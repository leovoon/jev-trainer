import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { z } from "zod";

/** Per-browser BYOK config (never sent back to client by server). */
export const byokSchema = z.object({
  provider: z
    .enum(["groq", "openrouter", "openai", "anthropic", "custom"])
    .default("groq"),
  baseURL: z.string().url().optional(),
  apiKey: z.string().min(1),
  model: z.string().min(1),
});
export type Byok = z.infer<typeof byokSchema>;

export const PRESETS = {
  groq: {
    label: "Groq",
    baseURL: "https://api.groq.com/openai/v1",
    defaultModel: "openai/gpt-oss-120b",
    keyHint: "console.groq.com → API Keys",
    docs: "https://console.groq.com/keys",
  },
  openrouter: {
    label: "OpenRouter",
    baseURL: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    keyHint: "openrouter.ai/settings/keys — or sign in below",
    docs: "https://openrouter.ai/settings/keys",
  },
  openai: {
    label: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    keyHint: "platform.openai.com/api-keys — paste key (no ChatGPT OAuth)",
    docs: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    label: "Anthropic",
    baseURL: "https://api.anthropic.com/v1",
    defaultModel: "claude-haiku-4-5",
    keyHint: "console.anthropic.com → API Keys — paste key (no Claude OAuth)",
    docs: "https://console.anthropic.com/settings/keys",
  },
  custom: {
    label: "Custom (OpenAI-compatible)",
    baseURL: "",
    defaultModel: "",
    keyHint: "Any OpenAI-compatible /v1 endpoint",
    docs: "",
  },
} as const;

export type PresetId = keyof typeof PRESETS;

/** Headers the browser may send for BYOK (key never in URL/query). */
export const BYOK_HEADERS = {
  key: "x-quiz-key",
  base: "x-quiz-base-url",
  model: "x-quiz-model",
} as const;

export function byokFromHeaders(req: Request): Byok | null {
  const apiKey = req.headers.get(BYOK_HEADERS.key)?.trim();
  if (!apiKey) return null;
  const baseURL = req.headers.get(BYOK_HEADERS.base)?.trim() || undefined;
  const model = req.headers.get(BYOK_HEADERS.model)?.trim() || undefined;
  const host = baseURL ? safeHost(baseURL) : "";
  const preset: PresetId = host.includes("groq")
    ? "groq"
    : host.includes("openrouter")
      ? "openrouter"
      : host.includes("api.openai.com")
        ? "openai"
        : host.includes("anthropic")
          ? "anthropic"
          : "custom";
  return byokSchema.parse({
    provider: preset,
    baseURL,
    apiKey,
    model: model || PRESETS[preset].defaultModel,
  });
}

/** OAuth cookie payload written by OpenRouter callback. */
export const oauthKeySchema = z.object({
  provider: z.literal("openrouter"),
  key: z.string().min(1),
  model: z.string().default(PRESETS.openrouter.defaultModel),
});
export type OAuthKey = z.infer<typeof oauthKeySchema>;

export function oauthFromCookie(req: Request): OAuthKey | null {
  const raw = readCookie(req.headers.get("cookie"), "jev_or_key");
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    return oauthKeySchema.parse(JSON.parse(json));
  } catch {
    return null;
  }
}

export function encodeOauthCookie(v: OAuthKey): string {
  const json = JSON.stringify(v);
  return Buffer.from(json, "utf8").toString("base64url");
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

function safeHost(url: string): string {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Server env key — OFF by default (public deploy must never spend host key).
 * Local only: set QUIZ_ALLOW_SERVER_KEY=1.
 */
export function envProvider(): {
  baseURL: string;
  apiKey: string;
  model: string;
} | null {
  const allowed =
    process.env.QUIZ_ALLOW_SERVER_KEY === "1" ||
    process.env.QUIZ_ALLOW_SERVER_KEY === "true";
  if (!allowed) return null;
  const baseURL =
    process.env.QUIZ_BASE_URL ??
    (process.env.GROQ_API_KEY
      ? "https://api.groq.com/openai/v1"
      : process.env.OPENROUTER_API_KEY
        ? "https://openrouter.ai/api/v1"
        : null);
  const apiKey =
    process.env.QUIZ_API_KEY ??
    (baseURL?.includes("groq")
      ? process.env.GROQ_API_KEY
      : process.env.OPENROUTER_API_KEY);
  const model =
    process.env.QUIZ_MODEL ??
    (baseURL?.includes("groq")
      ? "openai/gpt-oss-120b"
      : "openai/gpt-4o-mini");
  if (!baseURL || !apiKey) return null;
  return { baseURL, apiKey, model };
}

export type ResolvedProvider = {
  baseURL: string;
  apiKey: string;
  model: string;
  source: "byok-header" | "oauth-cookie" | "env";
};

/**
 * Public resolution: browser BYOK header → OAuth cookie → (local-only) env.
 * `x-quiz-model` overrides cookie model (OpenRouter session model swap).
 * No anonymous use of host keys.
 */
export function resolveRequestProvider(req: Request): ResolvedProvider | null {
  const modelOverride = req.headers.get(BYOK_HEADERS.model)?.trim();
  const byok = byokFromHeaders(req);
  if (byok) {
    return {
      baseURL: byok.baseURL || PRESETS[byok.provider].baseURL,
      apiKey: byok.apiKey,
      model: byok.model,
      source: "byok-header",
    };
  }
  const oauth = oauthFromCookie(req);
  if (oauth) {
    return {
      baseURL: PRESETS.openrouter.baseURL,
      apiKey: oauth.key,
      model: modelOverride || oauth.model,
      source: "oauth-cookie",
    };
  }
  const env = envProvider();
  if (env) return { ...env, source: "env" };
  return null;
}

export function makeModel(
  p: ResolvedProvider,
  opts: { structured?: boolean } = {},
) {
  // Anthropic OpenAI-compat: no response_format json_schema.
  // Some OpenRouter free models also reject structured-outputs (400).
  const structured =
    opts.structured ?? !safeHost(p.baseURL).includes("anthropic");
  const provider = createOpenAICompatible({
    name: "quiz",
    apiKey: p.apiKey,
    baseURL: p.baseURL,
    supportsStructuredOutputs: structured,
  });
  return provider(p.model);
}

/** Upstream said structured-outputs / response_format not supported. */
export function isStructuredUnsupported(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /structured-outputs|structured_outputs|response_format|does not support feature|INVALID_REQUEST_BODY/i.test(
    msg,
  );
}

/** Key rejected — not a model-capability issue. */
export function isKeyRejected(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /\b401\b|unauthorized|invalid api|incorrect api key/i.test(msg);
}

/** OpenRouter balance can't cover requested max_tokens (or usage). */
export function isInsufficientCredits(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /requires more credits|insufficient credits|add more credits|can only afford|payment required|\b402\b/i.test(
    msg,
  );
}
