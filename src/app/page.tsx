"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  scoreAnswer,
  type Dials,
  type Mode,
  type QuizItem,
  type Verdict,
} from "@/lib/schema";
import { seedsFor } from "@/lib/seed";
import {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_NAMES,
  dict,
  type Locale,
} from "@/lib/i18n";
import { ProviderSettings, byokHeaders } from "@/components/ProviderSettings";

type Phase = "answering" | "revealed" | "decompose-practice" | "decompose-done";
type Guess = { dials: Dials; verdict: Verdict | null };

const VERDICTS: Verdict[] = ["fast_lane", "decompose", "office"];
const MODES: Mode[] = ["mixed", "fast_lane", "decompose", "office"];
const DIAL_KEYS = ["menu", "glance", "branch"] as const;
type DialKey = (typeof DIAL_KEYS)[number];

function DialIcon({ k }: { k: DialKey }) {
  if (k === "menu") {
    return (
      <svg
        viewBox="0 0 40 40"
        width="40"
        height="40"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9.5 18.5 8 8.5l8.5 6.5"
          className="fill-accent/10 stroke-accent"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M23.5 18.5 25 8.5l-8.5 6.5"
          className="fill-accent/10 stroke-accent"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <circle
          cx="16.5"
          cy="23.5"
          r="9.5"
          className="fill-accent/10 stroke-accent"
          strokeWidth="1.75"
        />
        <circle cx="13" cy="22.5" r="1.35" className="fill-accent" />
        <circle cx="20" cy="22.5" r="1.35" className="fill-accent" />
        <path
          d="M15.2 27c.8.9 2.3.9 3.1 0"
          className="stroke-accent"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M6.5 22.5h3M6.5 26h3"
          className="stroke-accent/70"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <rect
          x="25"
          y="14.5"
          width="12"
          height="16"
          rx="2.5"
          className="fill-card stroke-warn"
          strokeWidth="1.5"
        />
        <circle cx="28.5" cy="19" r="1" className="fill-warn" />
        <circle cx="28.5" cy="23" r="1" className="fill-warn" />
        <circle cx="28.5" cy="27" r="1" className="fill-warn" />
        <path
          d="M31 19h3.5M31 23h3.5M31 27h2.5"
          className="stroke-warn"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (k === "glance") {
    return (
      <svg
        viewBox="0 0 40 40"
        width="40"
        height="40"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M11 14.5 9.5 6l7 5.5"
          className="fill-accent/10 stroke-accent"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M29 14.5 30.5 6l-7 5.5"
          className="fill-accent/10 stroke-accent"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <ellipse
          cx="20"
          cy="23.5"
          rx="12"
          ry="12"
          className="fill-accent/10 stroke-accent"
          strokeWidth="1.75"
        />
        <circle
          cx="15.5"
          cy="21.5"
          r="5"
          className="fill-background stroke-accent"
          strokeWidth="1.5"
        />
        <circle
          cx="24.5"
          cy="21.5"
          r="5"
          className="fill-background stroke-accent"
          strokeWidth="1.5"
        />
        <circle cx="15.5" cy="21.5" r="2" className="fill-accent" />
        <circle cx="24.5" cy="21.5" r="2" className="fill-accent" />
        <path d="M18.5 27 20 30.5 21.5 27Z" className="fill-warn" />
        <path
          d="M31.5 8.5l.9 1.9 1.9.9-1.9.9-.9 1.9-.9-1.9-1.9-.9 1.9-.9.9-1.9Z"
          className="fill-warn"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 40 40"
      width="40"
      height="40"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="13"
        cy="13.5"
        r="5.5"
        className="fill-accent/10 stroke-accent"
        strokeWidth="1.75"
      />
      <circle
        cx="27"
        cy="13.5"
        r="5.5"
        className="fill-accent/10 stroke-accent"
        strokeWidth="1.75"
      />
      <circle cx="13" cy="13.5" r="2" className="fill-accent" />
      <circle cx="27" cy="13.5" r="2" className="fill-accent" />
      <ellipse
        cx="20"
        cy="26.5"
        rx="13"
        ry="9.5"
        className="fill-accent/10 stroke-accent"
        strokeWidth="1.75"
      />
      <path
        d="M14 27.5c1.8 2.4 10.2 2.4 12 0"
        className="stroke-accent"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10.5" cy="25.5" r="1.6" className="fill-accent/40" />
      <circle cx="29.5" cy="25.5" r="1.6" className="fill-accent/40" />
    </svg>
  );
}

function pickSeed(locale: Locale, mode: Mode, idx: number): QuizItem {
  const pool = seedsFor(locale).filter(
    (s) => mode === "mixed" || s.verdict === mode,
  );
  const list = pool.length ? pool : seedsFor(locale);
  return list[idx % list.length];
}

function QuizBoard({
  item,
  locale,
  onNext,
  onScore,
  loading,
}: {
  item: QuizItem;
  locale: Locale;
  onNext: () => void;
  onScore: (allCorrect: boolean) => void;
  loading: boolean;
}) {
  const t = dict(locale);
  const [guess, setGuess] = useState<Guess>({
    dials: { menu: true, glance: true, branch: true },
    verdict: null,
  });
  const [phase, setPhase] = useState<Phase>("answering");
  const [practiceChoice, setPracticeChoice] = useState<number | null>(null);
  const [infoKey, setInfoKey] = useState<DialKey | null>(null);

  useEffect(() => {
    if (!infoKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInfoKey(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [infoKey]);

  const dialVerdict = useMemo(() => {
    const d = guess.dials;
    if (!d.glance) return "office" as Verdict;
    if (!d.menu) return "decompose" as Verdict;
    if (!d.branch) return "office" as Verdict;
    return "fast_lane" as Verdict;
  }, [guess.dials]);

  const result =
    phase !== "answering" && guess.verdict
      ? scoreAnswer(item, { dials: guess.dials, verdict: guess.verdict })
      : null;

  const submit = () => {
    if (!guess.verdict) return;
    const r = scoreAnswer(item, { dials: guess.dials, verdict: guess.verdict });
    onScore(r.allCorrect);
    if (item.verdict === "decompose" && item.decomposition && r.verdictHit) {
      setPhase("decompose-practice");
    } else {
      setPhase("revealed");
    }
  };

  return (
    <>
      <section className="rounded-xl border border-border bg-card/45 p-5 backdrop-blur-md sm:p-6">
        <p className="text-xs uppercase tracking-widest text-muted">
          {t.scenario}
        </p>
        <p className="mt-2 text-lg leading-relaxed">{item.scenario}</p>
        <p className="mt-3 text-sm text-muted">{item.setting}</p>
      </section>

      <section className="flex flex-col gap-3">
        {DIAL_KEYS.map((key) => {
          const meta = t.dialsMeta[key];
          const val = guess.dials[key];
          return (
            <div
              key={key}
              className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${
                phase === "answering" ? "hover:border-accent/40" : ""
              } ${val ? "border-accent/50 bg-accent/5 backdrop-blur-md" : "border-border bg-card/45 backdrop-blur-md"}`}
            >
              <button
                type="button"
                disabled={phase !== "answering"}
                onClick={() =>
                  setGuess((g) => ({
                    ...g,
                    dials: { ...g.dials, [key]: !val },
                  }))
                }
                className={`btn-press min-w-0 flex-1 text-left ${
                  phase === "answering" ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-semibold text-accent">
                    {meta.q}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-xs ${
                      val ? "bg-good/15 text-good" : "bg-bad/15 text-bad"
                    }`}
                  >
                    {val ? t.pass : t.fail}
                  </span>
                </div>
                <p className="mt-1 text-sm">{meta.prompt}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {t.tapTo} {val ? meta.pass : meta.fail}
                </p>
                {result && (
                  <p
                    className={`enter mt-2 font-mono text-xs ${
                      result.dialHits[key] ? "text-good" : "text-bad"
                    }`}
                  >
                    {result.dialHits[key] ? "✓" : "✗"} {t.truthLabel}{" "}
                    {item.dials[key] ? t.pass : t.fail}
                  </p>
                )}
              </button>
              <button
                type="button"
                onClick={() => setInfoKey(key)}
                title={t.infoHint}
                aria-label={`${meta.q} — ${t.infoHint}`}
                className="btn-press shrink-0 self-start rounded-lg border border-border bg-background/50 p-1 text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                <DialIcon k={key} />
              </button>
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border border-border bg-card/45 p-4 backdrop-blur-md">
        <p className="text-xs uppercase tracking-widest text-muted">
          {t.yourVerdict}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {VERDICTS.map((v) => (
              <button
                key={v}
                type="button"
                disabled={phase !== "answering"}
                onClick={() => setGuess((g) => ({ ...g, verdict: v }))}
                className={`btn-press rounded-lg border px-3 py-2 font-mono text-sm transition-colors ${
                  guess.verdict === v
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-muted hover:border-accent/40"
                }`}
              >
              {v}
            </button>
          ))}
        </div>
        <p className="mt-3 font-mono text-xs text-muted">
          {t.rulePreview}{" "}
          <span className="text-accent">{dialVerdict}</span>
          {guess.verdict && guess.verdict !== dialVerdict && (
            <span className="ml-2 text-warn">{t.verdictMismatch}</span>
          )}
        </p>
      </section>

      {phase === "answering" && (
        <button
          type="button"
          onClick={submit}
          disabled={guess.verdict === null}
          className="btn-press rounded-xl bg-accent px-4 py-3 font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {t.check}
        </button>
      )}

      {result && phase !== "answering" && (
        <section className="enter flex flex-col gap-4 rounded-xl border border-border bg-card/45 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span
              className={`font-mono text-sm ${
                result.allCorrect ? "text-good" : "text-warn"
              }`}
            >
              {t.dials(result.dialCount)} ·{" "}
              {result.verdictHit ? t.verdictOk : t.verdictBad}
            </span>
            <span className="font-mono text-sm text-muted">
              {t.truth} <span className="text-accent">{item.verdict}</span>
            </span>
          </div>

          {result.ruleNote && (
            <p className="text-xs text-warn">{result.ruleNote}</p>
          )}

          <ul className="stagger flex flex-col gap-2 text-sm">
            <li>
              <span className="font-mono text-accent">menu</span> —{" "}
              {item.explanations.menu}
            </li>
            <li>
              <span className="font-mono text-accent">glance</span> —{" "}
              {item.explanations.glance}
            </li>
            <li>
              <span className="font-mono text-accent">branch</span> —{" "}
              {item.explanations.branch}
            </li>
            <li className="border-t border-border pt-2">
              <span className="font-mono text-warn">verdict</span> —{" "}
              {item.explanations.verdict}
            </li>
          </ul>

          {(phase === "revealed" || phase === "decompose-done") && (
            <button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="btn-press rounded-xl border border-accent/50 px-4 py-3 font-semibold text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
            >
              {loading ? t.loading : t.next}
            </button>
          )}
        </section>
      )}

      {(phase === "decompose-practice" || phase === "decompose-done") &&
        item.decomposition && (
          <section className="enter flex flex-col gap-4 rounded-xl border border-warn/40 bg-warn/5 p-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-warn">
                {t.decomposePractice}
              </p>
              <p className="mt-2 text-sm">{item.decomposition.why}</p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">{t.whichSplit}</p>
              {[
                {
                  text: item.decomposition.subJudgments
                    .map((s) => s.question)
                    .join("  ·  "),
                  correct: true as const,
                },
                ...item.decomposition.distractors.map((d) => ({
                  text: d.text,
                  correct: false as const,
                  whyWrong: d.whyWrong,
                })),
              ].map((opt, i) => {
                const chosen = practiceChoice === i;
                const show =
                  phase === "decompose-done" && (chosen || opt.correct);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={phase !== "decompose-practice"}
                    onClick={() => setPracticeChoice(i)}
                    className={`btn-press rounded-lg border p-3 text-left text-sm transition-colors ${
                      chosen
                        ? "border-accent bg-accent/10"
                        : "border-border bg-card/45 backdrop-blur-md"
                    } ${
                      show && opt.correct
                        ? "!border-good !bg-good/10"
                        : show && chosen && !opt.correct
                          ? "!border-bad !bg-bad/10"
                          : ""
                    }`}
                  >
                    {opt.text}
                    {phase === "decompose-done" &&
                      "whyWrong" in opt &&
                      chosen &&
                      !opt.correct && (
                        <span className="mt-1 block text-xs text-bad">
                          {opt.whyWrong}
                        </span>
                      )}
                    {phase === "decompose-done" && opt.correct && (
                      <span className="mt-1 block text-xs text-good">
                        {t.splitOk}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg border border-border bg-background/50 p-3">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                {t.goodSplit}
              </p>
              <ol className="mt-2 flex flex-col gap-2 text-sm">
                {item.decomposition.subJudgments.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-accent">{i + 1}.</span>
                    <span>
                      {s.question}
                      <span className="ml-2 font-mono text-xs text-muted">
                        [{s.answers.join(" | ")}]
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {phase === "decompose-practice" && (
              <button
                type="button"
                onClick={() => setPhase("decompose-done")}
                disabled={practiceChoice === null}
                className="btn-press rounded-xl bg-warn px-4 py-3 font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {t.lockSplit}
              </button>
            )}
          </section>
        )}

      {infoKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setInfoKey(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.dialsMeta[infoKey].q}
            className="popover w-full max-w-sm rounded-xl border border-accent/30 bg-card p-5 shadow-2xl shadow-black/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="shrink-0 rounded-lg border border-border bg-background/50 p-1">
                <DialIcon k={infoKey} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-semibold text-accent">
                  {t.dialsMeta[infoKey].q}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {t.dialsMeta[infoKey].prompt}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              {t.dialsMeta[infoKey].explanation}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-good/15 px-2 py-0.5 font-mono text-xs text-good">
                {t.pass} · {t.dialsMeta[infoKey].pass}
              </span>
              <span className="rounded-full bg-bad/15 px-2 py-0.5 font-mono text-xs text-bad">
                {t.fail} · {t.dialsMeta[infoKey].fail}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setInfoKey(null)}
              className="btn-press mt-4 w-full rounded-xl bg-accent px-4 py-2.5 font-semibold text-background transition-opacity hover:opacity-90"
            >
              {t.popupClose}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [mode, setMode] = useState<Mode>("mixed");
  const [item, setItem] = useState<QuizItem>(() => pickSeed("en", "mixed", 0));
  const [source, setSource] = useState<"seed" | "llm" | "custom">("seed");
  const [loading, setLoading] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState("");
  const [judging, setJudging] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    const authError = params.get("auth_error");
    if (auth === "ok" || authError || auth) {
      params.delete("auth");
      params.delete("auth_error");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${qs ? `?${qs}` : ""}`,
      );
    }
    if (authError) return `OpenRouter: ${authError}`;
    return null;
  });
  const [seen, setSeen] = useState<string[]>([]);
  const [seedIdx, setSeedIdx] = useState(1);
  const [stats, setStats] = useState({ asked: 0, correct: 0 });

  const t = dict(locale);

  const changeLocale = (next: Locale) => {
    setLocale(next);
    setItem(pickSeed(next, mode, 0));
    setSource("seed");
    setSeedIdx(1);
    setError(null);
    setSeen([]);
    setCustomOpen(false);
    setCustomText("");
  };

  const changeMode = (m: Mode) => {
    setMode(m);
    setItem(pickSeed(locale, m, 0));
    setSource("seed");
    setSeedIdx(1);
    setError(null);
    setCustomOpen(false);
  };

  const loadLlm = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const avoid = [...seen, item.scenario];
      const res = await fetch("/api/scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...byokHeaders(),
        },
        body: JSON.stringify({ mode, locale, avoid: avoid.slice(-30) }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setItem(data as QuizItem);
      setSource("llm");
      setSeen((v) => [...v, (data as QuizItem).scenario]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "generation failed");
      const s = pickSeed(locale, mode, seedIdx);
      setItem(s);
      setSource("seed");
      setSeedIdx((i) => i + 1);
    } finally {
      setLoading(false);
    }
  }, [mode, locale, seen, item, seedIdx]);

  const next = () => {
    void loadLlm();
  };

  const newLlm = () => {
    void loadLlm();
  };

  const submitCustom = async () => {
    const text = customText.trim();
    if (text.length < 8) {
      setError(t.customTooShort);
      return;
    }
    setJudging(true);
    setError(null);
    try {
      const res = await fetch("/api/scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...byokHeaders(),
        },
        body: JSON.stringify({ scenario: text, locale }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setItem(data as QuizItem);
      setSource("custom");
      setSeen((v) => [...v, text]);
      setCustomOpen(false);
      setCustomText("");
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "judge failed");
    } finally {
      setJudging(false);
    }
  };

  const onScore = (allCorrect: boolean) => {
    setStats((s) => ({
      asked: s.asked + 1,
      correct: s.correct + (allCorrect ? 1 : 0),
    }));
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6 sm:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs text-muted">
            {t.score(stats.correct, stats.asked)}
            <span className="mx-2">·</span>
            {source === "seed"
              ? t.source.seed
              : source === "custom"
                ? t.source.custom
                : t.source.llm}
          </div>
          <div className="flex gap-1" role="group" aria-label="language">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                title={LOCALE_NAMES[l]}
                onClick={() => changeLocale(l)}
                className={`btn-press rounded border px-2 py-0.5 font-mono text-xs transition-colors ${
                  locale === l
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-muted hover:border-accent/40"
                }`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
          <ProviderSettings locale={locale} t={t} />
          <a
            href="https://github.com/leovoon/jev-trainer"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            title="GitHub"
            className="btn-press text-muted transition-colors hover:text-foreground"
          >
            <svg
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted">{t.mode}</span>
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => changeMode(m)}
              className={`btn-press rounded-full border px-3 py-1 font-mono transition-colors ${
                mode === m
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:border-accent/40"
              }`}
              title={t.modeHint[m]}
            >
              {m}
              {locale !== "en" && (
                <span className="ml-1 opacity-60">{t.modeHint[m]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCustomOpen((v) => !v)}
            disabled={loading || judging}
            className="btn-press rounded-full border border-warn/50 px-3 py-1 font-mono text-warn transition-colors hover:bg-warn/10 disabled:opacity-50"
          >
            {customOpen ? t.customClose : t.customOpen}
          </button>
          <button
            type="button"
            onClick={newLlm}
            disabled={loading || judging}
            className="btn-press rounded-full border border-accent/50 px-3 py-1 font-mono text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
          >
            {loading || judging ? t.generating : t.newLlm}
          </button>
        </div>
      </div>

      {customOpen && (
        <section className="enter rounded-xl border border-warn/40 bg-warn/5 p-4">
          <p className="text-xs uppercase tracking-widest text-warn">
            {t.custom}
          </p>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={t.customPlaceholder}
            rows={3}
            maxLength={800}
            className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-warn/50"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-muted">
              {customText.trim().length}/800
            </span>
            <button
              type="button"
              onClick={() => void submitCustom()}
              disabled={judging || customText.trim().length < 8}
              className="btn-press rounded-lg bg-warn px-4 py-1.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {judging ? t.customJudging : t.customSubmit}
            </button>
          </div>
        </section>
      )}

      {error && (
        <p className="enter rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
          {error} — {t.fellBack}
        </p>
      )}

      <QuizBoard
        key={`${locale}:${source}:${item.scenario.slice(0, 40)}`}
        item={item}
        locale={locale}
        onNext={next}
        onScore={onScore}
        loading={loading || judging}
      />

      <footer className="mt-auto border-t border-border pt-4 text-xs text-muted">
        {t.footerRule} ·{" "}
        <span className="text-accent/70">{t.footerHint}</span>
        <a
          href="https://github.com/leovoon"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto block pt-2 text-right font-mono text-[10px] font-extralight tracking-[0.2em] text-muted/40 transition-colors hover:text-muted/70"
        >
          @leovoon
        </a>
      </footer>
    </main>
  );
}
