import { SITE_HOST } from "./site";

/* --------------------------------------------------------------------------
 * Umami — cookieless visit analytics
 *
 * https://umami.is — open source (AGPL-3.0). The hosted free tier is enough for
 * this site, and because the tracker is the same script either way, moving to a
 * self-hosted instance later is a change of `NEXT_PUBLIC_UMAMI_SCRIPT_URL` and
 * nothing else.
 *
 * Why this and not a cookie-based tracker: Umami stores no cookies and no
 * cross-site identifiers, so zynax.io needs no consent banner under GDPR/ePrivacy.
 *
 * Configuration is entirely build-time, because `output: 'export'` means there is
 * no server to read anything at request time. Next inlines every `NEXT_PUBLIC_*`
 * variable into the bundle during `next build`:
 *
 *   NEXT_PUBLIC_UMAMI_WEBSITE_ID   required to enable tracking; the UUID Umami
 *                                  shows under Settings -> Websites. Not a
 *                                  secret — it is visible in the page source of
 *                                  every site that uses Umami.
 *   NEXT_PUBLIC_UMAMI_SCRIPT_URL   optional; defaults to Umami Cloud. Point it at
 *                                  `https://<your-instance>/script.js` to self-host.
 *   NEXT_PUBLIC_UMAMI_DOMAINS      optional; defaults to the production hostname.
 *                                  Set it to "" to disable the allow-list when
 *                                  testing the tracker from localhost.
 *
 * Leaving the ID unset (the default for `npm run dev` and for pull-request builds)
 * renders nothing at all, so local work never lands in production statistics.
 * ------------------------------------------------------------------------ */

const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

const SCRIPT_URL =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js";

/**
 * Umami's `data-domains` allow-list: the tracker sends nothing when
 * `location.hostname` is not in it. That is the safety net for the copies of
 * this static export that are not the real site — a local `npx serve web/out`,
 * the `zynax-io.github.io` fallback origin, a fork's Pages deployment — none of
 * which should pollute the numbers.
 *
 * `??` rather than `||` on purpose: an explicitly empty variable means "no
 * allow-list", while an absent one means "use the production default".
 */
const DOMAINS = process.env.NEXT_PUBLIC_UMAMI_DOMAINS ?? SITE_HOST;

/**
 * The tracker for the Next.js half of zynax.io. The Docusaurus half injects the
 * same script through `scripts` in `docs/docusaurus.config.ts`, against the same
 * website ID, so `/` and `/docs/` report into one property.
 *
 * Rendered as a plain `async` script rather than through `next/script`: React
 * hoists an async script into <head> during prerendering, so the tag is present
 * in the exported HTML and fires as soon as it downloads. `next/script`'s
 * default `afterInteractive` strategy would instead have the client runtime
 * insert it after hydration, losing every visitor who leaves before then — and
 * it would make this half behave differently from the docs half for no reason.
 *
 * `async` (never a blocking script) keeps analytics off the critical path of
 * first paint.
 */
export function Analytics() {
  if (!WEBSITE_ID) return null;

  return (
    <script
      async
      src={SCRIPT_URL}
      data-website-id={WEBSITE_ID}
      {...(DOMAINS ? { "data-domains": DOMAINS } : {})}
    />
  );
}
