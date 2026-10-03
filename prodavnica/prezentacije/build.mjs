// Pravi jedan samostalni HTML fajl po priči: node build.mjs [slug]
// Ulaz: stories/<slug>/story.mjs + assets/, engine/. Izlaz: dist/<slug>.html
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, extname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp" };
const dataUri = (file) => `data:${mime[extname(file)]};base64,${readFileSync(file).toString("base64")}`;
// JSON za ugradnju u <script>: "</" i U+2028/2029 bi razbili skriptu
const json = (v) => JSON.stringify(v).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

const slugs = process.argv[2] ? [process.argv[2]] : readdirSync(join(root, "stories"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
for (const slug of slugs) {
  const dir = join(root, "stories", slug);
  const story = (await import(pathToFileURL(join(dir, "story.mjs")).href)).default;

  const assets = {};
  const shared = join(root, "engine", "assets");
  for (const f of readdirSync(shared)) assets[basename(f, extname(f))] = dataUri(join(shared, f));
  for (const [key, file] of Object.entries(story.assets)) {
    const p = join(dir, "assets", file);
    if (!existsSync(p)) throw new Error(`Nedostaje slika ${file} (${slug}). Pokreni extract-assets.sh.`);
    assets[key] = dataUri(p);
  }

  const font = (name, range) =>
    `@font-face{font-family:"Nunito";font-style:normal;font-weight:500 900;font-display:swap;` +
    `src:url(data:font/woff2;base64,${readFileSync(join(root, "engine", "fonts", name)).toString("base64")}) format("woff2");unicode-range:${range};}`;
  const fonts = [
    font("nunito-cyrillic.woff2", "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116"),
    font("nunito-latin.woff2", "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212"),
  ].join("\n");

  const { assets: _a, art, ...data } = story;
  const html = readFileSync(join(root, "engine", "template.html"), "utf8")
    .replace("{{TITLE}}", () => `${story.title.replace(/\s+/g, " ")} · Igra Lab`)
    .replace("{{FONTS}}", () => fonts)
    .replace("{{CSS}}", () => readFileSync(join(root, "engine", "engine.css"), "utf8"))
    .replace("{{ASSETS}}", () => json(assets))
    .replace("{{ART}}", () => json(art))
    .replace("{{STORY}}", () => json(data))
    .replace("{{JS}}", () => readFileSync(join(root, "engine", "engine.js"), "utf8").replace(/<\/script/gi, "<\\/script"));

  mkdirSync(join(root, "dist"), { recursive: true });
  const out = join(root, "dist", `${slug}.html`);
  writeFileSync(out, html);
  console.log(`${out}  ${(html.length / 1024).toFixed(0)} KB`);
}
