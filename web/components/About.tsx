"use client";

import { useEffect, useRef, useState } from "react";

type Info = {
  groups: Record<string, string[]>;
  labels: string[];
  nTerms: number;
  metrics: Record<string, number>;
};

const EXPR: Record<string, string> = {
  happy: "😄 Happy",
  love: "😍 Loving",
  sad: "😢 Sad",
  angry: "😠 Angry",
  scared: "😨 Scared",
  surprised: "😲 Surprised",
  curious: "🤔 Curious",
  puppy: "🥺 Wishful",
  relaxed: "😌 Calm",
};
const pct = (x: number) => `${Math.round(x * 100)}%`;

export default function About({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (open && !info) {
      fetch("/api/about")
        .then((r) => r.json())
        .then(setInfo)
        .catch(() => {});
    }
  }, [open, info]);

  const m = info?.metrics;
  return (
    <dialog
      ref={ref}
      className="about"
      aria-labelledby="about-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="about-top">
        <h2 id="about-title">About Moodpets</h2>
        <button className="icon-btn" type="button" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="about-body">
        <h3>Model</h3>
        <p>
          A light-weight text classifier: TF-IDF features (single words and word pairs
          {info ? `, ${info.nTerms.toLocaleString()} features` : ""}) feeding one logistic-regression model per
          emotion. It runs on the server&apos;s CPU in about 20 ms, with no GPU and no deep-learning runtime. Your
          browser only sends the sentence and gets the answer back.
        </p>
        {m && (
          <div className="stats">
            <div className="stat">
              <b>{m.macro_f1.toFixed(2)}</b>
              <span>macro F1</span>
            </div>
            <div className="stat">
              <b>{pct(m.top1_in_gold_accuracy)}</b>
              <span>top pick is a true label</span>
            </div>
            <div className="stat">
              <b>{pct(m.group_accuracy)}</b>
              <span>right pet mood</span>
            </div>
          </div>
        )}
        <p className="small" style={{ marginTop: 8 }}>
          Scores are measured on the held-out test split{m ? ` (${m.test.toLocaleString()} comments)` : ""}. It is a
          small model, so sarcasm and subtle context can fool it.
        </p>

        <h3>Dataset</h3>
        <p>
          <a href="https://huggingface.co/datasets/google-research-datasets/go_emotions" target="_blank" rel="noreferrer">
            GoEmotions
          </a>{" "}
          by Google Research: 58k Reddit comments hand-labelled with 27 emotions or neutral (
          <a href="https://arxiv.org/abs/2005.00547" target="_blank" rel="noreferrer">
            Demszky et al., 2020
          </a>
          ).
          {m && (
            <>
              {" "}
              Split: {m.train.toLocaleString()} train / {m.validation.toLocaleString()} validation /{" "}
              {m.test.toLocaleString()} test.
            </>
          )}
        </p>
        <p className="small">
          The data reflects Reddit&apos;s user base and its annotators&apos; views, may contain offensive content, and does
          not represent global diversity.
        </p>

        <h3>Labels → pet mood</h3>
        {info ? (
          Object.entries(info.groups).map(([k, labels]) => (
            <div className="grp" key={k}>
              <div>{EXPR[k] ?? k}</div>
              <div className="chips" style={{ justifyContent: "flex-start" }}>
                {labels.map((l) => (
                  <span className="chip" key={l}>
                    {l}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="small">Loading…</p>
        )}
        <p className="small">The 28 labels are grouped into 9 expressions that the dog and sheep can show.</p>
      </div>
    </dialog>
  );
}
