"""Train a light-weight GoEmotions classifier (TF-IDF + one-vs-rest logistic regression).

CPU only, no torch. Exports weights that the Next.js server reads directly:
  ../web/model/vocab.json   {"terms": [...], "idf": [...]}
  ../web/model/weights.bin  float32, shape [n_labels, n_terms] row-major
  ../web/model/meta.json    labels, intercepts, thresholds, metrics
  ../report/metrics.json    full evaluation (used by the report)
"""
import json
import time
from pathlib import Path

import numpy as np
from datasets import load_from_disk
from scipy import sparse
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, precision_score, recall_score

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "web" / "model"
REPORT = ROOT.parent / "report"
OUT.mkdir(parents=True, exist_ok=True)
REPORT.mkdir(parents=True, exist_ok=True)

# Must stay identical to TOKEN_RE in web/lib/model.ts
TOKEN_PATTERN = r"[a-z0-9]+(?:'[a-z]+)?|[!?]"
MAX_FEATURES = 30000
C = 4.0

GROUPS = {  # label -> animal expression (same mapping as the reference HTML)
    "happy": ["joy", "amusement", "excitement", "optimism", "pride"],
    "love": ["love", "admiration", "caring", "gratitude"],
    "sad": ["sadness", "grief", "disappointment", "remorse"],
    "angry": ["anger", "annoyance", "disapproval", "disgust"],
    "scared": ["fear", "nervousness", "embarrassment"],
    "surprised": ["surprise", "realization"],
    "curious": ["curiosity", "confusion"],
    "puppy": ["desire"],
    "relaxed": ["neutral", "approval", "relief"],
}


def multi_hot(rows, n):
    y = np.zeros((len(rows), n), dtype=np.int8)
    for i, labs in enumerate(rows):
        y[i, labs] = 1
    return y


def main():
    ds = load_from_disk(str(ROOT / "data" / "go_emotions"))
    labels = ds["train"].features["labels"].feature.names
    n = len(labels)
    tr, va, te = ds["train"], ds["validation"], ds["test"]
    ytr, yva, yte = (multi_hot(d["labels"], n) for d in (tr, va, te))

    t0 = time.time()
    vec = TfidfVectorizer(
        lowercase=True,
        token_pattern=TOKEN_PATTERN,
        ngram_range=(1, 2),
        min_df=2,
        max_features=MAX_FEATURES,
        sublinear_tf=True,
        dtype=np.float32,
    )
    xtr = vec.fit_transform(tr["text"])
    xva, xte = vec.transform(va["text"]), vec.transform(te["text"])
    print("features:", xtr.shape, f"{time.time()-t0:.1f}s")

    W = np.zeros((n, xtr.shape[1]), dtype=np.float32)
    b = np.zeros(n, dtype=np.float32)
    for k in range(n):
        clf = LogisticRegression(C=C, solver="liblinear", class_weight="balanced")
        clf.fit(xtr, ytr[:, k])
        W[k], b[k] = clf.coef_[0], clf.intercept_[0]
    print(f"trained {n} classifiers in {time.time()-t0:.1f}s")

    sig = lambda z: 1 / (1 + np.exp(-z))
    pva, pte = sig(xva @ W.T + b), sig(xte @ W.T + b)

    # per-label threshold tuned on validation
    thr = np.zeros(n, dtype=np.float32)
    for k in range(n):
        best, bt = -1, 0.5
        for t in np.arange(0.2, 0.95, 0.025):
            f = f1_score(yva[:, k], pva[:, k] >= t, zero_division=0)
            if f > best:
                best, bt = f, t
        thr[k] = bt

    pred = pte >= thr
    top1 = pte.argmax(1)
    gold_any = yte[np.arange(len(yte)), top1] == 1

    idx = {l: i for i, l in enumerate(labels)}
    grp_of = {idx[l]: g for g, ls in GROUPS.items() for l in ls}
    gnames = list(GROUPS)
    def to_group(rows):
        return [{gnames.index(grp_of[j]) for j in np.flatnonzero(r)} for r in rows]
    g_true = to_group(yte)
    g_pred = [gnames.index(grp_of[i]) for i in top1]
    group_acc = float(np.mean([p in t for p, t in zip(g_pred, g_true)]))

    per_label = []
    for k, l in enumerate(labels):
        per_label.append({
            "label": l,
            "support": int(yte[:, k].sum()),
            "precision": float(precision_score(yte[:, k], pred[:, k], zero_division=0)),
            "recall": float(recall_score(yte[:, k], pred[:, k], zero_division=0)),
            "f1": float(f1_score(yte[:, k], pred[:, k], zero_division=0)),
        })

    metrics = {
        "train": len(tr), "validation": len(va), "test": len(te),
        "n_features": int(xtr.shape[1]), "n_labels": n,
        "top1_in_gold_accuracy": float(gold_any.mean()),
        "group_accuracy": group_acc,
        "macro_precision": float(precision_score(yte, pred, average="macro", zero_division=0)),
        "macro_recall": float(recall_score(yte, pred, average="macro", zero_division=0)),
        "macro_f1": float(f1_score(yte, pred, average="macro", zero_division=0)),
        "micro_f1": float(f1_score(yte, pred, average="micro", zero_division=0)),
        "weights_mb": round(W.nbytes / 1e6, 2),
        "train_seconds": round(time.time() - t0, 1),
        "per_label": per_label,
    }
    print({k: v for k, v in metrics.items() if k != "per_label"})

    # export
    terms = vec.get_feature_names_out().tolist()
    (OUT / "vocab.json").write_text(
        json.dumps({"terms": terms, "idf": [round(float(x), 5) for x in vec.idf_]}), encoding="utf8")
    W.astype("<f4").tofile(OUT / "weights.bin")
    (OUT / "meta.json").write_text(json.dumps({
        "labels": labels, "intercepts": b.tolist(), "thresholds": thr.tolist(),
        "n_terms": len(terms), "groups": GROUPS,
        "metrics": {k: metrics[k] for k in (
            "train", "validation", "test", "n_features", "macro_f1", "micro_f1",
            "macro_precision", "macro_recall", "top1_in_gold_accuracy", "group_accuracy", "weights_mb")},
    }), encoding="utf8")
    (REPORT / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf8")


if __name__ == "__main__":
    main()
