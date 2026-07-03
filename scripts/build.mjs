// Build wrapper that works around a Windows-only race condition in Next.js
// `output: 'export'`. When exporting, Next copies public/ into out/ using a
// 32-way *parallel* recursive copy with the COPYFILE_EXCL flag. On Windows
// those parallel workers race on directory creation and one file occasionally
// gets copied twice -> `EEXIST: copyfile ...` (a different file each run).
//
// Rather than retry-and-pray, we remove the race entirely:
//   1) run `tinacms build` (writes public/admin/index.html), then
//   2) temporarily hide public/ so `next build` skips its parallel copy, then
//   3) copy public/ -> out/ ourselves with a single-threaded fs.cpSync.

import { rmSync, existsSync, renameSync, cpSync } from "node:fs";
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

const PUBLIC = "public";
const HIDDEN = ".public-hidden";

const clean = () => {
  rmSync("out", { recursive: true, force: true });
  rmSync(".next", { recursive: true, force: true });
};

// This is a production build for the GitHub Pages project site, served under
// /soul-healing. Tell TinaCMS's admin SPA to load its assets from that path.
// (tinacms build runs before next build, so NODE_ENV isn't "production" yet —
// an explicit env var is the reliable signal. Local dev uses `tinacms dev`,
// which never runs this script, so its basePath stays empty/root.)
process.env.TINA_PUBLIC_BASE_PATH = "soul-healing";

// Safety: if a previous crashed run left public/ hidden, restore it first.
if (!existsSync(PUBLIC) && existsSync(HIDDEN)) {
  renameSync(HIDDEN, PUBLIC);
}

// 1) Tina build (schema/client generation + admin HTML into public/admin).
clean();
run("tinacms build");

// 2) Next.js static export with public/ hidden so Next won't do its racy copy.
let hidden = false;
try {
  renameSync(PUBLIC, HIDDEN);
  hidden = true;
  run("next build");
} finally {
  // Always restore public/ to its original name, even if the build failed.
  if (hidden && existsSync(HIDDEN)) {
    renameSync(HIDDEN, PUBLIC);
  }
}

// 3) Copy public/ -> out/ sequentially (single-threaded, no EEXIST race).
//    force:true lets it overwrite anything Next may emit at the same path.
cpSync(PUBLIC, "out", { recursive: true, force: true });

console.log("\n✅ Build succeeded (public/ copied sequentially).");


