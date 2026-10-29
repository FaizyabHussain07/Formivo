import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { revokeClientAccessAction, revokeInvitationAction } from "@/app/(developer)/clients/actions";
import { InviteClientForm } from "@/components/clients/invite-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { AppError } from "@/lib/errors";
import { getOwnedForm } from "@/lib/forms/service";
import { listWorkspaceClientAccess, listWorkspaceInvitations } from "@/lib/invitations/service";

export const metadata: Metadata = { title: "Form clients" };

export default async function Page({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const developer = await requireDeveloper();

  let form;
  try {
    form = await getOwnedForm(formId, developer.workspace.id);
  } catch (error) {
    if (error instanceof AppError && error.code === "FORM_NOT_FOUND") notFound();
    throw error;
  }

  const [invitations, access] = await Promise.all([
    listWorkspaceInvitations(developer.workspace.id),
    listWorkspaceClientAccess(developer.workspace.id),
  ]);
  const formInvitations = invitations.filter((invitation) => invitation.formId === formId);
  const formAccess = access.filter((grant) => grant.formId === formId);

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="invite-heading" className="flex flex-col gap-4">
        <h2 id="invite-heading" className="text-base font-semibold text-foreground">
          Share “{form.name}” with a client
        </h2>
        <div className="rounded-lg border border-border bg-surface p-5">
          <InviteClientForm
            forms={[{ id: form.id, name: form.name }]}
            fixedFormId={form.id}
          />
        </div>
      </section>

      <section aria-labelledby="access-heading" className="flex flex-col gap-3">
        <h2 id="access-heading" className="text-base font-semibold text-foreground">
          Client with access
        </h2>
        {formAccess.length === 0 ? (
          <p className="text-sm text-foreground-secondary">
            No client has access to this form. A form can be shared with one client at a time.
          </p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Client</TableHeaderCell>
                <TableHeaderCell>Granted</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formAccess.map((grant) => (
                <TableRow key={grant.permissionId}>
                  <TableCell className="text-sm text-foreground">
                    {grant.clientEmail ?? `${grant.clientUserId.slice(0, 8)}…`}
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
        {formInvitations.length === 0 ? (
          <p className="text-sm text-foreground-secondary">No invitations for this form yet.</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Expires</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formInvitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium text-foreground">{invitation.email}</TableCell>
                  <TableCell>
                    <Badge
                      tone={
                        invitation.status === "accepted"
                          ? "success"
                          : invitation.status === "pending"
                            ? "warning"
                            : invitation.status === "expired"
                              ? "error"
                              : "neutral"
                      }
                    >
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
