import type { Mode } from "./schema";
import { languageDirective, type Locale } from "./i18n";

export const RULE = `You write JSON quiz scenarios for the "dock manager's rule" — a quick test for whether a decision can be a fast, one-look, fixed-menu call (Jev-able) or needs the slow lane. Always respond with JSON matching the given schema.

TONE (critical): casual and life-like. Think group chat, kitchen table, bus stop — not a paper, not a case study, not "enterprise". Scenario should feel like something that actually happens to a person this week. Explanations talk like a friend, one short sentence.

THREE DIALS (each pass/fail):
1. menu — Can you list every possible answer BEFORE looking? Open-ended prose / vibes / endless dimensions → FAIL. Short fixed list → PASS.
2. glance — Does ONE look settle it? Needs multiple passes, comparing pairs, adding things up → FAIL. One look is enough → PASS.
3. branch — Does the answer flip a switch (do X vs Y) or write an essay? Write-up / draft / feelings paragraph → FAIL. Action or label → PASS.

VERDICT (strict order):
- glance FAIL → office
- menu FAIL → decompose
- branch FAIL → office
- all PASS → fast_lane

decompose = whole thing fails menu, BUT you can cut it into 2–4 tiny yes/no (or short-list) questions that each pass all three. When verdict is decompose, glance and branch must PASS on the original.

If glance or branch fail → office. Cutting it up doesn't save those.

SCENARIO REQUIREMENTS:
- 1–2 short sentences. Concrete daily life. No TypeSafe/Jev/classifier talk in the scenario text.
- setting: one line — where you are / what you're looking at.
- Match target verdict. Ground-truth dials MUST satisfy the rule (dockRule).

EXPLANATIONS: one friendly sentence each. verdict: name which dial decided it.

DECOMPOSITION (required iff verdict === decompose; else null):
- why: why the whole fails the short-list check, how the cut fixes it.
- subJudgments: 2–4 tiny questions, each with 2–4 concrete answers.
- distractors: exactly 2 wrong cuts (tempting, but still vague) + whyWrong.

DIVERSITY: plants, roommate chats, snacks, bus delays, laundry, pets, brunch, group trips, gym, packages, haircuts, cold coffee. Avoid leaf/friend-"I'm fine"/log-line (already seeds).`;

export function buildPrompt(
  mode: Mode,
  avoid: string[],
  locale: Locale = "en",
): string {
  const target =
    mode === "mixed"
      ? "Pick target yourself: 40% fast_lane, 30% decompose, 30% office."
      : `Target verdict MUST be exactly "${mode}".`;

  const avoidLine = avoid.length
    ? `Don't reuse or lightly reword these:\n${avoid.map((s) => `- ${s}`).join("\n")}`
    : "";

  return `${languageDirective(locale)}\n${target}\n${avoidLine}`.trim();
}

/** Judge a user-written scenario — keep their text, fill dials + explanations. */
export function buildJudgePrompt(
  scenario: string,
  locale: Locale = "en",
): string {
  return [
    languageDirective(locale),
    `JUDGE mode: the scenario below was written by the user. Do NOT rewrite it.`,
    `Keep scenario EXACTLY as given (copy verbatim into "scenario").`,
    `Invent only a one-line "setting" if the text doesn't already place you somewhere.`,
    `Decide the three dials for THIS decision as written. Ground-truth verdict = dockRule(dials).`,
    `Do NOT target a mode — just judge honestly.`,
    `Explanations talk through THIS scenario specifically, not a generic example.`,
    `If verdict is decompose, write a real split for THIS problem.`,
    `---`,
    `SCENARIO:`,
    scenario,
  ].join("\n");
}
