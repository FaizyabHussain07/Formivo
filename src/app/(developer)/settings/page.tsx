import type { Metadata } from "next";

import { UnavailableNotice } from "@/components/layout/unavailable-notice";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings" />
      <UnavailableNotice feature="Account settings" />
    </div>
  );
}
