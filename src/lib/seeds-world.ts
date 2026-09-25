import type { QuizItem } from "./schema";

/**
 * World-work seeds — organized by verdict so each mode drills what it claims:
 *
 *   fast_lane  — one glance over a closed menu, the answer feeds code
 *   decompose  — the whole is too big for one call, but each part is Jev-shaped
 *   office     — generation, reasoning, or the answer *is* the artifact
 *
 * Includes the boundary case (sort 1000 integers): a menu exists but the
 * glance can't do the work — proof that "enumerable" alone isn't enough.
 */

const en: QuizItem[] = [
  // ── fast_lane ─────────────────────────────────────────────────────────
  {
    scenario:
      "Support ticket lands: 'My card was charged twice.' Send it to billing, fraud, refund, or tech?",
    setting: "One ticket in the queue; the four team inboxes already exist.",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{billing, fraud, refund, tech} — the inboxes came first, the options with them.",
      glance: "One read of the ticket names the culprit.",
      branch: "It's a route — the ticket drops into one queue and code takes over.",
      verdict: "All three green → fast_lane.",
    },
    decomposition: null,
  },
  {
    scenario: "A new comment on your post: let it through, hold it, or delete it?",
    setting: "One comment box; the moderation setting has exactly three positions.",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{allow, hold, reject} — three buttons, known before you read.",
      glance: "One skim says spam or not.",
      branch: "The comment posts, sits in review, or dies.",
      verdict: "All three green → fast_lane.",
    },
    decomposition: null,
  },
  {
    scenario:
      "Someone types 'best cheap laptop 2025' — send them browsing, to a comparison, or straight to checkout?",
    setting: "One search bar; three ranking strategies wired up behind it.",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{browse, compare, buy} — three plays, decided in advance.",
      glance: "The query itself is the whole read.",
      branch: "Pick a strategy; code re-sorts the results.",
      verdict: "All three green → fast_lane.",
    },
    decomposition: null,
  },

  // ── decompose ─────────────────────────────────────────────────────────
  {
    scenario:
      "Process a stack of invoices end to end: who sent it, what's on each line, do the totals add up?",
    setting: "A pile of PDF invoices; an accounting rule for mismatches.",
    dials: { menu: false, glance: true, branch: true },
    verdict: "decompose",
    explanations: {
      menu: "The whole isn't one closed answer — vendor, line items, and totals are separate calls.",
      glance: "One invoice is one read.",
      branch: "Every answer feeds the ledger — switches and slots, not prose.",
      verdict: "Menu fails, the other two hold → cut it into small checks.",
    },
    decomposition: {
      why: "'Process the invoice' is too whole. Chop it into yes/nos on a single ticket.",
      subJudgments: [
        {
          question: "Is the sender on the approved vendor list?",
          answers: ["yes", "no"],
        },
        {
          question: "Does each line's price match the catalog?",
          answers: ["match", "mismatch"],
        },
        {
          question: "Does the total equal the sum of the lines?",
          answers: ["adds up", "doesn't"],
        },
      ],
      distractors: [
        {
          text: "Split by reading it aloud, summarizing it, and rating how legit it feels",
          whyWrong: "None of those are switches — still vibes.",
        },
        {
          text: "Split into small, medium, and large invoices",
          whyWrong: "Three fuzzy moods, not facts you can list — menu still open.",
        },
      ],
    },
  },
  {
    scenario: "Screen a pile of résumés for one job posting — who makes the shortlist?",
    setting: "40 PDFs and a job description with hard requirements.",
    dials: { menu: false, glance: true, branch: true },
    verdict: "decompose",
    explanations: {
      menu: "'Good candidate' hides several calls — skills, years, location — not one closed answer.",
      glance: "One résumé is one read.",
      branch: "Shortlist yes/no per person; code ranks the yeses.",
      verdict: "Menu fails, the other two hold → split into small checks.",
    },
    decomposition: {
      why: "'Good fit?' is mush. Turn it into yes/nos the JD already fixed.",
      subJudgments: [
        {
          question: "Does the résumé name a required skill?",
          answers: ["yes", "no"],
        },
        {
          question: "Are the years of experience enough?",
          answers: ["enough", "not enough"],
        },
        {
          question: "Is the location or visa workable?",
          answers: ["workable", "no"],
        },
      ],
      distractors: [
        {
          text: "Split by 'impressive, average, meh'",
          whyWrong: "Not switches — a gut reading in three costumes.",
        },
        {
          text: "Split into 'read fully, skim, skip'",
          whyWrong: "Three fuzzy moods, not listable facts — menu still open.",
        },
      ],
    },
  },
  {
    scenario: "Mine a product's reviews: which aspects get praised, which get burned?",
    setting: "500 reviews; a dashboard with aspect × mood cells.",
    dials: { menu: false, glance: true, branch: true },
    verdict: "decompose",
    explanations: {
      menu: "'What do people think' is many answers — aspect and mood are two separate dials.",
      glance: "One review is one read.",
      branch: "Each review drops a vote into an aspect × mood cell; code tallies.",
      verdict: "Menu fails, the other two hold → two judgments per review.",
    },
    decomposition: {
      why: "'What do they think?' is two dials wearing one coat. Ask them apart.",
      subJudgments: [
        {
          question: "Which aspect is this review about?",
          answers: ["price", "quality", "shipping"],
        },
        {
          question: "And the mood?",
          answers: ["praise", "burn", "neutral"],
        },
      ],
      distractors: [
        {
          text: "Split by long review, short review, five stars or not",
          whyWrong: "Star rating isn't an aspect — the cells stay empty.",
        },
        {
          text: "Sort the reviews by date and read them yourself",
          whyWrong: "No switches anywhere — the whole job is still whole.",
        },
      ],
    },
  },

  // ── office ────────────────────────────────────────────────────────────
  {
    scenario: "Answer an RFP: write a proposal that wins the bid.",
    setting: "A 20-page RFP and your last winning deck.",
    dials: { menu: false, glance: false, branch: false },
    verdict: "office",
    explanations: {
      menu: "Proposals aren't a list — every bid is its own essay.",
      glance: "Twenty pages plus your history — no single pass.",
      branch: "The deliverable *is* the document, not a switch.",
      verdict: "Glance dies first → office. Even cut up, the pieces stay prose.",
    },
    decomposition: null,
  },
  {
    scenario: "Churn jumped 40% this quarter — figure out why.",
    setting: "Dashboards, tickets, exit interviews; no suspects yet.",
    dials: { menu: false, glance: false, branch: false },
    verdict: "office",
    explanations: {
      menu: "Explanations aren't enumerable — 'why' opens, it doesn't close.",
      glance: "Several sources and hypotheses to chase — not one read.",
      branch: "The answer is a story you'll write, not a switch.",
      verdict: "All three red → office. Hypothesis work is System Two.",
    },
    decomposition: null,
  },
  {
    scenario: "Sort 1000 integers: evens before odds, each half ascending.",
    setting: "The boundary case — a menu exists, and it still doesn't help.",
    dials: { menu: true, glance: false, branch: true },
    verdict: "office",
    explanations: {
      menu: "Trivially enumerable — the sorted order is one fixed answer.",
      glance: "Fails. Recognition isn't computation — the work must actually get done.",
      branch: "The output would feed code — but glance already failed.",
      verdict: "Menu passes, glance fails → office. 'Enumerable' alone isn't enough.",
    },
    decomposition: null,
  },
];

