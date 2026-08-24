// Server-only content loader. Kept OUT of pages/ and never referenced by client
// component code, so Next strips it (and its Node `fs`/`path` imports) from every
// client bundle. Each page's getStaticProps imports from here.
//
// Build static props from the committed content files rather than querying Tina
// Cloud at build time. After a schema change Tina Cloud re-indexes the branch
// asynchronously *after* the push, so a cloud query during the deploy build can
// race ahead of indexing and fail ("Cannot query field …"). Reading the local
// JSON (which is exactly what Tina commits to git) makes the build deterministic.
// The generated query string + variables are still handed to useTina so inline
// editing in /admin keeps working — there it re-fetches live from Tina Cloud
// client-side, by which point indexing has caught up.
import fs from "fs";
import path from "path";
import {
  HeroDocument,
  AboutDocument,
  ServicesDocument,
  ReikiDocument,
  SoulHealingDocument,
  ContactDocument,
} from "../tina/__generated__/types";

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

export const readSections = () => ({
  hero: readSection("hero", "hero", HeroDocument),
  about: readSection("about", "about", AboutDocument),
  services: readSection("services", "services", ServicesDocument),
  reiki: readSection("reiki", "reiki", ReikiDocument),
  soulHealing: readSection("soul-healing", "soulHealing", SoulHealingDocument),
  contact: readSection("contact", "contact", ContactDocument),
});

// getStaticProps factory: every page reads the same committed content but tags
// itself with its `page` id, which selects the per-page SEO and initial tab.
export const makeStaticProps = (page = "home") => async () => ({
  props: { page, ...readSections() },
});

