import type { Metadata } from "next";

import { socialImage } from "@/lib/seo";

/** Shared metadata for a documentation page: canonical, Open Graph and Twitter card. */
export function docMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const heading = `${title} | Formivo Docs`;
  return {
    title: { absolute: heading },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: heading,
      description,
      url: path,
      images: [socialImage({ title: heading, subtitle: description, kind: "docs" })],
    },
    twitter: {
      card: "summary_large_image",
      title: heading,
      description,
      images: [socialImage({ title: heading, subtitle: description, kind: "docs" })],
    },
  };
}
