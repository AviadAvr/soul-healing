/** @type {import('next').NextConfig} */

// The site is served from the root of a custom domain (soul-pathways.com), both
// in production (GitHub Pages + CNAME) and in local dev. There is therefore no
// base path anywhere, so every asset/link resolves from "/".
//
// (Historically this was a GitHub Pages *project* site served under
// "/soul-healing", which required a production-only basePath. With the custom
// domain the site lives at the root, so the base path is now empty everywhere.)
const basePath = "";

const nextConfig = {
  // Emit a fully static site into ./out so it can be hosted on GitHub Pages.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  // Exposed to the browser so we can prefix plain <img>/<script>/<link> URLs,
  // which (unlike next/link & next/image) are NOT auto-prefixed with basePath.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;

