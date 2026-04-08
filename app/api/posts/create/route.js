import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { createPostForUser } from "@/lib/data";
import { getSession } from "@/lib/session";

const MAX_SERVER_UPLOAD_SIZE = 4_500_000;

function toNullableNumber(value) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const formData = await request.formData();
  const file = formData.get("screenshot");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(new URL("/profile?error=missing_file", request.url));
  }

  if (file.size > MAX_SERVER_UPLOAD_SIZE) {
    return NextResponse.redirect(new URL("/profile?error=file_too_large", request.url));
  }

  const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
  if (!allowedTypes.has(file.type)) {
    return NextResponse.redirect(new URL("/profile?error=invalid_file_type", request.url));
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "png";
  const safeExtension = ["png", "jpg", "jpeg", "webp"].includes(extension) ? extension : "png";
  const blob = await put(`boards/${session.userId}/${Date.now()}.${safeExtension}`, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type
  });

  await createPostForUser(session.userId, {
    caption: String(formData.get("caption") || "").trim().slice(0, 120),
    placement: toNullableNumber(formData.get("placement")),
    mmr: toNullableNumber(formData.get("mmr")),
    imagePath: blob.url
  });

  return NextResponse.redirect(new URL("/profile", request.url));
}
