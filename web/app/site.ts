/**
 * Single source of truth for where this site lives.
 *
 * Used by `layout.tsx` (metadataBase, canonical/OpenGraph URLs) and by
 * `analytics.tsx` (the hostname allow-list handed to the Umami tracker).
 * Keep it in agreement with `public/CNAME` and with `docs/docusaurus.config.ts`,
 * which declares the same origin for the Docusaurus half of the domain.
 */
export const SITE_URL = "https://zynax.io";

/** Bare hostname of {@link SITE_URL}, e.g. "zynax.io". */
export const SITE_HOST = new URL(SITE_URL).hostname;
