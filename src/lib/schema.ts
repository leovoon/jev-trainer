import { z } from "zod";

export const verdictSchema = z.enum(["fast_lane", "decompose", "office"]);
export type Verdict = z.infer<typeof verdictSchema>;

export const dialsSchema = z.object({
  menu: z.boolean(),
  glance: z.boolean(),
  branch: z.boolean(),
});
export type Dials = z.infer<typeof dialsSchema>;

export const subJudgmentSchema = z.object({
  question: z.string(),
  answers: z.array(z.string()).min(2),
});
export type SubJudgment = z.infer<typeof subJudgmentSchema>;

export const quizItemSchema = z.object({
  scenario: stringish(),
  setting: z.string().describe("One short sentence of concrete context"),
  dials: dialsSchema,
  verdict: verdictSchema,
  explanations: z.object({
    menu: z.string(),
    glance: z.string(),
    branch: z.string(),
    verdict: z.string(),
  }),
  decomposition: z
    .object({
      why: z.string().describe("Why the whole fails menu, and how the split fixes it"),
      subJudgments: z.array(subJudgmentSchema).min(2).max(4),
      distractors: z
        .array(
          z.object({
            text: z.string().describe("A tempting but wrong way to split"),
            whyWrong: z.string(),
          }),
        )
        .length(2),
    })
    .nullable()
    .describe("Present only when verdict is decompose"),
});
export type QuizItem = z.infer<typeof quizItemSchema>;

export const modeSchema = z.enum(["mixed", "fast_lane", "decompose", "office"]);
export type Mode = z.infer<typeof modeSchema>;

function stringish() {
  return z
    .string()
    .min(8)
    .describe(
      "The decision scenario, 1–2 sentences, concrete, no jargon (min ~8 chars; Chinese counts each character)",
    );
}

/** Dock manager's rule — independent of any model. */
export function dockRule(dials: Dials): Verdict {
  if (!dials.glance) return "office";
  if (!dials.menu) return "decompose";
  if (!dials.branch) return "office";
  return "fast_lane";
}

export function scoreAnswer(
  item: QuizItem,
  guess: { dials: Dials; verdict: Verdict },
) {
  const dialHits = {
    menu: item.dials.menu === guess.dials.menu,
    glance: item.dials.glance === guess.dials.glance,
    branch: item.dials.branch === guess.dials.branch,
  };
  const dialCount = Number(dialHits.menu) + Number(dialHits.glance) + Number(dialHits.branch);
  const verdictHit = item.verdict === guess.verdict;
  const rule = dockRule(item.dials);
  return {
    dialHits,
    dialCount,
    verdictHit,
    allCorrect: dialCount === 3 && verdictHit,
    ruleNote: rule === item.verdict ? null : `ground-truth dials imply ${rule}`,
  };
}
