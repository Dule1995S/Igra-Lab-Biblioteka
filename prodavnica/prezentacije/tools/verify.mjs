// Proverava da svaki slučaj (imena, tabela, bojenje, precrtavanje) ima TAČNO jedno rešenje,
// da zadato rešenje zadovoljava sve tragove i da nijedan trag nije suvišan.
// Upotreba: node tools/verify.mjs [naziv-price]
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ALPHA = ["А","Б","В","Г","Д","Ђ","Е","Ж","З","И","Ј","К","Л","Љ","М","Н","Њ","О","П","Р","С","Т","Ћ","У","Ф","Х","Ц","Ч","Џ","Ш"];
let bad = 0, checked = 0;
const err = (m) => { bad++; console.log("  ✗ " + m); };

function* perms(a) { if (a.length <= 1) { yield a.slice(); return; } for (let i = 0; i < a.length; i++) { const rest = a.slice(0, i).concat(a.slice(i + 1)); for (const p of perms(rest)) yield [a[i], ...p]; } }
function* injective(items, n) { // nizovi dužine n od različitih elemenata
  if (n === 0) { yield []; return; }
  for (let i = 0; i < items.length; i++) { const rest = items.slice(0, i).concat(items.slice(i + 1)); for (const p of injective(rest, n - 1)) yield [items[i], ...p]; }
}
function product(lists) { return lists.reduce((acc, l) => acc.flatMap((x) => l.map((y) => [...x, y])), [[]]); }

function uniq(label, all, clues, solutionKey, make) {
  const sols = all.filter((s) => clues.every((c) => c.check(make(s))));
  if (sols.length !== 1) err(`${label}: ${sols.length} rešenja (treba 1)`);
  else if (JSON.stringify(sols[0]) !== JSON.stringify(solutionKey)) err(`${label}: jedino rešenje je ${JSON.stringify(sols[0])}, a zadato je ${JSON.stringify(solutionKey)}`);
  clues.forEach((c, i) => { const without = all.filter((s) => clues.every((d, j) => j === i || d.check(make(s)))); if (without.length === 1) err(`${label}: trag ${i + 1} je suvišan („${c.text}“)`); });
  checked++;
}

