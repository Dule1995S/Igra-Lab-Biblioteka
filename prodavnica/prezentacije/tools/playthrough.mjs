// Automatska provera: odigra celu priču u pregledaču (Chromium) i snimi ekrane.
// Upotreba: node tools/playthrough.mjs <slug> [izlazni_folder]
// Potreban je Playwright (PLAYWRIGHT_DIR=/putanja/do/node_modules, podrazumevano /opt/node-tools/node_modules).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const slug = process.argv[2];
const out = process.argv[3] || join(here, "..", "shots", slug);
mkdirSync(out, { recursive: true });
const require = createRequire((process.env.PLAYWRIGHT_DIR || "/opt/node-tools/node_modules") + "/");
const { chromium } = require("playwright");
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errs = [];
page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error") errs.push("CONSOLE " + m.text()); });
page.on("request", (r) => { if (!/^(file|data|blob):/.test(r.url())) errs.push("SPOLJNI ZAHTEV " + r.url()); });
await page.goto("file://" + join(here, "..", "dist", slug + ".html"));
await page.waitForTimeout(500);
const shot = (n) => page.screenshot({ path: join(out, n + ".png") });
let curI = 0;
const next = async () => {
  const rw = story.steps[curI] && story.steps[curI].reward;
  if (rw && rw.number && (await page.locator(".reward").count())) {
    const wrong = rw.number === 1 ? 2 : 1;
    await page.locator(`.al[data-n="${wrong}"]`).click(); await page.waitForTimeout(150);
    await shot(`${String(curI + 1).padStart(2, "0")}-reward`);
    await page.locator(`.al[data-n="${rw.number}"]`).click(); await page.waitForTimeout(250);
  }
  await page.waitForSelector("#nextBtn:not([hidden])", { timeout: 4000 }); await page.click("#nextBtn", { force: true }); await page.waitForTimeout(250);
};
const story = await page.evaluate(() => STORY);

await shot("00-title");
await page.click(".big-btn.go"); await page.fill(".name-scene input", "Мила"); await page.keyboard.press("Enter"); await page.waitForTimeout(300);

async function drag(points, upAfter = true) {
  await page.mouse.move(points[0][0], points[0][1]); await page.mouse.down();
  for (const [x, y] of points.slice(1)) await page.mouse.move(x, y);
  if (upAfter) await page.mouse.up();
}

