"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type DeckSlide = { name: string; node: ReactNode; prompts?: string[] };

const W = 1280, H = 720;

export default function Deck({ slides }: { slides: DeckSlide[] }) {
  const [i, setI] = useState(0);
  const [reset, setReset] = useState(0);
  const [scale, setScale] = useState(1);
  const [asking, setAsking] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current; if (!el) return;
    const fit = () => setScale(Math.min(el.clientWidth / W, el.clientHeight / H));
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const go = useCallback((d: number) => setI((v) => Math.max(0, Math.min(slides.length - 1, v + d))), [slides.length]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [go]);

  const full = () => (document.fullscreenElement ? document.exitFullscreen() : root.current?.requestFullscreen());

  return (
    <div ref={root} className="flex flex-col bg-[#fff8ec]" style={{ height: "100%" }}>
      <div ref={box} className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 overflow-hidden rounded-2xl border-[6px]"
          style={{ width: W, height: H, borderColor: "#e4642b", background: "#fff8ec",
            transform: `translate(-50%,-50%) scale(${scale})`, transformOrigin: "center" }}>
          <div key={`${i}-${reset}`} className="h-full w-full">{slides[i].node}</div>
        </div>
      </div>
      {asking && slides[i].prompts && (
        <aside className="mx-4 mb-1 rounded-2xl border-4 bg-white px-5 py-3 text-[18px]" style={{ borderColor: "#2f8f86" }}>
          <p className="font-bold" style={{ color: "#23776f" }}>Питања за децу (за васпитачицу)</p>
          <ul className="mt-1 list-disc pl-6">{slides[i].prompts.map((q, n) => <li key={n}>{q}</li>)}</ul>
        </aside>
      )}
      <nav className="flex items-center justify-between gap-3 px-4 py-3">
        <button className="btn !px-5 !py-2" onClick={() => go(-1)} disabled={i === 0} aria-label="Prethodni slajd">←</button>
        <div className="flex flex-1 flex-wrap items-center justify-center gap-2" aria-label="Slajdovi">
          {slides.map((s, n) => (
            <button key={n} onClick={() => setI(n)} title={s.name} aria-label={s.name} aria-current={n === i}
              className="h-3.5 w-3.5 rounded-full border-2" style={{ borderColor: "#e4642b", background: n === i ? "#e4642b" : "transparent" }} />
          ))}
        </div>
        <span className="hidden text-[15px] sm:block">{i + 1} / {slides.length} · {slides[i].name}</span>
        <button className="underline" onClick={() => setAsking((a) => !a)} aria-pressed={asking}>Питања</button>
        <button className="underline" onClick={() => setReset((r) => r + 1)}>Испочетка</button>
        <button className="underline" onClick={full}>Цео екран</button>
        <button className="btn !px-5 !py-2" onClick={() => go(1)} disabled={i === slides.length - 1} aria-label="Sledeći slajd">→</button>
      </nav>
    </div>
  );
}
