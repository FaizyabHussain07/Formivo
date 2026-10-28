import type { Metadata } from "next";

import { UnavailableNotice } from "@/components/layout/unavailable-notice";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Shared forms" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Shared forms"
        description="Forms a developer has shared with you appear here."
      />
      <UnavailableNotice feature="Client access" />
    </div>
  );
}
