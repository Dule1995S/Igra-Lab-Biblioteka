"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, type ReactNode } from "react";
import { C, asset } from "./consts";
import { Card, SlideTitle, Sprite, TenFrame, frameCells, type Cell } from "./ui";

/* Zajedničko: dugme akcije za vaspitačicu i dugme „otkrij". */
function Act({ children, onClick, disabled, ghost }: { children: ReactNode; onClick: () => void; disabled?: boolean; ghost?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={ghost ? "rounded-full border-4 px-5 py-1 text-[22px] font-bold disabled:opacity-40" : "btn !px-6 !py-2 !text-[22px] disabled:opacity-40"}
      style={ghost ? { borderColor: C.ink, background: "#fff" } : undefined}>{children}</button>
  );
}
function Chips({ values, value, onPick, color = C.orange }: { values: (number | string)[]; value: number | string | null; onPick: (v: number) => void; color?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {values.map((v, i) => (
        <button key={String(v)} onClick={() => onPick(i)} className="h-12 min-w-12 rounded-full border-4 px-3 text-[24px] font-bold"
          style={{ borderColor: color, background: value === v ? color : "#fff", color: value === v ? "#fff" : C.ink }}>{v}</button>
      ))}
    </div>
  );
}
function Big({ children, color = C.green }: { children: ReactNode; color?: string }) {
  return <span className="inline-flex min-w-24 items-center justify-center rounded-3xl px-5 py-1 text-[72px] font-extrabold leading-tight text-white" style={{ background: color }}>{children}</span>;
}

/* ---------- Како бројимо? (4 корака) ---------- */
const STEPS = [
  { n: 1, t: "ДОДИРНИ", d: "Покажи сваки предмет прстом.", c: C.red },
  { n: 2, t: "ПОМЕРИ", d: "Одвоји оно што је већ пребројано.", c: C.blue },
  { n: 3, t: "КАЖИ БРОЈ", d: "Последњи број каже колико их има.", c: C.green },
  { n: 4, t: "ПРОВЕРИ", d: "Преброј још једном, другим редом.", c: C.orange },
];
export function RulesSlide({ title, hint, sprite, n }: { title: string; hint: string; sprite: string; n: number }) {
  const [counted, setCounted] = useState(0);
  const [check, setCheck] = useState(false);
  const order = (i: number) => (check ? n - 1 - i : i);
  const done = counted >= n;
  const lit = (s: number) => (s === 1 ? counted > 0 && !done : s === 2 ? counted > 0 : s === 3 ? done : done && check);
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-3 flex gap-4 px-12">
        {STEPS.map((s) => (
          <Card key={s.n} color={s.c} className="flex-1 p-3 transition" selected={lit(s.n)}>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[22px] font-bold text-white" style={{ background: s.c }}>{s.n}</span>
            <p className="mt-1 text-[22px] font-extrabold">{s.t}</p>
            <p className="text-[17px] leading-snug opacity-80">{s.d}</p>
          </Card>
        ))}
      </div>
      <div className="mt-4 px-12">
        <p className="text-[20px] font-bold tracking-widest opacity-70">ЈОШ НИСУ ПРЕБРОЈАНИ</p>
        <div className="flex min-h-[110px] items-center gap-4 rounded-2xl bg-white/60 px-5">
          {Array.from({ length: n }, (_, i) => order(i)).map((idx) => idx >= counted && (
            <button key={idx} onClick={() => !check && idx === counted && setCounted((c) => c + 1)} className="rounded-xl p-1"
              style={{ outline: !check && idx === counted ? `5px dashed ${C.orange}` : undefined }}>
              <Sprite name={sprite} h={92} /></button>
          ))}
        </div>
        <p className="mt-2 text-[20px] font-bold tracking-widest opacity-70">ПРЕБРОЈАНИ</p>
        <div className="flex min-h-[110px] items-center gap-4 rounded-2xl px-5" style={{ background: "#e6f5ee" }}>
          {Array.from({ length: counted }, (_, i) => (
            <div key={i} className="relative"><Sprite name={sprite} h={92} />
              <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full text-[22px] font-bold text-white" style={{ background: C.blue }}>{i + 1}</span></div>
          ))}
          {done && <span className="ml-auto"><Big>{n}</Big></span>}
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-4">
        <Act onClick={() => setCounted((c) => Math.min(n, c + 1))} disabled={done}>Додирни следећи</Act>
        <Act ghost disabled={!done || check} onClick={() => { setCheck(true); setCounted(0); }}>Провери: преброј обрнуто</Act>
        <Act ghost onClick={() => { setCounted(0); setCheck(false); }}>Испочетка</Act>
      </div>
    </>
  );
}

