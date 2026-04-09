import { NextResponse } from "next/server";
import { createMessageInvite } from "@/lib/data";
import { getSession } from "@/lib/session";

function getSafeReturnPath(value) {
  if (value === "/hub" || value === "/inbox") {
    return value;
  }

  return "/hub";
}

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.redirect(new URL("/signed-out", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const receiverId = Number(formData.get("receiverId"));
  const openerMessage = String(formData.get("openerMessage") || "").trim().slice(0, 240);
  const returnTo = getSafeReturnPath(String(formData.get("returnTo") || ""));

  if (!Number.isFinite(receiverId)) {
    return NextResponse.redirect(new URL(`${returnTo}?error=invalid_invite_target`, request.url), {
      status: 303
    });
  }

  try {
    await createMessageInvite(
      session.userId,
      receiverId,
      openerMessage || "Hey, want to talk Battlegrounds and maybe queue together?"
    );

    return NextResponse.redirect(new URL(`${returnTo}?invite=sent`, request.url), { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "invite_failed";
    const code =
      message === "Conversation already exists."
        ? "conversation_exists"
        : message === "A pending invite already exists."
          ? "invite_exists"
          : "invite_failed";

    return NextResponse.redirect(new URL(`${returnTo}?error=${code}`, request.url), { status: 303 });
  }
}
