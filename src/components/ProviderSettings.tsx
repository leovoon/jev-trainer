"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BYOK_HEADERS, PRESETS, type PresetId } from "@/lib/provider";
import type { Dict, Locale } from "@/lib/i18n";

type ByokForm = {
  provider: PresetId;
  baseURL: string;
  apiKey: string;
  model: string;
};

type Status = {
  oauth: {
    provider: string;
    model: string;
    cookieModel?: string;
    hasKey: boolean;
  } | null;
  server: { hasKey: boolean; model?: string; host?: string };
  defaultModel?: string;
};

const STORE = "jev_byok";
const MODEL_STORE = "jev_model";

function loadByok(): ByokForm | null {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return null;
    const v = JSON.parse(raw) as ByokForm;
    if (!v?.apiKey) return null;
    return v;
  } catch {
    return null;
  }
}

export function saveByok(v: ByokForm | null) {
  try {
    if (v?.apiKey) localStorage.setItem(STORE, JSON.stringify(v));
    else localStorage.removeItem(STORE);
  } catch {
    /* ignore */
  }
}

/** Model preference (OAuth session swap + display). Independent of BYOK key. */
export function loadModelPref(): string | null {
  try {
    return localStorage.getItem(MODEL_STORE);
  } catch {
    return null;
  }
}

export function saveModelPref(model: string) {
  try {
    if (model.trim()) localStorage.setItem(MODEL_STORE, model.trim());
    else localStorage.removeItem(MODEL_STORE);
  } catch {
    /* ignore */
  }
}

/** Headers for /api/scenario — client BYOK key never goes in URL. */
export function byokHeaders(): Record<string, string> {
  const v = loadByok();
  if (v?.apiKey) {
    const base = v.baseURL || PRESETS[v.provider].baseURL;
    return {
      [BYOK_HEADERS.key]: v.apiKey,
      [BYOK_HEADERS.base]: base,
      [BYOK_HEADERS.model]: v.model || PRESETS[v.provider].defaultModel,
    };
  }
  // No BYOK: still send model override for OpenRouter OAuth cookie.
  const model = loadModelPref();
  return model ? { [BYOK_HEADERS.model]: model } : {};
}

