"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, type ReactNode } from "react";

import { C } from "./consts";

export function Sprite({ name, h = 64, className = "" }: { name: string; h?: number; className?: string }) {
  return (
    <img src={`/sprites/${name}.png`} alt="" draggable={false} style={{ height: h, width: "auto" }}
      className={`select-none ${className}`} />
  );
}

export function SlideTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <header className="px-12 pt-8">
      <h2 className="text-[46px] leading-tight font-extrabold" style={{ fontFamily: "var(--font-nunito)" }}>{title}</h2>
      {hint && <p className="mt-1 text-[24px] opacity-80">{hint}</p>}
    </header>
  );
}

export function Card({ children, color = C.red, className = "", onClick, selected }: {
  children: ReactNode; color?: string; className?: string; onClick?: () => void; selected?: boolean;
}) {
  return (
    <div onClick={onClick} role={onClick ? "button" : undefined}
      className={`rounded-3xl bg-white/70 ${onClick ? "cursor-pointer active:scale-[0.98] transition" : ""} ${className}`}
      style={{ border: `4px solid ${color}`, boxShadow: selected ? `0 0 0 6px ${color}55` : undefined }}>
      {children}
    </div>
  );
}

/** Okrugla dugmad za izbor broja. Tačan odgovor se zeleni, pogrešan bledi. */
export function Choices({ options, answer, onSolved, size = 64, solvedLabel }: {
  options: (number | string)[]; answer: number | string; onSolved?: () => void; size?: number; solvedLabel?: string;
}) {
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string[]>([]);
  const click = (v: number | string) => {
    if (solved) return;
    if (String(v) === String(answer)) { setSolved(true); onSolved?.(); }
    else setWrong((w) => [...w, String(v)]);
  };
  return (
    <div className="flex items-center gap-3">
      {options.map((v) => {
        const right = solved && String(v) === String(answer);
        const bad = wrong.includes(String(v));
        return (
          <button key={String(v)} onClick={() => click(v)} disabled={solved && !right}
            className="rounded-full font-bold transition active:scale-95"
            style={{
              width: size, height: size, fontSize: size * 0.5,
              border: `4px solid ${right ? C.green : bad ? C.red : C.ink}`,
              background: right ? C.green : "#fff", color: right ? "#fff" : C.ink,
              opacity: bad ? 0.35 : solved && !right ? 0.5 : 1,
            }}>
            {v}
          </button>
        );
      })}
      {solved && <span className="text-[34px]" style={{ color: C.green }}>{solvedLabel ?? "✓"}</span>}
    </div>
  );
}

export type Cell = "blue" | "red" | "empty";

/** Okvir od deset: 2 reda po 5 polja. */
export function TenFrame({ cells, onCell, size = 52 }: { cells: Cell[]; onCell?: (i: number) => void; size?: number }) {
  return (
    <div className="inline-grid grid-cols-5 rounded-2xl border-4 bg-white p-1" style={{ borderColor: C.ink }}>
      {cells.map((c, i) => (
        <button key={i} onClick={() => onCell?.(i)} disabled={!onCell}
          className="flex items-center justify-center border border-black/10" style={{ width: size + 8, height: size + 8 }}>
          <span className="block rounded-full transition-all" style={{
            width: size - 6, height: size - 6,
            background: c === "empty" ? "transparent" : c === "red" ? C.red : C.blue,
            border: c === "empty" ? "3px dashed #bbb" : `3px solid ${C.ink}`,
          }} />
        </button>
      ))}
    </div>
  );
}

export const frameCells = (full: number, color: Cell = "red"): Cell[] =>
  Array.from({ length: 10 }, (_, i) => (i < full ? color : "empty"));

/** Povezivanje: izaberi levo, pa desno. Tačan par dobija istu boju. */
export function Matcher({ left, right, pairs, leftW = 130 }: {
  left: { id: string; label: string }[];
  right: { id: string; node: ReactNode }[];
  pairs: Record<string, string>;
  leftW?: number;
}) {
  const palette = [C.red, C.blue, C.green, C.orange, C.warm];
  const [sel, setSel] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, string>>({});
  const [shake, setShake] = useState<string | null>(null);
  const colorOf = (rid: string) => {
    const l = Object.keys(done).find((k) => done[k] === rid);
    return l ? palette[left.findIndex((x) => x.id === l) % palette.length] : undefined;
  };
  const pickRight = (rid: string) => {
    if (!sel || colorOf(rid)) return;
    if (pairs[sel] === rid) { setDone((d) => ({ ...d, [sel]: rid })); setSel(null); }
    else { setShake(rid); setTimeout(() => setShake(null), 400); }
  };
  return (
    <div className="flex items-stretch justify-between gap-8 px-12">
      <div className="flex flex-col justify-around gap-3">
        {left.map((l, i) => {
          const c = done[l.id] ? palette[i % palette.length] : C.red;
          return (
            <button key={l.id} onClick={() => !done[l.id] && setSel(l.id)}
              className="rounded-2xl bg-white text-[48px] font-extrabold"
              style={{ width: leftW, height: 96, border: `5px solid ${done[l.id] ? c : C.ink}`,
                background: done[l.id] ? c : sel === l.id ? "#ffe6d6" : "#fff", color: done[l.id] ? "#fff" : C.ink }}>
              {l.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-1 flex-col justify-around gap-3">
        {right.map((r) => {
          const c = colorOf(r.id);
          return (
            <div key={r.id} onClick={() => pickRight(r.id)} role="button"
              className={`flex cursor-pointer items-center justify-center rounded-2xl bg-white/80 px-4 py-2 ${shake === r.id ? "animate-pulse" : ""}`}
              style={{ border: `5px solid ${c ?? "#c9bfae"}`, background: c ? `${c}22` : undefined }}>
              {r.node}
            </div>
          );
        })}
      </div>
    </div>
  );
}
