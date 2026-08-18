# zynax-web

Website and documentation for [Zynax](https://github.com/zynax-io/zynax) — the
engine-portability layer for agentic automation.

Live at **[zynax.io](https://zynax.io)**, served entirely by GitHub Pages.

## Layout

This repository holds two independent apps behind one domain:

| Path    | App                       | Serves                  | Build output |
| ------- | ------------------------- | ----------------------- | ------------ |
| `web/`  | Next.js 16 (static export)| `https://zynax.io/`     | `web/out`    |
| `docs/` | Docusaurus 3              | `https://zynax.io/docs/`| `docs/build` |

Each is a separate npm project with its own `package-lock.json`. There is no
workspace root — install and build them independently.

## Requirements

**Node 22.** Next.js 16 requires `>=20.9.0` and Docusaurus 3.10 requires `>=20.0`.
CI pins Node 22; use [nvm](https://github.com/nvm-sh/nvm) locally if your system
Node is older.

## Local development

Landing page:

```bash
cd web
npm ci
npm run dev            # http://localhost:3000
npm run build          # -> web/out
```

Docs:

```bash
cd docs
npm ci
npm start              # http://localhost:3000/docs/
npm run build          # -> docs/build
```

To preview the merged site exactly as it deploys:

```bash
cd web && npm run build && cd ../docs && npm run build && cd ..
mkdir -p web/out/docs && cp -R docs/build/. web/out/docs/ && touch web/out/.nojekyll
npx serve web/out      # / and /docs/ both resolve
```

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main`: it builds both apps,
copies `docs/build/.` into `web/out/docs/`, creates `web/out/.nojekyll`, verifies
the merged tree, and uploads `web/out` as a single GitHub Pages artifact.
`.github/workflows/ci.yml` runs the same build (without deploying) on pull requests.

Three constraints are load-bearing and must not be changed casually:

- **`output: 'export'`** in `web/next.config.ts`. GitHub Pages has no Node runtime,
  so there are no API routes, no SSR, no ISR, and no middleware. Everything is
  prerendered at build time.
- **`.nojekyll` at the artifact root.** Without it Pages runs the upload through
  Jekyll, which strips underscore-prefixed paths — including Next.js's `_next/`
  bundle directory. The deploy would report success while the live site loads with
  no CSS and no JS.
- **Empty `basePath`.** The site is served from an apex custom domain, so the root
  is `/`. A `basePath` of `/zynax-web` would 404 every asset.

## Analytics

Visits are tracked with [Umami](https://umami.is) — open source (AGPL-3.0),
cookieless, and free on the hosted tier. It stores no cookies and no cross-site
identifiers, so **zynax.io needs no consent banner** under GDPR/ePrivacy.

Both halves of the domain report into **one** Umami website, so `/` and `/docs/`
show up as pages of the same property rather than two disconnected sites:

| Half     | Injected by                 |
| -------- | --------------------------- |
| `/`      | `web/app/analytics.tsx`     |
| `/docs/` | `scripts` in `docs/docusaurus.config.ts` |

### One-time setup

1. Create an account at [cloud.umami.is](https://cloud.umami.is) and add a
   website with domain `zynax.io`.
2. Copy its **Website ID** (a UUID, under Settings → Websites).
3. In this repo: **Settings → Secrets and variables → Actions → Variables →
   New repository variable**, named `UMAMI_WEBSITE_ID` with that UUID.

A *variable*, not a secret — the ID ships in the HTML of every page, so there is
nothing to hide, and secrets are masked in logs which would break the deploy's
verification step.

The next push to `main` deploys with tracking on. The deploy workflow fails if
`UMAMI_WEBSITE_ID` is set but no tracker reaches the artifact, so analytics
cannot break silently.

### Configuration

Both apps read the same three settings; the Next.js side needs the
`NEXT_PUBLIC_` prefix because that is what Next inlines into the client bundle.

| Next.js (`web/`)               | Docusaurus (`docs/`) | Effect                                                     |
| ------------------------------ | -------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | `UMAMI_WEBSITE_ID`   | Required. Unset ⇒ no tracker emitted at all.               |
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | `UMAMI_SCRIPT_URL`   | Defaults to Umami Cloud. Repoint to self-host.              |
| `NEXT_PUBLIC_UMAMI_DOMAINS`    | `UMAMI_DOMAINS`      | Hostname allow-list, defaults to `zynax.io`. `""` disables. |

Everything is resolved at **build time** — `output: 'export'` means there is no
server to read configuration at request time.

Because the ID is unset by default, `npm run dev`, local production builds and
pull-request builds emit no tracker and never touch production statistics. The
`data-domains` allow-list is the second line of defence: a stray copy of the
export served from anywhere other than `zynax.io` sends nothing.

To exercise the tracker locally, supply both:

```bash
cd web
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<uuid> NEXT_PUBLIC_UMAMI_DOMAINS= npm run dev
```

### Moving off the hosted tier

Umami is self-hostable and the tracker is the same script either way, so
switching is a change of `UMAMI_SCRIPT_URL` to `https://<your-instance>/script.js`
and nothing else. Swapping providers entirely touches only the two files in the
table above.

## Contributing

Work on a branch, then open a pull request against `main`.

```bash
git checkout -b feat/my-change
git push -u origin feat/my-change
```
