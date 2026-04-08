const region = process.env.BATTLE_NET_REGION || "us";
const oauthBase = "https://oauth.battle.net";

export function getBattleNetConfig() {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  return {
    clientId: process.env.BATTLE_NET_CLIENT_ID || "",
    clientSecret: process.env.BATTLE_NET_CLIENT_SECRET || "",
    appUrl,
    redirectUri: process.env.BATTLE_NET_REDIRECT_URI || `${appUrl}/api/auth/bnet/callback`,
    region
  };
}

export function getBattleNetAuthorizeUrl(state) {
  const { clientId, redirectUri } = getBattleNetConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    scope: "openid",
    response_type: "code",
    redirect_uri: redirectUri,
    state
  });

  return `${oauthBase}/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const { clientId, clientSecret, redirectUri } = getBattleNetConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri
  });

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${oauthBase}/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body,
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to exchange Battle.net authorization code.");
  }

  return response.json();
}

export async function fetchBattleNetUser(accessToken) {
  const response = await fetch(`${oauthBase}/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to load Battle.net profile.");
  }

  return response.json();
}
