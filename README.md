# Soul Pathways

A simple, static website for **Soul Pathways** — Reiki &amp; Soul Healing in Amsterdam.
Built with plain HTML, CSS and JavaScript so it can be hosted for free on **GitHub Pages**.

## What's inside

```
soul-healing/
├── index.html              # Single-page site (Hero, About, Services, Contact)
├── .nojekyll               # Tells GitHub Pages to serve files as-is
├── css/
│   └── styles.css          # All styling (calming sage / sand palette)
├── js/
│   ├── main.js             # Mobile menu + footer year
│   └── map.js              # Interactive map (Leaflet + OpenStreetMap)
└── static/                 # ← your images & branding live here
    ├── images/
    │   ├── hero-bg.svg     # Hero background  (replace)
    │   ├── about-1.svg     # About portrait   (replace)
    │   └── about-2.svg     # About space photo(replace)
    ├── logo/
    │   └── soul-pathways-logo.svg
    └── icons/
        └── favicon.svg
```

## Make it yours

Everything marked with `[edit]` or `placeholder` is meant to be replaced:

- **About Me** — edit the text in the `#about` section of `index.html`.
- **Photos** — drop real images into `static/images/` and update the `src`
  attributes (you can keep the same filenames, or use `.jpg`/`.png`).
- **Contact details** — update email, phone and Instagram in the `#contact` section.
- **Schedule** — edit the table rows under "Weekly availability".
- **Map** — coordinates for both locations live in `js/map.js`.

The two booking locations are already set up:

1. **Common Ground** — Zeeburgerdijk 265, 1095 AC Amsterdam
2. **The Integration Room** — Eerste Laurierdwarsstraat 2, 1016 PX Amsterdam

## Preview locally

Open `index.html` directly in a browser, or run a tiny local server (recommended,
so the map and fonts load exactly as they will online):

```powershell
# from the project folder
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Deploy to GitHub Pages

1. Commit and push everything to your GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
4. Choose the `main` branch and the `/ (root)` folder, then **Save**.
5. After a minute your site is live at
   `https://<your-username>.github.io/soul-healing/`.

> Because this is a project site, all asset paths are **relative**
> (`static/...`, `css/...`) so they work correctly under the `/soul-healing/`
> sub-path. The `.nojekyll` file keeps GitHub Pages from interfering with the
> folder structure.

## Online booking

The Contact section includes an embedded **Google Appointment Schedule** calendar
(the `#booking` block in `index.html`). Visitors pick a slot and the appointment is
confirmed instantly — no backend or database needed.

To use a different calendar, replace the `<iframe src="...">` URL inside the
`booking__embed` block with your own Google / Calendly / TidyCal embed link.
