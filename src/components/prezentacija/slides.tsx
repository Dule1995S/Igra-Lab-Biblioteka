"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { C } from "./consts";
import { Card, Choices, Matcher, SlideTitle, Sprite, TenFrame, frameCells, type Cell } from "./ui";

/* ---------- 1. Колико их има? ---------- */
export type CountItem = { sprites: string[]; options: number[]; answer: number };

function CountCard({ item }: { item: CountItem }) {
  const [counted, setCounted] = useState<number[]>([]);
  const toggle = (i: number) =>
    setCounted((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));
  return (
    <Card color={C.red} className="flex flex-col items-center justify-between gap-3 p-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {item.sprites.map((s, i) => (
          <button key={i} onClick={() => toggle(i)} className="relative">
            <Sprite name={s} h={item.sprites.length > 6 ? 62 : 74} />
            {counted.includes(i) && (
              <span className="absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full text-[22px] font-bold text-white"
                style={{ background: C.blue }}>{counted.indexOf(i) + 1}</span>
            )}
          </button>
        ))}
      </div>
      <Choices options={item.options} answer={item.answer} size={64} />
    </Card>
  );
}
export function CountSlide({ title, hint, items }: { title: string; hint: string; items: CountItem[] }) {
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="grid grid-cols-3 gap-5 px-12 pt-5">{items.map((it, i) => <CountCard key={i} item={it} />)}</div>
    </>
  );
}

/* ---------- 2. Повежи број и скуп ---------- */
export function MatchCountSlide({ title, hint, rows }: {
  title: string; hint: string; rows: { n: number; sprites: string[] }[];
}) {
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="pt-4">
        <Matcher left={rows.map((r) => ({ id: String(r.n), label: String(r.n) }))}
          right={[...rows].reverse().map((r) => ({
            id: String(r.n),
            node: <div className="flex flex-wrap justify-center gap-1">{r.sprites.map((s, i) => <Sprite key={i} name={s} h={58} />)}</div>,
          }))}
          pairs={Object.fromEntries(rows.map((r) => [String(r.n), String(r.n)]))} />
      </div>
    </>
  );
}

/* ---------- 3. Попуни до 10 ---------- */
export function Fill10Slide({ title, hint, rows }: { title: string; hint: string; rows: { have: number; options: number[] }[] }) {
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-3 flex flex-col gap-3 px-12">
        {rows.map((r, i) => <Fill10Row key={i} row={r} />)}
      </div>
    </>
  );
}
function Fill10Row({ row }: { row: { have: number; options: number[] } }) {
  const [filled, setFilled] = useState(0);
  const need = 10 - row.have;
  const cells: Cell[] = Array.from({ length: 10 }, (_, i) => (i < row.have + filled ? "red" : "empty"));
  return (
    <Card color={C.red} className="flex items-center justify-between px-8 py-2">
      <TenFrame cells={cells} size={34} onCell={(i) => i >= row.have + filled && setFilled((f) => Math.min(need, f + 1))} />
      <span className="text-[26px] font-bold tracking-widest">ЈОШ</span>
      <Choices options={row.options} answer={need} size={56} onSolved={() => setFilled(need)} />
    </Card>
  );
}

/* ---------- 4. Где има више? ---------- */
export type ComparePair = { left: string[]; right: string[] };
export function CompareSlide({ title, hint, pairs }: { title: string; hint: string; pairs: ComparePair[] }) {
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-3 flex flex-col gap-3 px-12">
        {pairs.map((p, i) => <CompareRow key={i} pair={p} />)}
      </div>
    </>
  );
}
function CompareRow({ pair }: { pair: ComparePair }) {
  const [sel, setSel] = useState<("l" | "r")[]>([]);
  const [result, setResult] = useState<null | boolean>(null);
  const correct = pair.left.length === pair.right.length ? ["l", "r"] : pair.left.length > pair.right.length ? ["l"] : ["r"];
  const toggle = (s: "l" | "r") => { setResult(null); setSel((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s])); };
  const check = () => setResult(sel.length === correct.length && correct.every((c) => sel.includes(c as "l" | "r")));
  const side = (s: "l" | "r", sprites: string[]) => (
    <Card color={C.red} selected={sel.includes(s)} onClick={() => toggle(s)}
      className="flex flex-1 flex-wrap items-center justify-center gap-1 p-2">
      {sprites.map((n, i) => <Sprite key={i} name={n} h={50} />)}
      {sel.includes(s) && <span className="ml-2 text-[34px]">⭕</span>}
    </Card>
  );
  return (
    <div className="flex items-center gap-4">
      {side("l", pair.left)}
      <span className="w-14 text-center text-[22px] font-bold">ИЛИ</span>
      {side("r", pair.right)}
      <div className="flex w-28 flex-col items-center gap-1">
        <button className="btn !px-4 !py-2 !text-[20px]" onClick={check} disabled={sel.length === 0}>Провери</button>
        {result === true && <span className="text-[30px]" style={{ color: C.green }}>✓</span>}
        {result === false && <span className="text-[22px]" style={{ color: C.red }}>Преброј поново</span>}
      </div>
    </div>
  );
}

