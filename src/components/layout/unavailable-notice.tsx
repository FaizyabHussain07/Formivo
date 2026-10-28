import { Construction } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

type UnavailableNoticeProps = {
  feature: string;
  description?: string;
};

/** Honest placeholder for routes whose functionality has not been built yet. */
export function UnavailableNotice({ feature, description }: UnavailableNoticeProps) {
  return (
    <EmptyState
      icon={Construction}
      title={`${feature} is not available yet`}
      description={
        description ??
        "This part of Formivo is still being built. Nothing on this page is functional yet, and no account data is shown."
      }
    />
  );
}
