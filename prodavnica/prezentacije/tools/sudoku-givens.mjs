// Pomoć: za zadato rešenje (n x n, kutije br x bc) izabere najmanje zadatih polja tako da rešenje ostane jedinstveno.
// Upotreba: node tools/sudoku-givens.mjs '[[1,2,3,4],...]' br bc [seed]
import { rng } from "../stories/_logic.mjs";
const sol = JSON.parse(process.argv[2]), br = +process.argv[3], bc = +process.argv[4], seed = +(process.argv[5] || 1), n = sol.length;
function count(given) {
  const g = given.map((row, y) => row.map((v, x) => (v ? sol[y][x] : 0))); let c = 0;
  const ok = (y, x, v) => { for (let i = 0; i < n; i++) if (g[y][i] === v || g[i][x] === v) return false; const by = Math.floor(y / br) * br, bx = Math.floor(x / bc) * bc; for (let a = 0; a < br; a++) for (let b = 0; b < bc; b++) if (g[by + a][bx + b] === v) return false; return true; };
  const go = () => { if (c > 1) return; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!g[y][x]) { for (let v = 1; v <= n; v++) if (ok(y, x, v)) { g[y][x] = v; go(); g[y][x] = 0; } return; } c++; };
  go(); return c;
}
const given = sol.map((r) => r.map(() => 1)), r = rng(seed), cells = [].concat(...sol.map((row, y) => row.map((_, x) => [y, x]))).sort(() => r() - 0.5);
for (const [y, x] of cells) { given[y][x] = 0; if (count(given) !== 1) given[y][x] = 1; }
console.log(JSON.stringify(given), given.flat().filter(Boolean).length + " zadatih");
