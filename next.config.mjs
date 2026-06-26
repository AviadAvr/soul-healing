/** @type {import('next').NextConfig} */

// In production (GitHub Pages project site) the app is served from /soul-healing.
// In local dev there is no base path, so assets resolve from the root.
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/soul-healing" : "";

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