/* ---------- 5. Који број недостаје? ---------- */
export function MissingSlide({ title, hint, rows }: {
  title: string; hint: string; rows: { seq: (number | null)[]; options: number[]; answer: number; color: string }[];
}) {
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-4 flex flex-col gap-3 px-12">
        {rows.map((r, i) => <MissingRow key={i} row={r} />)}
      </div>
    </>
  );
}
function MissingRow({ row }: { row: { seq: (number | null)[]; options: number[]; answer: number; color: string } }) {
  const [solved, setSolved] = useState(false);
  return (
    <Card color={row.color} className="flex items-center justify-between px-8 py-3">
      <div className="flex gap-4">
        {row.seq.map((n, i) => (
          <div key={i} className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl text-[40px] font-bold"
            style={{ border: `4px ${n === null && !solved ? "dashed" : "solid"} ${n === null ? C.ink : row.color}`,
              background: n === null && solved ? C.green : "#fff", color: n === null && solved ? "#fff" : C.ink }}>
            {n ?? (solved ? row.answer : "?")}
          </div>
        ))}
      </div>
      <Choices options={row.options} answer={row.answer} size={68} onSolved={() => setSolved(true)} />
    </Card>
  );
}

/* ---------- 6. Десет и још ---------- */
export function TenPlusSlide({ title, hint, exampleRed, rows }: {
  title: string; hint: string; exampleRed: number; rows: { red: number; options: number[] }[];
}) {
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-4 flex gap-6 px-12">
        <Card color={C.blue} className="flex w-[44%] flex-col items-center gap-3 p-4">
          <p className="rounded-full border-2 border-black px-4 text-[20px] font-bold">ПРИМЕР</p>
          <img src="/sprites/scene-blocks.png" alt="" style={{ height: 150 }} />
          <div className="flex gap-3">
            <TenFrame cells={frameCells(10, "blue")} size={32} />
            <TenFrame cells={frameCells(exampleRed)} size={32} />
          </div>
          <p className="rounded-full border-4 px-6 py-1 text-[28px] font-extrabold" style={{ borderColor: C.blue }}>
            10 И ЈОШ {exampleRed} ЈЕ {10 + exampleRed}
          </p>
        </Card>
        <div className="flex flex-1 flex-col gap-3">
          {rows.map((r, i) => (
            <Card key={i} color={C.red} className="flex items-center justify-between px-5 py-3">
              <div className="flex gap-2">
                <TenFrame cells={frameCells(10, "blue")} size={30} />
                <TenFrame cells={frameCells(r.red)} size={30} />
              </div>
              <Choices options={r.options} answer={10 + r.red} size={58} />
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------- 7. Повежи до 20 ---------- */
export function Match20Slide({ title, hint, rows }: { title: string; hint: string; rows: { n: number; red: number }[] }) {
  const shuffled = [rows[2], rows[3], rows[0], rows[1]];
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="pt-4">
        <Matcher left={rows.map((r) => ({ id: String(r.n), label: String(r.n) }))}
          right={shuffled.map((r) => ({
            id: String(r.n),
            node: (
              <div className="flex gap-3">
                <TenFrame cells={frameCells(10, "blue")} size={36} />
                <TenFrame cells={frameCells(r.red)} size={36} />
              </div>
            ),
          }))}
          pairs={Object.fromEntries(rows.map((r) => [String(r.n), String(r.n)]))} />
      </div>
    </>
  );
}

/* ---------- 8. Бројчани лов ---------- */
const HUNT: [string, number][] = [["fish", 12], ["shell", 9], ["star", 15]];
function huntLayout() {
  const names = HUNT.flatMap(([n, c]) => Array(c).fill(n) as string[]);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = names.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [names[i], names[j]] = [names[j], names[i]]; }
  return names.map((n, i) => ({ n, x: (i % 9) * 11.2 + 3 + rnd() * 4, y: Math.floor(i / 9) * 23 + 3 + rnd() * 8 }));
}
const HUNT_ITEMS = huntLayout();
export function HuntSlide({ title, hint }: { title: string; hint: string }) {
  const [marked, setMarked] = useState<number[]>([]);
  const [show, setShow] = useState(false);
  const count = (n: string) => marked.filter((i) => HUNT_ITEMS[i].n === n).length;
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="relative mx-12 mt-3 rounded-3xl border-4" style={{ height: 380, borderColor: C.blue, background: "#e8f2fc" }}>
        {HUNT_ITEMS.map((it, i) => (
          <button key={i} className="absolute transition" style={{ left: `${it.x}%`, top: `${it.y}%`, opacity: marked.includes(i) ? 0.35 : 1 }}
            onClick={() => setMarked((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]))}>
            <Sprite name={it.n} h={60} />
            {marked.includes(i) && <span className="absolute inset-0 flex items-center justify-center text-[44px]" style={{ color: C.green }}>✓</span>}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 px-12">
        {HUNT.map(([n, total]) => (
          <Card key={n} color={C.blue} className="flex flex-1 items-center justify-center gap-3 py-2">
            <Sprite name={n} h={52} />
            <span className="flex h-14 w-20 items-center justify-center rounded-2xl border-4 border-black bg-white text-[36px] font-bold">
              {show ? total : count(n)}
            </span>
          </Card>
        ))}
        <button className="btn !text-[20px]" onClick={() => setShow((s) => !s)}>{show ? "Сакриј решење" : "Решење"}</button>
      </div>
    </>
  );
}

/* ---------- 9. Две боје, укупно 10 ---------- */
function ColorFrame({ initial }: { initial: Cell[] }) {
  const [cells, setCells] = useState<Cell[]>(initial);
  const next = (c: Cell): Cell => (c === "empty" ? "red" : c === "red" ? "blue" : "empty");
  const red = cells.filter((c) => c === "red").length, blue = cells.filter((c) => c === "blue").length;
  return (
    <Card color="#c9bfae" className="flex items-center justify-between px-6 py-3">
      <TenFrame cells={cells} size={46} onCell={(i) => setCells((cs) => cs.map((c, j) => (j === i ? next(c) : c)))} />
      <div className="flex items-center gap-3 text-[34px] font-bold">
        <span className="flex h-16 w-16 items-center justify-center rounded-xl border-4" style={{ borderColor: C.red }}>{red}</span>И
        <span className="flex h-16 w-16 items-center justify-center rounded-xl border-4" style={{ borderColor: C.blue }}>{blue}</span>ЈЕ
        <span className={red + blue === 10 ? "" : "opacity-30"}>10</span>
        {red + blue === 10 && <span style={{ color: C.green }}>✓</span>}
      </div>
    </Card>
  );
}
export function TwoColorsSlide({ title, hint }: { title: string; hint: string }) {
  const example: Cell[] = [...Array(6).fill("red"), ...Array(4).fill("blue")];
  const blank: Cell[] = Array(10).fill("empty");
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-4 flex gap-6 px-12">
        <div className="w-[44%]">
          <p className="mb-2 text-[22px] font-bold">ПРИМЕР</p>
          <Card color={C.blue} className="flex flex-col items-center gap-4 p-6">
            <TenFrame cells={example} size={52} />
            <p className="text-[36px] font-extrabold">6 И 4 ЈЕ 10</p>
          </Card>
          <p className="mt-4 text-[20px] opacity-70">Додирни поље да га обојиш: црвено, плаво, празно.</p>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <p className="text-[22px] font-bold">САД ТИ</p>
          {[0, 1, 2].map((i) => <ColorFrame key={i} initial={blank} />)}
        </div>
      </div>
    </>
  );
}

/* ---------- 10. Распореди по једнако ---------- */
const BASKETS = [{ id: 0, color: C.red }, { id: 1, color: C.blue }, { id: 2, color: C.green }];
export function ShareSlide({ title, hint, items, perBasket, options }: {
  title: string; hint: string; items: string[]; perBasket: number; options: number[];
}) {
  const [place, setPlace] = useState<(number | null)[]>(items.map(() => null));
  const [sel, setSel] = useState<number | null>(null);
  const inBasket = (b: number) => place.filter((p) => p === b).length;
  const allPlaced = place.every((p) => p !== null);
  const equal = allPlaced && BASKETS.every((b) => inBasket(b.id) === perBasket);
  const tapItem = (i: number) => (place[i] === null ? setSel(i === sel ? null : i) : setPlace((p) => p.map((v, j) => (j === i ? null : v))));
  const tapBasket = (b: number) => { if (sel === null) return; setPlace((p) => p.map((v, j) => (j === sel ? b : v))); setSel(null); };
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-2 flex flex-wrap justify-center gap-3 px-12" style={{ minHeight: 140 }}>
        {items.map((s, i) => place[i] === null && (
          <button key={i} onClick={() => tapItem(i)} className="rounded-full p-1 transition"
            style={{ outline: sel === i ? `5px solid ${C.orange}` : undefined }}><Sprite name={s} h={64} /></button>
        ))}
        {allPlaced && <p className="self-center text-[28px] font-bold" style={{ color: equal ? C.green : C.red }}>
          {equal ? "У свакој корпи је исто ✓" : "Није свуда исто, покушај поново"}</p>}
      </div>
      <div className="mt-2 flex justify-around px-12">
        {BASKETS.map((b) => (
          <div key={b.id} onClick={() => tapBasket(b.id)} role="button" className="flex w-[27%] cursor-pointer flex-col items-center">
            <div className="flex min-h-[90px] flex-wrap justify-center gap-1">
              {items.map((s, i) => place[i] === b.id && (
                <button key={i} onClick={(e) => { e.stopPropagation(); tapItem(i); }}><Sprite name={s} h={44} /></button>
              ))}
            </div>
            <div className="h-24 w-full rounded-b-3xl border-4" style={{ borderColor: C.ink, background: "#e0b374", borderTop: `14px solid ${b.color}` }} />
            <p className="mt-1 text-[24px] font-bold">{inBasket(b.id)}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-5">
        <span className="text-[24px] font-bold tracking-widest">У СВАКОЈ КОРПИ:</span>
        <Choices options={options} answer={perBasket} size={60} />
        <button className="btn !px-4 !py-2 !text-[18px]" onClick={() => { setPlace(items.map(() => null)); setSel(null); }}>Испочетка</button>
      </div>
    </>
  );
}

/* ---------- 11. Мање или више од 10? ---------- */
export function LessMoreSlide({ title, hint, items }: { title: string; hint: string; items: { sprite: string; n: number }[] }) {
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="grid grid-cols-3 gap-5 px-12 pt-5">{items.map((it, i) => <LessMoreCard key={i} item={it} />)}</div>
    </>
  );
}
function LessMoreCard({ item }: { item: { sprite: string; n: number } }) {
  const [pick, setPick] = useState<"less" | "more" | null>(null);
  const right = item.n < 10 ? "less" : "more";
  const btn = (k: "less" | "more", label: string, color: string) => (
    <button onClick={() => !pick || pick !== right ? setPick(k) : null}
      className="rounded-full border-4 px-7 py-2 text-[24px] font-bold tracking-widest"
      style={{ borderColor: color, background: pick === k ? (k === right ? C.green : C.red) : "#fff",
        color: pick === k ? "#fff" : C.ink, opacity: pick && pick !== k ? 0.6 : 1 }}>{label}</button>
  );
  return (
    <Card color={C.green} className="flex flex-col items-center gap-3 p-4">
      <div className="flex min-h-[150px] flex-wrap items-center justify-center gap-1">
        {Array.from({ length: item.n }, (_, i) => <Sprite key={i} name={item.sprite} h={item.n > 10 ? 48 : 58} />)}
      </div>
      <div className="flex gap-3">{btn("less", "МАЊЕ", C.blue)}{btn("more", "ВИШЕ", C.red)}</div>
      {pick && <span className="text-[26px]" style={{ color: pick === right ? C.green : C.red }}>{pick === right ? "✓" : "Преброј поново"}</span>}
    </Card>
  );
}

/* ---------- 12. Мој број ---------- */
export function MyNumberSlide({ title, hint }: { title: string; hint: string }) {
  const [n, setN] = useState<number | null>(null);
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-6 flex flex-wrap justify-center gap-4 px-12">
        {Array.from({ length: 10 }, (_, i) => 11 + i).map((v) => (
          <button key={v} onClick={() => setN(v)} className="h-24 w-24 rounded-3xl border-4 text-[48px] font-extrabold"
            style={{ borderColor: n === v ? C.orange : C.ink, background: n === v ? C.orange : "#fff", color: n === v ? "#fff" : C.ink }}>{v}</button>
        ))}
      </div>
      <Card color={C.blue} className="mx-12 mt-8 flex flex-col items-center gap-5 p-8">
        {n === null ? <p className="text-[30px] opacity-60">Изабери број од 11 до 20</p> : (
          <>
            <div className="flex items-end gap-10">
              <div className="text-center"><TenFrame cells={frameCells(10, "blue")} size={52} /><p className="mt-2 text-[20px] font-bold tracking-widest">ПУНА ДЕСЕТИЦА</p></div>
              <div className="text-center"><TenFrame cells={frameCells(n - 10)} size={52} /><p className="mt-2 text-[20px] font-bold tracking-widest">И ЈОШ</p></div>
            </div>
            <p className="text-[44px] font-extrabold">10 И ЈОШ {n - 10} ЈЕ {n}</p>
          </>
        )}
      </Card>
    </>
  );
}

/* ---------- 13. Пљесни и преброј (игра покрета) ---------- */
export function ClapSlide({ title, hint, numbers }: { title: string; hint: string; numbers: number[] }) {
  const [n, setN] = useState<number | null>(null);
  const [claps, setClaps] = useState(0);
  const done = n !== null && claps >= n;
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-3 flex gap-6 px-12">
        <Card color={C.orange} className="flex w-1/2 flex-col items-center justify-center gap-2 p-4" >
          <img src={done ? "/sprites/scene-highfive.png" : "/sprites/scene-clap.png"} alt="" style={{ height: 300 }} />
          <p className="text-[26px] font-bold tracking-widest">{done ? "ДАЈ ПЕТ!" : "ПЉЕСКАМО И БРОЈИМО"}</p>
        </Card>
        <Card color={C.blue} className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          {n === null ? <p className="text-[28px] opacity-60">Изабери број</p> : (
            <>
              <p className="text-[110px] font-extrabold leading-none">{n}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: n }, (_, i) => (
                  <span key={i} className="h-8 w-8 rounded-full border-4" style={{ borderColor: C.ink, background: i < claps ? C.warm : "#fff" }} />
                ))}
              </div>
              <button className="btn" onClick={() => setClaps((c) => Math.min(n, c + 1))} disabled={done}>👏 Пљесни ({claps})</button>
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

/* ---------- 14. Десет корака и још ---------- */
export function StepsSlide({ title, hint, cards }: { title: string; hint: string; cards: number[] }) {
  const [n, setN] = useState<number | null>(null);
  const colors = [C.red, C.green, C.orange];
  return (
    <>
      <SlideTitle title={title} hint={hint} />
      <div className="mt-3 flex gap-6 px-12">
        <Card color={C.orange} className="flex w-[40%] items-center justify-center p-4">
          <img src="/sprites/scene-steps.png" alt="" style={{ height: 270 }} />
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

/* ---------- Наслов и крај ---------- */
export function TitleSlide({ title1, title2, subtitle, age }: { title1: string; title2: string; subtitle: string; age: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <img src="/logo.png" alt="Igra Lab" style={{ height: 80 }} />
      <h1 className="mt-4 text-[84px] font-extrabold leading-none" style={{ color: C.blue, fontFamily: "var(--font-nunito)" }}>{title1}</h1>
      <h1 className="text-[84px] font-extrabold leading-none" style={{ color: C.red, fontFamily: "var(--font-nunito)" }}>{title2}</h1>
      <p className="mt-2 text-[28px] opacity-80">{subtitle}</p>
      <p className="text-[24px] opacity-70">{age}</p>
      <img src="/sprites/scene-table.png" alt="" style={{ height: 230 }} />
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
      <img src="/logo.png" alt="Igra Lab" style={{ height: 70 }} />
    </div>
  );
}