for (let i = 0; i < story.steps.length; i++) {
  const g = story.steps[i].game, n = String(i + 1).padStart(2, "0"), n_ = n; curI = i;
  await page.waitForTimeout(350);
  await shot(`${n}-${g.type}-start`);
  if (g.type === "odd") {
    for (let r = 0; r < g.rounds.length; r++) {
      const wrong = (g.rounds[r].odd + 1) % g.rounds[r].items.length;
      if (r === 0) { await page.locator(".cards .card").nth(wrong).click(); await page.waitForTimeout(200); await shot(`${n}-wrong`); }
      await page.locator(".cards .card").nth(g.rounds[r].odd).click(); await page.waitForTimeout(250);
      if (r === g.rounds.length - 1) await shot(`${n}-done`); await next();
    }
  } else if (g.type === "bigger") {
    for (let r = 0; r < g.rounds.length; r++) { await page.locator(".cards .card").nth(g.rounds[r].bigger === "a" ? 0 : 1).click(); await page.waitForTimeout(250); if (r === g.rounds.length - 1) await shot(`${n}-done`); await next(); }
  } else if (g.type === "choose") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r];
      if (r === 0) { await page.locator(".choices-row .card").nth((R.right + 1) % R.choices.length).click(); await page.waitForTimeout(200); await shot(`${n}-wrong`); }
      await page.locator(".choices-row .card").nth(R.right).click(); await page.waitForTimeout(250);
      if (r === g.rounds.length - 1) await shot(`${n}-done`); await next();
    }
  } else if (g.type === "sort") {
    for (let k = 0; k < g.items.length; k++) {
      const it = g.items[k];
      if (k === 0) { await page.locator(".bin").nth((it.bin + 1) % g.bins.length).click(); await page.waitForTimeout(200); await shot(`${n}-wrong`); }
      await page.locator(".bin").nth(it.bin).click(); await page.waitForTimeout(300);
      const btn = await page.locator("#nextBtn:not([hidden])").count();
      if (k === g.items.length - 1) { await shot(`${n}-done`); await next(); }
      else if (btn) await next(); else await page.waitForTimeout(800);
    }
  } else if (g.type === "order") {
    const items = g.show.map((k) => g.items[k]);
    const idxByRank = [...items.keys()].sort((a, b) => items[a].rank - items[b].rank);
    await page.locator(".ob").nth(idxByRank[1]).click(); await page.waitForTimeout(200); await shot(`${n}-wrong`);
    for (let k = 0; k < idxByRank.length; k++) { await page.locator(".ob").nth(idxByRank[k]).click(); await page.waitForTimeout(250); if (k === 1) await shot(`${n}-half`); }
    await shot(`${n}-done`); await next();
  } else if (g.type === "dig") {
    const b = await page.locator(".dig-box").boundingBox();
    const pts = []; for (let y = 20; y < b.height; y += 38) { const row = []; for (let x = 20; x < b.width; x += 30) row.push([b.x + (Math.floor(y / 38) % 2 ? b.width - x : x), b.y + y]); pts.push(...row); }
    await page.mouse.move(pts[0][0], pts[0][1]); await page.mouse.down();
    for (let k = 1; k < pts.length; k++) { await page.mouse.move(pts[k][0], pts[k][1]); if (k === Math.floor(pts.length / 3)) await shot(`${n}-half`); }
    await page.mouse.up(); await page.waitForTimeout(800); await shot(`${n}-done`); await next();
  } else if (g.type === "trace") {
    for (let r = 0; r < g.rounds.length; r++) {
      await page.waitForTimeout(250);
      const pts = await page.evaluate(() => { const p = document.querySelector(".trace-scene svg path"); const L = p.getTotalLength(); const o = []; for (let i = 0; i <= 200; i++) { const q = p.getPointAtLength(L * i / 200); o.push([q.x, q.y]); } return o; });
      await page.mouse.move(pts[0][0], pts[0][1]); await page.mouse.down();
      for (let k = 1; k < pts.length; k++) { await page.mouse.move(pts[k][0], pts[k][1]); if (r === 0 && k === 100) await shot(`${n}-half`); }
      await page.mouse.up(); await page.waitForTimeout(300); if (r === g.rounds.length - 1) await shot(`${n}-done`); await next();
    }
  } else if (g.type === "grid") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r], right = R.grid[R.hole[0]][R.hole[1]];
      if (r === 0) { await page.locator(".choices .card").nth((right + 1) % R.symbols.length).click(); await page.waitForTimeout(200); await shot(`${n}-wrong`); }
      await page.locator(".choices .card").nth(right).click(); await page.waitForTimeout(250);
      if (r === g.rounds.length - 1) await shot(`${n}-done`); await next();
    }
  } else if (g.type === "stickers") {
    for (let k = 0; k < g.slots.length; k++) { await page.locator(".tray .card").nth(k).click(); await page.waitForTimeout(80); }
    await page.waitForTimeout(400); await shot(`${n}-done`); await next();
  } else if (g.type === "shadow") {
    const t = await page.locator(".torch").boundingBox();
    await drag([[t.x + t.width / 2, t.y + 60], [640, t.y + 60], [620, t.y + 60]], false); await page.waitForTimeout(200); await shot(`${n}-near`);
    await drag([[300, t.y + 60], [150, t.y + 60]]); await page.waitForTimeout(300); await shot(`${n}-done`); await next();
  } else if (g.type === "missing") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r];
      if (r === 0) { await page.locator(".choices-row .card").nth((R.right + 1) % R.choices.length).click(); await page.waitForTimeout(200); await shot(`${n}-wrong`); }
      await page.locator(".choices-row .card").nth(R.right).click(); await page.waitForTimeout(250);
      if (r === g.rounds.length - 1) await shot(`${n}-done`); await next();
    }
  } else if (g.type === "nth") {
    const nn = g.n || 3; let first = true;
    const btns = page.locator(".nb"); const total = await btns.count(); let pos = 0;
    for (let ri = 0; ri < g.rows.length; ri++) for (let i = 0; i < g.rows[ri].length; i++, pos++) {
      if (first && (i + 1) % nn !== 0) { await btns.nth(pos).click(); await page.waitForTimeout(200); await shot(`${n}-wrong`); first = false; }
      if ((i + 1) % nn === 0) { await btns.nth(pos).click(); await page.waitForTimeout(120); }
    }
    await page.waitForTimeout(300); await shot(`${n}-done`); await next();
  } else if (g.type === "assign") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r], N = R.slots.length;
      const fill = async (sol) => { for (let k = 0; k < N; k++) { await page.locator(".nm-chip").nth(sol[k]).click(); await page.locator(".as-slot").nth(k).click(); } };
      const wrongSol = R.solution.map((_, k) => R.solution[(k + 1) % N]);
      await fill(wrongSol); await page.locator(".as-check").click(); await page.waitForTimeout(200); if (r === 0) await shot(`${n}-wrong`);
      for (let k = 0; k < N; k++) await page.locator(".as-slot").nth(k).click();
      await fill(R.solution); if (r === 0) await shot(`${n}-half`);
      await page.locator(".as-check").click(); await page.waitForTimeout(300);
      if (r === g.rounds.length - 1) await shot(`${n}-done`); await next();
    }
  } else if (g.type === "table") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r];
      const cell = (t, ri, ci) => page.locator(".dt").nth(t).locator("tr").nth(ri + 1).locator(".cell0").nth(ci);
      // pogrešan potez: dve kvačice u istom redu
      const c0 = R.solution[0][0], alt = (c0 + 1) % R.tables[0].cols.length;
      await cell(0, 0, c0).click(); await cell(0, 0, c0).click(); await cell(0, 0, alt).click(); await cell(0, 0, alt).click(); await page.waitForTimeout(150);
      if (r === 0) await shot(`${n}-wrong`);
      await cell(0, 0, alt).click(); // 2 -> 0
      for (let t = 0; t < R.tables.length; t++) for (let ri = 0; ri < R.rows.length; ri++) {
        const ci = R.solution[t][ri];
        if (t === 0 && ri === 0) { if (r === 0) await shot(`${n}-half`); continue; }
        await cell(t, ri, ci).click(); await cell(t, ri, ci).click();
      }
      await page.waitForTimeout(300); if (r === g.rounds.length - 1) await shot(`${n}-done`); await next();
    }
  } else if (g.type === "paint") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r], pal = R.palette || ["red", "blue", "yellow", "green"];
      const paintAll = async (colorOf) => { for (let k = 0; k < R.shapes.length; k++) { await page.locator(".crayon").nth(pal.indexOf(colorOf(R.shapes[k], k))).click(); await page.locator(".pshape").nth(k).click(); } };
      await paintAll((S, k) => pal[(pal.indexOf(R.solution[S.id]) + 1) % pal.length]); await page.waitForTimeout(250); if (r === 0) await shot(`${n}-wrong`);
      await paintAll((S) => R.solution[S.id]); await page.waitForTimeout(300);
      if (r === g.rounds.length - 1) await shot(`${n}-done`); await next();
    }
  } else if (g.type === "eliminate") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r]; let alive = R.animals.map((_, i) => i);
      for (let k = 0; k < R.clues.length; k++) {
        const cl = R.clues[k], f = (a) => (cl.has ? !a.traits.includes(cl.trait) : a.traits.includes(cl.trait));
        if (r === 0 && k === 0) { const ok = alive.find((i) => !f(R.animals[i])); await page.locator(".card.elim").nth(ok).click(); await page.waitForTimeout(200); await shot(`${n}-wrong`); }
        for (const i of alive.filter((i) => f(R.animals[i]))) { await page.locator(".card.elim").nth(i).click(); await page.waitForTimeout(120); }
        alive = alive.filter((i) => !f(R.animals[i]));
        if (r === 0 && k === 0) await shot(`${n}-half`);
      }
      await page.waitForTimeout(300); if (r === g.rounds.length - 1) await shot(`${n}-done`); await next();
    }
  } else if (g.type === "numq") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r], wrong = R.choices.find((v) => v !== R.answer);
      if (r === 0) { await page.locator(".nkey", { hasText: new RegExp("^" + wrong + "$") }).click(); await page.waitForTimeout(200); await shot(`${n}-wrong`); }
      await page.locator(".nkey", { hasText: new RegExp("^" + R.answer + "$") }).click(); await page.waitForTimeout(300);
      if (r === g.rounds.length - 1) await shot(`${n}-done`); await next();
    }
  } else if (g.type === "match") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r], n = R.keys.length, order = R.right || null;
      const cards = page.locator(".mcard"), ord = order || [...Array(n).keys()];
      await cards.nth(0).click(); await cards.nth(n + ((ord.indexOf(0) + 1) % n)).click(); await page.waitForTimeout(150); if (r === 0) await shot(`${n_}-wrong`);
      for (let i = 0; i < n; i++) { const j = ord.indexOf(i); await cards.nth(i).click(); await cards.nth(n + j).click(); await page.waitForTimeout(100); if (r === 0 && i === 0) await shot(`${n_}-half`); }
      await page.waitForTimeout(250); if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else if (g.type === "count") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r], wrong = R.choices.find((v) => v !== R.n);
      if (r === 0) { await page.locator(".nkey", { hasText: new RegExp("^" + wrong + "$") }).click(); await page.waitForTimeout(150); await shot(`${n_}-wrong`); }
      await page.locator(".nkey", { hasText: new RegExp("^" + R.n + "$") }).click(); await page.waitForTimeout(250);
      if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else if (g.type === "connect") {
    for (let r = 0; r < g.rounds.length; r++) {
      await page.waitForTimeout(200);
      const pts = await page.evaluate(() => window.__T.connectPts());
      if (pts.length > 2) { await page.mouse.click(pts[2][0], pts[2][1]); await page.waitForTimeout(120); if (r === 0) await shot(`${n_}-wrong`); }
      for (let i = 0; i < pts.length; i++) { await page.mouse.click(pts[i][0], pts[i][1]); await page.waitForTimeout(60); if (r === 0 && i === Math.floor(pts.length / 2)) await shot(`${n_}-half`); }
      await page.waitForTimeout(250); if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else if (g.type === "findall") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r], cells = page.locator(".fa-cell");
      const bad = R.cells.findIndex((q) => q.t !== R.target); await cells.nth(bad).click(); await page.waitForTimeout(150); if (r === 0) await shot(`${n_}-wrong`);
      for (let i = 0; i < R.cells.length; i++) if (R.cells[i].t === R.target) await cells.nth(i).click();
      await page.waitForTimeout(250); if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else if (g.type === "maze") {
    for (let r = 0; r < g.rounds.length; r++) {
      await page.waitForTimeout(200);
      const pts = await page.evaluate(() => window.__T.mazePts());
      await page.mouse.move(pts[0][0], pts[0][1]); await page.mouse.down();
      for (let i = 1; i < pts.length; i++) { await page.mouse.move(pts[i][0], pts[i][1], { steps: 3 }); if (r === 0 && i === Math.floor(pts.length / 2)) await shot(`${n_}-half`); }
      await page.mouse.up(); await page.waitForTimeout(300); if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else if (g.type === "letters") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r], cells = page.locator(".lt-cell"), cols = R.grid[0].length;
      const bad = R.grid.flat().findIndex((ch) => ch !== R.target); await cells.nth(bad).click(); await page.waitForTimeout(150); if (r === 0) await shot(`${n_}-wrong`);
      let k = 0; for (const ch of R.grid.flat()) { if (ch === R.target) { await cells.nth(k).click(); if (r === 0 && k > 20) await shot(`${n_}-half`); } k++; }
      void cols; await page.waitForTimeout(250); if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else if (g.type === "spell") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r], word = R.word.split("");
      const press = async (letters) => { for (const L of letters) await page.locator(".sp-tile:not(.used)", { hasText: new RegExp("^" + L + "$") }).first().click(); };
      if (r === 0) { await press([...word].reverse()); await page.waitForTimeout(200); await shot(`${n_}-wrong`); await page.waitForTimeout(700); }
      await press(word); if (r === 0) await page.waitForTimeout(50);
      await page.waitForTimeout(250); if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else if (g.type === "sudoku") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r], n = R.n, cells = page.locator(".su-cell"), tray = page.locator(".su-tray .card");
      let first = true;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!R.given[y][x]) {
        await cells.nth(y * n + x).click();
        if (first) { first = false; const gx = R.given[y].findIndex((v) => v); if (gx >= 0) { await tray.nth(R.sol[y][gx] - 1).click(); await page.waitForTimeout(100); await shot(`${n_}-wrong`); } }
        await tray.nth(R.sol[y][x] - 1).click(); await page.waitForTimeout(40);
      }
      await page.waitForTimeout(250); if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else if (g.type === "scale") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r], pans = page.locator(".pan");
      await pans.nth(R.heavier === "left" ? 1 : 0).click(); await page.waitForTimeout(150); if (r === 0) await shot(`${n_}-wrong`);
      await pans.nth(R.heavier === "left" ? 0 : 1).click(); await page.waitForTimeout(900);
      if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else if (g.type === "wordsearch") {
    for (let r = 0; r < g.rounds.length; r++) {
      const segs = await page.evaluate(() => window.__T.wsCells());
      await page.mouse.click(segs[0][0][0], segs[0][0][1]); await page.mouse.click(segs[0][0][0] + 2, segs[0][0][1]); await page.waitForTimeout(120); if (r === 0) await shot(`${n_}-wrong`);
      let k = 0; for (const [a, b] of segs) { await page.mouse.click(a[0], a[1]); await page.mouse.click(b[0], b[1]); await page.waitForTimeout(100); if (r === 0 && k === 0) await shot(`${n_}-half`); k++; }
      await page.waitForTimeout(250); if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else if (g.type === "diff") {
    for (let r = 0; r < g.rounds.length; r++) {
      await page.waitForTimeout(250);
      const pts = await page.evaluate(() => window.__T.diffPts());
      const box = await page.locator(".df-img").nth(1).boundingBox(); await page.mouse.click(box.x + 3, box.y + 3); await page.waitForTimeout(120); if (r === 0) await shot(`${n_}-wrong`);
      let k = 0; for (const [x, y] of pts) { await page.mouse.click(x, y); await page.waitForTimeout(100); if (r === 0 && k === 0) await shot(`${n_}-half`); k++; }
      await page.waitForTimeout(250); if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else if (g.type === "pattern") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r];
      if (r === 0) { await page.locator(".pt-choices .card").nth((R.right + 1) % R.choices.length).click(); await page.waitForTimeout(150); await shot(`${n_}-wrong`); }
      await page.locator(".pt-choices .card").nth(R.right).click(); await page.waitForTimeout(250);
      if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else if (g.type === "twins") {
    for (let r = 0; r < g.rounds.length; r++) {
      const R = g.rounds[r], cells = page.locator(".tw-cell"), it = R.items; let pair = null;
      for (let i = 0; i < it.length && !pair; i++) for (let j = i + 1; j < it.length; j++) if (it[i].c === it[j].c && it[i].pat === it[j].pat && (it[i].cap || "") === (it[j].cap || "")) { pair = [i, j]; break; }
      const odd = it.findIndex((_, i) => !pair.includes(i)); await cells.nth(odd).click(); await cells.nth(pair[0]).click(); await page.waitForTimeout(150); if (r === 0) await shot(`${n_}-wrong`);
      await cells.nth(pair[0]).click(); await cells.nth(pair[1]).click(); await page.waitForTimeout(300);
      if (r === g.rounds.length - 1) await shot(`${n_}-done`); await next();
    }
  } else throw new Error("nepoznata igra " + g.type);
}
await page.waitForTimeout(4500); await shot("90-finale");
await page.click(".finale-actions .big-btn:first-child"); await page.waitForTimeout(400); await shot("91-parents");
console.log(errs.length ? errs.join("\n") : `OK: ${slug}, ${story.steps.length} igara, bez grešaka`);
await browser.close();
