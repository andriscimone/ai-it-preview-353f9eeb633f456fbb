import { copyFileSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const output = join(root, "out");
const target = join(root, "dist");

rmSync(target, { recursive: true, force: true });
cpSync(output, target, { recursive: true });
mkdirSync(join(target, "server"), { recursive: true });
mkdirSync(join(target, ".openai"), { recursive: true });
copyFileSync(join(root, "sites", "server-index.js"), join(target, "server", "index.js"));
copyFileSync(join(root, ".openai", "hosting.json"), join(target, ".openai", "hosting.json"));
