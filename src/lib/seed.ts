import type { QuizItem } from "./schema";
import type { Locale } from "./i18n";

/** Hand-authored seeds per locale — casual everyday scenes. */

const en: QuizItem[] = [
  {
    scenario: "Your pothos leaf went yellow. Water it or leave it?",
    setting: "One sad leaf on the windowsill.",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "Just two — water or don't — you already know the list.",
      glance: "One look at the leaf. Done.",
      branch: "You tip the watering can, or you don't.",
      verdict: "All three green → fast_lane.",
    },
    decomposition: null,
  },
  {
    scenario: "Friend texts 'I'm fine.' Buy it, or poke them again?",
    setting: "One bubble in the chat.",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{buy it, poke} — short list before you read the vibe.",
      glance: "Tone and timing in one glance.",
      branch: "You send 'ok' or 'wanna talk?' — either way you hit send.",
      verdict: "All three green → fast_lane.",
    },
    decomposition: null,
  },
  {
    scenario: "The rice cooker says it's done. Unplug it now, or let it keep warm?",
    setting: "Kitchen counter, one beep just went off.",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{unplug, keep warm} — two buttons, known up front.",
      glance: "The beep + the light is the whole story.",
      branch: "Hand goes to the plug, or to the warm button.",
      verdict: "All three green → fast_lane.",
    },
    decomposition: null,
  },
  {
    scenario:
      "Clear your messy inbox: figure out which of 200 emails matter and write a reply to each.",
    setting: "Inbox export, half the threads talk to each other.",
    dials: { menu: false, glance: false, branch: false },
    verdict: "office",
    explanations: {
      menu: "Replies aren't a short list — each one is its own little essay.",
      glance: "You can't settle 200 chatty threads in one pass.",
      branch: "Output is letters, not switches.",
      verdict: "Glance dies first → office. Even cut up, the drafts stay prose.",
    },
    decomposition: null,
  },
  {
    scenario: "Is this person a good fit for the roommate spot?",
    setting: "One chat history and a vague 'must be clean-ish' note.",
    dials: { menu: false, glance: true, branch: false },
    verdict: "office",
    explanations: {
      menu: "'Good fit' has no fixed list — vibes, schedules, feelings…",
      glance: "You can read the chat once.",
      branch: "You'd write a whole paragraph of judgment, not a yes/no switch.",
      verdict: "Menu already shaky; branch fails → office.",
    },
    decomposition: null,
  },
  {
    scenario: "Decide which saved articles are worth sending to the group chat.",
    setting: "A pile of tabs; keep/drop has a fixed threshold.",
    dials: { menu: false, glance: true, branch: true },
    verdict: "decompose",
    explanations: {
      menu: "'Worth sending' hides several little calls — not one closed answer.",
      glance: "One skim of an article is enough.",
      branch: "Send or skip is a switch.",
      verdict: "Menu fails, other two hold → cut it into tiny checks.",
    },
    decomposition: {
      why: "'Worth it?' is mush. Chop it into yes/nos your thumb can flip.",
      subJudgments: [
        {
          question: "Does it mention someone in the chat by name?",
          answers: ["yes", "no"],
        },
        {
          question: "Is it under 5 minutes to read?",
          answers: ["yes", "no"],
        },
        {
          question: "Did we already send a link like this this week?",
          answers: ["yes", "no"],
        },
      ],
      distractors: [
        {
          text: "Split by how smart it feels, how pretty, and how much you liked it",
          whyWrong: "Those aren't send/skip switches — still vibes.",
        },
        {
          text: "Split into 'read now', 'read later', 'maybe someday'",
          whyWrong: "Three fuzzy moods, not facts you can list — menu still open.",
        },
      ],
    },
  },
  {
    scenario: "Check if tomorrow is a workday so you can set the alarm.",
    setting: "Today's date + a fixed holiday list in your calendar app.",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{workday, not} — closed before you check the date.",
      glance: "Date + list, one look.",
      branch: "Alarm on, or sleep in — a switch.",
      verdict: "All three green → fast_lane.",
    },
    decomposition: null,
  },
  {
    scenario:
      "Tag this group-chat message as joke, plan, or drama — then notice if it's a repeat of an old thread.",
    setting: "One message; a scroll of history behind it.",
    dials: { menu: true, glance: false, branch: true },
    verdict: "office",
    explanations: {
      menu: "{joke, plan, drama} — short list up front.",
      glance: "Tagging one line is one look; finding the old thread means comparing the whole scroll.",
      branch: "Tag is a switch — but glance already failed.",
      verdict: "Glance fails → office. (The 'is this a rerun' part is its own multi-look job.)",
    },
    decomposition: null,
  },
];

