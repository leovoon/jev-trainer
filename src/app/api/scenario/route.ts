import { generateObject, generateText, tool } from "ai";
import { z } from "zod";
import { RULE, buildPrompt, buildJudgePrompt } from "@/lib/prompt";
import {
  resolveRequestProvider,
  makeModel,
  isKeyRejected,
  isInsufficientCredits,
} from "@/lib/provider";
import { modeSchema, quizItemSchema, dockRule, type Mode } from "@/lib/schema";

export const maxDuration = 75;

/**
 * Quiz JSON fits well under this. Low enough that OpenRouter won't reject
 * for "can only afford N tokens" when balance is tight.
 */
const MAX_OUT = 1500;

/** Per-phase wall clock — reasoning models hang on structured JSON forever. */
const PHASE_MS: Record<"structured" | "tool" | "plain", number> = {
  structured: 20_000,
  tool: 35_000,
  plain: 20_000,
};

const localeSchema = z.enum(["en", "zh-CN", "zh-TW"]);

const bodySchema = z.object({
  mode: modeSchema.default("mixed"),
  avoid: z.array(z.string()).default([]),
  locale: localeSchema.default("en"),
  /** User-written scenario → judge dials/verdict instead of generating. */
  scenario: z.string().min(8).max(800).optional(),
});

type Item = z.infer<typeof quizItemSchema>;

/** Finish item: force user text, validate decompose, null-out junk split. */
function finish(
  raw: Item,
  judgeScenario: string | null,
  mode: Mode | null,
): { ok: true; item: Item } | { ok: false; retry: string } {
  const verdict = dockRule(raw.dials);
  if (mode && mode !== "mixed" && verdict !== mode) {
    return { ok: false, retry: `dials imply ${verdict}, wanted ${mode}` };
  }
  const item: Item = {
    ...raw,
    verdict,
    decomposition: verdict === "decompose" ? raw.decomposition : null,
  };
  if (judgeScenario) item.scenario = judgeScenario;
  if (item.verdict === "decompose" && !item.decomposition) {
    return { ok: false, retry: "decompose without a split" };
  }
  return { ok: true, item };
}

/**
 * Fallback for models that reject response_format / structured-outputs
 * (e.g. inclusionai/*:free on OpenRouter) — force a tool call instead.
 */
async function generateViaTool(
  cfg: Parameters<typeof makeModel>[0],
  system: string,
  prompt: string,
  temperature: number,
): Promise<Item> {
  const quizTool = tool({
    description: "Return the completed quiz item",
    inputSchema: quizItemSchema,
  });
  const result = await generateText({
    model: makeModel(cfg, { structured: false }),
    tools: { quiz_item: quizTool },
    toolChoice: "required",
    temperature,
    maxOutputTokens: MAX_OUT,
    system,
    prompt,
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(PHASE_MS.tool),
  });
  const call = result.toolCalls?.[0];
  if (!call) throw new Error("model did not call quiz_item");
  return quizItemSchema.parse(call.input);
}

