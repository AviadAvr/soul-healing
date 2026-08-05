import { defineConfig } from "tinacms";

// Your hosting provider may set the branch via an env var.
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Tina Cloud credentials (from .env). Leave undefined to run in local mode.
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

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
      {
        name: "page",
        label: "Pages",
        path: "content/pages",
        format: "json",
        // Lets Tina open the live page for contextual (inline) editing.
        ui: {
          router: () => "/",
          allowedActions: { create: false, delete: false },
        },
        fields: [
          // ───────────── HERO ─────────────
          {
            type: "object",
            name: "hero",
            label: "Hero",
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
            type: "object",
            name: "about",
            label: "About",
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
            type: "object",
            name: "services",
            label: "Services",
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
          // ───────────── CONTACT ─────────────
          {
            type: "object",
            name: "contact",
            label: "Contact",
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
                name: "bookingHomeNote",
                label: "Home-visit note",
                ui: { component: "textarea" },
              },
            ],
          },
          // ───────────── BOOKING ─────────────
          {
            type: "object",
            name: "booking",
            label: "Booking",
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
    ],
  },
});