const zhCN: QuizItem[] = [
  {
    scenario: "绿萝有片叶子黄了。浇，还是先别动？",
    setting: "窗台上那一片蔫叶子。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "就俩 — 浇 / 不浇 — 不看也知道。",
      glance: "瞄一眼叶子，够了。",
      branch: "拿起水壶，或者不拿。",
      verdict: "三关全绿 → fast_lane。",
    },
    decomposition: null,
  },
  {
    scenario: "朋友发来「我没事」。信，还是再追问一句？",
    setting: "聊天里就那一口气泡。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{信, 追问} — 看之前就俩选项。",
      glance: "语气和时间，一眼的事。",
      branch: "发「好的」还是发「要不要出来坐坐」— 反正都得点发送。",
      verdict: "三关全绿 → fast_lane。",
    },
    decomposition: null,
  },
  {
    scenario: "电饭煲跳保温了。现在拔插头，还是让它保温着？",
    setting: "厨房台面，刚「嘀」了一声。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{拔电, 保温} — 两个按钮，事先清楚。",
      glance: "一声嘀 + 指示灯，看完就懂。",
      branch: "手伸向插头，或伸向保温键。",
      verdict: "三关全绿 → fast_lane。",
    },
    decomposition: null,
  },
  {
    scenario:
      "清一下乱糟糟的收件箱：200 封里哪些要紧，还得每封都回一段。",
    setting: "整个收件箱导出，一半邮件互相套着。",
    dials: { menu: false, glance: false, branch: false },
    verdict: "office",
    explanations: {
      menu: "回信不是几个固定选项 — 封封都得现编。",
      glance: "200 条缠在一起的，一遍看不完。",
      branch: "交出去的是信，不是开关。",
      verdict: "glance 先挂 → office。拆开了，草稿还是文章。",
    },
    decomposition: null,
  },
  {
    scenario: "这人适合来当室友吗？",
    setting: "一段聊天记录，外加「爱干净就行」这种模糊条件。",
    dials: { menu: false, glance: true, branch: false },
    verdict: "office",
    explanations: {
      menu: "「合适」没有固定几条 — 气场、作息、习惯全掺着。",
      glance: "聊天可以一遍读完。",
      branch: "你得写一小段评价，不是按个行/不行。",
      verdict: "menu 本来就不牢；branch 也挂 → office。",
    },
    decomposition: null,
  },
  {
    scenario: "从收藏的文章里挑几篇丢进群聊。",
    setting: "一堆标签页；留/丢有条固定线。",
    dials: { menu: false, glance: true, branch: true },
    verdict: "decompose",
    explanations: {
      menu: "「值不值得发」里藏着好几件事 — 不是一个封闭答案。",
      glance: "一篇扫一遍就够。",
      branch: "发 / 不发是开关。",
      verdict: "menu 挂了，另两关还行 → 切成几个小检查。",
    },
    decomposition: {
      why: "「值吗？」太糊。切成拇指能按的是非题。",
      subJudgments: [
        {
          question: "文中有没有点名群里某个人？",
          answers: ["有", "没有"],
        },
        {
          question: "五分钟内读得完吗？",
          answers: ["能", "不能"],
        },
        {
          question: "这周是不是已经发过类似的了？",
          answers: ["发过", "没发过"],
        },
      ],
      distractors: [
        {
          text: "按「显得多有深度」「好不好看」「你多喜欢」来拆",
          whyWrong: "这些不是发/不发的开关 — 还是凭感觉。",
        },
        {
          text: "拆成「现在精读」「稍后再说」「以后可能」",
          whyWrong: "三种模糊心情，列不成事实 — menu 还是开的。",
        },
      ],
    },
  },
  {
    scenario: "看一眼明天是不是工作日，好决定要不要上闹钟。",
    setting: "今天的日期 + 日历里固定的假期表。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{工作日, 不是} — 日期没到就先封好。",
      glance: "日期加表，扫一眼。",
      branch: "上闹钟还是睡懒觉 — 拨一下。",
      verdict: "三关全绿 → fast_lane。",
    },
    decomposition: null,
  },
  {
    scenario:
      "把群聊这条标成玩笑、约局还是撕逼 — 再看看是不是老话题重提。",
    setting: "一条消息；后面还有一串历史。",
    dials: { menu: true, glance: false, branch: true },
    verdict: "office",
    explanations: {
      menu: "{玩笑, 约局, 撕逼} — 事先就这几个。",
      glance: "标一条是一眼；翻旧账得把整串拿来比。",
      branch: "打标是开关 — 但 glance 已经挂了。",
      verdict: "glance 挂 → office。（「是不是重播」是另一件要来回看的活。）",
    },
    decomposition: null,
  },
];

