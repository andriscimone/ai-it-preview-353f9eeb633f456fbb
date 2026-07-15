import { cpSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const target = join(root, "public");
const files = [
  "index.html",
  "energia.html",
  "chip.html",
  "algoritmi.html",
  "inferenza.html",
  "altro.html",
  "novita.html",
  "benchmark.html",
  "politica.html",
  "guerra.html",
  "spooky-timeline.html",
  "app.js",
  "spooky-timeline.js",
  "dossier.js",
  "energy-visuals.js",
  "algorithm-visuals.js",
  "energy.css",
  "algorithms.css",
  "altro.css",
  "spooky-timeline.css",
  "styles.css",
  "robots.txt"
];

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

for (const file of files) copyFileSync(join(root, file), join(target, file));
for (const directory of ["assets", "fonts"]) {
  cpSync(join(root, directory), join(target, directory), { recursive: true });
}
