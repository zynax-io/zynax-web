import type { NextConfig } from "next";

/**
 * Next.js configuration for the zynax.io marketing site.
 *
 * Deployment shape this file has to satisfy:
 *   - GitHub Pages, repo `zynax-io/zynax-web`.
 *   - Served from the APEX custom domain https://zynax.io (see `public/CNAME`).
 *   - CI runs `next build` here, merges the Docusaurus build into `out/docs/`,
 *     and uploads `out/` as the single Pages artifact.
 *
 * Every option below is required by that pipeline — none of them are stylistic.
 */
const nextConfig: NextConfig = {
  /**
   * GitHub Pages is a dumb static file host: no Node process, no Next.js
   * server, no on-demand rendering, no image optimizer. `output: 'export'`
   * makes `next build` prerender every route to plain HTML/CSS/JS under `out/`,
   * which is exactly what the Pages artifact upload expects. Without it the
   * build emits a server bundle (`.next/`) that Pages has no way to run.
   */
  output: "export",

  /**
   * Emit `out/<route>/index.html` and link to `/route/` instead of emitting
   * `out/<route>.html`. Pages resolves a directory request to that directory's
   * `index.html`, but it does NOT do extensionless `/route` -> `/route.html`
   * fallback, so directory-style output is the shape that reliably resolves.
   *
   * It also keeps this app in agreement with the Docusaurus site, which is
   * configured with `trailingSlash: true` at `baseUrl: '/docs/'` — both halves
   * of zynax.io then share one canonical URL form and neither redirects.
   */
  trailingSlash: true,

  /**
   * The default `next/image` loader rewrites `src` to `/_next/image?...`, which
   * is served by the Next.js image optimization server. That server does not
   * exist on Pages, so every optimized image would 404 at runtime.
   * `unoptimized: true` makes the loader emit the original asset path as-is.
   */
  images: { unoptimized: true },

  /**
   * `basePath` is deliberately NOT set (i.e. it stays '').
   *
   * A GitHub Pages *project* site with no custom domain is served from
   * https://zynax-io.github.io/zynax-web/ and would need `basePath: '/zynax-web'`
   * so assets and links resolve under that subpath. This site is served from
   * the apex custom domain https://zynax.io, where the site root is `/`.
   * Setting `basePath` here would prefix every asset URL, internal link and
   * router route with `/zynax-web`, producing a site of 404s.
   */
};

export default nextConfig;
