"use server";

import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/viewer";
import { errorMessage } from "@/lib/errors";
import { acceptInvitation } from "@/lib/invitations/service";

export type AcceptState = { error?: string };

export async function acceptInvitationAction(
  _prev: AcceptState,
  formData: FormData,
): Promise<AcceptState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { error: "This invitation link is invalid." };

  const user = await getSessionUser();
  if (!user?.email) {
    redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  try {
    await acceptInvitation({ token, userId: user.id, userEmail: user.email });
  } catch (error) {
    return { error: errorMessage(error) };
  }

  redirect("/client");
}
