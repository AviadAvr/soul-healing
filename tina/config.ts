import { defineConfig } from "tinacms";

// Your hosting provider may set the branch via an env var.
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // ───────────────────────────────────────────────────────────────────
  // Tina Cloud credentials.
  // Leave these undefined to run in LOCAL MODE (no account needed) for the
  // proof-of-concept. For production, create a project at app.tina.io and
  // put the values in .env (see .env.example).
  // ───────────────────────────────────────────────────────────────────
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin", // editor available at /admin
    publicFolder: "public",
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
        ],
      },
    ],
  },
});

