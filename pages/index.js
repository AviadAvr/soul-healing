import Head from "next/head";
import Script from "next/script";
import fs from "fs";
import path from "path";
import { Fragment, useEffect, useRef, useState } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import {
  HeroDocument,
  AboutDocument,
  ServicesDocument,
  ReikiDocument,
  SoulHealingDocument,
  ContactDocument,
} from "../tina/__generated__/types";

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

// Normalise a display phone (e.g. "(+31) 06-4497-4792") to an international
// dial string ("+31644974792"): keep digits & "+", then drop the trunk "0"
// that sits right after the country code.
const dialNumber = (phone) =>
  (phone || "").replace(/[^\d+]/g, "").replace(/^(\+\d{1,3})0/, "$1");

// Lightweight inline emphasis: turn *starred* spans into <em> without allowing
// raw HTML. Keeps content editable (plain text) in the Tina/JSON editor.
const withEmphasis = (text) =>
  (text || "").split(/\*([^*]+)\*/g).map((chunk, i) =>
    i % 2 === 1 ? <em key={i}>{chunk}</em> : chunk
  );

// Richer inline renderer for body copy: supports **bold**, *italic* and
// [label](target) links. Pass a context object:
//   { selectTab, resolveLink }
// `resolveLink(label, target, key)` lets the caller render special links (e.g.
// WhatsApp / Email / a stored URL) and should return a React element, or a
// falsy value to fall back to the defaults below. A target of "contact" opens
// the Contact section on the Home tab; anything else is treated as an external
// URL. Everything stays plain, editable text in Tina — no raw HTML.
const renderInline = (text, ctx = {}) => {
  const { selectTab, resolveLink } = ctx;
  const out = [];
  let key = 0;

  // Apply **bold** / *italic* to a plain string chunk (no links inside).
  const pushFormatted = (str) => {
    str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).forEach((part) => {
      if (!part) return;
      if (part.startsWith("**") && part.endsWith("**")) {
        out.push(<strong key={key++}>{part.slice(2, -2)}</strong>);
      } else if (part.startsWith("*") && part.endsWith("*")) {
        out.push(<em key={key++}>{part.slice(1, -1)}</em>);
      } else {
        out.push(part);
      }
    });
  };

  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  while ((m = linkRe.exec(text || "")) !== null) {
    if (m.index > last) pushFormatted(text.slice(last, m.index));
    const [, label, target] = m;
    const custom = resolveLink?.(label, target, key);
    if (custom) {
      out.push(custom);
      key++;
    } else if (target === "contact") {
      out.push(
        <a
          key={key++}
          href={pathFor("contact")}
          onClick={(e) => {
            e.preventDefault();
            selectTab?.("home", "contact");
          }}
        >
          {label}
        </a>
      );
    } else {
      out.push(
        <a key={key++} href={target} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (text && last < text.length) pushFormatted(text.slice(last));
  return out;
};

// WhatsApp deep-link needs digits only (no leading "+").
const waNumber = (phone) => dialNumber(phone).replace(/\D/g, "");

// The single-page site is organised as tabs; only one panel is visible at a time.
// Services and Contact both live at the bottom of the Home panel;
// "reiki"/"soul-healing" are their own tabs.
const TABS = ["home", "about", "reiki", "soul-healing"];

// Maps each service card (by order) to the tab it opens when clicked.
const SERVICE_TABS = ["reiki", "soul-healing"];

// In-page sections at the bottom of Home (reached by switching to Home + scroll).
const HOME_SECTIONS = ["services", "contact"];

// ── Practice locations (map switcher) ─────────────────────────────
// Add a new location here and it automatically gets a switch button + pin.
// `coords` are deliberately street-level (never the exact house number);
// `url` is the Google Maps link opened from the marker popup.
const LOCATIONS = [
  {
    id: "leiden",
    label: "Leiden",
    coords: [52.1607446, 4.4941448],
    popupLabel: "Van der Werfstraat<br>Leiden",
    url: "https://www.google.com/maps/dir//Van+der+Werfstraat,+Leiden/@52.1608267,4.4917957,17z/data=!4m18!1m8!3m7!1s0x47c5c6925081e325:0xc57ad6caa402a513!2sVan+der+Werfstraat,+Leiden!3b1!8m2!3d52.1608234!4d4.4943706!16s%2Fg%2F1tgyvx18!4m8!1m0!1m5!1m1!1s0x47c5c6925081e325:0xc57ad6caa402a513!2m2!1d4.4943706!2d52.1608234!3e3?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D",
  },
  {
    id: "amsterdam",
    label: "Amsterdam",
    coords: [52.3725301, 4.8804524],
    popupLabel: "The Integration Room<br>Amsterdam",
    url: "https://www.google.com/maps/dir//The+Integration+Room+%7C+Walk-In+Therapy+Studio+Amsterdam,+Eerste+Laurierdwarsstraat+2,+1016+PX+Amsterdam/@52.3725333,4.8778775,17z/data=!4m17!1m7!3m6!1s0x47c6093a4374ab2b:0xc6a8c57ee8cfbf1f!2sThe+Integration+Room+%7C+Walk-In+Therapy+Studio+Amsterdam!8m2!3d52.3725301!4d4.8804524!16s%2Fg%2F11xyqcyz4t!4m8!1m0!1m5!1m1!1s0x47c6093a4374ab2b:0xc6a8c57ee8cfbf1f!2m2!1d4.8804524!2d52.3725301!3e3?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D",
  },
];
const DEFAULT_LOCATION_ID = "leiden";

// Point an existing Leaflet map + marker at a location (updates pin, popup & view).
const showLocation = (map, marker, loc) => {
  marker.setLatLng(loc.coords);
  marker.setPopupContent(
    `<a href="${loc.url}" target="_blank" rel="noopener noreferrer">${loc.popupLabel}</a>`
  );
  map.setView(loc.coords, map.getZoom());
  marker.openPopup();
};

export default function Home(props) {
  // Each section is its own Tina document; useTina makes each one live-editable
  // inside the Tina admin iframe. One hook per section keeps them independent.
  const { data: heroData } = useTina(props.hero);
  const { data: aboutData } = useTina(props.about);
  const { data: servicesData } = useTina(props.services);
  const { data: reikiData } = useTina(props.reiki);
  const { data: soulHealingData } = useTina(props.soulHealing);
  const { data: contactData } = useTina(props.contact);

  const hero = heroData.hero;
  const about = aboutData.about;
  const services = servicesData.services;
  const reiki = reikiData.reiki;
  const soulHealing = soulHealingData.soulHealing;
  const contact = contactData.contact;

  // ── Tab navigation ────────────────────────────────────────────────
  // Default to "home" so the server-rendered HTML matches (good for SEO and
  // first paint); on the client we sync to the URL path after hydration.
  const [activeTab, setActiveTab] = useState("home");

  // ── "Copied to clipboard" toast ───────────────────────────────────
  // `label` is the message text (e.g. "Email address"); `visible` drives the
  // fade in/out. Keeping the label while hiding avoids a flash of bare
  // "copied to clipboard" text during the fade-out.
  const [toast, setToast] = useState({ label: "", visible: false });

  // On touch/mobile devices the email/phone open the mail/dialer app; on
  // desktop they copy to the clipboard instead. Default to desktop for SSR,
  // then refine on the client after hydration.
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  // Holds the Leaflet map instance so it can be re-sized when the tab changes.
  const mapRef = useRef(null);
  // The single marker whose position/popup we move between locations.
  const markerRef = useRef(null);
  // Which practice location the map currently shows (Leiden by default).
  const [activeLocation, setActiveLocation] = useState(DEFAULT_LOCATION_ID);
  // Mirror of activeLocation for use inside the (mount-only) map init closure.
  const activeLocationRef = useRef(DEFAULT_LOCATION_ID);

  // Centre the map on a location. Always recentres — even when re-selecting the
  // current location after the user has panned away.
  const selectLocation = (id) => {
    activeLocationRef.current = id;
    setActiveLocation(id);
    const map = mapRef.current;
    const marker = markerRef.current;
    const loc = LOCATIONS.find((l) => l.id === id);
    if (map && marker && loc) showLocation(map, marker, loc);
  };
  useEffect(() => {
    const coarse =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(pointer: coarse)").matches ||
        "ontouchstart" in window);
    setIsTouchDevice(!!coarse);
  }, []);

  const copyToClipboard = async (value, label) => {
    const text = value || "";
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older / non-secure contexts.
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setToast({ label, visible: true });
      window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2200);
    } catch {
      // Clipboard blocked — leave silently.
    }
  };

  const copyEmail = () => copyToClipboard(contact.email, "Email address");
  const copyPhone = () => copyToClipboard(dialNumber(contact.phone), "Phone number");

  // Resolves the special links used inside the editable booking sentences so the
  // surrounding copy stays plain text in Tina while the links keep their
  // behaviour: [WhatsApp](whatsapp), [Email](email) (a mailto on touch, a
  // copy-to-clipboard button on desktop) and [The Integration Room](integration-room).
  const resolveBookingLink = (label, target, key) => {
    if (target === "whatsapp") {
      return (
        <a key={key} href={`https://wa.me/${waNumber(contact.phone)}`} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
    if (target === "email") {
      return isTouchDevice ? (
        <a key={key} href={`mailto:${contact.email}`}>{label}</a>
      ) : (
        <button
          key={key}
          type="button"
          className="contact__copy contact__copy--inline"
          onClick={copyEmail}
          aria-label={`Copy email address ${contact.email} to clipboard`}
        >
          {label}
        </button>
      );
    }
    if (target === "integration-room") {
      return (
        <a key={key} href={contact.integrationRoomUrl} target="_blank" rel="noopener noreferrer" data-tina-field={tinaField(contact, "integrationRoomUrl")}>
          {label}
        </a>
      );
    }
    return null; // fall back to default [contact]/external handling
  };

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
        // Unrecognised path (served via the 404.html fallback): show Home and
        // tidy the address bar so it matches, without adding a history entry.
        setActiveTab("home");
        window.history.replaceState(null, "", pathFor("home"));
      }
    };
    applyFromPath(); // deep links like /about or /contact on load / refresh
    window.addEventListener("popstate", applyFromPath); // browser back / forward
    return () => window.removeEventListener("popstate", applyFromPath);
  }, []);

  // ── Location map (Leaflet, loaded from CDN) ───────────────────────
  // A street-level pin marks the practice on Van der Werfstraat without ever
  // exposing the exact house number. On touch devices the map uses cooperative
  // gestures: one finger scrolls the page (and shows a hint), two fingers pan.
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Start on whichever location is currently selected (Leiden by default).
    const startLoc =
      LOCATIONS.find((l) => l.id === activeLocationRef.current) || LOCATIONS[0];
    let map;

    const init = () => {
      const L = window.L;
      const el = document.getElementById("contactMap");
      if (!L || !el || el._leaflet_id) return; // guard against double init

      const isMobile = L.Browser.mobile;
      map = L.map(el, {
        center: startLoc.coords,
        zoom: 15, // street level, not building level
        scrollWheelZoom: false, // don't hijack page scroll (enabled on desktop below)
        dragging: !isMobile, // one-finger drag off on touch; two fingers re-enable it
        tap: false,
      });
      mapRef.current = map;

      // Jawg "Streets" — soft, detailed street map (free tier, needs a token).
      // Get a free access token at https://www.jawg.io and set it in
      // NEXT_PUBLIC_JAWG_TOKEN (see .env). Other Jawg styles:
      //   jawg-sunny / jawg-light / jawg-terrain / jawg-dark
      const jawgToken = process.env.NEXT_PUBLIC_JAWG_TOKEN;
      L.tileLayer(
        `https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=${jawgToken}`,
        {
          attribution:
            '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          minZoom: 0,
          maxZoom: 22,
        }
      ).addTo(map);

      // A single marker; its popup links out to Google Maps and opens by
      // default. autoPan is off so opening the popup can't nudge the map away
      // from having the marker centred.
      const marker = L.marker(startLoc.coords)
        .addTo(map)
        .bindPopup("", { autoPan: false });
      markerRef.current = marker;
      showLocation(map, marker, startLoc);

      if (!isMobile) {
        // Desktop: full interactivity.
        map.scrollWheelZoom.enable();
      } else {
        // Mobile: cooperative gestures + "use two fingers" hint overlay.
        const hint = document.getElementById("mapHint");
        el.addEventListener(
          "touchstart",
          (e) => {
            if (e.touches.length >= 2) {
              map.dragging.enable();
              hint?.classList.remove("is-visible");
            } else {
              map.dragging.disable();
              hint?.classList.add("is-visible");
            }
          },
          { passive: true }
        );
        el.addEventListener("touchend", (e) => {
          if (e.touches.length === 0) {
            map.dragging.disable();
            hint?.classList.remove("is-visible");
          }
        });
      }

      // The map lives in a tab that can start hidden; recalc once it's visible.
      setTimeout(() => map.invalidateSize(), 0);
    };

    // Load Leaflet's CSS + JS from CDN once, then initialise.
    if (window.L) {
      init();
    } else {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      let script = document.getElementById("leaflet-js");
      if (!script) {
        script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        document.body.appendChild(script);
      }
      script.addEventListener("load", init);
    }

    return () => {
      if (map) map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);


  // The map may be initialised while the Home tab (and thus the contact section)
  // is hidden; recalc its size whenever Home becomes visible so tiles render.
  useEffect(() => {
    if (activeTab === "home" && mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 0);
    }
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
          content="Soul Pathways — Reiki and Soul Healing in Leiden. Reconnect with a deeper sense of balance, presence and wellbeing in your life."
        />
        <title>Soul Pathways — Reiki &amp; Soul Healing in Leiden</title>

        {/* Open Graph / social preview */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Soul Pathways" />
        <meta
          property="og:title"
          content="Soul Pathways — Reiki & Soul Healing in Leiden"
        />
        <meta
          property="og:description"
          content="Reconnect with a deeper sense of balance, presence and wellbeing in your life."
        />
        <meta
          property="og:image"
          content="https://soul-pathways.com/static/images/og-preview.jpg"
        />
        <meta
          property="og:image:secure_url"
          content="https://soul-pathways.com/static/images/og-preview.jpg"
        />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Soul Pathways — Reiki & Soul Healing in Leiden"
        />
        <meta property="og:url" content="https://soul-pathways.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://soul-pathways.com/static/images/og-preview.jpg"
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

            {/* Services — hover dropdown on desktop */}
            <li className="nav__item nav__has-dropdown">
              <a
                href={pathFor("services")}
                className={`nav__link nav__dropdown-toggle${activeTab === "reiki" || activeTab === "soul-healing" ? " is-active" : ""}`}
                aria-haspopup="true"
                onClick={(e) => { e.preventDefault(); selectTab("home", "services"); }}
              >
                Services <span className="nav__caret" aria-hidden="true">▾</span>
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

          {/* ===================== SERVICES (part of Home, Tina-editable) ===================== */}
          <section id="services" className="section services">
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
              {/* Wide screens: highlights sit under the photo. Hidden on mobile (see CSS). */}
              <ul className="about__highlights about__highlights--onMedia" data-tina-field={tinaField(about, "highlights")}>
                {about.highlights?.map((item, i) => (
                  <li key={i}>{withEmphasis(item)}</li>
                ))}
              </ul>
            </div>

            <div className="about__text">
              <p className="section__eyebrow" data-tina-field={tinaField(about, "eyebrow")}>
                {about.eyebrow}
              </p>
              <h2 className="section__title" data-tina-field={tinaField(about, "title")}>
                {about.title}
              </h2>

              <div data-tina-field={tinaField(about, "paragraphs")}>
                {(about.paragraphs?.flatMap((para) => para.split(/\n{2,}/)) ?? []).map((para, i) => (
                  <p key={i}>{withEmphasis(para)}</p>
                ))}
              </div>

              {/* Mobile: highlights sit beneath the paragraphs. Hidden on wide screens (see CSS). */}
              <ul className="about__highlights about__highlights--inText" data-tina-field={tinaField(about, "highlights")}>
                {about.highlights?.map((item, i) => (
                  <li key={i}>{withEmphasis(item)}</li>
                ))}
              </ul>

              <a href={pathFor("contact")} className="btn btn--primary" data-tab="contact" onClick={(e) => { e.preventDefault(); selectTab("home", "contact"); }} data-tina-field={tinaField(about, "cta")}>
                {about.cta}
              </a>
            </div>
          </div>
        </section>

        {/* ===================== REIKI (Tina-editable) ===================== */}
        <section {...panelProps("reiki", "section service-page")}>
          <div className="container">
            <div className="section__head">
              {reiki.eyebrow && (
                <p className="section__eyebrow" data-tina-field={tinaField(reiki, "eyebrow")}>{reiki.eyebrow}</p>
              )}
              <h2 className="section__title" data-tina-field={tinaField(reiki, "title")}>{reiki.title}</h2>
              <p className="section__lead" data-tina-field={tinaField(reiki, "lead")}>
                {reiki.lead}
              </p>
            </div>

            <div className="service-page__body">
              {reiki.sections?.map((s, i) => (
                <Fragment key={i}>
                  <h3 data-tina-field={tinaField(s, "heading")}>{s.heading}</h3>
                  {s.gloss && (
                    <p className="service-page__gloss" data-tina-field={tinaField(s, "gloss")}>
                      {renderInline(s.gloss, { selectTab })}
                    </p>
                  )}
                  <p data-tina-field={tinaField(s, "body")}>{renderInline(s.body, { selectTab })}</p>
                </Fragment>
              ))}
              <a href={pathFor("contact")} className="btn btn--primary" onClick={(e) => { e.preventDefault(); selectTab("home", "contact"); }} data-tina-field={tinaField(reiki, "cta")}>
                {reiki.cta}
              </a>
            </div>
          </div>
        </section>

        {/* ===================== SOUL HEALING (Tina-editable) ===================== */}
        <section {...panelProps("soul-healing", "section service-page")}>
          <div className="container">
            <div className="section__head">
              {soulHealing.eyebrow && (
                <p className="section__eyebrow" data-tina-field={tinaField(soulHealing, "eyebrow")}>{soulHealing.eyebrow}</p>
              )}
              <h2 className="section__title" data-tina-field={tinaField(soulHealing, "title")}>{soulHealing.title}</h2>
              {soulHealing.lead && (
                <p className="section__lead" data-tina-field={tinaField(soulHealing, "lead")}>
                  {soulHealing.lead}
                </p>
              )}
            </div>

            <div className="service-page__body">
              {soulHealing.intro?.map((para, i) => (
                <p key={`intro-${i}`} data-tina-field={tinaField(soulHealing, "intro")}>
                  <em>{renderInline(para, { selectTab })}</em>
                </p>
              ))}
              {soulHealing.sections?.map((s, i) => (
                <Fragment key={i}>
                  <h3 data-tina-field={tinaField(s, "heading")}>{s.heading}</h3>
                  {s.gloss && (
                    <p className="service-page__gloss" data-tina-field={tinaField(s, "gloss")}>
                      {renderInline(s.gloss, { selectTab })}
                    </p>
                  )}
                  <p data-tina-field={tinaField(s, "body")}>{renderInline(s.body, { selectTab })}</p>
                </Fragment>
              ))}
              <a href={pathFor("contact")} className="btn btn--primary" onClick={(e) => { e.preventDefault(); selectTab("home", "contact"); }} data-tina-field={tinaField(soulHealing, "cta")}>
                {soulHealing.cta}
              </a>
            </div>
          </div>
        </section>

        {/* ===================== CONTACT — shown at the bottom of the Home page ===================== */}
        <section id="contact" className="section contact" hidden={activeTab !== "home"}>
          <div className="container">
            <div className="section__head">
              {contact.eyebrow && (
                <p className="section__eyebrow" data-tina-field={tinaField(contact, "eyebrow")}>{contact.eyebrow}</p>
              )}
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
                    <span className="contact__label">Phone</span>
                    <span className="contact__action">
                      {isTouchDevice ? (
                        <a href={`tel:${dialNumber(contact.phone)}`} data-tina-field={tinaField(contact, "phone")}>Tel: {contact.phone}</a>
                      ) : (
                        <button
                          type="button"
                          className="contact__copy"
                          onClick={copyPhone}
                          data-tina-field={tinaField(contact, "phone")}
                          aria-label={`Copy phone number ${contact.phone} to clipboard`}
                        >
                          <span>Tel: {contact.phone}</span>
                        </button>
                      )}
                    </span>
                    <a href={`https://wa.me/${waNumber(contact.phone)}`} target="_blank" rel="noopener noreferrer" className="contact__wa" data-tina-field={tinaField(contact, "phone")}>
                      <svg className="contact__wa-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      WhatsApp
                    </a>
                  </li>
                  <li>
                    <span className="contact__label">Email</span>
                    <span className="contact__action">
                      {isTouchDevice ? (
                        <a href={`mailto:${contact.email}`} data-tina-field={tinaField(contact, "email")}>{contact.email}</a>
                      ) : (
                        <button
                          type="button"
                          className="contact__copy"
                          onClick={copyEmail}
                          data-tina-field={tinaField(contact, "email")}
                          aria-label={`Copy email address ${contact.email} to clipboard`}
                        >
                          <span>{contact.email}</span>
                        </button>
                      )}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="contact__pricing">
                <h3 className="contact__subtitle" data-tina-field={tinaField(contact, "pricingTitle")}>{contact.pricingTitle}</h3>
                <p className="contact__price" data-tina-field={tinaField(contact, "pricingSingle")}>
                  {contact.pricingSingle}
                </p>
                <p className="contact__price">
                  <span data-tina-field={tinaField(contact, "pricingReduced")}>{contact.pricingReduced}</span>
                  <br />
                  <em data-tina-field={tinaField(contact, "pricingReducedNote")}>{contact.pricingReducedNote}</em>
                </p>
              </div>

              <div className="contact__schedule">
                <h3 className="contact__subtitle" data-tina-field={tinaField(contact, "bookingTitle")}>{contact.bookingTitle}</h3>
                <p data-tina-field={tinaField(contact, "bookingLeiden")}>
                  {renderInline(contact.bookingLeiden, { selectTab, resolveLink: resolveBookingLink })}
                </p>
                <p data-tina-field={tinaField(contact, "bookingAmsterdam")}>
                  {renderInline(contact.bookingAmsterdam, { selectTab, resolveLink: resolveBookingLink })}
                </p>
                <p data-tina-field={tinaField(contact, "bookingHomeNote")}><em>{contact.bookingHomeNote}</em></p>
              </div>
            </div>

            {/* Location map — pin sits at street level (never the exact house
                number). Buttons above the map switch between practice locations. */}
            <div className="contact__map-wrap">
              <div className="contact__map-switch" role="group" aria-label="Choose a location">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    className={`contact__map-btn${activeLocation === loc.id ? " is-active" : ""}`}
                    aria-pressed={activeLocation === loc.id}
                    onClick={() => selectLocation(loc.id)}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
              <div className="contact__map" id="contactMap" role="img" aria-label="Map showing the selected practice location">
                <div className="sp-map-hint" id="mapHint" aria-hidden="true">Use two fingers to move the map</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* "Copied to clipboard" toast — announced politely for screen readers. */}
      <div
        className={`toast${toast.visible ? " is-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast.label && `${toast.label} copied to clipboard`}
      </div>

      {/* ===================== FOOTER ===================== */}
      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div className="site-footer__brand">
            <img src={`${PREFIX}/static/logo/soul-pathways-logo.svg`} alt="" className="site-footer__logo" />
            <span>Soul Pathways</span>
          </div>
          <p className="site-footer__tag">Reiki & Soul Healing</p>
          <p className="site-footer__copy-top">© 2026 Soul Pathways Therapy. All rights reserved.</p>
          <p className="site-footer__copy-bottom">KVK number: 98665723 | Leiden, Netherlands</p>
        </div>
      </footer>

      {/* Existing site scripts (nav toggle + footer year). */}
      <Script src={`${PREFIX}/js/main.js`} strategy="afterInteractive" />
    </>
  );
}

// Build static props from the committed content files rather than querying Tina
// Cloud at build time. After a schema change Tina Cloud re-indexes the branch
// asynchronously *after* the push, so a cloud query during the deploy build can
// race ahead of indexing and fail ("Cannot query field …"). Reading the local
// JSON (which is exactly what Tina commits to git) makes the build deterministic.
// The generated query string + variables are still handed to useTina so inline
// editing in /admin keeps working — there it re-fetches live from Tina Cloud
// client-side, by which point indexing has caught up.
const readSection = (folder, field, query) => {
  const relativePath = "index.json";
  const file = path.join(process.cwd(), "content", folder, relativePath);
  const values = JSON.parse(fs.readFileSync(file, "utf8"));
  const typename = field.charAt(0).toUpperCase() + field.slice(1);
  return {
    query,
    variables: { relativePath },
    data: {
      [field]: {
        __typename: typename,
        id: `content/${folder}/${relativePath}`,
        _sys: {
          filename: "index",
          basename: "index.json",
          hasReferences: false,
          breadcrumbs: ["index"],
          path: `content/${folder}/${relativePath}`,
          relativePath,
          extension: ".json",
        },
        ...values,
      },
    },
  };
};

export const getStaticProps = async () => ({
  props: {
    hero: readSection("hero", "hero", HeroDocument),
    about: readSection("about", "about", AboutDocument),
    services: readSection("services", "services", ServicesDocument),
    reiki: readSection("reiki", "reiki", ReikiDocument),
    soulHealing: readSection("soul-healing", "soulHealing", SoulHealingDocument),
    contact: readSection("contact", "contact", ContactDocument),
  },
});










