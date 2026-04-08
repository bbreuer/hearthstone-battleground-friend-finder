import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBattleNetAuthorizeUrl } from "@/lib/bnet";

export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("bg_tavern_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600
  });

  return NextResponse.redirect(getBattleNetAuthorizeUrl(state));
}
