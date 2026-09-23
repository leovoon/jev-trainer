import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * OpenRouter PKCE (agent pattern: no client secret, S256 challenge).
 * Start: set short-lived httpOnly cookies, redirect to OpenRouter.
 */
export const dynamic = "force-dynamic";

const AUTH_URL = "https://openrouter.ai/auth";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const callback = `${origin}/api/auth/openrouter/callback`;
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(16).toString("base64url");

  const url = new URL(AUTH_URL);
  url.searchParams.set("callback_url", callback);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(url.toString());
  const cookie = (name: string, value: string) =>
    `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; MaxAge=600`;
  res.headers.append("Set-Cookie", cookie("jev_pkce_verifier", verifier));
  res.headers.append("Set-Cookie", cookie("jev_pkce_state", state));
  return res;
}
