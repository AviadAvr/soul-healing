# Soul Pathways

Website for **Soul Pathways** — Reiki & Soul Healing in Leiden.
Built with **Next.js** (static export) and **TinaCMS** for visual/inline content
editing, hosted for free on **GitHub Pages**.

## Project layout

```
soul-healing/
├── pages/
│   ├── index.js           # The site (tabbed single page), fully Tina-editable
│   └── _document.js        # Sets <html lang>
├── content/pages/home.json # Editable content (committed to Git on save)
├── tina/config.ts          # TinaCMS schema — the fields the client edits
├── public/                 # Static assets served as-is (css/, js/, static/)
├── scripts/
│   ├── build.mjs           # Production build wrapper (see below)
│   ├── images/
│   │   ├── brand.py            # Shared brand palette + SVG writer for the generators
│   │   ├── make-assets.py      # Regenerates every generated image at once
│   │   ├── make-favicon.py     # -> public/static/icons/favicon.svg
│   │   ├── make-logo.py        # -> public/static/logo/soul-pathways-logo.svg
│   │   ├── make-hero-bg.py     # -> public/static/images/hero-bg.svg
│   │   ├── make-about-2.py     # -> public/static/images/about-2.svg
│   │   └── make-og-image.py    # -> public/static/images/og-preview.jpg
├── next.config.mjs         # Static export + /soul-healing basePath
└── .github/workflows/deploy.yml  # Builds and deploys to GitHub Pages
```

## Requirements

**Node 20 or 22 (LTS).** Not Node 23/24 — TinaCMS pulls in `better-sqlite3`, a
native module with no prebuilt binary for the newest Node versions. The repo
pins Node via `.nvmrc`:

```powershell
nvm install 22
nvm use 22
```

## Develop locally

```powershell
npm install
npm run dev
```

- Site:   <http://localhost:3000>
- Editor: <http://localhost:3000/admin/index.html>

`npm run dev` runs Tina in **local mode**: edits in `/admin` are written straight
to `content/pages/home.json` on disk — no account or token needed.

## Build

```powershell
npm run build   # -> static site in ./out
```

`scripts/build.mjs` runs `tinacms build` then `next build`, and works around a
Windows-only file-copy race in Next's static export.

## Brand assets (generated images)

All the brand images are produced by scripts so they stay reproducible and easy
to tweak. Colors live once in `scripts/brand.py` (mirroring the `--c-*` CSS
variables). Requires Python with **Pillow** for the OG image
(`pip install pillow`); the SVG scripts need only the standard library.

```powershell
python scripts/make-assets.py        # regenerate everything
python scripts/make-logo.py          # or just one asset
```

| Script              | Output                                       |
| ------------------- | -------------------------------------------- |
| `make-favicon.py`   | `public/static/icons/favicon.svg`            |
| `make-logo.py`      | `public/static/logo/soul-pathways-logo.svg`  |
| `make-hero-bg.py`   | `public/static/images/hero-bg.svg`           |
| `make-about-2.py`   | `public/static/images/about-2.svg`           |
| `make-og-image.py`  | `public/static/images/og-preview.jpg`        |

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds on Linux
and publishes `./out` to GitHub Pages. Two one-time repo settings are required:

1. **Settings → Pages → Source = GitHub Actions.**
2. **Settings → Secrets and variables → Actions** — add `NEXT_PUBLIC_TINA_CLIENT_ID`
   and `TINA_TOKEN` (from your Tina Cloud project).

The live site is served under the `/soul-healing/` sub-path.

## Editing content

The client opens `/admin/index.html` on the deployed site, logs in via Tina
Cloud, edits inline, and saves — Tina commits to `main`, which redeploys
automatically. All page sections are Tina-editable — **Hero**, **About**,
**Services** (repeatable cards), **Contact** (details, repeatable locations and
weekly-schedule rows) and **Booking** (intro + Calendly URL). The fields live in
`tina/config.ts` and the content in `content/pages/home.json`.

> The interactive map pins (in `public/js/map.js`) and their coordinates remain
> in code, not Tina.
