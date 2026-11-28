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
├── archive/                # Pages kept out of the build (e.g. Reiki & Soul Healing), see its README
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
2. **Settings → Secrets and variables → Actions** — add `TINA_TOKEN` (a read-only
   content token from your Tina Cloud project). This is required by `tinacms
   build` to generate the client and the `/admin` editor. It's a build-time,
   server-side secret and is never shipped to the browser.

The Tina Cloud **Client ID** is a public identifier hardcoded in
`tina/config.ts` (override with `NEXT_PUBLIC_TINA_CLIENT_ID` for a fork), so it
is *not* a secret. Site content is read from the local `content/` JSON files at
build time rather than fetched from Tina Cloud, so the token is only for building
the CMS/admin. The contact-page map uses `NEXT_PUBLIC_JAWG_TOKEN` — another
public, build-time-inlined value; set it in `.env` (and as an Actions secret if
you want the map tiles to render in production).

The live site is served from the root of the custom domain
(`https://soul-pathways.com/`). The `public/CNAME` file tells GitHub Pages which
domain to serve, and is republished on every deploy.

## Hosting & services overview

A map of the services behind the site, for whoever (probably future me) needs to
manage it. **No credentials belong in this file or anywhere in this repo.**
Passwords, API keys and recovery codes live in a password manager.

| Concern | Service | Notes |
| --- | --- | --- |
| Domain registration | **Porkbun** | `soul-pathways.com`. DNS records are managed in the Porkbun dashboard. |
| DNS → site | Porkbun DNS → GitHub Pages | `public/CNAME` tells Pages which custom domain to serve. |
| Website hosting | **GitHub Pages** | Static export of Next.js, published by `.github/workflows/deploy.yml` on every push to `main`. |
| Content management | **TinaCMS** (Tina Cloud) | Editor at `/admin/index.html`. Edits are committed to the repo as JSON in `content/`, which triggers a redeploy. |
| Outgoing email (SMTP routing) | **Resend** | Sends mail for the domain. Its SPF/DKIM DNS records are set in Porkbun. |
| Real mailbox | **Gmail** | Where the `@soul-pathways.com` address is actually read and answered. |
| Map tiles | **Jawg Maps** | Token is `NEXT_PUBLIC_JAWG_TOKEN` (public by design, it ships in the site's JavaScript). |
| Fonts / map library | Google Fonts, Leaflet (unpkg CDN) | Loaded in the browser, nothing to manage. |
| Dependency updates | **Dependabot** | Patch and minor updates are auto-merged once the build check passes; majors need a manual review. |

### How a change reaches the live site

1. Edit code (a PR) or content (Tina editor, which commits to `main`).
2. A PR runs `.github/workflows/build-check.yml` (build only, no deploy).
3. Merging to `main` runs `.github/workflows/deploy.yml`, which builds on Linux and publishes `./out` to GitHub Pages.

### Where the secrets live (names only)

| Name | Where it is set | Used for |
| --- | --- | --- |
| `TINA_TOKEN` | GitHub repo → Settings → Secrets and variables → Actions | Building the `/admin` editor |
| `NEXT_PUBLIC_JAWG_TOKEN` | GitHub Actions secret, and local `.env` | Map tiles |
| Resend API key / SMTP credentials | Resend dashboard and wherever the email is sent from | Outgoing email |
| Account logins (Porkbun, GitHub, Tina Cloud, Resend, Gmail) | Password manager | Managing each service |

Keep 2FA on for all of these accounts, and keep the registrar lock on the domain.

### Routine checks

- **Domain renewal:** renews in Porkbun. Check the expiry date and the payment method once a year.
- **Email not arriving or landing in spam:** check the Resend and Gmail DNS records (MX, SPF, DKIM, DMARC) in Porkbun.
- **Editor can't save:** check Tina Cloud and that `TINA_TOKEN` is still valid.
- **Site not updating:** check the latest run of the *Deploy to GitHub Pages* workflow in the repo's Actions tab.

## Editing content

The client opens `/admin/index.html` on the deployed site, logs in via Tina
Cloud, edits inline, and saves — Tina commits to `main`, which redeploys
automatically. Every section is its own Tina document (collection), so each can
be edited independently — **Home · Hero**, **About** (intro, highlights, text & photo rows), **Services** (repeatable
cards with a duration), **My Approach** (intro + alternating Counselling / Energy
Healing sections, each with a photo slot), **FAQ** (repeatable question/answer
pairs, shown as an accordion on its own page), **Contact** (details, pricing,
booking notes) and **Booking** (intro + Calendly URL). The fields live in
`tina/config.ts` and the content in `content/<section>/index.json` (e.g.
`content/my-approach/index.json`).

> Photo slots (About rows, My Approach sections) show a dashed placeholder until
> an image is picked in Tina (or an `image` path such as
> `/static/images/desert.jpg` is added to the section's JSON). The caption of the
> placeholder is the photo description, which also becomes the alt text.

> Body copy supports lightweight inline formatting: `*italic*`, `**bold**`, and
> `[label](https://…)` links. Use `[label](contact)` to link to the Contact
> section. FAQ answers also take blank lines between paragraphs and `- ` bullet
> lists.

> The interactive map pins (in `public/js/map.js`) and their coordinates remain
> in code, not Tina.
