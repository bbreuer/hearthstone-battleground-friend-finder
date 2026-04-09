import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeCodeForToken, fetchBattleNetUser, getBattleNetConfig } from "@/lib/bnet";
import { upsertBattleNetUser } from "@/lib/data";
import { createSession } from "@/lib/session";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, request.url));
  }

  const jar = await cookies();
  const expectedState = jar.get("bg_tavern_oauth_state")?.value;
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/?error=oauth_state_mismatch", request.url));
  }

  try {
    const token = await exchangeCodeForToken(code);
    const battleNetUser = await fetchBattleNetUser(token.access_token);
    const config = getBattleNetConfig();
    const userId = await upsertBattleNetUser({
      externalId: String(battleNetUser.id || battleNetUser.sub),
      battletag: battleNetUser.battletag || "",
      region: config.region
    });

    await createSession(userId);
    jar.set("bg_tavern_oauth_state", "", { path: "/", maxAge: 0 });

    return NextResponse.redirect(new URL("/hub", request.url));
  } catch {
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url));
  }
}
