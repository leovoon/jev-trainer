export const LOCALES = ["en", "zh-CN", "zh-TW"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  "zh-CN": "简",
  "zh-TW": "繁",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
};

export type Dict = typeof en;

const en = {
  title: "Have you Jev'd?",
  subtitle: "3 gut checks. Is this a quick call or a whole thing?",
  score: (c: number, a: number) => `${c}/${a} clean`,
  source: { seed: "preset", llm: "fresh", custom: "yours" } as {
    seed: string;
    llm: string;
    custom: string;
  },
  mode: "vibe",
  newLlm: "surprise me",
  custom: "yours",
  customOpen: "judge yours",
  customClose: "close",
  customPlaceholder:
    "Your decision, 1–2 sentences… e.g. should I text back now or later?",
  customSubmit: "read it",
  customJudging: "reading…",
  customTooShort: "need a few more words",
  generating: "thinking…",
  fellBack: "grabbed a preset instead.",
  scenario: "the situation",
  yourVerdict: "your call",
  rulePreview: "if your dials are right →",
  verdictMismatch: "⚠ your call fights your dials",
  check: "reveal",
  dials: (n: number) => `${n}/3 checks`,
  verdictOk: "call ✓",
  verdictBad: "call ✗",
  truth: "answer:",
  next: "next one →",
  loading: "hang on…",
  decomposePractice: "split it up",
  whichSplit:
    "Which cut actually works? (every piece needs all 3 checks green)",
  lockSplit: "that's the cut",
  goodSplit: "the right cut",
  splitOk: "✓ each one: fixed answers · one look · does something",
  footerRule:
    "can't tell at a glance → office · answers aren't a short list → decompose · it's a write-up → office · else fast_lane",
  footerHint: "tap to flip · your call should match your checks",
  pass: "YES",
  fail: "NO",
  truthLabel: "really:",
  tapTo: "tap →",
  infoHint: "what is this check?",
  popupClose: "got it",
  dialsMeta: {
    menu: {
      q: "MENU",
      prompt: "Can you list the answers before you even look?",
      fail: "could go on forever",
      pass: "short fixed list",
      explanation:
        "Can you name the options right now — like glancing at a takeout menu and picking? If yes, just pick. If the list keeps growing the more you think, it's too open-ended; chop it into smaller questions first.",
    },
    glance: {
      q: "GLANCE",
      prompt: "One look and you know?",
      fail: "need passes / compare / calculate",
      pass: "one look is enough",
      explanation:
        "Like crossing the street — one look and you go. If you have to re-read, weigh things, or do a little math, you need a second look, and that's not a quick call anymore.",
    },
    branch: {
      q: "BRANCH",
      prompt: "Does it pick an action, or write an essay?",
      fail: "spits out a write-up",
      pass: "flips a switch",
      explanation:
        "Is the result just doing something — hit send or don't, grab it or leave it? Or do you have to sit down and write it out first? If it needs a write-up, take it to the office, not the fast lane.",
    },
  },
  modeHint: {
    mixed: "mix",
    fast_lane: "quick",
    decompose: "split",
    office: "deep",
  },
  settings: {
    open: "AI provider settings",
    title: "AI keys",
    blurb: "Your key, your browser. Server default works too.",
    signIn: "Sign in",
    logout: "Log out",
    loggedIn: "signed in",
    oauthHint: "PKCE → long-lived OpenRouter key (saved-auth cookie).",
    sourceLocal: "yours",
    sourceOauth: "or",
    sourceServer: "host",
    sourceNone: "off",
    keyPlaceholder: "API key (stored in this browser only)",
    modelPlaceholder: "model id",
    save: "save key",
    saved: "saved ✓",
    clear: "clear",
    cleared: "key cleared",
    test: "test key",
    testOk: "key works ✓",
    testFail: "key failed",
    keyRequired: "paste a key first",
    oauthCleared: "signed out",
    privacy: "Keys stay in localStorage / httpOnly cookie — never logged, never sent back.",
    serverOn: "Local host key:",
    usingModel: "using",
    cookieDefault: "cookie default",
    keyOptionalOauth: "API key optional (OpenRouter signed in)",
  },
};