const zhCN: QuizItem[] = [
  // ── fast_lane ─────────────────────────────────────────────────────────
  {
    scenario: "工单进来了：「我的卡被扣了两次钱。」转给账单、反诈、退款还是技术？",
    setting: "队列里一条工单；四个组的收件箱早就建好了。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{账单, 反诈, 退款, 技术} — 收件箱先有，选项跟着就有。",
      glance: "读一遍工单，该去哪儿自报家门。",
      branch: "这是个路由：丢进对的队列，剩下的代码接手。",
      verdict: "三关全绿 → fast_lane。",
    },
    decomposition: null,
  },
  {
    scenario: "帖子下面来了条新评论：放行、押后，还是删掉？",
    setting: "一个评论框；审核设置里就三档。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{放行, 押后, 删除} — 没读之前按钮就仨。",
      glance: "扫一眼就知道是不是垃圾。",
      branch: "评论发出、进待审，或消失。",
      verdict: "三关全绿 → fast_lane。",
    },
    decomposition: null,
  },
  {
    scenario: "有人搜「2025 值得买的便宜笔记本」— 让他随便逛、看对比，还是直达下单页？",
    setting: "一个搜索框；后面接着三种排序策略。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{逛, 比, 买} — 三种打法，事先定好。",
      glance: "搜索词本身就是全部。",
      branch: "选个策略，代码把结果重排。",
      verdict: "三关全绿 → fast_lane。",
    },
    decomposition: null,
  },

  // ── decompose ─────────────────────────────────────────────────────────
  {
    scenario: "整批发票过一遍：谁开的、每行是什么、总数对不对得上？",
    setting: "一沓 PDF 发票；账务那里有条对不上的处理规则。",
    dials: { menu: false, glance: true, branch: true },
    verdict: "decompose",
    explanations: {
      menu: "整件事不是一个封闭答案 — 抬头、明细、合计是三件独立的小判断。",
      glance: "一张发票读一遍，够。",
      branch: "每个判断都喂进账本 — 是开关和格子，不是文章。",
      verdict: "menu 挂了，另两关还行 → 切成几个小检查。",
    },
    decomposition: {
      why: "「过一遍发票」太整。切成一张票上的几个是非题。",
      subJudgments: [
        {
          question: "开票方在合作名单里吗？",
          answers: ["在", "不在"],
        },
        {
          question: "每行单价和目录对得上吗？",
          answers: ["一致", "对不上"],
        },
        {
          question: "合计等于各行之和吗？",
          answers: ["对得上", "对不上"],
        },
      ],
      distractors: [
        {
          text: "拆成「念一遍发票、总结一遍、凭感觉打个可信度」",
          whyWrong: "这些不是开关 — 还是凭感觉。",
        },
        {
          text: "拆成「小额、中额、大额发票」",
          whyWrong: "三种模糊档位，列不成事实 — menu 还是开的。",
        },
      ],
    },
  },
  {
    scenario: "给一个职位初筛一沓简历 — 谁进短名单？",
    setting: "40 份 PDF；JD 上写着硬性条件。",
    dials: { menu: false, glance: true, branch: true },
    verdict: "decompose",
    explanations: {
      menu: "「合不合适」藏着好几件事 — 技能、年限、地点 — 不是一个封闭答案。",
      glance: "一份简历读一遍。",
      branch: "每人一个进/不进；代码再给「进」的排名。",
      verdict: "menu 挂了，另两关还行 → 切成几个小检查。",
    },
    decomposition: {
      why: "「合适吗？」太糊。切成 JD 早就定好的是非题。",
      subJudgments: [
        {
          question: "简历里写了 JD 要求的技能吗？",
          answers: ["写了", "没写"],
        },
        {
          question: "年限够吗？",
          answers: ["够", "不够"],
        },
        {
          question: "地点或签证能办吗？",
          answers: ["能", "不能"],
        },
      ],
      distractors: [
        {
          text: "拆成「惊艳、一般、拉倒」",
          whyWrong: "不是开关 — 换了三身衣服的凭感觉。",
        },
        {
          text: "拆成「精读、略读、跳过」",
          whyWrong: "三种模糊心情，列不成事实 — menu 还是开的。",
        },
      ],
    },
  },
  {
    scenario: "挖一挖产品的评价：哪些方面被夸，哪些被骂？",
    setting: "500 条评价；看板上有「方面 × 情绪」的格子。",
    dials: { menu: false, glance: true, branch: true },
    verdict: "decompose",
    explanations: {
      menu: "「大家怎么想」是好多答案 — 方面和情绪是两个拨盘。",
      glance: "一条评价读一遍。",
      branch: "每条评价往「方面 × 情绪」的格子里投一票；代码负责数。",
      verdict: "menu 挂了，另两关还行 → 每条评两个判断。",
    },
    decomposition: {
      why: "「怎么想」是穿着一件外套的两个拨盘。拆开来问。",
      subJudgments: [
        {
          question: "这条评价说的是哪方面？",
          answers: ["价格", "质量", "物流"],
        },
        {
          question: "情绪呢？",
          answers: ["夸", "骂", "中性"],
        },
      ],
      distractors: [
        {
          text: "拆成「长评、短评、五星与否」",
          whyWrong: "星级不是方面 — 格子还是空的。",
        },
        {
          text: "按日期排好，自己慢慢读",
          whyWrong: "哪儿都没有开关 — 整件事还是整件事。",
        },
      ],
    },
  },

  // ── office ────────────────────────────────────────────────────────────
  {
    scenario: "应一份 RFP：写出能中标的标书。",
    setting: "20 页的招标书；你上次的方案 deck。",
    dials: { menu: false, glance: false, branch: false },
    verdict: "office",
    explanations: {
      menu: "标书列不成选项 — 每份都是现写的文章。",
      glance: "20 页加你的历史 — 一遍看不完。",
      branch: "交出去的成果就是文档本身，不是开关。",
      verdict: "glance 先挂 → office。就算拆开，每块还是文章。",
    },
    decomposition: null,
  },
  {
    scenario: "这季度流失率涨了 40% — 查查为什么。",
    setting: "看板、工单、退出访谈；嫌疑人还没影。",
    dials: { menu: false, glance: false, branch: false },
    verdict: "office",
    explanations: {
      menu: "原因列不成清单 — 「为什么」是开的，不是封的。",
      glance: "好几个来源、好几个假设 — 不是一遍的事。",
      branch: "答案是你要写的一段话，不是开关。",
      verdict: "三关全红 → office。找原因是 System Two 的活。",
    },
    decomposition: null,
  },
  {
    scenario: "1000 个整数排个序：偶数在前，各自升序。",
    setting: "边界案例 — 菜单有，照样没用。",
    dials: { menu: true, glance: false, branch: true },
    verdict: "office",
    explanations: {
      menu: "封闭得很 — 排好的顺序就一个答案。",
      glance: "挂。认出来不等于算出来 — 活儿得真干。",
      branch: "答案确实喂代码 — 但 glance 已经挂了。",
      verdict: "menu 过了，glance 挂 → office。「列得出来」本身不够。",
    },
    decomposition: null,
  },
];