/* ---------- Колико их има? (додајемо један по један) ---------- */
export function BuildSlide({ title, hint, rounds }: { title: string; hint: string; rounds: { sprite: string; n: number }[] }) {
  const [r, setR] = useState(0);
  const [k, setK] = useState(0);
  const [reveal, setReveal] = useState(false);
  const { sprite, n } = rounds[r];
  const pick = (i: number) => { setR(i); setK(0); setReveal(false); };
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-3 flex justify-center"><Chips values={rounds.map((_, i) => `${i + 1}`)} value={`${r + 1}`} onPick={pick} /></div>
      <Card color={C.red} className="mx-12 mt-3 flex min-h-[300px] flex-wrap content-center items-center justify-center gap-3 p-5">
        {Array.from({ length: k }, (_, i) => (
          <div key={i} className="relative"><Sprite name={sprite} h={n > 8 ? 100 : 118} />
            <span className="absolute -right-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full text-[24px] font-bold text-white" style={{ background: C.blue }}>{i + 1}</span></div>
        ))}
        {k === 0 && <p className="text-[28px] opacity-50">Притисни „Додај један“ или „Прикажи све“</p>}
      </Card>
      <div className="mt-4 flex items-center justify-center gap-4">
        <Act onClick={() => setK((v) => Math.min(n, v + 1))} disabled={k >= n}>＋ Додај један</Act>
        <Act ghost onClick={() => setK(n)} disabled={k >= n}>Прикажи све</Act>
        <Act ghost onClick={() => { setK(0); setReveal(false); }}>Испочетка</Act>
        <Act onClick={() => setReveal(true)} disabled={k < n || reveal}>Колико их има?</Act>
        {reveal && <Big>{n}</Big>}
      </div>
    </>
  );
}

/* ---------- Где има више? (упаривање један на један) ---------- */
export function PairSlide({ title, hint, rounds }: { title: string; hint: string; rounds: { a: string[]; b: string[] }[] }) {
  const [r, setR] = useState(0);
  const [p, setP] = useState(0);
  const { a, b } = rounds[r];
  const cols = Math.max(a.length, b.length), min = Math.min(a.length, b.length);
  const done = p >= min;
  const verdict = a.length === b.length ? "ИСТО" : a.length > b.length ? "ВИШЕ ЈЕ ГОРЕ" : "ВИШЕ ЈЕ ДОЛЕ";
  const row = (list: string[], top: boolean) => (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {list.map((s, i) => {
        const extra = done && i >= min;
        return <div key={i} className="flex justify-center rounded-xl py-1" style={{ background: extra ? "#fde7d3" : undefined, outline: extra ? `4px solid ${C.orange}` : undefined, margin: 4 }}>
          <Sprite name={s} h={cols > 7 ? 74 : 88} /></div>;
      })}
      {Array.from({ length: cols - list.length }, (_, i) => <div key={`e${top}${i}`} />)}
    </div>
  );
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-2 flex justify-center"><Chips values={rounds.map((_, i) => `${i + 1}`)} value={`${r + 1}`} onPick={(i) => { setR(i); setP(0); }} /></div>
      <Card color={C.blue} className="mx-12 mt-3 p-4">
        {row(a, true)}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, height: 70 }}>
          {Array.from({ length: cols }, (_, i) => (
            <div key={i} className="flex justify-center">{i < p && i < min && <div className="h-full w-1.5 rounded-full" style={{ background: C.blue }} />}</div>
          ))}
        </div>
        {row(b, false)}
      </Card>
      <div className="mt-4 flex items-center justify-center gap-4">
        <Act onClick={() => setP((v) => Math.min(min, v + 1))} disabled={done}>Упари један пар</Act>
        <Act ghost onClick={() => setP(min)} disabled={done}>Упари све</Act>
        <Act ghost onClick={() => setP(0)}>Испочетка</Act>
        {done && <span className="rounded-full px-6 py-2 text-[34px] font-extrabold text-white" style={{ background: C.green }}>{verdict}</span>}
      </div>
    </>
  );
}

