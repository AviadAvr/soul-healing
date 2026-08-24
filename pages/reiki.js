// Independently indexable /reiki/ page. Re-uses the Home component (so the UI is
// byte-for-byte the SPA) but injects page="reiki" via getStaticProps, which
// selects the Reiki <title>, meta description, self-referencing canonical and
// unique <h1>. Re-exporting the default (rather than wrapping it) keeps Home's
// server-only fs/getStaticProps out of the client bundle.
export { default } from "./index";
import { makeStaticProps } from "../lib/content";

export const getStaticProps = makeStaticProps("reiki");

