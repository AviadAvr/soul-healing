# TinaCMS proof-of-concept

This branch adds **TinaCMS inline/visual editing** to the Soul Pathways site,
running on **Next.js** (static export, still deployable free to GitHub Pages).

Right now the **Hero** and **About** sections are Tina-editable; the rest of the
page (Services, Contact, map, Booking, footer) is still static markup in
`pages/index.js` and can be migrated the same way.

## Requirements

- **Node 20 or 22 (LTS).** Do **not** use Node 23/24 — TinaCMS pulls in
  `better-sqlite3`, a native module with no prebuilt binary for the newest Node
  versions, so it would try to compile from source and fail without Visual
  Studio C++ Build Tools.
  This repo pins Node via `.nvmrc`:

  ```powershell
  nvm install 22
  nvm use 22
  ```

## Run locally (no account needed)

```powershell
npm install
npm run dev
```

- Site:   <http://localhost:3000>
- Editor: <http://localhost:3000/admin/index.html>
- Tina API (local GraphQL): <http://localhost:4001/graphql>

`npm run dev` runs Tina in **local mode**: edits in the `/admin` UI are written
straight to `content/pages/home.json` on disk. Open the editor, change the Hero
or About text, and watch the page update live.

## How it fits together

| File | Role |
|------|------|
| `tina/config.ts` | Schema — defines the editable fields the client sees |
| `content/pages/home.json` | The actual content (committed to Git on save) |
| `pages/index.js` | Renders the page; `useTina` + `tinaField` enable inline editing for Hero/About |
| `pages/_document.js` | Sets `<html lang>` |
| `next.config.mjs` | Static export + `/soul-healing` basePath for GitHub Pages |
| `public/` | Your existing `css/`, `js/`, `static/` assets (copied so paths keep working) |

> The original `index.html` is left in place for reference but is **no longer
> the source of truth** — Next.js serves `pages/index.js`.

## Going to production (next steps, not done yet)

1. **Tina Cloud** (free tier): create a project at <https://app.tina.io>
   pointing at this GitHub repo, then copy the Client ID + Token into `.env`
   (see `.env.example`). This provides the editor login + save-to-Git that a
   static host can't do on its own.
2. **GitHub Pages**: `npm run build` outputs a static site to `./out`. Deploy
   that (e.g. via a GitHub Action) and the `/soul-healing` basePath kicks in
   automatically.
3. **Expand coverage**: move Services / Contact / Schedule into `tina/config.ts`
   + `content/` the same way Hero/About were done.

