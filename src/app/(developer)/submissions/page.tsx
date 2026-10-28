import type { Metadata } from "next";

import { UnavailableNotice } from "@/components/layout/unavailable-notice";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Submissions" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Submissions" />
      <UnavailableNotice feature="Submission management" />
    </div>
  );
}