export async function POST(req: Request) {
  let cfg: ReturnType<typeof resolveRequestProvider> = null;
  try {
    cfg = resolveRequestProvider(req);
  } catch (e) {
    // Bad BYOK headers (invalid URL, etc.) — keep response JSON.
    return Response.json(
      {
        error:
          e instanceof Error && /url/i.test(e.message)
            ? "Invalid provider base URL in settings."
            : "Invalid provider settings.",
        code: "bad_provider_config",
      },
      { status: 400 },
    );
  }
  if (!cfg) {
    return Response.json(
      {
        error:
          "No provider key. Add one in settings (paste key / OpenRouter sign-in).",
        code: "no_provider",
      },
      { status: 401 },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.message }, { status: 400 });
  }
  const { mode, avoid, locale, scenario } = parsed.data;
  const judge = Boolean(scenario);
  const judgeScenario = judge ? scenario! : null;
  const userPrompt = judge
    ? buildJudgePrompt(scenario!, locale)
    : buildPrompt(mode, avoid, locale);
  const systemPlain = `${RULE}\nUse the quiz_item tool. Never reply with prose.`;
  const temperature = judge ? 0.3 : 1.0;

  // strategy: structured generateObject → tool fallback → plain generateObject
  let phase: "structured" | "tool" | "plain" = cfg.baseURL.includes("anthropic")
    ? "tool"
    : "structured";
  let lastError = "generation failed";

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      let raw: Item;
      if (phase === "tool") {
        raw = await generateViaTool(cfg, systemPlain, userPrompt, temperature);
      } else {
        const { object } = await generateObject({
          model: makeModel(cfg, { structured: phase === "structured" }),
          schema: quizItemSchema,
          output: "object",
          temperature,
          maxOutputTokens: MAX_OUT,
          system:
            phase === "plain"
              ? `${RULE}\nRespond with one raw JSON object only. No markdown fences.`
              : RULE,
          prompt: userPrompt,
          maxRetries: 0,
          abortSignal: AbortSignal.timeout(PHASE_MS[phase]),
        });
        raw = object;
      }

      const done = finish(raw, judgeScenario, judge ? null : mode);
      if (!done.ok) {
        lastError = done.retry;
        continue;
      }
      return Response.json(done.item);
    } catch (err) {
      lastError = err instanceof Error ? err.message : "generation failed";

      if (isKeyRejected(err)) {
        return Response.json(
          {
            error: "Provider rejected the key. Update it in settings.",
            code: "provider_key_invalid",
          },
          { status: 401 },
        );
      }

      // Balance too low for requested max_tokens / usage — don't retry.
      if (isInsufficientCredits(err)) {
        return Response.json(
          {
            error:
              "OpenRouter balance too low for this model. Add credits, or switch to a free model (e.g. ends in `:free`) in AI settings.",
            code: "insufficient_credits",
          },
          { status: 402 },
        );
      }

      // wall-clock hang (reasoning model on structured JSON) → next phase
      if (
        err instanceof Error &&
        (err.name === "TimeoutError" ||
          err.name === "AbortError" ||
          /timeout|aborted|The operation was aborted/i.test(err.message))
      ) {
        if (phase === "structured") {
          phase = "tool";
          continue;
        }
        if (phase === "tool") {
          phase = "plain";
          continue;
        }
        return Response.json(
          {
            error:
              "Model timed out. Try another model in AI settings (free reasoning models are slow on structured output).",
            code: "model_timeout",
          },
          { status: 504 },
        );
      }

      // structured-outputs / json_object rejected → tool path.
      // Don't match bare "400" — credit/other errors can contain digits.
      if (
        phase === "structured" &&
        /structured-outputs|structured_outputs|response_format|Provider returned error|does not support feature|INVALID_REQUEST_BODY/i.test(
          lastError,
        )
      ) {
        phase = "tool";
        continue;
      }

      if (phase === "tool" && /tool|quiz_item|NoObjectGenerated/i.test(lastError)) {
        phase = "plain";
        continue;
      }

      if (/could not parse|No object generated|invalid_json/i.test(lastError)) {
        phase = phase === "structured" ? "tool" : "plain";
        continue;
      }

      // free-tier flake — one more try on tool path (not credits)
      if (
        phase !== "tool" &&
        /429|rate.?limit|overloaded|Provider returned/i.test(lastError) &&
        !isInsufficientCredits(lastError)
      ) {
        phase = "tool";
        continue;
      }
    }
  }

  if (/could not parse|No object generated/i.test(lastError)) {
    return Response.json(
      {
        error: `${lastError} This model may be a poor fit — try another in AI settings.`,
        code: "parse_failed",
      },
      { status: 502 },
    );
  }

  return Response.json({ error: lastError }, { status: 502 });
}
