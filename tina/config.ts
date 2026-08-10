import { defineConfig } from "tinacms";

// Your hosting provider may set the branch via an env var.
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

// Each section of the single-page site is its own Tina document/collection, so
// every part (Home hero, About, Services, Reiki, Soul Healing, Contact, Booking)
// can be edited independently in the CMS. `router` opens the matching tab in the
// live site so contextual (inline) editing lands on the right panel.
const sectionUi = (tab: string) => ({
  router: () => (tab ? `/${tab}/` : "/"),
  allowedActions: { create: false, delete: false },
});

export default defineConfig({
  branch,

  // Tina Cloud project id. Safe to hardcode/commit: it's a public identifier that
  // Next inlines into the client bundle and bakes into public/admin/ anyway, and
  // it grants no access on its own (editors authorise via GitHub through Tina
  // Cloud). No read-only content token is needed either — build-time content is
  // read from the local content/ JSON files (see getStaticProps in pages/index.js).
  // An env var still wins if set, e.g. to point a fork at its own project.
  clientId:
    process.env.NEXT_PUBLIC_TINA_CLIENT_ID ||
    "f4f06805-ae00-4277-b9ed-2431424e82a5",

  build: {
    outputFolder: "admin", // editor available at /admin
    publicFolder: "public",
    // The site is served from the root of the custom domain, so the admin SPA
    // loads its assets from "/". The production build script leaves
    // TINA_PUBLIC_BASE_PATH empty; local `tinacms dev` leaves it empty too.
    basePath: (process.env.TINA_PUBLIC_BASE_PATH || "").replace(/^\/+/, ""),
  },
  media: {
    tina: {
      mediaRoot: "static/images",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      // ───────────── HOME · HERO ─────────────
      {
        name: "hero",
        label: "Home · Hero",
        path: "content/hero",
        format: "json",
        ui: sectionUi(""),
        fields: [
          { type: "string", name: "eyebrow", label: "Eyebrow" },
          { type: "string", name: "titleLine1", label: "Title — line 1" },
          { type: "string", name: "titleLine2", label: "Title — line 2" },
          {
            type: "string",
            name: "subtitle",
            label: "Subtitle",
            ui: { component: "textarea" },
          },
          { type: "string", name: "primaryCta", label: "Primary button" },
          { type: "string", name: "secondaryCta", label: "Secondary button" },
        ],
      },
      // ───────────── ABOUT ─────────────
      {
        name: "about",
        label: "About",
        path: "content/about",
        format: "json",
        ui: sectionUi("about"),
        fields: [
          { type: "string", name: "eyebrow", label: "Eyebrow" },
          { type: "string", name: "title", label: "Heading" },
          {
            type: "string",
            name: "paragraphs",
            label: "Paragraphs",
            list: true,
            ui: { component: "textarea" },
          },
          {
            type: "string",
            name: "highlights",
            label: "Highlights",
            list: true,
          },
          { type: "string", name: "cta", label: "Button label" },
        ],
      },
      // ───────────── SERVICES ─────────────
      {
        name: "services",
        label: "Services",
        path: "content/services",
        format: "json",
        ui: sectionUi(""),
        fields: [
          { type: "string", name: "eyebrow", label: "Eyebrow" },
          { type: "string", name: "title", label: "Heading" },
          {
            type: "string",
            name: "lead",
            label: "Intro",
            ui: { component: "textarea" },
          },
          {
            type: "object",
            name: "cards",
            label: "Service cards",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title }) },
            fields: [
              { type: "string", name: "icon", label: "Icon (symbol)" },
              { type: "string", name: "title", label: "Title" },
              {
                type: "string",
                name: "text",
                label: "Description",
                ui: { component: "textarea" },
              },
            ],
          },
        ],
      },
      // ───────────── REIKI ─────────────
      {
        name: "reiki",
        label: "Reiki",
        path: "content/reiki",
        format: "json",
        ui: sectionUi("reiki"),
        fields: [
          { type: "string", name: "eyebrow", label: "Eyebrow" },
          { type: "string", name: "title", label: "Heading" },
          {
            type: "string",
            name: "lead",
            label: "Intro",
            ui: { component: "textarea" },
          },
          {
            type: "object",
            name: "sections",
            label: "Content sections",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.heading }) },
            fields: [
              { type: "string", name: "heading", label: "Heading" },
              {
                type: "string",
                name: "gloss",
                label: "Gloss (italic sub-line, optional)",
                description:
                  "Wrap words in *asterisks* for italics, **double** for bold.",
              },
              {
                type: "string",
                name: "body",
                label: "Body",
                ui: { component: "textarea" },
                description:
                  "Supports *italic*, **bold** and [links](https://…) or [contact me](contact).",
              },
            ],
          },
          { type: "string", name: "cta", label: "Button label" },
        ],
      },
      // ───────────── SOUL HEALING ─────────────
      {
        name: "soulHealing",
        label: "Soul Healing",
        path: "content/soul-healing",
        format: "json",
        ui: sectionUi("soul-healing"),
        fields: [
          { type: "string", name: "eyebrow", label: "Eyebrow (optional)" },
          { type: "string", name: "title", label: "Heading" },
          {
            type: "string",
            name: "intro",
            label: "Intro notes (shown in italic, above the sections)",
            list: true,
            ui: { component: "textarea" },
            description:
              "Supports *italic*, **bold** and [links](https://…) or [contact me](contact).",
          },
          {
            type: "string",
            name: "lead",
            label: "Lead paragraph (optional)",
            ui: { component: "textarea" },
          },
          {
            type: "object",
            name: "sections",
            label: "Content sections",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.heading }) },
            fields: [
              { type: "string", name: "heading", label: "Heading" },
              {
                type: "string",
                name: "gloss",
                label: "Gloss (italic sub-line, optional)",
                description:
                  "Wrap words in *asterisks* for italics, **double** for bold.",
              },
              {
                type: "string",
                name: "body",
                label: "Body",
                ui: { component: "textarea" },
                description:
                  "Supports *italic*, **bold** and [links](https://…) or [contact me](contact).",
              },
            ],
          },
          { type: "string", name: "cta", label: "Button label" },
        ],
      },
      // ───────────── CONTACT ─────────────
      {
        name: "contact",
        label: "Contact",
        path: "content/contact",
        format: "json",
        ui: sectionUi(""),
        fields: [
          { type: "string", name: "eyebrow", label: "Eyebrow" },
          { type: "string", name: "title", label: "Heading" },
          {
            type: "string",
            name: "lead",
            label: "Intro",
            ui: { component: "textarea" },
          },
          { type: "string", name: "detailsTitle", label: "“Reach me” heading" },
          { type: "string", name: "email", label: "Email" },
          { type: "string", name: "phone", label: "Phone" },
          { type: "string", name: "pricingTitle", label: "Pricing heading" },
          { type: "string", name: "pricingSingle", label: "Single treatment price" },
          { type: "string", name: "pricingReduced", label: "Reduced rate" },
          {
            type: "string",
            name: "pricingReducedNote",
            label: "Reduced rate note",
            ui: { component: "textarea" },
          },
          { type: "string", name: "bookingTitle", label: "Booking heading" },
          { type: "string", name: "integrationRoomUrl", label: "The Integration Room URL" },
          {
            type: "string",
            name: "bookingLeiden",
            label: "Booking · Leiden note",
            ui: { component: "textarea" },
            description:
              "Use [WhatsApp](whatsapp), [Email](email) and [contact me](contact) for the special links. Also supports *italic* / **bold**.",
          },
          {
            type: "string",
            name: "bookingAmsterdam",
            label: "Booking · Amsterdam note",
            ui: { component: "textarea" },
            description:
              "Use [The Integration Room](integration-room) to link to the URL above. Also supports *italic* / **bold** and [external links](https://…).",
          },
          {
            type: "string",
            name: "bookingHomeNote",
            label: "Home-visit note",
            ui: { component: "textarea" },
          },
        ],
      },
      // ───────────── BOOKING ─────────────
      {
        name: "booking",
        label: "Booking",
        path: "content/booking",
        format: "json",
        ui: sectionUi(""),
        fields: [
          { type: "string", name: "eyebrow", label: "Eyebrow" },
          { type: "string", name: "title", label: "Heading" },
          {
            type: "string",
            name: "lead",
            label: "Intro",
            ui: { component: "textarea" },
          },
          { type: "string", name: "calendlyUrl", label: "Calendly URL" },
        ],
      },
    ],
  },
});

