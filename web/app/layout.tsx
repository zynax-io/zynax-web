import type { Metadata, Viewport } from "next";

import { Analytics } from "./analytics";
import { SITE_URL } from "./site";
import "./globals.css";

const TITLE = "Zynax — the engine-portability layer for agentic automation";

const DESCRIPTION =
  "Write your agent workflow once as a YAML manifest and run it on Temporal or Argo without a rewrite. " +
  "Zynax is a declarative, cloud-native, engine-agnostic control plane for AI agent workflows. " +
  "Go and Kubernetes, built on CNCF-graduated technologies, Apache-2.0.";

export const metadata: Metadata = {
  // Resolves every relative URL used below (canonical, OpenGraph) against the
  // apex custom domain the site is actually served from.
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Zynax",
  },
  description: DESCRIPTION,
  applicationName: "Zynax",
  generator: "Next.js",
  keywords: [
    "Zynax",
    "engine portability",
    "agentic automation",
    "AI agent workflows",
    "agent orchestration",
    "Temporal",
    "Argo Workflows",
    "control plane",
    "declarative workflows",
    "Kubernetes",
    "gRPC",
    "CNCF",
  ],
  authors: [{ name: "Zynax", url: "https://github.com/zynax-io/zynax" }],
  creator: "Zynax",
  publisher: "Zynax",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Zynax",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