/* ---------- Оквир од десет ---------- */
export function TenFrameSlide({ title, hint }: { title: string; hint: string }) {
  const [n, setN] = useState(0);
  const [showNum, setShowNum] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const cells: Cell[] = Array.from({ length: 10 }, (_, i) => (i < n ? "red" : "empty"));
  const set = (v: number) => { setN(v); setShowNum(false); setShowMore(false); };
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-4 flex items-center justify-center gap-10 px-12">
        <div className="rounded-3xl p-3 transition" style={{ boxShadow: showMore ? `0 0 0 8px ${C.orange}55` : undefined }}>
          <TenFrame size={84} cells={cells} onCell={(i) => set(i < n ? i : i + 1)} />
          {showMore && n < 10 && <p className="mt-2 text-center text-[30px] font-extrabold" style={{ color: C.orange }}>празна поља: {10 - n}</p>}
        </div>
        <div className="flex w-56 flex-col items-center gap-3">
          {showNum ? <Big color={C.blue}>{n}</Big> : <span className="text-[88px] font-extrabold opacity-20">?</span>}
          {showMore && <p className="text-[32px] font-bold">ЈОШ {10 - n}</p>}
        </div>
      </div>
      <div className="mt-5 flex justify-center"><Chips values={Array.from({ length: 10 }, (_, i) => i + 1)} value={n} onPick={(i) => set(i + 1)} /></div>
      <div className="mt-4 flex justify-center gap-4">
        <Act onClick={() => set(Math.min(10, n + 1))} disabled={n >= 10}>＋ Стави један</Act>
        <Act ghost onClick={() => set(Math.max(0, n - 1))} disabled={n <= 0}>− Скини</Act>
        <Act ghost onClick={() => set(0)}>Испочетка</Act>
        <Act onClick={() => setShowNum(true)} disabled={showNum || n === 0}>Колико је сада?</Act>
        <Act onClick={() => setShowMore(true)} disabled={showMore || n === 0 || n === 10}>Колико још до 10?</Act>
      </div>
    </>
  );
}

/* ---------- Десет и још ---------- */
export function TenPlusSlide({ title, hint }: { title: string; hint: string }) {
  const [k, setK] = useState(10);
  const [showNum, setShowNum] = useState(false);
  const [showSum, setShowSum] = useState(false);
  const set = (v: number) => { setK(Math.max(0, Math.min(20, v))); setShowNum(false); setShowSum(false); };
  const a: Cell[] = Array.from({ length: 10 }, (_, i) => (i < k ? "blue" : "empty"));
  const b: Cell[] = Array.from({ length: 10 }, (_, i) => (i < k - 10 ? "red" : "empty"));
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-4 flex items-center justify-center gap-8 px-12">
        <div className="text-center"><TenFrame cells={a} size={70} />
          <p className="mt-1 text-[22px] font-bold tracking-widest">{k >= 10 ? "ПУНА ДЕСЕТИЦА" : ""}</p></div>
        <div className="text-center"><TenFrame cells={b} size={70} />
          <p className="mt-1 text-[22px] font-bold tracking-widest">{k > 10 ? "И ЈОШ" : ""}</p></div>
      </div>
      <div className="mt-3 flex min-h-[96px] items-center justify-center gap-6">
        {showNum && <Big color={C.blue}>{k}</Big>}
        {showSum && k > 10 && <p className="rounded-full border-4 px-8 py-1 text-[44px] font-extrabold" style={{ borderColor: C.blue }}>10 И ЈОШ {k - 10} ЈЕ {k}</p>}
      </div>
      <div className="flex justify-center"><Chips values={[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]} value={k} onPick={(i) => set(10 + i)} /></div>
      <div className="mt-4 flex justify-center gap-4">
        <Act onClick={() => set(k + 1)} disabled={k >= 20}>＋ Додај један</Act>
        <Act ghost onClick={() => set(k - 1)} disabled={k <= 0}>− Скини</Act>
        <Act onClick={() => setShowNum(true)} disabled={showNum}>Колико их има?</Act>
        <Act onClick={() => setShowSum(true)} disabled={showSum || k <= 10}>Покажи рачун</Act>
      </div>
    </>
  );
}

