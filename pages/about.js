// Real pre-rendered page for the /about clean URL so static hosts serve it with
// a 200 (not the 404 fallback). This matters for Open Graph: social scrapers
// don't run JS and ignore pages returning a 404 status. Renders the same SPA,
// which reads the path on boot and opens the matching tab.
export { default, getStaticProps } from "./index";