const zhCN: Dict = {
  title: "你Jev了吗?",
  subtitle: "三问过一遍。这事能秒定，还是得慢慢来？",
  score: (c, a) => `${c}/${a} 全对`,
  source: { seed: "现成", llm: "现抽", custom: "你的" } as {
    seed: string;
    llm: string;
    custom: string;
  },
  mode: "口味",
  newLlm: "来点新的",
  custom: "你的",
  customOpen: "出我的题",
  customClose: "收起",
  customPlaceholder: "写下你的事，1–2 句… 比如：现在回消息还是等会儿回？",
  customSubmit: "让 AI 读",
  customJudging: "读题中…",
  customTooShort: "再多写几个字",
  generating: "想题中…",
  fellBack: "先拿现成的顶上。",
  scenario: "这事是",
  yourVerdict: "你选",
  rulePreview: "按你的勾选 →",
  verdictMismatch: "⚠ 你选的和你勾的对不上",
  check: "揭晓",
  dials: (n) => `${n}/3 关`,
  verdictOk: "选对 ✓",
  verdictBad: "选错 ✗",
  truth: "答案：",
  next: "下一题 →",
  loading: "稍等…",
  decomposePractice: "拆开练",
  whichSplit: "哪种拆法真的能用？（每一块都要三关全绿）",
  lockSplit: "就这个拆法",
  goodSplit: "正确拆法",
  splitOk: "✓ 每一块：选项固定 · 看一遍 · 能动手",
  footerRule:
    "一眼定不了 → office · 答案列不完 → decompose · 输出是小作文 → office · 否则 fast_lane",
  footerHint: "点一下翻转 · 你的选择该跟勾选一致",
  pass: "过",
  fail: "挂",
  truthLabel: "实际：",
  tapTo: "点 →",
  infoHint: "这关是啥？",
  popupClose: "懂了",
  dialsMeta: {
    menu: {
      q: "MENU",
      prompt: "还没看内容，答案能先列出来吗？",
      fail: "怎么写都写不完",
      pass: "就那几个选项",
      explanation:
        "现在就能把选项报出来吗？像看外卖菜单一样，就那几样——能，就直接挑。越想越多、列个没完，说明太散，先拆成几个小问题再选。",
    },
    glance: {
      q: "GLANCE",
      prompt: "扫一眼就定了？",
      fail: "得来回看 / 比一比 / 算一下",
      pass: "一遍就够",
      explanation:
        "像过马路，扫一眼就走。要是得重读、反复权衡、或者算一算，那就是还得再看一眼——已经不是秒定了。",
    },
    branch: {
      q: "BRANCH",
      prompt: "是做个动作，还是写篇文章？",
      fail: "交上来一段小作文",
      pass: "拨个开关",
      explanation:
        "结果是不是就一个动作——发还是不发、拿还是不拿？还是得坐下来先写一段？要写小作文的，进办公室，不进快车道。",
    },
  },
  modeHint: {
    mixed: "混着来",
    fast_lane: "秒定",
    decompose: "拆开",
    office: "费脑",
  },
  settings: {
    open: "AI 服务商设置",
    title: "AI 密钥",
    blurb: "密钥只在你浏览器里。服务器默认也能用。",
    signIn: "登录",
    logout: "退出",
    loggedIn: "已登录",
    oauthHint: "PKCE → 长期 OpenRouter 密钥（httpOnly cookie）。",
    sourceLocal: "你的",
    sourceOauth: "or",
    sourceServer: "主机",
    sourceNone: "关",
    keyPlaceholder: "API key（只存本浏览器）",
    modelPlaceholder: "模型 id",
    save: "保存密钥",
    saved: "已保存 ✓",
    clear: "清除",
    cleared: "密钥已清",
    test: "试一下",
    testOk: "密钥可用 ✓",
    testFail: "密钥不行",
    keyRequired: "先粘贴密钥",
    oauthCleared: "已退出登录",
    privacy: "密钥只在 localStorage / httpOnly cookie — 不回传、不记日志。",
    serverOn: "本机 host key：",
    usingModel: "当前模型",
    cookieDefault: "cookie 默认",
    keyOptionalOauth: "API key 可不填（OpenRouter 已登录）",
  },
};

