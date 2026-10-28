import type { Metadata } from "next";

import { UnavailableNotice } from "@/components/layout/unavailable-notice";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Billing" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Billing" />
      <UnavailableNotice feature="Billing" />
    </div>
  );
}
