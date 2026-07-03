// Production build for the GitHub Pages project site (served under /soul-healing).
//
// Works around a Windows-only race in Next's `output: 'export'`: it copies
// public/ into out/ with a 32-way parallel copy that intermittently throws
// `EEXIST`. We avoid it by hiding public/ during `next build`, then copying it
// into out/ ourselves with a single-threaded fs.cpSync.

import { rmSync, existsSync, renameSync, cpSync } from "node:fs";
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

const PUBLIC = "public";
const HIDDEN = ".public-hidden";

const clean = () => {
  rmSync("out", { recursive: true, force: true });
  rmSync(".next", { recursive: true, force: true });
};

// Tell TinaCMS's admin SPA to load its assets from /soul-healing. tinacms build
// runs before next build, so NODE_ENV isn't "production" yet — an explicit env
// var is the reliable signal. Local dev uses `tinacms dev`, which skips this.
process.env.TINA_PUBLIC_BASE_PATH = "soul-healing";

// If a previous crashed run left public/ hidden, restore it first.
if (!existsSync(PUBLIC) && existsSync(HIDDEN)) {
  renameSync(HIDDEN, PUBLIC);
}

clean();
run("tinacms build");

// Hide public/ so `next build` skips its racy parallel copy.
let hidden = false;
try {
  renameSync(PUBLIC, HIDDEN);
  hidden = true;
  run("next build");
} finally {
  if (hidden && existsSync(HIDDEN)) renameSync(HIDDEN, PUBLIC);
}

// Copy public/ -> out/ sequentially (no EEXIST race).
cpSync(PUBLIC, "out", { recursive: true, force: true });

console.log("\n✅ Build succeeded (public/ copied sequentially).");


