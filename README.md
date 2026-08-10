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
├── next.config.mjs         # Static export, served from the domain root (no basePath)
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
and publishes `./out` to GitHub Pages. One one-time repo setting is required:

1. **Settings → Pages → Source = GitHub Actions.**

No Tina secrets are needed: the Tina Cloud Client ID is a public identifier
hardcoded in `tina/config.ts`, and build-time content is read from the local
`content/` JSON files rather than fetched from Tina Cloud. (Both can still be
overridden with `NEXT_PUBLIC_TINA_CLIENT_ID` if a fork wants its own project.)
The contact-page map uses `NEXT_PUBLIC_JAWG_TOKEN` — another public,
build-time-inlined value; set it in `.env` (and as an Actions secret if you want
the map tiles to render in production).

The live site is served from the root of the custom domain
(`https://soul-pathways.com/`). The `public/CNAME` file tells GitHub Pages which
domain to serve, and is republished on every deploy.

## Editing content

The client opens `/admin/index.html` on the deployed site, logs in via Tina
Cloud, edits inline, and saves — Tina commits to `main`, which redeploys
automatically. Every section is its own Tina document (collection), so each can
be edited independently — **Home · Hero**, **About**, **Services** (repeatable
cards), **Reiki** (intro + repeatable content sections), **Soul Healing** (intro
+ body paragraphs), **Contact** (details, pricing, booking notes) and
**Booking** (intro + Calendly URL). The fields live in `tina/config.ts` and the
content in `content/<section>/index.json` (e.g. `content/reiki/index.json`).

> Body copy in Reiki and Soul Healing supports lightweight inline formatting:
> `*italic*`, `**bold**`, and `[label](https://…)` links. Use
> `[label](contact)` to link to the Contact section.

> The interactive map pins (in `public/js/map.js`) and their coordinates remain
> in code, not Tina.
