import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { deletePostForUser } from "@/lib/data";
import { getSession } from "@/lib/session";

function getSafeReturnPath(value) {
  if (value === "/account" || value === "/profile") {
    return value;
  }

  return "/profile";
}

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.redirect(new URL("/signed-out", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const postId = Number(formData.get("postId"));
  const returnTo = getSafeReturnPath(String(formData.get("returnTo") || ""));

  if (!Number.isFinite(postId)) {
    return NextResponse.redirect(new URL(`${returnTo}?error=invalid_post`, request.url), {
      status: 303
    });
  }

  const imagePath = await deletePostForUser(session.userId, postId);
  if (imagePath) {
    try {
      await del(imagePath);
    } catch {
      // If blob cleanup fails, the DB row is still gone and the UI should recover.
    }
  }

  return NextResponse.redirect(new URL(returnTo, request.url), { status: 303 });
}
