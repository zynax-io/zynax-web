# Zynax documentation site

The [Docusaurus](https://docusaurus.io/) site served at
**https://zynax.io/docs/**. The marketing landing page at `https://zynax.io/` is a
separate Next.js app in [`../web`](../web); CI builds both and merges this site's
`build/` output into the Pages artifact under `/docs`.

Content is sourced from the product repository,
[zynax-io/zynax](https://github.com/zynax-io/zynax) — keep commands and flags in
sync with it rather than inventing them.

## Local development

```bash
npm run start      # dev server with live reload
npm run build      # static build into ./build
npm run serve      # serve the production build locally
npm run typecheck  # tsc over the config and sidebars
```

Because `baseUrl` is `/docs/`, the dev server serves the site at
`http://localhost:3000/docs/`.

## Layout

```
docs/          the documentation pages (intro, getting-started, workflows, architecture, cli)
src/css/       global Infima overrides (Zynax palette)
static/img/    logo and favicon
sidebars.ts    explicit sidebar order
docusaurus.config.ts
```

`onBrokenLinks` is set to `throw`, so a broken internal link fails the build in
CI rather than shipping.
