import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { ThemeScript } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/config/site";
import { SITE_URL } from "@/lib/seo";

import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  // Canonical origin is fixed to the production domain so previews and localhost
  // never emit competing canonical URLs.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Formivo | Form Backend and Submission Management for Developers",
    template: "%s | Formivo",
  },
  description:
    "Connect your existing website forms to Formivo. Receive submissions through a simple endpoint, manage leads in your dashboard, and share selected forms with clients.",
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    title: "Formivo | Form Backend and Submission Management for Developers",
    description:
      "Connect your existing website forms to Formivo. Receive submissions through a simple endpoint, manage leads in your dashboard, and share selected forms with clients.",
    url: `${SITE_URL}/`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Formivo — the form backend for developers. Connect your website forms, manage submissions, share with clients.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Formivo | Form Backend for Developers",
    description:
      "Connect your website forms to one public endpoint. Receive submissions, manage leads and share selected forms with clients.",
    images: [
      {
        url: "/og-image.png",
        alt: "Formivo — the form backend for developers.",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9f8" },
    { media: "(prefers-color-scheme: dark)", color: "#071412" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
