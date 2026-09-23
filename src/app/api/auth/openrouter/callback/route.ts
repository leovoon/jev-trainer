import { NextResponse } from "next/server";
import { PRESETS } from "@/lib/provider";

/**
 * OpenRouter callback: exchange one-time code → long-lived sk-or key,
 * stash in httpOnly cookie (saved auth — never round-trips to JS except status).
 */
export const dynamic = "force-dynamic";

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const cookies = req.headers.get("cookie");
  const verifier = readCookie(cookies, "jev_pkce_verifier");
  const expectedState = readCookie(cookies, "jev_pkce_state");
  const origin = url.origin;

  const fail = (msg: string) =>
    NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(msg)}`,
      { status: 302 },
    );

  if (!code || !verifier) return fail("missing_code");
  // OpenRouter may omit state on some flows — only enforce when we sent one.
  if (expectedState && returnedState && expectedState !== returnedState) {
    return fail("state_mismatch");
  }

  let key: string;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        code_verifier: verifier,
        code_challenge_method: "S256",
      }),
    });
    const data = (await res.json()) as { key?: string; error?: string };
    if (!res.ok || !data.key) {
      return fail(data.error ?? `exchange_${res.status}`);
    }
    key = data.key;
  } catch {
    return fail("exchange_failed");
  }

  const payload = Buffer.from(
    JSON.stringify({
      provider: "openrouter",
      key,
      model: PRESETS.openrouter.defaultModel,
    }),
    "utf8",
  ).toString("base64url");

  const res = NextResponse.redirect(`${origin}/?auth=ok`, { status: 302 });
  res.headers.append(
    "Set-Cookie",
    `jev_or_key=${payload}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
  );
  res.headers.append(
    "Set-Cookie",
    "jev_pkce_verifier=; Path=/; HttpOnly; Max-Age=0",
  );
  res.headers.append("Set-Cookie", "jev_pkce_state=; Path=/; HttpOnly; Max-Age=0");
  return res;
}
