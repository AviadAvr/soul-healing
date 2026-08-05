// Production build for the custom-domain site (soul-pathways.com), served from
// the root and hosted on GitHub Pages (see public/CNAME).
//
// Works around a Windows-only race in Next's `output: 'export'`: it copies
// public/ into out/ with a 32-way parallel copy that intermittently throws
// `EEXIST`. We avoid it by hiding public/ during `next build`, then copying it
// into out/ ourselves with a single-threaded fs.cpSync.

import { rmSync, existsSync, renameSync, cpSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

const PUBLIC = "public";
const HIDDEN = ".public-hidden";

const clean = () => {
  rmSync("out", { recursive: true, force: true });
  rmSync(".next", { recursive: true, force: true });
};

// The site is served from the root of the custom domain, so the TinaCMS admin
// SPA loads its assets from "/" too. Keep this empty (no base path). tinacms
// build runs before next build, so this env var is the reliable signal.
// Local dev uses `tinacms dev`, which skips this.
process.env.TINA_PUBLIC_BASE_PATH = "";

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

// GitHub Pages only serves a custom 404 from `404.html` at the site root, but
// `trailingSlash: true` makes Next emit the not-found page as `out/404/index.html`.
// Mirror it to `out/404.html` so unknown URLs boot the SPA (which then cleans up
// the address bar) instead of hitting GitHub's default 404 page.
if (!existsSync("out/404.html") && existsSync("out/404/index.html")) {
  copyFileSync("out/404/index.html", "out/404.html");
  console.log("Mirrored out/404/index.html -> out/404.html (GitHub Pages fallback).");
}

console.log("\n✅ Build succeeded (public/ copied sequentially).");