/* ---------- Бројевна стаза до 20 ---------- */
const PATH_COLORS = [C.red, C.blue, C.green, C.orange];
export function PathSlide({ title, hint }: { title: string; hint: string }) {
  const [pos, setPos] = useState(1);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState<number[]>([]);
  const go = (n: number) => { setPos(n); if (hidden) setOpen((o) => (o.includes(n) ? o : [...o, n])); };
  const rows = [3, 2, 1, 0].map((r) => {
    const nums = Array.from({ length: 5 }, (_, i) => r * 5 + i + 1);
    return r % 2 === 1 ? nums.reverse() : nums;
  });
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mx-12 mt-3 flex flex-col gap-3">
        {rows.map((nums, ri) => (
          <div key={ri} className="flex items-center justify-around rounded-full py-1" style={{ background: "#dbe9fb" }}>
            {nums.map((n) => {
              const c = PATH_COLORS[Math.floor((n - 1) / 5)];
              const shown = !hidden || open.includes(n);
              return (
                <button key={n} onClick={() => go(n)} className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full border-4 bg-white text-[40px] font-bold"
                  style={{ borderColor: c, background: n % 5 === 0 ? `${c}33` : "#fff" }}>
                  {shown ? n : "?"}
                  {pos === n && <img src={asset("lisko.png")} alt="Лиско" className="absolute -top-9 left-1/2 h-14 -translate-x-1/2 drop-shadow" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-4">
        <Act ghost onClick={() => go(Math.max(1, pos - 1))}>← Назад</Act>
        <Act onClick={() => go(Math.min(20, pos + 1))} disabled={pos >= 20}>Напред →</Act>
        <Act ghost onClick={() => { setHidden((h) => !h); setOpen([]); }}>{hidden ? "Прикажи све бројеве" : "Сакриј бројеве"}</Act>
      </div>
    </>
  );
}

/* ---------- Мање или више од 10? ---------- */
export function LessMoreSlide({ title, hint, rounds }: { title: string; hint: string; rounds: { sprite: string; n: number }[] }) {
  const [r, setR] = useState(0);
  const [arranged, setArranged] = useState(false);
  const [answer, setAnswer] = useState(false);
  const { sprite, n } = rounds[r];
  const inFrame = Math.min(10, n), extra = Math.max(0, n - 10);
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-2 flex justify-center"><Chips values={rounds.map((_, i) => `${i + 1}`)} value={`${r + 1}`} onPick={(i) => { setR(i); setArranged(false); setAnswer(false); }} /></div>
      <Card color={C.green} className="mx-12 mt-3 flex min-h-[320px] items-center justify-center gap-10 p-4">
        {!arranged ? (
          <div className="flex max-w-[900px] flex-wrap items-center justify-center gap-3">
            {Array.from({ length: n }, (_, i) => <Sprite key={i} name={sprite} h={92} className={i % 2 ? "-rotate-6" : "rotate-3"} />)}
          </div>
        ) : (
          <>
            <div className="inline-grid grid-cols-5 rounded-2xl border-4 bg-white p-1" style={{ borderColor: C.ink }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="flex h-[88px] w-[88px] items-center justify-center border border-black/10">
                  {i < inFrame ? <Sprite name={sprite} h={74} /> : <span className="h-14 w-14 rounded-full border-4 border-dashed border-[#bbb]" />}
                </div>
              ))}
            </div>
            {extra > 0 && <div className="flex max-w-[260px] flex-wrap items-center gap-2">
              <p className="w-full text-[22px] font-bold tracking-widest">И ЈОШ {extra}</p>
              {Array.from({ length: extra }, (_, i) => <Sprite key={i} name={sprite} h={74} />)}</div>}
          </>
        )}
      </Card>
      <div className="mt-4 flex items-center justify-center gap-4">
        <Act onClick={() => setArranged(true)} disabled={arranged}>Распореди у десетицу</Act>
        <Act ghost onClick={() => { setArranged(false); setAnswer(false); }}>Испочетка</Act>
        <Act onClick={() => setAnswer(true)} disabled={!arranged || answer}>Одговор</Act>
        {answer && <span className="rounded-full px-6 py-2 text-[34px] font-extrabold text-white" style={{ background: n < 10 ? C.blue : C.red }}>
          {n < 10 ? `МАЊЕ: има ${10 - n} празно` : `ВИШЕ: ${n} је 10 и још ${extra}`}</span>}
      </div>
    </>
  );
}

/* ---------- Делимо једнако ---------- */
export function ShareSlide({ title, hint, items }: { title: string; hint: string; items: string[] }) {
  const [b, setB] = useState(3);
  const [d, setD] = useState(0);
  const [reveal, setReveal] = useState(false);
  const colors = [C.red, C.blue, C.green, C.orange, C.warm, "#8a5ea8"];
  const total = items.length;
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-2 flex items-center justify-center gap-3">
        <span className="text-[22px] font-bold">Корпи:</span>
        <Chips values={[2, 3, 4, 6]} value={b} onPick={(i) => { setB([2, 3, 4, 6][i]); setD(0); setReveal(false); }} />
      </div>
      <div className="mt-2 flex min-h-[110px] flex-wrap items-center justify-center gap-2 px-12">
        {items.slice(d).map((s, i) => <Sprite key={i} name={s} h={70} />)}
        {d >= total && <p className="text-[28px] font-bold" style={{ color: C.green }}>Све је подељено ✓</p>}
      </div>
      <div className="mt-1 flex justify-around px-8">
        {Array.from({ length: b }, (_, bi) => {
          const mine = items.slice(0, d).filter((_, i) => i % b === bi);
          return (
            <div key={bi} className="flex flex-col items-center" style={{ width: `${92 / b}%` }}>
              <div className="flex min-h-[118px] flex-wrap content-end justify-center gap-1">
                {mine.map((s, i) => <Sprite key={i} name={s} h={b > 4 ? 40 : 48} />)}</div>
              <div className="h-16 w-full rounded-b-3xl border-4" style={{ borderColor: C.ink, background: "#e0b374", borderTop: `14px solid ${colors[bi]}` }} />
              <p className="mt-1 h-10 text-[32px] font-extrabold">{reveal && d >= total ? mine.length : ""}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4">
        <Act onClick={() => setD((v) => Math.min(total, v + 1))} disabled={d >= total}>Подели један</Act>
        <Act ghost onClick={() => setD((v) => Math.min(total, v + b))} disabled={d >= total}>Свакој корпи по један</Act>
        <Act ghost onClick={() => { setD(0); setReveal(false); }}>Испочетка</Act>
        <Act onClick={() => setReveal(true)} disabled={d < total || reveal}>Колико у свакој корпи?</Act>
      </div>
    </>
  );
}

/* ---------- Пљесни и преброј (игра покрета) ---------- */
export function ClapSlide({ title, hint, numbers }: { title: string; hint: string; numbers: number[] }) {
  const [n, setN] = useState<number | null>(null);
  const [claps, setClaps] = useState(0);
  const done = n !== null && claps >= n;
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-3 flex gap-6 px-12">
        <Card color={C.orange} className="flex w-1/2 flex-col items-center justify-center gap-2 p-4">
          <img src={done ? asset("sprites/scene-highfive.png") : asset("sprites/scene-clap.png")} alt="" style={{ height: 290 }} />
          <p className="text-[26px] font-bold tracking-widest">{done ? "ДАЈ ПЕТ!" : "ПЉЕСКАМО И БРОЈИМО"}</p>
        </Card>
        <Card color={C.blue} className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          {n === null ? <p className="text-[28px] opacity-60">Изабери број картицом</p> : (
            <>
              <p className="text-[110px] font-extrabold leading-none">{n}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: n }, (_, i) => <span key={i} className="h-8 w-8 rounded-full border-4" style={{ borderColor: C.ink, background: i < claps ? C.warm : "#fff" }} />)}
              </div>
              <Act onClick={() => setClaps((c) => Math.min(n, c + 1))} disabled={done}>👏 Један пљесак ({claps})</Act>
            </>
          )}
        </Card>
      </div>
      <div className="mt-4 flex justify-center gap-4 px-12">
        {numbers.map((v, i) => (
          <button key={v} onClick={() => { setN(v); setClaps(0); }} className="h-24 w-28 rounded-2xl border-4 text-[52px] font-bold"
            style={{ borderColor: [C.red, C.blue, C.green, C.orange, C.red][i % 5], background: n === v ? "#ffe6d6" : "#fff" }}>{v}</button>
        ))}
      </div>
    </>
  );
}

/* ---------- Десет корака и још ---------- */
export function StepsSlide({ title, hint, cards }: { title: string; hint: string; cards: number[] }) {
  const [n, setN] = useState<number | null>(null);
  const colors = [C.red, C.green, C.orange];
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-3 flex gap-6 px-12">
        <Card color={C.orange} className="flex w-[40%] items-center justify-center p-4">
          <img src={asset("sprites/scene-steps.png")} alt="" style={{ height: 270 }} />
        </Card>
        <Card color={C.blue} className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <div className="flex gap-4">
            <TenFrame cells={frameCells(10, "blue")} size={44} />
            {n !== null && <TenFrame cells={frameCells(n)} size={44} />}
          </div>
          <p className="rounded-full border-4 px-6 py-1 text-[28px] font-extrabold" style={{ borderColor: C.blue }}>
            {n === null ? "10 КОРАКА" : `10 И ЈОШ ${n} ЈЕ ${10 + n}`}
          </p>
        </Card>
      </div>
      <div className="mt-5 flex justify-center gap-6 px-12">
        {cards.map((v, i) => (
          <Card key={v} color={colors[i % 3]} selected={n === v} onClick={() => setN(v)} className="w-52 py-3 text-center">
            <p className="text-[22px] font-bold tracking-widest">И ЈОШ</p>
            <p className="text-[64px] font-bold leading-none">{v}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ---------- Прелаз на радни лист ---------- */
export function WorksheetSlide({ title, color, pages, tip }: {
  title: string; color: string; pages: { p: string; t: string; d: string }[]; tip: string;
}) {
  return (
    <div className="flex h-full flex-col px-12 py-8">
      <div className="flex items-center gap-5">
        <img src={asset("lisko.png")} alt="" style={{ height: 96 }} />
        <div>
          <p className="text-[24px] font-bold tracking-widest" style={{ color }}>САД НА РАДНИ ЛИСТ</p>
          <h2 className="text-[50px] font-extrabold leading-tight" style={{ fontFamily: "var(--font-nunito)" }}>{title}</h2>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2">
        {pages.map((x) => (
          <Card key={x.p} color={color} className="flex items-center gap-5 px-5 py-2">
            <span className="flex h-12 min-w-[84px] items-center justify-center rounded-2xl px-3 text-[26px] font-extrabold text-white" style={{ background: color }}>стр. {x.p}</span>
            <div><p className="text-[28px] font-extrabold">{x.t}</p><p className="text-[20px] opacity-80">{x.d}</p></div>
          </Card>
        ))}
      </div>
      <p className="mt-4 rounded-2xl bg-white/70 px-5 py-2 text-[21px]">💡 {tip}</p>
    </div>
  );
}

/* ---------- Наслов и крај ---------- */
export function TitleSlide({ title1, title2, subtitle, age }: { title1: string; title2: string; subtitle: string; age: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <img src={asset("logo.png")} alt="Igra Lab" style={{ height: 80 }} />
      <h1 className="mt-4 text-[84px] font-extrabold leading-none" style={{ color: C.blue, fontFamily: "var(--font-nunito)" }}>{title1}</h1>
      <h1 className="text-[84px] font-extrabold leading-none" style={{ color: C.red, fontFamily: "var(--font-nunito)" }}>{title2}</h1>
      <p className="mt-2 text-[28px] opacity-80">{subtitle}</p>
      <p className="text-[24px] opacity-70">{age}</p>
      <img src={asset("sprites/scene-table.png")} alt="" style={{ height: 230 }} />
    </div>
  );
}
export function EndSlide() {
  const [stars, setStars] = useState(0);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-[96px] font-extrabold" style={{ color: C.orange, fontFamily: "var(--font-nunito)" }}>БРАВО!</h1>
      <div className="flex gap-4">
        {[5, 10, 15, 20].map((v, i) => (
          <button key={v} onClick={() => setStars(v)} className="flex h-28 w-28 items-center justify-center rounded-full border-4 text-[48px] font-bold"
            style={{ borderColor: [C.red, C.blue, C.green, C.orange][i], background: stars >= v ? [C.red, C.blue, C.green, C.orange][i] : "#fff", color: stars >= v ? "#fff" : C.ink }}>{v}</button>
        ))}
      </div>
      <div className="flex min-h-[80px] gap-2">{Array.from({ length: stars }, (_, i) => <Sprite key={i} name="star" h={stars > 10 ? 44 : 60} />)}</div>
      <p className="text-[24px]">Налепнице и диплома: стране 18 и 19 радног листа.</p>
      <img src={asset("logo.png")} alt="Igra Lab" style={{ height: 70 }} />
    </div>
  );
}
