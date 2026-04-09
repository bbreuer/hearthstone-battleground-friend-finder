import { NextResponse } from "next/server";
import { respondToMessageInvite } from "@/lib/data";
import { getSession } from "@/lib/session";

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.redirect(new URL("/signed-out", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const inviteId = Number(formData.get("inviteId"));
  const response = String(formData.get("response") || "");

  if (!Number.isFinite(inviteId)) {
    return NextResponse.redirect(new URL("/inbox?error=invalid_invite", request.url), { status: 303 });
  }

  try {
    const conversationId = await respondToMessageInvite(session.userId, inviteId, response);
    if (conversationId) {
      return NextResponse.redirect(new URL(`/messages/${conversationId}`, request.url), { status: 303 });
    }

    return NextResponse.redirect(new URL("/inbox?invite=declined", request.url), { status: 303 });
  } catch {
    return NextResponse.redirect(new URL("/inbox?error=invite_response_failed", request.url), {
      status: 303
    });
  }
}