const zhTW: QuizItem[] = [
  // ── fast_lane ─────────────────────────────────────────────────────────
  {
    scenario: "工單進來了：「我的卡被扣了兩次錢。」轉給帳單、反詐、退款還是技術？",
    setting: "佇列裡一張工單；四個組的信箱早就建好了。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{帳單, 反詐, 退款, 技術} — 信箱先有，選項跟著就有。",
      glance: "讀一遍工單，該去哪裡自己報上名來。",
      branch: "這是個路由：丟進對的佇列，剩下的程式接手。",
      verdict: "三關全綠 → fast_lane。",
    },
    decomposition: null,
  },
  {
    scenario: "貼文下面來了則新留言：放行、押後，還是刪掉？",
    setting: "一個留言框；審核設定裡就三檔。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{放行, 押後, 刪除} — 沒讀之前按鈕就三個。",
      glance: "掃一眼就知道是不是垃圾。",
      branch: "留言送出、進待審，或消失。",
      verdict: "三關全綠 → fast_lane。",
    },
    decomposition: null,
  },
  {
    scenario: "有人搜「2025 值得買的便宜筆電」— 讓他隨便逛、看比較，還是直達下單頁？",
    setting: "一個搜尋框；後面接著三種排序策略。",
    dials: { menu: true, glance: true, branch: true },
    verdict: "fast_lane",
    explanations: {
      menu: "{逛, 比, 買} — 三種打法，事先定好。",
      glance: "搜尋詞本身就是全部。",
      branch: "選個策略，程式把結果重排。",
      verdict: "三關全綠 → fast_lane。",
    },
    decomposition: null,
  },

  // ── decompose ─────────────────────────────────────────────────────────
  {
    scenario: "整批發票過一遍：誰開的、每行是什麼、總數對不對得上？",
    setting: "一疊 PDF 發票；帳務那裡有條對不上的處理規則。",
    dials: { menu: false, glance: true, branch: true },
    verdict: "decompose",
    explanations: {
      menu: "整件事不是一個封閉答案 — 廠商、明細、合計是三件獨立的小判斷。",
      glance: "一張發票讀一遍，夠。",
      branch: "每個判斷都餵進帳本 — 是開關和格子，不是文章。",
      verdict: "menu 掛了，另兩關還行 → 切成幾個小檢查。",
    },
    decomposition: {
      why: "「過一遍發票」太整。切成一張票上的幾個是非題。",
      subJudgments: [
        {
          question: "開票方在合作名單裡嗎？",
          answers: ["在", "不在"],
        },
        {
          question: "每行單價和目錄對得上嗎？",
          answers: ["一致", "對不上"],
        },
        {
          question: "合計等於各行之和嗎？",
          answers: ["對得上", "對不上"],
        },
      ],
      distractors: [
        {
          text: "拆成「唸一遍發票、摘要一遍、憑感覺打個可信度」",
          whyWrong: "這些不是開關 — 還是憑感覺。",
        },
        {
          text: "拆成「小額、中額、大額發票」",
          whyWrong: "三種模糊檔位，列不成事實 — menu 還是開的。",
        },
      ],
    },
  },
  {
    scenario: "幫一個職位初篩一疊履歷 — 誰進短名單？",
    setting: "40 份 PDF；職缺說明寫著硬性條件。",
    dials: { menu: false, glance: true, branch: true },
    verdict: "decompose",
    explanations: {
      menu: "「合不合適」藏著好幾件事 — 技能、年資、地點 — 不是一個封閉答案。",
      glance: "一份履歷讀一遍。",
      branch: "每人一個進/不進；程式再給「進」的排名。",
      verdict: "menu 掛了，另兩關還行 → 切成幾個小檢查。",
    },
    decomposition: {
      why: "「合適嗎？」太糊。切成職缺早就定好的是非題。",
      subJudgments: [
        {
          question: "履歷裡寫了職缺要求的技能嗎？",
          answers: ["寫了", "沒寫"],
        },
        {
          question: "年資夠嗎？",
          answers: ["夠", "不夠"],
        },
        {
          question: "地點或簽證能辦嗎？",
          answers: ["能", "不能"],
        },
      ],
      distractors: [
        {
          text: "拆成「驚豔、普通、算了」",
          whyWrong: "不是開關 — 換了三身衣服的憑感覺。",
        },
        {
          text: "拆成「精讀、略讀、跳過」",
          whyWrong: "三種模糊心情，列不成事實 — menu 還是開的。",
        },
      ],
    },
  },
  {
    scenario: "挖一挖產品的評價：哪些方面被誇，哪些被罵？",
    setting: "500 則評價；看板上有「方面 × 情緒」的格子。",
    dials: { menu: false, glance: true, branch: true },
    verdict: "decompose",
    explanations: {
      menu: "「大家怎麼想」是好多答案 — 方面和情緒是兩個撥盤。",
      glance: "一則評價讀一遍。",
      branch: "每則評價往「方面 × 情緒」的格子裡投一票；程式負責數。",
      verdict: "menu 掛了，另兩關還行 → 每則評兩個判斷。",
    },
    decomposition: {
      why: "「怎麼想」是穿著一件外套的兩個撥盤。拆開來問。",
      subJudgments: [
        {
          question: "這則評價說的是哪方面？",
          answers: ["價格", "品質", "物流"],
        },
        {
          question: "情緒呢？",
          answers: ["誇", "罵", "中性"],
        },
      ],
      distractors: [
        {
          text: "拆成「長評、短評、五星與否」",
          whyWrong: "星級不是方面 — 格子還是空的。",
        },
        {
          text: "按日期排好，自己慢慢讀",
          whyWrong: "哪裡都沒有開關 — 整件事還是整件事。",
        },
      ],
    },
  },

  // ── office ────────────────────────────────────────────────────────────
  {
    scenario: "應一份 RFP：寫出能得標的提案書。",
    setting: "20 頁的招標文件；你上次的簡報 deck。",
    dials: { menu: false, glance: false, branch: false },
    verdict: "office",
    explanations: {
      menu: "提案書列不成選項 — 每份都是現寫的文章。",
      glance: "20 頁加你的歷史 — 一遍看不完。",
      branch: "交出去的成果就是文件本身，不是開關。",
      verdict: "glance 先掛 → office。就算拆開，每塊還是文章。",
    },
    decomposition: null,
  },
  {
    scenario: "這季流失率漲了 40% — 查查為什麼。",
    setting: "看板、工單、離職訪談；嫌疑人還沒影。",
    dials: { menu: false, glance: false, branch: false },
    verdict: "office",
    explanations: {
      menu: "原因列不成清單 — 「為什麼」是開的，不是封的。",
      glance: "好幾個來源、好幾個假設 — 不是一遍的事。",
      branch: "答案是你要寫的一段話，不是開關。",
      verdict: "三關全紅 → office。找原因是 System Two 的活。",
    },
    decomposition: null,
  },
  {
    scenario: "1000 個整數排個序：偶數在前，各自升冪。",
    setting: "邊界案例 — 菜單有，照樣沒用。",
    dials: { menu: true, glance: false, branch: true },
    verdict: "office",
    explanations: {
      menu: "封閉得很 — 排好的順序就一個答案。",
      glance: "掛。認出來不等於算出來 — 活兒得真幹。",
      branch: "答案確實餵程式 — 但 glance 已經掛了。",
      verdict: "menu 過了，glance 掛 → office。「列得出來」本身不夠。",
    },
    decomposition: null,
  },
];

export const WORLD_SEEDS_BY_LOCALE = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
} as const;
