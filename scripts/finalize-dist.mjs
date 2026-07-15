import { cpSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const output = join(root, "out");
const target = join(root, "dist");

rmSync(target, { recursive: true, force: true });
cpSync(output, target, { recursive: true });
