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
const next = async () => { await page.waitForSelector("#nextBtn:not([hidden])", { timeout: 4000 }); await page.click("#nextBtn", { force: true }); await page.waitForTimeout(250); };
const story = await page.evaluate(() => STORY);

await shot("00-title");
await page.click(".big-btn.go"); await page.fill(".name-scene input", "Мила"); await page.keyboard.press("Enter"); await page.waitForTimeout(300);

async function drag(points, upAfter = true) {
  await page.mouse.move(points[0][0], points[0][1]); await page.mouse.down();
  for (const [x, y] of points.slice(1)) await page.mouse.move(x, y);
  if (upAfter) await page.mouse.up();
}

for (let i = 0; i < story.steps.length; i++) {
  const g = story.steps[i].game, n = String(i + 1).padStart(2, "0");
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
  } else throw new Error("nepoznata igra " + g.type);
}
await page.waitForTimeout(4500); await shot("90-finale");
await page.click(".finale-actions .big-btn:first-child"); await page.waitForTimeout(400); await shot("91-parents");
console.log(errs.length ? errs.join("\n") : `OK: ${slug}, ${story.steps.length} igara, bez grešaka`);
await browser.close();
