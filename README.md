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

## Contributing

Work on a branch, then open a pull request against `main`.

```bash
git checkout -b feat/my-change
git push -u origin feat/my-change
```
