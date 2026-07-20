import { cpSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const target = join(root, "public");
const files = [
  "index.html",
  "sistema.html",
  "energia.html",
  "chip.html",
  "algoritmi.html",
  "inferenza.html",
  "altro.html",
  "novita.html",
  "news-jacobiana.html",
  "news-jacobiana.html",
  "benchmark.html",
  "politica.html",
  "guerra.html",
  "spooky-timeline.html",
  "app.js",
  "dossier.js",
  "energy-visuals.js",
  "algorithm-visuals.js",
  "politica.js",
  "guerra.js",
  "news-jacobiana.js",
  "news-jacobiana.js",
  "spooky-timeline.js",
  "energy.css",
  "algorithms.css",
  "inferenza.css",
  "politica.css",
  "altro.css",
  "news-jacobiana.css",
  "news-jacobiana.css",
  "spooky-timeline.css",
  "spooky-landian.css",
  "spooky-accelerando.css",
  "styles.css",
  "sistema.css",
  "robots.txt"
];

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

for (const file of files) copyFileSync(join(root, file), join(target, file));
for (const directory of ["assets", "fonts"]) {
  cpSync(join(root, directory), join(target, directory), { recursive: true });
}
