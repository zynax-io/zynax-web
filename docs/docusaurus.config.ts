import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const GITHUB_REPO = 'https://github.com/zynax-io/zynax';
const GITHUB_WEB_REPO = 'https://github.com/zynax-io/zynax-web';

/**
 * Link back to the marketing site at the apex root.
 *
 * zynax.io is served by two different apps behind one domain: the Next.js
 * landing page owns `/`, this Docusaurus site owns `/docs/`. A plain
 * `to: '/'` would be rewritten to the baseUrl (`/docs/`) and handled by React
 * Router, which never leaves the docs bundle. `pathname://` opts out of the
 * SPA router and `autoAddBaseUrl: false` keeps the baseUrl off the href, so the
 * browser performs a real navigation to `/`.
 */
const HOME_LINK = {
  href: 'pathname:///',
  autoAddBaseUrl: false,
  target: '_self',
} as const;

/* --------------------------------------------------------------------------
 * Umami — cookieless visit analytics
 *
 * The Next.js landing page injects the exact same tracker from
 * `web/app/analytics.tsx` against the same website ID, so `/` and `/docs/`
 * report into one Umami property instead of two half-pictures.
 *
 * Configuration is read from the environment at build time (this file runs in
 * Node during `docusaurus build`). Unlike the Next.js side there is no
 * `NEXT_PUBLIC_` prefix to honour, so the variables are unprefixed:
 *
 *   UMAMI_WEBSITE_ID   required to enable tracking; the UUID from Umami's
 *                      Settings -> Websites. Public, not a secret.
 *   UMAMI_SCRIPT_URL   optional; defaults to Umami Cloud. Repoint to self-host.
 *   UMAMI_DOMAINS      optional; defaults to the production hostname. Set it to
 *                      "" to drop the allow-list when testing from localhost.
 *
 * With the ID unset — `npm start`, `npm run build` on a laptop, pull-request
 * builds — no script tag is emitted and no data leaves the machine.
 * ------------------------------------------------------------------------ */
const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;
const UMAMI_SCRIPT_URL =
  process.env.UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js';
// `??` not `||`: an explicitly empty value means "no allow-list", an absent one
// means "use the production default".
const UMAMI_DOMAINS = process.env.UMAMI_DOMAINS ?? 'zynax.io';

const config: Config = {
  title: 'Zynax',
  tagline:
    'Write your agent workflow once — run it on Temporal or Argo without a rewrite.',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Production URL: the apex custom domain served by GitHub Pages.
  url: 'https://zynax.io',
  // The docs bundle is merged into the Pages artifact under /docs.
  baseUrl: '/docs/',
  trailingSlash: true,

  // GitHub Pages deployment config (repo that publishes the Pages artifact).
  organizationName: 'zynax-io',
  projectName: 'zynax-web',

  // Fail the build on any broken link so CI catches it before deploy.
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
      onBrokenMarkdownImages: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  /**
   * Injected into the <head> of every docs page. `defer` keeps the tracker off
   * the critical rendering path; Umami hooks the History API itself, so
   * client-side navigation inside the Docusaurus SPA is counted without any
   * extra wiring.
   */
  scripts: UMAMI_WEBSITE_ID
    ? [
        {
          src: UMAMI_SCRIPT_URL,
          defer: true,
          'data-website-id': UMAMI_WEBSITE_ID,
          ...(UMAMI_DOMAINS ? {'data-domains': UMAMI_DOMAINS} : {}),
        },
      ]
    : [],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // The whole site is already mounted at /docs/ via baseUrl, so the
          // docs plugin serves from the root of that mount: /docs/getting-started/.
          routeBasePath: '/',
          editUrl: `${GITHUB_WEB_REPO}/tree/main/docs/`,
        },
        // No blog for launch.
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    metadata: [
      {
        name: 'description',
        content:
          'Zynax is the engine-portability layer for agentic automation: declare an AI agent workflow once in YAML and run it on Temporal or Argo without a rewrite.',
      },
    ],
    navbar: {
      title: 'Zynax',
      logo: {
        alt: 'Zynax',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          ...HOME_LINK,
          label: 'zynax.io',
          position: 'left',
        },
        {
          href: GITHUB_REPO,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Introduction', to: '/'},
            {label: 'Getting started', to: '/getting-started'},
            {label: 'Workflow manifests', to: '/workflows'},
            {label: 'Architecture', to: '/architecture'},
            {label: 'CLI reference', to: '/cli'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'Source on GitHub', href: GITHUB_REPO},
            {label: 'Releases', href: `${GITHUB_REPO}/releases`},
            {label: 'Issues', href: `${GITHUB_REPO}/issues`},
            {label: 'Roadmap', href: `${GITHUB_REPO}/blob/main/ROADMAP.md`},
          ],
        },
        {
          title: 'More',
          items: [
            {...HOME_LINK, label: 'zynax.io'},
            {label: 'Contributing', href: `${GITHUB_REPO}/blob/main/CONTRIBUTING.md`},
            {label: 'Security', href: `${GITHUB_REPO}/blob/main/SECURITY.md`},
            {label: 'License (Apache-2.0)', href: `${GITHUB_REPO}/blob/main/LICENSE`},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} The Zynax Authors. Apache-2.0. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['protobuf'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
