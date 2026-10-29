import type { Metadata } from "next";
import Link from "next/link";

import { revokeClientAccessAction, revokeInvitationAction } from "@/app/(developer)/clients/actions";
import { InviteClientForm } from "@/components/clients/invite-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { requireDeveloper } from "@/lib/auth/viewer";
import { formatDate } from "@/lib/format";
import { listForms } from "@/lib/forms/service";
import { listWorkspaceClientAccess, listWorkspaceInvitations } from "@/lib/invitations/service";

export const metadata: Metadata = { title: "Client access" };

const INVITATION_TONES: Record<string, "neutral" | "success" | "warning" | "error"> = {
  pending: "warning",
  accepted: "success",
  revoked: "neutral",
  expired: "error",
};

export default async function Page() {
  const developer = await requireDeveloper();
  const [forms, invitations, access] = await Promise.all([
    listForms(developer.workspace.id),
    listWorkspaceInvitations(developer.workspace.id),
    listWorkspaceClientAccess(developer.workspace.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Client access"
        description={`${developer.entitlements.viewerCount} of ${developer.plan.viewers} client viewers on the ${developer.plan.name} plan.`}
      />

      <section aria-labelledby="invite-heading" className="flex flex-col gap-4">
        <h2 id="invite-heading" className="text-base font-semibold text-foreground">
          Invite a client
        </h2>
        <div className="rounded-lg border border-border bg-surface p-5">
          <InviteClientForm forms={forms.map((form) => ({ id: form.id, name: form.name }))} />
        </div>
      </section>

      <section aria-labelledby="access-heading" className="flex flex-col gap-3">
        <h2 id="access-heading" className="text-base font-semibold text-foreground">
          Active client access
        </h2>
        {access.length === 0 ? (
          <p className="text-sm text-foreground-secondary">No client has access yet.</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Client</TableHeaderCell>
                <TableHeaderCell>Form</TableHeaderCell>
                <TableHeaderCell>Granted</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {access.map((grant) => (
                <TableRow key={grant.permissionId}>
                  <TableCell>
                    <span className="text-sm text-foreground">
                      {grant.clientEmail ?? `${grant.clientUserId.slice(0, 8)}…`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/forms/${grant.formId}/clients`} className="text-accent hover:underline">
                      {grant.formName}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(grant.grantedAt)}</TableCell>
                  <TableCell className="text-right">
                    <form action={revokeClientAccessAction}>
                      <input type="hidden" name="permissionId" value={grant.permissionId} />
                      <Button type="submit" variant="secondary" size="sm">
                        Revoke access
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section aria-labelledby="invitations-heading" className="flex flex-col gap-3">
        <h2 id="invitations-heading" className="text-base font-semibold text-foreground">
          Invitations
        </h2>
        {invitations.length === 0 ? (
          <p className="text-sm text-foreground-secondary">No invitations have been sent yet.</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Form</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Expires</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium text-foreground">{invitation.email}</TableCell>
                  <TableCell>{invitation.formName}</TableCell>
                  <TableCell>
                    <Badge tone={INVITATION_TONES[invitation.status] ?? "neutral"}>
                      {invitation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                  <TableCell className="text-right">
                    {invitation.status === "pending" ? (
                      <form action={revokeInvitationAction}>
                        <input type="hidden" name="invitationId" value={invitation.id} />
                        <Button type="submit" variant="secondary" size="sm">
                          Revoke
                        </Button>
                      </form>
                    ) : (
                      <span className="text-xs text-foreground-muted">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
