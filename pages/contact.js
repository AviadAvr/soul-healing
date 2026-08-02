// Real pre-rendered page for the /contact clean URL (a section at the bottom of
// Home). Serving a 200 here — instead of the 404 fallback — lets Open Graph
// previews render when the link is shared. See about.js.
export { default, getStaticProps } from "./index";