export function ProviderSettings({
  locale,
  t,
}: {
  locale: Locale;
  t: Dict;
}) {
  const [open, setOpen] = useState(false);
  // SSR/client first paint must match — no localStorage until after mount.
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<ByokForm>({
    provider: "groq",
    baseURL: PRESETS.groq.baseURL,
    apiKey: "",
    model: PRESETS.groq.defaultModel,
  });
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const byok = loadByok();
    const model = loadModelPref();
    // Hydration-safe: SSR HTML must match first client paint, then hydrate from localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(
      byok ??
        {
          provider: "groq",
          baseURL: PRESETS.groq.baseURL,
          apiKey: "",
          model: model || PRESETS.groq.defaultModel,
        },
    );
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const headers: Record<string, string> = {};
      const m = loadModelPref();
      if (m) headers[BYOK_HEADERS.model] = m;
      const res = await fetch("/api/provider/status", { headers });
      const data = (await res.json()) as Status;
      setStatus(data);
      // Surface OAuth cookie default into form when no local BYOK key.
      if (!loadByok()?.apiKey && data.oauth) {
        setForm((f) => ({
          ...f,
          provider: "openrouter",
          baseURL: PRESETS.openrouter.baseURL,
          model: loadModelPref() || data.oauth!.model || f.model,
        }));
      }
    } catch {
      setStatus(null);
    }
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void refresh();
  };

  const pickPreset = (p: PresetId) => {
    setForm((f) => ({
      ...f,
      provider: p,
      baseURL: PRESETS[p].baseURL || f.baseURL,
      model: PRESETS[p].defaultModel || f.model,
    }));
    setSaved(false);
    setMsg(null);
  };

  const setModel = (model: string) => {
    setForm((f) => ({ ...f, model }));
    saveModelPref(model);
    setSaved(false);
  };

  const save = () => {
    if (!form.apiKey.trim()) {
      if (status?.oauth) {
        // OAuth logged in — only model swap, no BYOK key required.
        saveModelPref(form.model);
        setMsg(t.settings.saved);
        void refresh();
        return;
      }
      setMsg(t.settings.keyRequired);
      return;
    }
    saveByok({
      ...form,
      baseURL: form.baseURL || PRESETS[form.provider].baseURL,
      model: form.model || PRESETS[form.provider].defaultModel,
    });
    saveModelPref(form.model);
    setSaved(true);
    setMsg(t.settings.saved);
  };

  const clear = () => {
    saveByok(null);
    saveModelPref("");
    setForm((f) => ({ ...f, apiKey: "" }));
    setSaved(false);
    setMsg(t.settings.cleared);
  };

  const test = async () => {
    setTesting(true);
    setMsg(null);
    try {
      const next = {
        ...form,
        baseURL: form.baseURL || PRESETS[form.provider].baseURL,
        model: form.model || PRESETS[form.provider].defaultModel,
      };
      if (next.apiKey) saveByok(next);
      saveModelPref(next.model);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        [BYOK_HEADERS.model]: next.model,
      };
      if (next.apiKey) {
        headers[BYOK_HEADERS.key] = next.apiKey;
        headers[BYOK_HEADERS.base] = next.baseURL;
      }
      const res = await fetch("/api/scenario", {
        method: "POST",
        headers,
        body: JSON.stringify({ mode: "mixed", locale, avoid: [] }),
        credentials: "include",
      });
      if (res.ok) setMsg(t.settings.testOk);
      else {
        let msg = t.settings.testFail;
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) msg = data.error;
        } catch {
          msg = `HTTP ${res.status}`;
        }
        setMsg(msg);
      }
    } catch {
      setMsg(t.settings.testFail);
    } finally {
      setTesting(false);
    }
  };

  const logout = async () => {
    await fetch("/api/provider/status", { method: "DELETE" });
    await refresh();
    setMsg(t.settings.oauthCleared);
  };

  const hasLocal = mounted && Boolean(form.apiKey);
  const sourceLabel = hasLocal
    ? t.settings.sourceLocal
    : status?.oauth
      ? t.settings.sourceOauth
      : status?.server?.hasKey
        ? t.settings.sourceServer
        : t.settings.sourceNone;

  const activeModel = hasLocal
    ? form.model
    : status?.oauth?.model || (mounted ? loadModelPref() : null) || null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="btn-press rounded border border-border px-2 py-0.5 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
        title={
          activeModel
            ? `${t.settings.open} — ${activeModel}`
            : t.settings.open
        }
      >
        AI
        <span className="ml-1 opacity-70">{sourceLabel}</span>
        {activeModel && (
          <span className="ml-1 hidden max-w-[10rem] truncate opacity-50 sm:inline">
            {activeModel}
          </span>
        )}
      </button>

      {open && (
        <div className="popover absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-3rem))] rounded-xl border border-border bg-card p-4 shadow-xl">
          <p className="text-xs uppercase tracking-widest text-muted">
            {t.settings.title}
          </p>
          <p className="mt-1 text-xs text-muted">{t.settings.blurb}</p>

          {/* OpenRouter OAuth — agent PKCE pattern */}
          <div className="mt-3 rounded-lg border border-border bg-background/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm">OpenRouter</span>
              {status?.oauth ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-good">
                    {t.settings.loggedIn}
                  </span>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="btn-press rounded border border-bad/40 px-2 py-0.5 text-xs text-bad transition-colors hover:bg-bad/10"
                  >
                    {t.settings.logout}
                  </button>
                </div>
              ) : (
                <a
                  href="/api/auth/openrouter/start"
                  className="btn-press rounded bg-accent px-2 py-1 text-xs font-semibold text-background transition-opacity hover:opacity-90"
                >
                  {t.settings.signIn}
                </a>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">{t.settings.oauthHint}</p>
            {status?.oauth && (
              <p className="mt-1 font-mono text-xs text-accent">
                {t.settings.usingModel}{" "}
                <span className="text-foreground">
                  {status.oauth.model}
                </span>
                {status.oauth.cookieModel &&
                  status.oauth.model !== status.oauth.cookieModel && (
                    <span className="ml-1 text-muted">
                      ({t.settings.cookieDefault} {status.oauth.cookieModel})
                    </span>
                  )}
              </p>
            )}
          </div>

          {/* Manual BYOK + model swap */}
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex flex-wrap gap-1">
              {(Object.keys(PRESETS) as PresetId[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => pickPreset(p)}
                  className={`btn-press rounded-full border px-2 py-0.5 font-mono transition-colors ${
                    form.provider === p
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted"
                  }`}
                >
                  {PRESETS[p].label}
                </button>
              ))}
            </div>

            <input
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder={
                status?.oauth
                  ? t.settings.keyOptionalOauth
                  : t.settings.keyPlaceholder
              }
              value={form.apiKey}
              onChange={(e) => {
                setForm((f) => ({ ...f, apiKey: e.target.value }));
                setSaved(false);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-accent/50"
            />

            <input
              type="text"
              spellCheck={false}
              placeholder={t.settings.modelPlaceholder}
              value={form.model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-accent/50"
            />

            {form.provider === "custom" && (
              <input
                type="url"
                placeholder="https://api.example.com/v1"
                value={form.baseURL}
                onChange={(e) =>
                  setForm((f) => ({ ...f, baseURL: e.target.value }))
                }
                className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-accent/50"
              />
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={save}
                className="btn-press rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-background transition-opacity hover:opacity-90"
              >
                {saved ? t.settings.saved : t.settings.save}
              </button>
              <button
                type="button"
                onClick={() => void test()}
                disabled={testing || (!form.apiKey && !status?.oauth)}
                className="btn-press rounded-lg border border-accent/50 px-3 py-1.5 text-xs text-accent transition-colors hover:bg-accent/10 disabled:opacity-40"
              >
                {testing ? "…" : t.settings.test}
              </button>
              <button
                type="button"
                onClick={clear}
                className="btn-press rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-bad/40 hover:text-bad"
              >
                {t.settings.clear}
              </button>
            </div>

            <p className="text-xs text-muted">{PRESETS[form.provider].keyHint}</p>
            {msg && <p className="text-xs text-accent">{msg}</p>}
            <p className="text-[11px] leading-snug text-muted">
              {t.settings.privacy}
            </p>
            {status?.server?.hasKey && (
              <p className="text-[11px] text-muted">
                {t.settings.serverOn}{" "}
                <span className="font-mono">{status.server.host}</span>
                {status.server.model && (
                  <span className="ml-1 font-mono">· {status.server.model}</span>
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
