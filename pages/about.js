// Independently indexable /about/ page. Re-uses the Home component (UI identical
// to the SPA) but injects page="about" via getStaticProps for its own <title>,
// meta description, self-referencing canonical and unique <h1>. Social scrapers
// get a 200 with About-specific metadata.
export { default } from "./index";
import { makeStaticProps } from "../lib/content";

export const getStaticProps = makeStaticProps("about");