const slugs = process.argv[2] ? [process.argv[2]] : readdirSync(join(root, "stories"), { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith("_")).map((d) => d.name);
for (const slug of slugs) {
  const story = (await import(pathToFileURL(join(root, "stories", slug, "story.mjs")).href)).default;
  console.log(slug);
  story.steps.forEach((st, si) => {
    const gl = st.game.type === "multi" ? st.game.parts : [st.game];
    gl.forEach((g) => (g.rounds || []).forEach((R, ri) => {
      const L = `${st.label} #${ri + 1}`;
      if (g.type === "assign") {
        const n = R.slots.length, idxs = [...Array(n).keys()];
        const all = [...perms(idxs)]; // all[i][slot] = indeks imena
        uniq(L, all, R.clues, R.solution, (s) => { const at = {}; s.forEach((nameIdx, slot) => { at[R.names[nameIdx]] = slot; }); return at; });
      } else if (g.type === "table") {
        const nR = R.rows.length;
        const perTable = R.tables.map((T) => [...perms([...Array(T.cols.length).keys()])]);
        const all = product(perTable); // all[k][t][row] = kolona
        uniq(L, all, R.clues, R.solution, (s) => { const at = {}; R.rows.forEach((nm, r) => { at[nm] = s.map((tab) => tab[r]); }); return at; });
        void nR;
      } else if (g.type === "paint") {
        const pal = R.palette || ["red", "blue", "yellow", "green"], ids = R.shapes.map((s) => s.id);
        const all = [...injective(pal, ids.length)];
        uniq(L, all, R.clues, ids.map((id) => R.solution[id]), (s) => { const c = {}; ids.forEach((id, i) => { c[id] = s[i]; }); return c; });
      } else if (g.type === "eliminate") {
        let alive = R.animals.map((a, i) => i);
        R.clues.forEach((cl, k) => {
          const f = (a) => (cl.has ? !a.traits.includes(cl.trait) : a.traits.includes(cl.trait));
          const out = alive.filter((i) => f(R.animals[i]));
          if (!out.length) err(`${L}: trag ${k + 1} ne izbacuje nikoga`);
          alive = alive.filter((i) => !out.includes(i));
        });
        if (alive.length !== 1) err(`${L}: ostaje ${alive.length} životinja`);
        else if (R.animals[alive[0]].key !== R.answer) err(`${L}: ostaje ${R.animals[alive[0]].key}, a odgovor je ${R.answer}`);
        checked++;
      } else if (g.type === "sudoku") {
        const n = R.n, sol = R.sol, ok0 = sol.every((row, y) => row.every((v, x) => { for (let i = 0; i < n; i++) { if (i !== x && sol[y][i] === v) return false; if (i !== y && sol[i][x] === v) return false; } const by = Math.floor(y / R.br) * R.br, bx = Math.floor(x / R.bc) * R.bc; for (let a = 0; a < R.br; a++) for (let b = 0; b < R.bc; b++) if ((by + a !== y || bx + b !== x) && sol[by + a][bx + b] === v) return false; return v >= 1 && v <= n; }));
        if (!ok0) err(`${L}: rešenje sudokua nije ispravno`);
        const grid = R.given.map((row, y) => row.map((g, x) => (g ? sol[y][x] : 0))); let count = 0;
        const okc = (y, x, v) => { for (let i = 0; i < n; i++) if (grid[y][i] === v || grid[i][x] === v) return false; const by = Math.floor(y / R.br) * R.br, bx = Math.floor(x / R.bc) * R.bc; for (let a = 0; a < R.br; a++) for (let b = 0; b < R.bc; b++) if (grid[by + a][bx + b] === v) return false; return true; };
        const solve = () => { if (count > 1) return; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!grid[y][x]) { for (let v = 1; v <= n; v++) if (okc(y, x, v)) { grid[y][x] = v; solve(); grid[y][x] = 0; } return; } count++; };
        solve(); if (count !== 1) err(`${L}: sudoku ima ${count > 1 ? "više" : "0"} rešenja`); checked++;
      } else if (g.type === "twins") {
        let pairs = 0; for (let i = 0; i < R.items.length; i++) for (let j = i + 1; j < R.items.length; j++) { const a = R.items[i], b = R.items[j]; if (a.c === b.c && a.pat === b.pat && (a.cap || "") === (b.cap || "")) pairs++; }
        if (pairs !== 1) err(`${L}: ${pairs} istih parova kugli (treba 1)`); checked++;
      } else if (g.type === "spell") {
        if (R.imgs && R.imgs.length !== R.word.length) err(`${L}: broj slika i slova ne odgovara`);
        if (R.legend && R.imgs) R.imgs.forEach((im, i) => { const e = R.legend.find((q) => q.img === im); if (!e || e.letter !== R.word[i]) err(`${L}: šifra ne daje slovo ${i + 1}`); });
        checked++;
      } else if (g.type === "wordsearch") {
        R.words.forEach((w) => { const [a, b] = R.pos[w] || []; if (!a) return err(`${L}: nema položaja za ${w}`); const len = w.length, dy = Math.sign(b[0] - a[0]), dx = Math.sign(b[1] - a[1]); let s = ""; for (let i = 0; i < len; i++) s += R.grid[a[0] + dy * i][a[1] + dx * i]; if (s !== w) err(`${L}: reč ${w} nije u mreži (${s})`); });
        checked++;
      } else if (g.type === "maze") {
        const { cols, rows, cells } = R, seen = new Set(["0,0"]), q = [[0, 0]]; const D = [[0, -1, 1], [1, 0, 2], [0, 1, 4], [-1, 0, 8]];
        while (q.length) { const [x, y] = q.shift(); for (const [dx, dy, b] of D) if (cells[y][x] & b) { const k = `${x + dx},${y + dy}`; if (!seen.has(k)) { seen.add(k); q.push([x + dx, y + dy]); } } }
        if (!seen.has(`${cols - 1},${rows - 1}`)) err(`${L}: lavirint nema put`); checked++;
      } else if (g.type === "numq") {
        if (!R.choices.includes(R.answer)) err(`${L}: tačan broj nije među ponuđenima`);
        if (R.check && !R.check()) err(`${L}: jednačina se ne slaže`);
        checked++;
      }
    }));
    if (st.reward && story.magic) {
      const W = story.magic.word.charAt(st.slot);
      const L = st.reward.letter || ALPHA[st.reward.number - 1];
      if (L !== W) err(`${st.label}: nagrada daje „${L}“, a na mestu ${st.slot + 1} treba „${W}“`);
    }
    if (story.magic && (st.slot == null || !st.reward)) err(`${st.label}: nema slot/nagradu za čarobnu reč`);
  });
}
console.log(bad ? `\n${bad} grešaka` : `\nOK: ${checked} slučajeva, sva rešenja jedinstvena`);
process.exit(bad ? 1 : 0);

// slotovi čarobne reči moraju pokriti svako slovo tačno jednom
for (const slug of slugs) {
  const story = (await import(pathToFileURL(join(root, "stories", slug, "story.mjs")).href)).default;
  if (!story.magic) continue;
  const used = story.steps.map((s) => s.slot).sort();
  if (JSON.stringify(used) !== JSON.stringify([...Array(story.magic.word.length).keys()].sort())) { console.log(`✗ ${slug}: slotovi ${used} ne pokrivaju reč „${story.magic.word}“`); process.exit(1); }
}
