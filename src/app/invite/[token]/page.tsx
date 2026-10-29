import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { signOutAction } from "@/app/(auth)/actions";
import { AcceptInvitation } from "@/components/clients/accept-invitation";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { getSessionUser } from "@/lib/auth/viewer";
import { formatDate } from "@/lib/format";
import { findInvitationByToken } from "@/lib/invitations/service";

export const metadata: Metadata = { title: "Invitation", robots: { index: false } };
export const instant = false;

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [invitation, user] = await Promise.all([findInvitationByToken(token), getSessionUser()]);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Container className="max-w-lg px-0">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="text-xl">Client invitation</span>
            </CardTitle>
            <CardDescription>
              Read-only access to a form&apos;s submissions and analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {!invitation ? (
              <Alert tone="error" title="This invitation link is not valid">
                The link may be incomplete or already replaced. Ask the developer to send a new
                invitation.
              </Alert>
            ) : invitation.status === "revoked" ? (
              <Alert tone="error" title="This invitation was revoked">
                Access was withdrawn before it was accepted. Ask the developer to send a new one.
              </Alert>
            ) : invitation.status === "accepted" ? (
              <>
                <Alert tone="info" title="This invitation has already been accepted" />
                <ButtonLink href="/client">Open your shared forms</ButtonLink>
              </>
            ) : invitation.isExpired ? (
              <Alert tone="warning" title="This invitation has expired">
                Invitations are valid for 7 days. Ask the developer to invite you again.
              </Alert>
            ) : (
              <>
                <dl className="flex flex-col gap-3 rounded-lg border border-border bg-surface-muted p-4 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-xs text-foreground-muted">Workspace</dt>
                    <dd className="font-medium text-foreground">{invitation.workspaceName}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-xs text-foreground-muted">Form</dt>
                    <dd className="font-medium text-foreground">{invitation.formName}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-xs text-foreground-muted">Invited email</dt>
                    <dd className="text-foreground-secondary">{invitation.email}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-xs text-foreground-muted">Expires</dt>
                    <dd className="text-foreground-secondary">
                      {formatDate(invitation.expiresAt)}
                    </dd>
                  </div>
                </dl>

                {!user ? (
                  <div className="flex flex-col gap-3">
                    <Alert tone="info" title="Sign in to accept">
                      Use the email address this invitation was sent to ({invitation.email}).
                    </Alert>
                    <div className="flex flex-wrap gap-2">
                      <ButtonLink href={`/login?next=/invite/${token}`}>Sign in</ButtonLink>
                      <ButtonLink href={`/signup?next=/invite/${token}`} variant="secondary">
                        Create an account
                      </ButtonLink>
                    </div>
                  </div>
                ) : user.email?.toLowerCase() !== invitation.email.toLowerCase() ? (
                  <div className="flex flex-col gap-3">
                    <Alert tone="warning" title="Wrong account">
                      You are signed in as {user.email}, but this invitation was sent to{" "}
                      {invitation.email}. Sign out and use the invited address.
                    </Alert>
                    <form action={signOutAction}>
                      <Button type="submit" variant="secondary">
                        Sign out
                      </Button>
                    </form>
                  </div>
                ) : (
                  <AcceptInvitation token={token} />
                )}
              </>
            )}

            <p className="flex items-center gap-2 text-xs text-foreground-muted">
              <Mail className="size-3.5" aria-hidden="true" />
              Questions? Reply to the invitation email or{" "}
              <Link href="/contact" className="underline">
                contact the team
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