const zhTW: QuizItem[] = [
  {
    scenario: "黃金葛有片葉子黃了。澆水，還是先別動？",
    setting: "窗台上那一片蔫掉的葉子。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "就倆 — 澆 / 不澆 — 不看也知道。",
      glance: "瞄一眼葉子，夠了。",
      branch: "拿起水壺，或者不拿。",
      verdict: "三關全綠 → fast_lane。",
    },
    decomposition: null,
  },
  {
    scenario: "朋友傳來「我沒事」。信，還是再追問一句？",
    setting: "聊天裡就那一顆氣泡。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{信, 追問} — 看之前就倆選項。",
      glance: "語氣和時間，一眼的事。",
      branch: "傳「好的」還是傳「要不要出來坐坐」— 反正都得按送出。",
      verdict: "三關全綠 → fast_lane。",
    },
    decomposition: null,
  },
  {
    scenario: "電鍋跳保溫了。現在拔插頭，還是讓它保溫著？",
    setting: "廚房檯面，剛「嗶」了一聲。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{拔電, 保溫} — 兩個按鈕，事先清楚。",
      glance: "一聲嗶 + 指示燈，看完就懂。",
      branch: "手伸向插頭，或伸向保溫鍵。",
      verdict: "三關全綠 → fast_lane。",
    },
    decomposition: null,
  },
  {
    scenario:
      "清一下亂糟糟的收件匣：200 封裡哪些要緊，還得每封都回一段。",
    setting: "整個收件匣匯出，一半郵件互相套著。",
    dials: { menu: false, glance: false, branch: false },
    verdict: "office",
    explanations: {
      menu: "回信不是幾個固定選項 — 封封都得現編。",
      glance: "200 條纏在一起的，一遍看不完。",
      branch: "交出去的是信，不是開關。",
      verdict: "glance 先掛 → office。拆開了，草稿還是文章。",
    },
    decomposition: null,
  },
  {
    scenario: "這人適合來當室友嗎？",
    setting: "一段聊天記錄，外加「愛乾淨就行」這種模糊條件。",
    dials: { menu: false, glance: true, branch: false },
    verdict: "office",
    explanations: {
      menu: "「合適」沒有固定幾條 — 氣場、作息、習慣全摻著。",
      glance: "聊天可以一遍讀完。",
      branch: "你得寫一小段評價，不是按個行/不行。",
      verdict: "menu 本來就不牢；branch 也掛 → office。",
    },
    decomposition: null,
  },
  {
    scenario: "從收藏的文章裡挑幾篇丟進群組。",
    setting: "一堆分頁；留/丟有條固定線。",
    dials: { menu: false, glance: true, branch: true },
    verdict: "decompose",
    explanations: {
      menu: "「值不值得發」裡藏著好幾件事 — 不是一個封閉答案。",
      glance: "一篇掃一遍就夠。",
      branch: "發 / 不發是開關。",
      verdict: "menu 掛了，另兩關還行 → 切成幾個小檢查。",
    },
    decomposition: {
      why: "「值嗎？」太糊。切成拇指能按的是非題。",
      subJudgments: [
        {
          question: "文中有没有點名群裡某個人？",
          answers: ["有", "沒有"],
        },
        {
          question: "五分鐘內讀得完嗎？",
          answers: ["能", "不能"],
        },
        {
          question: "這週是不是已經發過類似的了？",
          answers: ["發過", "沒發過"],
        },
      ],
      distractors: [
        {
          text: "按「顯得多有深度」「好不好看」「你多喜歡」來拆",
          whyWrong: "這些不是發/不發的開關 — 還是憑感覺。",
        },
        {
          text: "拆成「現在精讀」「稍後再說」「以後可能」",
          whyWrong: "三種模糊心情，列不成事實 — menu 還是開的。",
        },
      ],
    },
  },
  {
    scenario: "看一眼明天是不是工作日，好決定要不要上鬧鐘。",
    setting: "今天的日期 + 日曆裡固定的假期表。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{工作日, 不是} — 日期沒到就先封好。",
      glance: "日期加表，掃一眼。",
      branch: "上鬧鐘還是睡懶覺 — 撥一下。",
      verdict: "三關全綠 → fast_lane。",
    },
    decomposition: null,
  },
  {
    scenario:
      "把群組這則標成玩笑、約局還是撕逼 — 再看看是不是老話題重提。",
    setting: "一則訊息；後面還有一串歷史。",
    dials: { menu: true, glance: false, branch: true },
    verdict: "office",
    explanations: {
      menu: "{玩笑, 約局, 撕逼} — 事先就這幾個。",
      glance: "標一則是一眼；翻舊帳得把整串拿來比。",
      branch: "標籤是開關 — 但 glance 已經掛了。",
      verdict: "glance 掛 → office。（「是不是重播」是另一件要來回看的活。）",
    },
    decomposition: null,
  },
];

export const SEEDS_BY_LOCALE: Record<Locale, QuizItem[]> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
};

/** @deprecated prefer SEEDS_BY_LOCALE — English pool. */
export const SEEDS: QuizItem[] = en;

export function seedsFor(locale: Locale): QuizItem[] {
  return SEEDS_BY_LOCALE[locale] ?? en;
}
