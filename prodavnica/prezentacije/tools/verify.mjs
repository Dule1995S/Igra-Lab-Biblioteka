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

const slugs = process.argv[2] ? [process.argv[2]] : readdirSync(join(root, "stories"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
for (const slug of slugs) {
  const story = (await import(pathToFileURL(join(root, "stories", slug, "story.mjs")).href)).default;
  console.log(slug);
  story.steps.forEach((st, si) => {
    const g = st.game;
    (g.rounds || []).forEach((R, ri) => {
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
      } else if (g.type === "numq") {
        if (!R.choices.includes(R.answer)) err(`${L}: tačan broj nije među ponuđenima`);
        if (R.check && !R.check()) err(`${L}: jednačina se ne slaže`);
        checked++;
      }
    });
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
