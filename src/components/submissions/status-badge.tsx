import { Badge, type BadgeTone } from "@/components/ui/badge";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/submissions/queries";

const TONES: Record<LeadStatus, BadgeTone> = {
  new: "accent",
  read: "neutral",
  contacted: "warning",
  qualified: "accent",
  converted: "success",
  archived: "neutral",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge tone={TONES[status]}>{LEAD_STATUS_LABELS[status]}</Badge>;
}

export function FormStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={status === "active" ? "success" : "warning"}>
      {status === "active" ? "Active" : "Paused"}
    </Badge>
  );
}
