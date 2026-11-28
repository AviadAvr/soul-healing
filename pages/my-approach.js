import { makeStaticProps } from "../lib/content";

export const getStaticProps = makeStaticProps("my-approach");

// Independently indexable /my-approach/ page. Re-uses the Home component (so the
// UI is byte-for-byte the SPA) but injects page="my-approach" via getStaticProps,
// which selects the My Approach <title>, meta description, self-referencing
// canonical and unique <h1>. Re-exporting the default (rather than wrapping it)
// keeps Home's server-only fs/getStaticProps out of the client bundle.
export { default } from "./index";
