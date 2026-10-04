// Pomoćnici za priče sa zaključivanjem (Mali detektiv).
export const DETEKTIV_LEAD = (title, vrste) =>
  `Ово је мали укус књижице „${title}“: шест кратких случајева, по један из сваке врсте. Дете чита трагове (или их ви читате наглас), закључује корак по корак и само долази до решења. Испод је шта је сваки случај вежбао и на којој страни књижице то наставља. ${vrste || ""}`.trim();

// imena -> mesta (slotovi). at[ime] = redni broj slike sleva (0, 1, 2...)
export const clue = (text, check) => ({ text, check });
export const is = (ime, ...slots) => (at) => slots.includes(at[ime]);
export const isNot = (ime, ...slots) => (at) => !slots.includes(at[ime]);
export const before = (a, b) => (at) => at[a] < at[b];
export const rightOf = (a, b) => (at) => at[a] > at[b];
export const beside = (a, b) => (at) => Math.abs(at[a] - at[b]) === 1;

// Tabele: at[ime] = [kolona u prvoj tabeli, kolona u drugoj tabeli, ...]
export const tHas = (ime, t, col) => (at) => at[ime][t] === col;
export const tNot = (ime, t, col) => (at) => at[ime][t] !== col;
export const tNotAny = (ime, t, ...cols) => (at) => !cols.includes(at[ime][t]);
export const tBefore = (a, b, t = 0) => (at) => at[a][t] < at[b][t];
// „Dete sa X u prvoj tabeli ima Y u drugoj“: red gde su obe kolone isti
export const tLink = (t1, c1, t2, c2) => (at) => Object.values(at).some((v) => v[t1] === c1 && v[t2] === c2);

/* ===== generatori za Mozgalice (pokreću se pri pravljenju priče, rezultat ide u podatke) ===== */
export function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Lavirint (DFS): cells[y][x] = bitovi otvorenih prolaza N=1 E=2 S=4 W=8; polazak (0,0), cilj (cols-1,rows-1)
export function makeMaze(cols, rows, seed) {
  const r = rng(seed), cells = Array.from({ length: rows }, () => Array(cols).fill(0)), seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  const D = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]], stack = [[0, 0]]; seen[0][0] = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1], opts = D.filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < cols && ny < rows && !seen[ny][nx]; });
    if (!opts.length) { stack.pop(); continue; }
    const [dx, dy, b, ob] = opts[Math.floor(r() * opts.length)], nx = x + dx, ny = y + dy;
    cells[y][x] |= b; cells[ny][nx] |= ob; seen[ny][nx] = true; stack.push([nx, ny]);
  }
  return cells;
}

// Osmosmerka: vraća { grid, pos } (pos[reč] = [[y,x],[y,x]] početak i kraj)
export function makeWordSearch(words, rows, cols, seed, dirs = [[0, 1], [1, 0]], pool = "АБВГДЕЖЗИЈКЛМНОПРСТУФХЦЧШ") {
  const r = rng(seed), grid = Array.from({ length: rows }, () => Array(cols).fill("")), pos = {};
  for (const w of [...words].sort((a, b) => b.length - a.length)) {
    let ok = false;
    for (let t = 0; t < 800 && !ok; t++) {
      const [dy, dx] = dirs[Math.floor(r() * dirs.length)], rev = r() < 0.3, word = rev ? [...w].reverse().join("") : w;
      const y0 = Math.floor(r() * rows), x0 = Math.floor(r() * cols), y1 = y0 + dy * (w.length - 1), x1 = x0 + dx * (w.length - 1);
      if (y1 < 0 || x1 < 0 || y1 >= rows || x1 >= cols) continue;
      let fits = true; for (let i = 0; i < w.length; i++) { const c = grid[y0 + dy * i][x0 + dx * i]; if (c && c !== word[i]) fits = false; }
      if (!fits) continue;
      for (let i = 0; i < w.length; i++) grid[y0 + dy * i][x0 + dx * i] = word[i];
      pos[w] = rev ? [[y1, x1], [y0, x0]] : [[y0, x0], [y1, x1]]; ok = true;
    }
    if (!ok) throw new Error("Reč „" + w + "“ ne staje u osmosmerku");
  }
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (!grid[y][x]) grid[y][x] = pool[Math.floor(r() * pool.length)];
  return { grid, pos };
}

// Slovo u gužvi: mreža slova sa tačno `hits` traženih slova
export function makeLetters(target, rows, cols, hits, seed, pool = "АБВГДЕЖЗИЈКЛМНОПРСТУФХЦЧШ") {
  const r = rng(seed), others = [...pool].filter((c) => c !== target), grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => others[Math.floor(r() * others.length)]));
  const cells = Array.from({ length: rows * cols }, (_, i) => i).sort(() => r() - 0.5).slice(0, hits);
  for (const i of cells) grid[Math.floor(i / cols)][i % cols] = target;
  return grid;
}

// Isti oblik: n oblika, tačno `hits` je traženog tipa
export function makeShapes(target, n, hits, seed, types = ["circle", "square", "triangle", "heart", "star", "oval", "diamond"], rot = false) {
  const r = rng(seed), others = types.filter((t) => t !== target), out = [];
  for (let i = 0; i < n; i++) out.push({ t: i < hits ? target : others[Math.floor(r() * others.length)], s: 0.6 + r() * 0.4, rot: rot ? Math.floor(r() * 4) * 15 : 0 });
  return out.sort(() => r() - 0.5);
}
