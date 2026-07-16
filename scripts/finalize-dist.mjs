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
  "dossier.js",
  "energy-visuals.js",
  "algorithm-visuals.js",
  "politica.js",
  "guerra.js",
  "energy.css",
  "algorithms.css",
  "politica.css",
  "altro.css",
  "spooky-timeline.css",
  "styles.css",
  "robots.txt"
];

function collect(directory, prefix = "") {
  for (const name of readdirSync(join(root, directory))) {
    const relative = join(directory, name);
    const absolute = join(root, relative);
    if (statSync(absolute).isDirectory()) collect(relative, join(prefix, name));
    else routeFiles.push(relative);
  }
}

collect("assets");
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
export default {async fetch(request){const url=new URL(request.url);if(url.pathname==="/")return Response.redirect(new URL("/index.html",url),302);let path=decodeURIComponent(url.pathname);if(!routes[path]&&!path.includes("."))path+=".html";const asset=routes[path];if(!asset)return new Response("Not found",{status:404});const mutable=asset.type.startsWith("text/html")||asset.type.startsWith("text/css")||asset.type.startsWith("text/javascript");return new Response(decode(asset.body),{headers:{"content-type":asset.type,"cache-control":mutable?"no-cache":"public, max-age=31536000, immutable"}});}};`;

writeFileSync(join(target, "server", "index.js"), worker);