const zhTW: Dict = {
  title: "你Jev了嗎?",
  subtitle: "三問過一遍。這事能秒定，還是得慢慢來？",
  score: (c, a) => `${c}/${a} 全對`,
  source: { seed: "現成", llm: "現抽", custom: "你的" } as {
    seed: string;
    llm: string;
    custom: string;
  },
  mode: "口味",
  newLlm: "來點新的",
  custom: "你的",
  customOpen: "出我的題",
  customClose: "收起",
  customPlaceholder: "寫下你的事，1–2 句… 比如：現在回訊息還是等會兒回？",
  customSubmit: "讓 AI 讀",
  customJudging: "讀題中…",
  customTooShort: "再多寫幾個字",
  generating: "想題中…",
  fellBack: "先拿現成的頂上。",
  scenario: "這事是",
  yourVerdict: "你選",
  rulePreview: "按你的勾選 →",
  verdictMismatch: "⚠ 你選的和你勾的對不上",
  check: "揭曉",
  dials: (n) => `${n}/3 關`,
  verdictOk: "選對 ✓",
  verdictBad: "選錯 ✗",
  truth: "答案：",
  next: "下一題 →",
  loading: "稍等…",
  decomposePractice: "拆開練",
  whichSplit: "哪種拆法真的能用？（每一塊都要三關全綠）",
  lockSplit: "就這個拆法",
  goodSplit: "正確拆法",
  splitOk: "✓ 每一塊：選項固定 · 看一遍 · 能動手",
  footerRule:
    "一眼定不了 → office · 答案列不完 → decompose · 輸出是小作文 → office · 否則 fast_lane",
  footerHint: "點一下翻轉 · 你的選擇該跟勾選一致",
  pass: "過",
  fail: "掛",
  truthLabel: "實際：",
  tapTo: "點 →",
  infoHint: "這關是什麼？",
  popupClose: "懂了",
  dialsMeta: {
    menu: {
      q: "MENU",
      prompt: "還沒看內容，答案能先列出來嗎？",
      fail: "怎麼寫都寫不完",
      pass: "就那幾個選項",
      explanation:
        "現在就能把選項報出來嗎？像看外賣菜單一樣，就那幾樣——能，就直接挑。越想越多、列個沒完，代表太散，先拆成幾個小問題再選。",
    },
    glance: {
      q: "GLANCE",
      prompt: "掃一眼就定了？",
      fail: "得來回看 / 比一比 / 算一下",
      pass: "一遍就夠",
      explanation:
        "像過馬路，掃一眼就走。要是得重讀、反覆權衡、或者算一算，那就是還得再看一眼——已經不是秒定了。",
    },
    branch: {
      q: "BRANCH",
      prompt: "是做個動作，還是寫篇文章？",
      fail: "交上來一段小作文",
      pass: "撥個開關",
      explanation:
        "結果是不是就一個動作——傳還是不傳、拿還是不拿？還是得坐下來先寫一段？要寫小作文的，進辦公室，不進快車道。",
    },
  },
  modeHint: {
    mixed: "混著來",
    fast_lane: "秒定",
    decompose: "拆開",
    office: "費腦",
  },
  settings: {
    open: "AI 服務商設定",
    title: "AI 金鑰",
    blurb: "金鑰只在你瀏覽器。伺服器預設也能用。",
    signIn: "登入",
    logout: "登出",
    loggedIn: "已登入",
    oauthHint: "PKCE → 長期 OpenRouter 金鑰（httpOnly cookie）。",
    sourceLocal: "你的",
    sourceOauth: "or",
    sourceServer: "主機",
    sourceNone: "關",
    keyPlaceholder: "API key（只存本瀏覽器）",
    modelPlaceholder: "模型 id",
    save: "儲存金鑰",
    saved: "已儲存 ✓",
    clear: "清除",
    cleared: "金鑰已清",
    test: "試一下",
    testOk: "金鑰可用 ✓",
    testFail: "金鑰不行",
    keyRequired: "先貼上金鑰",
    oauthCleared: "已登出",
    privacy: "金鑰只在 localStorage / httpOnly cookie — 不回傳、不記日誌。",
    serverOn: "本機 host key：",
    usingModel: "當前模型",
    cookieDefault: "cookie 預設",
    keyOptionalOauth: "API key 可不填（OpenRouter 已登入）",
  },
};

export const DICTS: Record<Locale, Dict> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
};

export function dict(locale: Locale): Dict {
  return DICTS[locale] ?? en;
}

/** Language + tone directive for generation prompts. */
export function languageDirective(locale: Locale): string {
  const casual = [
    "TONE: casual, spoken, everyday-life — like a friend describing a real moment.",
    "NOT academic, NOT paper-like, NOT enterprise jargon.",
    "Prefer tiny domestic scenes: plants, chats, snacks, bus, laundry, pets, roommates, group hangs, commuting, cooking, chores.",
    "Explanations sound like you talking to a friend — short, plain, no textbook words.",
  ].join("\n");

  switch (locale) {
    case "zh-CN":
      return [
        casual.replace("casual, spoken", "语气：口语、生活化、像朋友聊天"),
        "OUTPUT LANGUAGE: Simplified Chinese (简体中文).",
        "scenario / setting / explanations.* / decomposition fields / answers — all 简体中文.",
        "Keep only these English tokens: fast_lane, decompose, office, menu, glance, branch, PASS, FAIL, GitHub, JSON.",
      ].join("\n");
    case "zh-TW":
      return [
        casual.replace("casual, spoken", "語氣：口語、生活化、像朋友聊天"),
        "OUTPUT LANGUAGE: Traditional Chinese (繁體中文, Taiwan).",
        "scenario / setting / explanations.* / decomposition fields / answers — all 繁體中文.",
        "Taiwan wording: 程式 not 软件, 資訊 not 数据, 網路 not 网络, 訊息 not 消息.",
        "Keep only these English tokens: fast_lane, decompose, office, menu, glance, branch, PASS, FAIL, GitHub, JSON.",
      ].join("\n");
    default:
      return [
        casual,
        "OUTPUT LANGUAGE: English (casual spoken register).",
        "Write every user-facing string in English.",
      ].join("\n");
  }
}
