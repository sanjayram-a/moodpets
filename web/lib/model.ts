import { readFileSync } from "node:fs";
import path from "node:path";

// Must stay identical to TOKEN_PATTERN in ml/train.py
const TOKEN_RE = /[a-z0-9]+(?:'[a-z]+)?|[!?]/g;

type Meta = {
  labels: string[];
  intercepts: number[];
  thresholds: number[];
  n_terms: number;
  groups: Record<string, string[]>;
};

type Loaded = {
  meta: Meta;
  index: Map<string, number>;
  idf: Float32Array;
  weights: Float32Array; // [n_labels, n_terms]
  labelToExpr: Map<string, string>;
};

let cache: Loaded | null = null;

function load(dir = path.join(process.cwd(), "model")): Loaded {
  if (cache) return cache;
  const meta: Meta = JSON.parse(readFileSync(path.join(dir, "meta.json"), "utf8"));
  const vocab: { terms: string[]; idf: number[] } = JSON.parse(
    readFileSync(path.join(dir, "vocab.json"), "utf8"),
  );
  const buf = readFileSync(path.join(dir, "weights.bin"));
  const weights = new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const labelToExpr = new Map<string, string>();
  for (const [expr, labels] of Object.entries(meta.groups)) for (const l of labels) labelToExpr.set(l, expr);
  cache = {
    meta,
    index: new Map(vocab.terms.map((t, i) => [t, i])),
    idf: Float32Array.from(vocab.idf),
    weights,
    labelToExpr,
  };
  return cache;
}

export function featurize(text: string, m: Loaded): [number, number][] {
  const tokens = text.toLowerCase().match(TOKEN_RE) ?? [];
  const counts = new Map<number, number>();
  const add = (term: string) => {
    const i = m.index.get(term);
    if (i !== undefined) counts.set(i, (counts.get(i) ?? 0) + 1);
  };
  for (let i = 0; i < tokens.length; i++) {
    add(tokens[i]);
    if (i + 1 < tokens.length) add(tokens[i] + " " + tokens[i + 1]);
  }
  const feats: [number, number][] = [];
  let norm = 0;
  for (const [i, c] of counts) {
    const v = (1 + Math.log(c)) * m.idf[i];
    feats.push([i, v]);
    norm += v * v;
  }
  norm = Math.sqrt(norm) || 1;
  return feats.map(([i, v]) => [i, v / norm]);
}

export type Prediction = {
  emotion: string; // top GoEmotions label
  expression: string; // animal expression key
  score: number;
  top: { label: string; score: number }[];
};

export function predict(text: string, dir?: string): Prediction {
  const m = load(dir);
  const { labels, intercepts, n_terms } = m.meta;
  const feats = featurize(text, m);
  const scores = labels.map((label, k) => {
    let z = intercepts[k];
    const row = k * n_terms;
    for (const [i, v] of feats) z += v * m.weights[row + i];
    return { label, score: 1 / (1 + Math.exp(-z)) };
  });
  scores.sort((a, b) => b.score - a.score);
  // nothing recognised -> neutral
  const best = feats.length ? scores[0] : { label: "neutral", score: 1 };
  return {
    emotion: best.label,
    expression: m.labelToExpr.get(best.label) ?? "relaxed",
    score: best.score,
    top: feats.length ? scores.slice(0, 3) : [{ label: "neutral", score: 1 }],
  };
}
