import Head from "next/head";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { client } from "../tina/__generated__/client";

// Plain <img>/<link>/<script> srcs are NOT auto-prefixed with basePath the way
// next/link and next/image are, so we prefix them manually for GitHub Pages.
const PREFIX = process.env.NEXT_PUBLIC_BASE_PATH || "";

// The single-page site is organised as tabs; only one panel is visible at a time.
const TABS = ["home", "services", "about", "contact", "booking"];

export default function Home(props) {
  // useTina makes the content live-editable inside the Tina admin iframe.
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const hero = data.page.hero;
  const about = data.page.about;

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
          content="https://soul-pathways.github.io/soul-healing/static/images/og-preview.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />

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
            <li><a {...linkProps("services")} className={`nav__link${activeTab === "services" ? " is-active" : ""}`}>Services</a></li>
            <li><a {...linkProps("about")} className={`nav__link${activeTab === "about" ? " is-active" : ""}`}>About</a></li>
            <li><a {...linkProps("contact")} className={`nav__link${activeTab === "contact" ? " is-active" : ""}`}>Contact</a></li>
            <li><a {...linkProps("booking")} className={`nav__link nav__link--cta${activeTab === "booking" ? " is-active" : ""}`}>Book a session</a></li>
          </ul>
        </nav>
      </header>

      <main className="tabbed-main">
        {/* ===================== HERO (Tina-editable) ===================== */}
        <section {...panelProps("home", "hero")}>
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

        {/* ===================== SERVICES (static for now) ===================== */}
        <section {...panelProps("services", "section services")}>
          <div className="container">
            <div className="section__head">
              <p className="section__eyebrow">What I offer</p>
              <h2 className="section__title">Services</h2>
              <p className="section__lead">
                Each session is gentle, intuitive, and tailored to where you
                are today. Below is a general overview — feel free to reach out
                with any questions.
              </p>
            </div>

            <div className="services__grid">
              <article className="card">
                <div className="card__icon" aria-hidden="true">✦</div>
                <h3 className="card__title">Reiki Healing</h3>
                <p className="card__text">
                  A relaxing, hands-on (or hands-near) energy technique that
                  encourages deep rest and supports your body's natural ability
                  to find balance. Wonderful for stress relief and renewal.
                </p>
              </article>

              <article className="card">
                <div className="card__icon" aria-hidden="true">☾</div>
                <h3 className="card__title">Soul Healing</h3>
                <p className="card__text">
                  A deeper, intuitive session to help release old patterns and
                  reconnect with your inner self. We gently work with energy and
                  intention to bring clarity, lightness, and grounding.
                </p>
              </article>

              <article className="card">
                <div className="card__icon" aria-hidden="true">❀</div>
                <h3 className="card__title">Combined Session</h3>
                <p className="card__text">
                  A blended experience of Reiki and soul healing, shaped around
                  your needs on the day. Ideal if you're not sure where to begin
                  — we'll find the right rhythm together.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ===================== CONTACT (static for now) ===================== */}
        <section {...panelProps("contact", "section contact")}>
          <div className="container">
            <div className="section__head">
              <p className="section__eyebrow">Get in touch</p>
              <h2 className="section__title">Contact &amp; Booking</h2>
              <p className="section__lead">
                Sessions are available at two welcoming locations in Amsterdam.
                Reach out to book, or use the weekly availability below as a guide.
              </p>
            </div>

            <div className="contact__grid">
              <div className="contact__details">
                <h3 className="contact__subtitle">Reach me directly</h3>
                <ul className="contact__list">
                  <li>
                    <span className="contact__label">Email</span>
                    <a href="mailto:hello@soulpathways.example">hello@soulpathways.example</a>
                  </li>
                  <li>
                    <span className="contact__label">Phone</span>
                    <a href="tel:+310000000000">+31 (0)0 000 0000</a>
                  </li>
                  <li>
                    <span className="contact__label">Instagram</span>
                    <a href="#">@soulpathways <em>[edit]</em></a>
                  </li>
                </ul>

                <h3 className="contact__subtitle">Locations</h3>
                <address className="contact__location">
                  <strong>Common Ground</strong><br />
                  Zeeburgerdijk 265<br />
                  1095 AC Amsterdam
                </address>
                <address className="contact__location">
                  <strong>The Integration Room</strong><br />
                  <span className="contact__location-sub">Walk-In Therapy Studio Amsterdam</span><br />
                  Eerste Laurierdwarsstraat 2<br />
                  1016 PX Amsterdam
                </address>
              </div>

              <div className="contact__schedule">
                <h3 className="contact__subtitle">Weekly availability <em>(template — edit)</em></h3>
                <table className="schedule">
                  <thead>
                    <tr>
                      <th scope="col">Day</th>
                      <th scope="col">Hours</th>
                      <th scope="col">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><th scope="row">Monday</th><td>10:00 – 16:00</td><td>Common Ground</td></tr>
                    <tr><th scope="row">Tuesday</th><td>12:00 – 18:00</td><td>The Integration Room</td></tr>
                    <tr><th scope="row">Wednesday</th><td className="schedule__closed">By appointment</td><td>—</td></tr>
                    <tr><th scope="row">Thursday</th><td>10:00 – 16:00</td><td>Common Ground</td></tr>
                    <tr><th scope="row">Friday</th><td>12:00 – 18:00</td><td>The Integration Room</td></tr>
                    <tr><th scope="row">Sat – Sun</th><td className="schedule__closed">Closed</td><td>—</td></tr>
                  </tbody>
                </table>
                <p className="contact__note">
                  <em>Times above are a general guide. To reserve your spot,
                  use the online booking calendar below.</em>
                </p>
              </div>
            </div>

            <div className="contact__map-wrap">
              <h3 className="contact__subtitle">Find me on the map</h3>
              <div id="map" className="contact__map" role="application" aria-label="Map showing the two Amsterdam session locations"></div>
              <p className="contact__map-legend">
                <span className="legend__pin legend__pin--green"></span> Common Ground
                <span className="legend__pin legend__pin--violet"></span> The Integration Room
              </p>
            </div>
          </div>
        </section>

        {/* ===================== BOOKING (static for now) ===================== */}
        <section {...panelProps("booking", "section booking")}>
          <div className="container">
            <div className="section__head">
              <p className="section__eyebrow">Appointments</p>
              <h2 className="section__title">Book a session online</h2>
              <p className="section__lead">
                Choose a time that suits you below. Sessions are available in
                Common Ground and The Integration Room.
              </p>
            </div>
            <div className="booking__embed">
              <div
                className="calendly-inline-widget"
                data-url="https://calendly.com/babagas_a/30min?background_color=c3e9c1&primary_color=67a765"
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










