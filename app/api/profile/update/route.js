import { NextResponse } from "next/server";
import { updateCurrentUserProfile } from "@/lib/data";
import { getSession } from "@/lib/session";

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
    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const displayName = String(formData.get("displayName") || "").trim().slice(0, 40);
  const bgRank = toNullableNumber(formData.get("bgRank"));
  const favoriteHero = String(formData.get("favoriteHero") || "").trim().slice(0, 60);
  const lookingForGroup = String(formData.get("lookingForGroup") || "").trim().slice(0, 120);
  const bio = String(formData.get("bio") || "").trim().slice(0, 280);

  await updateCurrentUserProfile(session.userId, {
    displayName,
    bgRank,
    favoriteHero,
    lookingForGroup,
    bio
  });

  return NextResponse.redirect(new URL("/profile", request.url), { status: 303 });
}
