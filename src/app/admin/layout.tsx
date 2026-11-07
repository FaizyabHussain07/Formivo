import type { Metadata } from "next";

/** The whole admin area is operational, so no page in it is indexable. */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
