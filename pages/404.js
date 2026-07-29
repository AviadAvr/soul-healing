// On static hosts (e.g. GitHub Pages) there are no real files at /about, /reiki,
// etc. — those requests fall through to 404.html. By rendering the same Home
// component here, a refresh or shared deep-link to any clean URL still boots the
// SPA, which then reads the path and opens the matching tab/section.
export { default, getStaticProps } from "./index";

