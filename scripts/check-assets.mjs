/* =========================================================
   Soul Pathways — check-assets.mjs
   Verifies that every LOCAL asset referenced from the HTML
   and CSS actually exists on disk. External links (http/https,
   mailto, tel, data:, in-page #anchors) are ignored.

   Exits with a non-zero code if any reference is broken,
   so CI fails before a broken site is deployed.
   ========================================================= */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Files to scan: [path, type]
const targets = [
    ["index.html", "html"],
    ["css/styles.css", "css"]
];

const isExternal = (ref) =>
    /^(?:https?:)?\/\//i.test(ref) ||
    ref.startsWith("mailto:") ||
    ref.startsWith("tel:") ||
    ref.startsWith("data:") ||
    ref.startsWith("#");

const strip = (ref) => ref.split("#")[0].split("?")[0].trim();

const missing = [];
let checkedCount = 0;

async function scan(file, type) {
    const abs = join(root, file);
    if (!existsSync(abs)) {
        missing.push(`(source file not found) ${file}`);
        return;
    }
    const content = await readFile(abs, "utf8");
    const baseDir = dirname(abs);

    const regex =
        type === "css"
            ? /url\(\s*["']?([^"')]+)["']?\s*\)/gi
            : /(?:src|href)\s*=\s*["']([^"']+)["']/gi;

    let m;
    while ((m = regex.exec(content)) !== null) {
        const raw = m[1].trim();
        if (!raw || isExternal(raw)) continue;

        const clean = strip(raw);
        if (!clean) continue;

        checkedCount++;
        // HTML refs are relative to repo root; CSS url() is relative to the CSS file.
        const resolved = type === "css" ? resolve(baseDir, clean) : join(root, clean);

        if (!existsSync(resolved)) {
            missing.push(`${file}  ->  ${raw}`);
        }
    }
}

for (const [file, type] of targets) {
    await scan(file, type);
}

console.log(`Checked ${checkedCount} local asset reference(s).`);

if (missing.length > 0) {
    console.error("\n\u2716 Broken local asset reference(s):");
    for (const item of missing) console.error("   - " + item);
    process.exit(1);
}

console.log("\u2713 All local asset references resolve to existing files.");

