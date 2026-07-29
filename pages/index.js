import Head from "next/head";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { client } from "../tina/__generated__/client";

// Plain <img>/<link>/<script> srcs are NOT auto-prefixed with basePath the way
// next/link and next/image are, so we prefix them manually for GitHub Pages.
const PREFIX = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Clean, hash-free URL for a tab/section. Home is the base path; everything else
// is a sub-path. A 404.html fallback re-serves this same SPA for those sub-paths
// on static hosts (e.g. GitHub Pages), so refresh & deep-links keep working.
const pathFor = (id) => (!id || id === "home" ? `${PREFIX}/` : `${PREFIX}/${id}/`);

// The current section, derived from the URL path (basePath + slashes stripped).
const currentSegment = () => {
  if (typeof window === "undefined") return "";
  let p = window.location.pathname;
  if (PREFIX && p.startsWith(PREFIX)) p = p.slice(PREFIX.length);
  return p.replace(/^\/+|\/+$/g, "");
};

// WhatsApp deep-link needs digits only (country code kept, "(0)" trunk dropped).
const waNumber = (phone) => (phone || "").replace(/\(0\)/g, "").replace(/\D/g, "");

// The single-page site is organised as tabs; only one panel is visible at a time.
// Offerings (services) and Contact both live at the bottom of the Home panel;
// "reiki"/"soul-healing" are their own tabs.
const TABS = ["home", "about", "reiki", "soul-healing"];

// Maps each service card (by order) to the tab it opens when clicked.
const SERVICE_TABS = ["reiki", "soul-healing"];

// In-page sections at the bottom of Home (reached by switching to Home + scroll).
const HOME_SECTIONS = ["offerings", "contact"];

