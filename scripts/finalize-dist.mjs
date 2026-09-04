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

// The Maven demo is already served from an immutable GitHub Raw URL; omitting the
// unused local copy keeps the Sites archive below its upload limit.
rmSync(join(target, "assets", "palantir-maven-three-clicks.mp4"), { force: true });

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
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
  "spooky-timeline.js",
  "energy.css",
  "algorithms.css",
  "inferenza.css",
  "politica.css",
  "altro.css",
  "novita.css",
  "news-jacobiana.css",
  "spooky-timeline.css",
  "spooky-landian.css",
  "spooky-accelerando.css",
  "styles.css",
  "editorial.css",
  "sistema.css",
  "robots.txt"
];

const maxEmbeddedAssetBytes = 256 * 1024;
// Keep superseded or externally served files out of the Worker route table.
const excludedEmbeddedAssets = new Set([
  "assets/n16-glm53-flash-pareto.png",
  "assets/news-jacobiana-meme.png",
  "assets/spacex-ai-satellite-concept.webp",
  "assets/terafab-scale-nic-cruz-patane.webp"
]);
const externalRoutes = {
  // Pin the original PNGs to a published revision, preserving resolution while
  // keeping the Worker below the Sites upload limit.
  "/assets/n16-glm53-flash-pareto.png": "https://raw.githubusercontent.com/andriscimone/ai-it-preview-353f9eeb633f456fbb/ad7e363df8b28fa73011dd43337ce1244225edbd/assets/n16-glm53-flash-pareto.png",
  "/assets/news-jacobiana-meme.png": "https://raw.githubusercontent.com/andriscimone/ai-it-preview-353f9eeb633f456fbb/ad7e363df8b28fa73011dd43337ce1244225edbd/assets/news-jacobiana-meme.png",
  "/assets/terafab-scale-nic-cruz-patane.webp": "https://raw.githubusercontent.com/andriscimone/ai-it-preview-353f9eeb633f456fbb/0e60b48a80c482302248f305728064c234daacc8/assets/terafab-scale-nic-cruz-patane.webp"
};
const alwaysEmbeddedAssets = new Set([
  "assets/code-contributed-per-person-quarter-2026-it.png",
  "assets/claude-code-session-success-rate-2026-it.png",
  "assets/news-jacobiana-post.png",
  "assets/openai-output-tokens-by-department-2026-it.png",
  "assets/spooky-plato-cave-v1.webp"
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
  !file.endsWith(".mp4") &&
  !excludedEmbeddedAssets.has(file.replaceAll("\\", "/")) && (
    alwaysEmbeddedAssets.has(file.replaceAll("\\", "/")) ||
    statSync(join(root, file)).size <= maxEmbeddedAssetBytes
  )
);
collect("fonts");

const routes = Object.fromEntries(routeFiles.map(file => {
  const normalized = file.replaceAll("\\", "/");
  const extension = normalized.slice(normalized.lastIndexOf("."));
  const type = contentTypes[extension] || "application/octet-stream";
  const isText = type.startsWith("text/") || type.startsWith("application/json");
  return [`/${normalized}`, {
    body: isText ? readFileSync(join(root, file), "utf8").replaceAll("\r\n", "\n") : readFileSync(join(root, file)).toString("base64"),
    ...(isText ? {} : { binary: true }),
    type
  }];
}));

const worker = `const routes=${JSON.stringify(routes)};const externalRoutes=${JSON.stringify(externalRoutes)};
function decode(value){const binary=atob(value);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;}
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname==="/")return Response.redirect(new URL("/index.html",url),302);let path=decodeURIComponent(url.pathname);if(!routes[path]&&!externalRoutes[path]&&!path.includes("."))path+=".html";const external=externalRoutes[path];if(external)return Response.redirect(external,302);const asset=routes[path];if(!asset){if(env?.ASSETS)return env.ASSETS.fetch(request);return new Response("Not found",{status:404});}const mutable=asset.type.startsWith("text/html")||asset.type.startsWith("text/css")||asset.type.startsWith("text/javascript");const body=asset.binary?decode(asset.body):asset.body;return new Response(body,{headers:{"content-type":asset.type,"cache-control":mutable?"no-cache":"public, max-age=31536000, immutable"}});}};`;

writeFileSync(join(target, "server", "index.js"), worker);
