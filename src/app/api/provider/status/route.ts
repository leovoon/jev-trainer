import { NextResponse } from "next/server";
import { envProvider, oauthFromCookie, PRESETS } from "@/lib/provider";

export const dynamic = "force-dynamic";

/**
 * Write-only status: booleans + labels, never raw keys.
 * `oauth.model` = cookie default; client override via `x-quiz-model` header
 * is request-scoped and not visible here unless sent on this request.
 */
export async function GET(req: Request) {
  const oauth = oauthFromCookie(req);
  const env = envProvider();
  const override = req.headers.get("x-quiz-model")?.trim();
  return NextResponse.json({
    oauth: oauth
      ? {
          provider: "openrouter",
          model: override || oauth.model,
          cookieModel: oauth.model,
          hasKey: true,
        }
      : null,
    server: env
      ? {
          hasKey: true,
          model: env.model,
          host: safeHost(env.baseURL),
        }
      : { hasKey: false },
    defaultModel: PRESETS.openrouter.defaultModel,
  });
}

/** Clear OAuth saved-auth cookie. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    "jev_or_key=; Path=/; HttpOnly; Max-Age=0",
  );
  return res;
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}
