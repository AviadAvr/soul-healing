import Head from "next/head";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { client } from "../tina/__generated__/client";

// Plain <img>/<link>/<script> srcs are NOT auto-prefixed with basePath the way
// next/link and next/image are, so we prefix them manually for GitHub Pages.
const PREFIX = process.env.NEXT_PUBLIC_BASE_PATH || "";

// The single-page site is organised as tabs; only one panel is visible at a time.
// "services" lives inside the Home panel.
const TABS = ["home", "about", "contact", "booking"];

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
  const booking = data.page.booking;

  // ── Tab navigation ────────────────────────────────────────────────
  // Default to "home" so the server-rendered HTML matches (good for SEO and
  // first paint); on the client we sync to the URL hash after hydration.
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const applyFromHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (TABS.includes(id)) setActiveTab(id);
    };
    applyFromHash(); // handle deep links like /#about on load
    window.addEventListener("hashchange", applyFromHash); // back/forward + #links
    return () => window.removeEventListener("hashchange", applyFromHash);
  }, []);

  const selectTab = (id) => {
    setActiveTab(id);
    if (typeof window !== "undefined") {
      // Update the URL without triggering the default jump/scroll.
      window.history.replaceState(null, "", `#${id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Close the mobile nav menu if it's open.
      document.getElementById("navMenu")?.classList.remove("is-open");
      document.getElementById("navToggle")?.setAttribute("aria-expanded", "false");
    }
  };

  // Props for a tab link (nav) and a tab panel (section), derived from state.
  const linkProps = (id) => ({
    href: `#${id}`,
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
          <a href="#home" className="nav__brand">
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
            <li><a {...linkProps("about")} className={`nav__link${activeTab === "about" ? " is-active" : ""}`}>About</a></li>
            <li><a {...linkProps("contact")} className={`nav__link${activeTab === "contact" ? " is-active" : ""}`}>Contact</a></li>
            <li><a {...linkProps("booking")} className={`nav__link nav__link--cta${activeTab === "booking" ? " is-active" : ""}`}>Book a session</a></li>
          </ul>
        </nav>
      </header>

      <main className="tabbed-main">
        {/* ===================== HOME: HERO + SERVICES (Tina-editable) ===================== */}
        <div {...panelProps("home", "home-page")}>
          <section className="hero">
            <div className="hero__overlay"></div>
            <div className="hero__content container">
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
              <a href="#booking" className="btn btn--primary" data-tab="booking" onClick={(e) => { e.preventDefault(); selectTab("booking"); }} data-tina-field={tinaField(hero, "primaryCta")}>
                {hero.primaryCta}
              </a>
              <a href="#about" className="btn btn--ghost" data-tab="about" onClick={(e) => { e.preventDefault(); selectTab("about"); }} data-tina-field={tinaField(hero, "secondaryCta")}>
                {hero.secondaryCta}
              </a>
            </div>
          </div>
          </section>

          {/* ===================== SERVICES (part of Home, Tina-editable) ===================== */}
          <section className="section services">
            <div className="container">
              <div className="section__head">
                <p className="section__eyebrow" data-tina-field={tinaField(services, "eyebrow")}>{services.eyebrow}</p>
                <h2 className="section__title" data-tina-field={tinaField(services, "title")}>{services.title}</h2>
                <p className="section__lead" data-tina-field={tinaField(services, "lead")}>
                  {services.lead}
                </p>
              </div>

              <div className="services__grid">
                {services.cards?.map((card, i) => (
                  <article className="card" key={i} data-tina-field={tinaField(card)}>
                    <div className="card__icon" aria-hidden="true" data-tina-field={tinaField(card, "icon")}>{card.icon}</div>
                    <h3 className="card__title" data-tina-field={tinaField(card, "title")}>{card.title}</h3>
                    <p className="card__text" data-tina-field={tinaField(card, "text")}>
                      {card.text}
                    </p>
                  </article>
                ))}
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

              <a href="#contact" className="btn btn--primary" data-tab="contact" onClick={(e) => { e.preventDefault(); selectTab("contact"); }} data-tina-field={tinaField(about, "cta")}>
                {about.cta}
              </a>
            </div>
          </div>
        </section>

        {/* ===================== CONTACT (Tina-editable) ===================== */}
        <section {...panelProps("contact", "section contact")}>
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
                    <span className="contact__label">Email</span>
                    <a href={`mailto:${contact.email}`} data-tina-field={tinaField(contact, "email")}>{contact.email}</a>
                  </li>
                  <li>
                    <span className="contact__label">Phone</span>
                    <a href={`tel:${(contact.phone || "").replace(/[^+\d]/g, "")}`} data-tina-field={tinaField(contact, "phone")}>{contact.phone}</a>
                  </li>
                  <li>
                    <span className="contact__label">Instagram</span>
                    <a href="#" data-tina-field={tinaField(contact, "instagram")}>{contact.instagram}</a>
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

        {/* ===================== BOOKING (Tina-editable) ===================== */}
        <section {...panelProps("booking", "section booking")}>
          <div className="container">
            <div className="section__head">
              <p className="section__eyebrow" data-tina-field={tinaField(booking, "eyebrow")}>{booking.eyebrow}</p>
              <h2 className="section__title" data-tina-field={tinaField(booking, "title")}>{booking.title}</h2>
              <p className="section__lead" data-tina-field={tinaField(booking, "lead")}>
                {booking.lead}
              </p>
            </div>
            <div className="booking__embed">
              <div
                className="calendly-inline-widget"
                data-url={booking.calendlyUrl}
                data-tina-field={tinaField(booking, "calendlyUrl")}
              ></div>
              <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
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










