import { makeStaticProps } from "../lib/content";

export const getStaticProps = makeStaticProps("faq");

// Independently indexable /faq/ page. Re-uses the Home component (UI identical
// to the SPA) but injects page="faq" via getStaticProps for its own <title>,
// meta description, self-referencing canonical and unique <h1>.
export { default } from "./index";
