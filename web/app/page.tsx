"use client";

import { useEffect, useRef, useState } from "react";
import { Dog, Sheep } from "@/components/Pets";
import About from "@/components/About";
import { EXAMPLES } from "@/lib/examples";

type Pet = "dog" | "sheep";
type Result = { emotion: string; expression: string; score: number; top: { label: string; score: number }[] };

const DELAY_MS = 1000;
const MAX_CHARS = 500;

const EXPRESSIONS: Record<string, { name: string; emoji: string }> = {
  happy: { name: "Happy", emoji: "😄" },
  love: { name: "Loving", emoji: "😍" },
  sad: { name: "Sad", emoji: "😢" },
  angry: { name: "Angry", emoji: "😠" },
  scared: { name: "Scared", emoji: "😨" },
  surprised: { name: "Surprised", emoji: "😲" },
  curious: { name: "Curious", emoji: "🤔" },
  puppy: { name: "Wishful", emoji: "🥺" },
  relaxed: { name: "Calm", emoji: "😌" },
};

export default function Home() {
  const [pet, setPet] = useState<Pet>("dog");
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const ctrl = useRef<AbortController | null>(null);
  const [about, setAbout] = useState(false);
  const exIdx = useRef(-1);
  const instant = useRef(false); // example picks predict right away, typing waits 1 s

  const pick = (i: number) => {
    exIdx.current = i;
    instant.current = true;
    setText(EXAMPLES[i]);
  };
  const step = (d: number) => pick((exIdx.current + d + EXAMPLES.length) % EXAMPLES.length);
  const shuffle = () => {
    let i = exIdx.current;
    while (i === exIdx.current) i = Math.floor(Math.random() * EXAMPLES.length);
    pick(i);
  };
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // warm up the model on the server so the first real prediction is instant
    fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "hello" }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  const toggleTheme = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setDark(!dark);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pet");
      if (saved === "dog" || saved === "sheep") setPet(saved);
    } catch {}
  }, []);

  const choose = (p: Pet) => {
    setPet(p);
    try {
      localStorage.setItem("pet", p);
    } catch {}
  };

  // wait 1s after the last keystroke, then ask the server
  useEffect(() => {
    ctrl.current?.abort();
    if (!text.trim()) {
      setResult(null);
      setBusy(false);
      setError(false);
      return;
    }
    setBusy(true);
    const wait = instant.current ? 0 : DELAY_MS;
    instant.current = false;
    const timer = setTimeout(async () => {
      const c = new AbortController();
      ctrl.current = c;
      try {
        const res = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: c.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        setResult(await res.json());
        setError(false);
        setBusy(false);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(true);
        setBusy(false);
      }
    }, wait);
    return () => {
      clearTimeout(timer);
      ctrl.current?.abort();
    };
  }, [text]);

  const expr = result?.expression ?? "relaxed";
  const info = EXPRESSIONS[expr] ?? EXPRESSIONS.relaxed;
  const label = `${info.name} ${pet}`;
  const Animal = pet === "dog" ? Dog : Sheep;

  return (
    <main className="app" data-mood={expr}>
      <header className="head">
        <button type="button" className="icon-btn" onClick={() => setAbout(true)} aria-label="About the model, dataset and labels">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><circle cx="12" cy="7.8" r="0.6" fill="currentColor" /></svg>
        </button>
        <div>
          <h1 className="title">
            Mood<span>pets</span>
          </h1>
          <p className="sub">Tell me how you feel ♡</p>
        </div>
        <button type="button" className="icon-btn theme-btn" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
          <svg className="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          <svg className="moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></svg>
        </button>
      </header>

      <div className="switch" role="radiogroup" aria-label="Choose a pet" data-pet={pet}>
        <button type="button" role="radio" aria-checked={pet === "dog"} onClick={() => choose("dog")}>
          🐶 Dog
        </button>
        <button type="button" role="radio" aria-checked={pet === "sheep"} onClick={() => choose("sheep")}>
          🐑 Sheep
        </button>
      </div>

      <section className="stage">
        <Animal key={pet} emotion={expr} label={label} />
      </section>

      <div className="result" aria-live="polite">
        {error ? (
          <span className="hint">Couldn’t reach the server. Try again.</span>
        ) : result ? (
          <>
            <div className="emotion">
              <span className="em" aria-hidden="true">{info.emoji}</span>
              {result.emotion}
            </div>
            <div className="chips">
              {result.top.map((t) => (
                <span className="chip" key={t.label}>
                  {t.label} {Math.round(t.score * 100)}%
                </span>
              ))}
            </div>
          </>
        ) : (
          <span className="hint">{busy ? "Thinking…" : "Say something and I’ll feel it."}</span>
        )}
      </div>

      <div className="field">
        <textarea
          value={text}
          maxLength={MAX_CHARS}
          onChange={(e) => {
            exIdx.current = -1;
            setText(e.target.value);
          }}
          placeholder="Type a sentence…"
          aria-label="Your sentence"
          autoFocus
          rows={2}
        />
        <div className="examples" role="group" aria-label="Example sentences">
          <button type="button" onClick={() => step(-1)} aria-label="Previous example">
            <svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6" /></svg>
          </button>
          <button type="button" onClick={shuffle} aria-label="Random example">
            <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="9" cy="9" r="1" fill="currentColor" /><circle cx="15" cy="15" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="9" r="1" fill="currentColor" /><circle cx="9" cy="15" r="1" fill="currentColor" /></svg>
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next example">
            <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </div>
        <span className="status" data-on={busy} aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className="count">{text.length}/{MAX_CHARS}</span>
      </div>

      <About open={about} onClose={() => setAbout(false)} />

      <p className="foot">Predicted on the server · trained on GoEmotions</p>
    </main>
  );
}
