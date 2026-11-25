# Archived: Reiki & Soul Healing pages

These pages are not on the live site right now. They are kept here, out of the
build, so they can be brought back later. Nothing in this folder is read by
Next.js or TinaCMS.

| File | Where it goes back to |
| --- | --- |
| `pages/reiki.js`, `pages/soul-healing.js` | `pages/` (the `/reiki/` and `/soul-healing/` routes) |
| `content/reiki/index.json`, `content/soul-healing/index.json` | `content/reiki/`, `content/soul-healing/` |
| `tina-collections.ts` | `schema.collections` in `tina/config.ts` |
| `sections.jsx` | The tab panels in `pages/index.js`, next to the other panels |
| `service-page.css` | `public/css/styles.css` |

To re-integrate, also wire them up in `pages/index.js` and `lib/content.js`:

- `lib/content.js`: import `ReikiDocument` and `SoulHealingDocument` and add
  `reiki: readSection("reiki", "reiki", ReikiDocument)` and
  `soulHealing: readSection("soul-healing", "soulHealing", SoulHealingDocument)`
  to `readSections()`.
- `pages/index.js`:
  - add `"reiki"` and `"soul-healing"` to `TABS`;
  - add `useTina(props.reiki)` / `useTina(props.soulHealing)` hooks, plus
    `ReikiTitleTag` / `SoulTitleTag` like the other pages;
  - add `PAGE_SEO` entries for both pages;
  - add nav links (e.g. `<a {...linkProps("reiki")}>Reiki</a>`);
  - `sections.jsx` uses `Fragment`, so import it from `react` again.
- `public/sitemap.xml`: add `/reiki/` and `/soul-healing/`.

The full previous versions are also in git history (before the
`261122-layout-changes` branch).
