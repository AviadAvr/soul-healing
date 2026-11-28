// Reiki and Soul Healing collections, as they were in tina/config.ts (schema.collections).

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
