import { NextResponse } from "next/server";
import { addMessageToConversation } from "@/lib/data";
import { getSession } from "@/lib/session";

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.redirect(new URL("/signed-out", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const conversationId = Number(formData.get("conversationId"));
  const body = String(formData.get("body") || "");

  if (!Number.isFinite(conversationId)) {
    return NextResponse.redirect(new URL("/inbox?error=invalid_conversation", request.url), {
      status: 303
    });
  }

  try {
    await addMessageToConversation(conversationId, session.userId, body);
    return NextResponse.redirect(new URL(`/messages/${conversationId}`, request.url), { status: 303 });
  } catch {
    return NextResponse.redirect(new URL(`/messages/${conversationId}?error=message_failed`, request.url), {
      status: 303
    });
  }
}
