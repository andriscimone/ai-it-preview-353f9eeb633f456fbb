import { copyFileSync, cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const output = join(root, "out");
const target = join(root, "dist");

rmSync(target, { recursive: true, force: true });
cpSync(output, target, { recursive: true });
mkdirSync(join(target, "server"), { recursive: true });
mkdirSync(join(target, ".openai"), { recursive: true });
copyFileSync(join(root, ".openai", "hosting.json"), join(target, ".openai", "hosting.json"));

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
};
const routeFiles = [
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

const maxEmbeddedAssetBytes = 256 * 1024;
const alwaysEmbeddedAssets = new Set([
  "assets/code-contributed-per-person-quarter-2026-it.png",
  "assets/claude-code-session-success-rate-2026-it.png",
  "assets/openai-output-tokens-by-department-2026-it.png"
]);

function collect(directory, prefix = "", include = () => true) {
  for (const name of readdirSync(join(root, directory))) {
    const relative = join(directory, name);
    const absolute = join(root, relative);
    if (statSync(absolute).isDirectory()) collect(relative, join(prefix, name), include);
    else if (include(relative)) routeFiles.push(relative);
  }
}

collect("assets", "", file =>
  !file.endsWith(".mp4") && (
    alwaysEmbeddedAssets.has(file.replaceAll("\\", "/")) ||
    statSync(join(root, file)).size <= maxEmbeddedAssetBytes
  )
);
collect("fonts");

const routes = Object.fromEntries(routeFiles.map(file => {
  const normalized = file.replaceAll("\\", "/");
  const extension = normalized.slice(normalized.lastIndexOf("."));
  return [`/${normalized}`, {
    body: readFileSync(join(root, file)).toString("base64"),
    type: contentTypes[extension] || "application/octet-stream"
  }];
}));

const worker = `const routes=${JSON.stringify(routes)};
function decode(value){const binary=atob(value);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;}
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname==="/")return Response.redirect(new URL("/index.html",url),302);let path=decodeURIComponent(url.pathname);if(!routes[path]&&!path.includes("."))path+=".html";const asset=routes[path];if(!asset){if(env?.ASSETS)return env.ASSETS.fetch(request);return new Response("Not found",{status:404});}const mutable=asset.type.startsWith("text/html")||asset.type.startsWith("text/css")||asset.type.startsWith("text/javascript");return new Response(decode(asset.body),{headers:{"content-type":asset.type,"cache-control":mutable?"no-cache":"public, max-age=31536000, immutable"}});}};`;

writeFileSync(join(target, "server", "index.js"), worker);
