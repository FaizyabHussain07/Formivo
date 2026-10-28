import type { Metadata } from "next";

import { UnavailableNotice } from "@/components/layout/unavailable-notice";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Page() {
  return (
    <Container className="flex flex-col gap-8 py-12">
      <PageHeader title="Privacy policy" />
      <UnavailableNotice
        feature="The privacy policy"
        description="This page is being written and will be published before launch."
      />
    </Container>
  );
}
