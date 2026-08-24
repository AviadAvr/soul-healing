// /contact/ is part of the Home document (the Contact section lives at the
// bottom of Home), so this route intentionally renders the home page and shares
// its canonical (https://soul-pathways.com/). Serving a 200 here — instead of
// the 404 fallback — lets Open Graph previews render when the link is shared.
export { default, getStaticProps } from "./index";

