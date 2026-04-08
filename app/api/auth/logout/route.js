import { NextResponse } from "next/server";
import { setUserOnlineStatus } from "@/lib/data";
import { getSession } from "@/lib/session";
import { destroySession } from "@/lib/session";

export async function POST(request) {
  const session = await getSession();
  if (session?.userId) {
    await setUserOnlineStatus(session.userId, false);
  }

  await destroySession();
  return NextResponse.redirect(new URL("/", request.url));
}