export default function Home(props) {
  // useTina makes the content live-editable inside the Tina admin iframe.
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const hero = data.page.hero;
  const about = data.page.about;
  const services = data.page.services;
  const contact = data.page.contact;

  // ── Tab navigation ────────────────────────────────────────────────
  // Default to "home" so the server-rendered HTML matches (good for SEO and
  // first paint); on the client we sync to the URL path after hydration.
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const applyFromPath = () => {
      const seg = currentSegment();
      if (TABS.includes(seg)) {
        setActiveTab(seg);
      } else if (HOME_SECTIONS.includes(seg)) {
        // Sections at the bottom of Home: show Home, then scroll to them.
        setActiveTab("home");
        requestAnimationFrame(() => {
          document.getElementById(seg)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      } else {
        setActiveTab("home");
      }
    };
    applyFromPath(); // deep links like /about or /contact on load / refresh
    window.addEventListener("popstate", applyFromPath); // browser back / forward
    return () => window.removeEventListener("popstate", applyFromPath);
  }, []);

  // The map lives at the bottom of the Home page; Leaflet mis-measures its
  // container while a panel is hidden, so refresh it whenever Home is shown.
  useEffect(() => {
    if (activeTab !== "home") return;
    const id = window.setTimeout(() => window.__spRefreshMap?.(), 60);
    return () => window.clearTimeout(id);
  }, [activeTab]);

  // Pass `scrollToId` to open the Home tab and smooth-scroll to a section on it.
  const selectTab = (id, scrollToId) => {
    setActiveTab(id);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", pathFor(scrollToId || id));
      if (scrollToId) {
        requestAnimationFrame(() => {
          document.getElementById(scrollToId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      // Close the mobile nav menu if it's open.
      document.getElementById("navMenu")?.classList.remove("is-open");
      document.getElementById("navToggle")?.setAttribute("aria-expanded", "false");
    }
  };

  // Props for a tab link (nav) and a tab panel (section), derived from state.
  const linkProps = (id) => ({
    href: pathFor(id),
    id: `tab-${id}-link`,
    role: "tab",
    "aria-selected": activeTab === id,
    "aria-controls": `tab-${id}`,
    "data-tab": id,
    onClick: (e) => {
      e.preventDefault();
      selectTab(id);
    },
  });

  const panelProps = (id, baseClass) => ({
    id: `tab-${id}`,
    "data-tab-panel": id,
    role: "tabpanel",
    "aria-labelledby": `tab-${id}-link`,
    className: `${baseClass} tab-panel${activeTab === id ? " is-active" : ""}`,
    hidden: activeTab !== id,
  });

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Soul Pathways — Reiki and Soul Healing in Amsterdam. Gentle, supportive energy healing sessions to help you reconnect, restore balance, and find calm."
        />
        <title>Soul Pathways — Reiki &amp; Soul Healing in Amsterdam</title>

        {/* Open Graph / social preview */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Soul Pathways" />
        <meta
          property="og:title"
          content="Soul Pathways — Reiki & Soul Healing in Amsterdam"
        />
        <meta
          property="og:description"
          content="Gentle, supportive energy healing sessions to help you reconnect, restore balance, and find calm."
        />
        <meta
          property="og:image"
          content="https://aviadavr.github.io/soul-healing/static/images/og-preview.jpg"
        />
        <meta
          property="og:image:secure_url"
          content="https://aviadavr.github.io/soul-healing/static/images/og-preview.jpg"
        />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Soul Pathways — Reiki & Soul Healing in Amsterdam"
        />
        <meta property="og:url" content="https://aviadavr.github.io/soul-healing/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://aviadavr.github.io/soul-healing/static/images/og-preview.jpg"
        />

        <meta name="theme-color" content="#7d9b78" />
        <link rel="icon" type="image/svg+xml" href={`${PREFIX}/static/icons/favicon.svg`} />

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Nunito+Sans:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Leaflet (interactive map) styles */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin="anonymous"
        />

        {/* Existing site styles (kept as a plain stylesheet so the CSS url()
            references to /static/... keep resolving exactly as before). */}
        <link rel="stylesheet" href={`${PREFIX}/css/styles.css`} />
      </Head>

      {/* ===================== NAVIGATION ===================== */}
      <header className="site-header" id="top">
        <nav className="nav container" aria-label="Primary">
          <a href={pathFor("home")} className="nav__brand" onClick={(e) => { e.preventDefault(); selectTab("home"); }}>
            <img
              src={`${PREFIX}/static/logo/soul-pathways-logo.svg`}
              alt="Soul Pathways logo"
              className="nav__logo"
            />
            <span className="nav__name">Soul&nbsp;Pathways</span>
          </a>

          <button
            type="button"
            className="nav__toggle"
            id="navToggle"
            aria-label="Toggle navigation"
            aria-expanded="false"
            aria-controls="navMenu"
          >
            <span className="nav__toggle-bar"></span>
            <span className="nav__toggle-bar"></span>
            <span className="nav__toggle-bar"></span>
          </button>

          <ul className="nav__menu" id="navMenu" role="tablist" aria-label="Site sections">
            <li><a {...linkProps("home")} className={`nav__link${activeTab === "home" ? " is-active" : ""}`}>Home</a></li>

            {/* Offerings — hover dropdown on desktop */}
            <li className="nav__item nav__has-dropdown">
              <a
                href={pathFor("offerings")}
                className={`nav__link nav__dropdown-toggle${activeTab === "reiki" || activeTab === "soul-healing" ? " is-active" : ""}`}
                aria-haspopup="true"
                onClick={(e) => { e.preventDefault(); selectTab("home", "offerings"); }}
              >
                Offerings <span className="nav__caret" aria-hidden="true">▾</span>
              </a>
              <ul className="nav__dropdown">
                <li><a {...linkProps("reiki")} className={`nav__dropdown-link${activeTab === "reiki" ? " is-active" : ""}`}>Reiki</a></li>
                <li><a {...linkProps("soul-healing")} className={`nav__dropdown-link${activeTab === "soul-healing" ? " is-active" : ""}`}>Soul Healing</a></li>
              </ul>
            </li>

            {/* Direct links — shown only on mobile, where hover menus don't work */}
            <li className="nav__item--mobile">
              <a href={pathFor("reiki")} className={`nav__link${activeTab === "reiki" ? " is-active" : ""}`} onClick={(e) => { e.preventDefault(); selectTab("reiki"); }}>Reiki</a>
            </li>
            <li className="nav__item--mobile">
              <a href={pathFor("soul-healing")} className={`nav__link${activeTab === "soul-healing" ? " is-active" : ""}`} onClick={(e) => { e.preventDefault(); selectTab("soul-healing"); }}>Soul Healing</a>
            </li>

            <li><a {...linkProps("about")} className={`nav__link${activeTab === "about" ? " is-active" : ""}`}>About</a></li>

            <li><a href={pathFor("contact")} className="nav__link nav__link--cta" onClick={(e) => { e.preventDefault(); selectTab("home", "contact"); }}>Contact</a></li>
          </ul>
        </nav>
      </header>

      <main className="tabbed-main">
        {/* ===================== HOME: HERO + SERVICES (Tina-editable) ===================== */}
        <div {...panelProps("home", "home-page")}>
          <section className="hero">
            <div className="hero__overlay"></div>
            <div className="hero__content container">
            <div className="hero__card">
            <p className="hero__eyebrow" data-tina-field={tinaField(hero, "eyebrow")}>
              {hero.eyebrow}
            </p>
            <h1 className="hero__title">
              <span data-tina-field={tinaField(hero, "titleLine1")}>{hero.titleLine1}</span>
              <br />
              <span data-tina-field={tinaField(hero, "titleLine2")}>{hero.titleLine2}</span>
            </h1>
            <p className="hero__subtitle" data-tina-field={tinaField(hero, "subtitle")}>
              {hero.subtitle}
            </p>
            <div className="hero__actions">
              <a href={pathFor("contact")} className="btn btn--primary" data-tab="contact" onClick={(e) => { e.preventDefault(); selectTab("home", "contact"); }} data-tina-field={tinaField(hero, "primaryCta")}>
                {hero.primaryCta}
              </a>
              <a href={pathFor("about")} className="btn btn--ghost" data-tab="about" onClick={(e) => { e.preventDefault(); selectTab("about"); }} data-tina-field={tinaField(hero, "secondaryCta")}>
                {hero.secondaryCta}
              </a>
            </div>
            </div>
          </div>
          </section>

          {/* ===================== OFFERINGS (part of Home, Tina-editable) ===================== */}
          <section id="offerings" className="section services">
            <div className="container">
              <div className="section__head">
                <p className="section__eyebrow" data-tina-field={tinaField(services, "eyebrow")}>{services.eyebrow}</p>
                <h2 className="section__title" data-tina-field={tinaField(services, "title")}>{services.title}</h2>
                <p className="section__lead" data-tina-field={tinaField(services, "lead")}>
                  {services.lead}
                </p>
              </div>

              <div className="services__grid">
                {services.cards?.map((card, i) => {
                  const tab = SERVICE_TABS[i];
                  return (
                    <a
                      className="card card--link"
                      key={i}
                      href={tab ? pathFor(tab) : undefined}
                      onClick={tab ? (e) => { e.preventDefault(); selectTab(tab); } : undefined}
                      data-tina-field={tinaField(card)}
                    >
                      <div className="card__icon" aria-hidden="true" data-tina-field={tinaField(card, "icon")}>{card.icon}</div>
                      <h3 className="card__title" data-tina-field={tinaField(card, "title")}>{card.title}</h3>
                      <p className="card__text" data-tina-field={tinaField(card, "text")}>
                        {card.text}
                      </p>
                      <span className="card__more" aria-hidden="true">Learn more →</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* ===================== ABOUT (Tina-editable) ===================== */}
        <section {...panelProps("about", "section about")}>
          <div className="container about__grid">
            <div className="about__media">
              <img src={`${PREFIX}/static/images/about-1.jpg`} alt="Portrait of the practitioner — placeholder" className="about__photo about__photo--main" />
              <img src={`${PREFIX}/static/images/about-2.svg`} alt="Healing space — placeholder" className="about__photo about__photo--accent" />
            </div>

            <div className="about__text">
              <p className="section__eyebrow" data-tina-field={tinaField(about, "eyebrow")}>
                {about.eyebrow}
              </p>
              <h2 className="section__title" data-tina-field={tinaField(about, "title")}>
                {about.title}
              </h2>

              <div data-tina-field={tinaField(about, "paragraphs")}>
                {about.paragraphs?.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <ul className="about__highlights" data-tina-field={tinaField(about, "highlights")}>
                {about.highlights?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <a href={pathFor("contact")} className="btn btn--primary" data-tab="contact" onClick={(e) => { e.preventDefault(); selectTab("home", "contact"); }} data-tina-field={tinaField(about, "cta")}>
                {about.cta}
              </a>
            </div>
          </div>
        </section>

        {/* ===================== REIKI (placeholder — copy to be added later) ===================== */}
        <section {...panelProps("reiki", "section service-page")}>
          <div className="container">
            <div className="section__head">
              <p className="section__eyebrow">Energy Healing</p>
              <h2 className="section__title">Reiki</h2>
              <p className="section__lead">
                A gentle, hands-on (or hands-near) Japanese energy technique that
                encourages deep relaxation and supports your body&apos;s natural balance.
              </p>
            </div>

            <div className="service-page__body">
              <p>
                <em>Placeholder text — your Reiki page copy will go here.</em>
              </p>
              <h3>What is Reiki?</h3>
              <p>
                Reiki is a calming practice in which the practitioner channels
                universal life energy to help ease tension and restore a sense of
                harmony. Describe your approach, lineage, and philosophy here.
              </p>
              <h3>What a session feels like</h3>
              <p>
                You remain fully clothed and comfortable while gentle hand
                positions guide the flow of energy. Many people feel warmth,
                tingling, and deep calm. Add what clients can expect here.
              </p>
              <h3>Who it&apos;s for</h3>
              <p>
                Reiki can support stress relief, emotional balance, better rest,
                and general wellbeing. Outline who benefits most and any details
                to keep in mind before a session.
              </p>
              <a href={pathFor("contact")} className="btn btn--primary" onClick={(e) => { e.preventDefault(); selectTab("home", "contact"); }}>
                Book a session
              </a>
            </div>
          </div>
        </section>

        {/* ===================== SOUL HEALING (placeholder — copy to be added later) ===================== */}
        <section {...panelProps("soul-healing", "section service-page")}>
          <div className="container">
            <div className="section__head">
              <p className="section__eyebrow">Inner Work</p>
              <h2 className="section__title">Soul Healing</h2>
              <p className="section__lead">
                A deeper, intuitive session to help release old patterns and
                reconnect with your inner self — bringing clarity, lightness, and grounding.
              </p>
            </div>

            <div className="service-page__body">
              <p>
                <em>Placeholder text — your Soul Healing page copy will go here.</em>
              </p>
              <h3>What is Soul Healing?</h3>
              <p>
                Soul healing gently works with energy and intention to soften
                long-held patterns and reconnect you with your deeper self.
                Describe your unique method and intentions here.
              </p>
              <h3>What a session feels like</h3>
              <p>
                In a calm, held space we explore where energy feels stuck and
                invite it to move. Many people leave feeling lighter and clearer.
                Add the flow of your sessions here.
              </p>
              <h3>Who it&apos;s for</h3>
              <p>
                This work supports those seeking clarity, emotional release, or a
                renewed sense of grounding. Describe who it&apos;s best suited to and
                how to prepare.
              </p>
              <a href={pathFor("contact")} className="btn btn--primary" onClick={(e) => { e.preventDefault(); selectTab("home", "contact"); }}>
                Book a session
              </a>
            </div>
          </div>
        </section>

        {/* ===================== CONTACT — shown at the bottom of the Home page ===================== */}
        <section id="contact" className="section contact" hidden={activeTab !== "home"}>
          <div className="container">
            <div className="section__head">
              <p className="section__eyebrow" data-tina-field={tinaField(contact, "eyebrow")}>{contact.eyebrow}</p>
              <h2 className="section__title" data-tina-field={tinaField(contact, "title")}>{contact.title}</h2>
              <p className="section__lead" data-tina-field={tinaField(contact, "lead")}>
                {contact.lead}
              </p>
            </div>

            <div className="contact__grid">
              <div className="contact__details">
                <h3 className="contact__subtitle" data-tina-field={tinaField(contact, "detailsTitle")}>{contact.detailsTitle}</h3>
                <ul className="contact__list">
                  <li>
                    <span className="contact__label">WhatsApp</span>
                    <a href={`https://wa.me/${waNumber(contact.phone)}`} target="_blank" rel="noopener noreferrer" className="contact__wa" data-tina-field={tinaField(contact, "phone")}>
                      <svg className="contact__wa-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      Chat on WhatsApp
                    </a>
                  </li>
                  <li>
                    <span className="contact__label">Phone</span>
                    <a href={`tel:${(contact.phone || "").replace(/[^+\d]/g, "")}`} data-tina-field={tinaField(contact, "phone")}>{contact.phone}</a>
                  </li>
                  <li>
                    <span className="contact__label">Email</span>
                    <a href={`mailto:${contact.email}`} data-tina-field={tinaField(contact, "email")}>{contact.email}</a>
                  </li>
                </ul>

                <h3 className="contact__subtitle" data-tina-field={tinaField(contact, "locationsTitle")}>{contact.locationsTitle}</h3>
                {contact.locations?.map((loc, i) => (
                  <address className="contact__location" key={i} data-tina-field={tinaField(loc)}>
                    <strong>{loc.name}</strong><br />
                    {loc.addressLines?.map((line, j) => (
                      <span key={j}>{line}<br /></span>
                    ))}
                  </address>
                ))}
              </div>

              <div className="contact__schedule">
                <h3 className="contact__subtitle" data-tina-field={tinaField(contact, "scheduleTitle")}>{contact.scheduleTitle}</h3>
                <table className="schedule">
                  <thead>
                    <tr>
                      <th scope="col">Day</th>
                      <th scope="col">Hours</th>
                      <th scope="col">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contact.schedule?.map((row, i) => {
                      const closed = /closed|appointment/i.test(row.hours || "");
                      return (
                        <tr key={i} data-tina-field={tinaField(row)}>
                          <th scope="row">{row.day}</th>
                          <td className={closed ? "schedule__closed" : undefined}>{row.hours}</td>
                          <td>{row.location}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="contact__note" data-tina-field={tinaField(contact, "scheduleNote")}>
                  <em>{contact.scheduleNote}</em>
                </p>
              </div>
            </div>

            <div className="contact__map-wrap">
              <h3 className="contact__subtitle" data-tina-field={tinaField(contact, "mapTitle")}>{contact.mapTitle}</h3>
              <div id="map" className="contact__map" role="application" aria-label="Map showing the two Amsterdam session locations"></div>
              <p className="contact__map-legend">
                <span className="legend__pin legend__pin--green"></span> {contact.locations?.[0]?.name}
                <span className="legend__pin legend__pin--violet"></span> {contact.locations?.[1]?.name}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div className="site-footer__brand">
            <img src={`${PREFIX}/static/logo/soul-pathways-logo.svg`} alt="" className="site-footer__logo" />
            <span>Soul Pathways</span>
          </div>
          <p className="site-footer__tag">Reiki &amp; Soul Healing · Amsterdam</p>
          <p className="site-footer__copy">© <span id="year"></span> Soul Pathways. All rights reserved.</p>
        </div>
      </footer>

      {/* Existing site scripts (nav toggle + footer year). */}
      <Script src={`${PREFIX}/js/main.js`} strategy="afterInteractive" />

      {/* Leaflet first, then map.js (which depends on the global L). */}
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          const s = document.createElement("script");
          s.src = `${PREFIX}/js/map.js`;
          document.body.appendChild(s);
        }}
      />
    </>
  );
}

// Pull the content from content/pages/home.json through Tina at build time.
export const getStaticProps = async () => {
  const res = await client.queries.page({ relativePath: "home.json" });
  return {
    props: {
      data: res.data,
      query: res.query,
      variables: res.variables,
    },
  };
};










