import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "bg_tavern_session";
const ONE_WEEK = 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.SESSION_SECRET || "change-this-before-production";
}

function sign(input) {
  return crypto.createHmac("sha256", getSecret()).update(input).digest("base64url");
}

export function encodeSession(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSession(raw) {
  if (!raw || !raw.includes(".")) {
    return null;
  }

  const [body, signature] = raw.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = sign(body);
  if (signature.length !== expected.length) {
    return null;
  }

  const valid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload?.userId || !payload?.exp || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId) {
  const payload = {
    userId,
    exp: Date.now() + ONE_WEEK * 1000
  };

  const jar = await cookies();
  jar.set(COOKIE_NAME, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_WEEK
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getSession() {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  return decodeSession(raw);
}
