import type { Source } from './model';
import type { EvidenceRef } from './research-model';

// Supplemental checks for the conclusion-first state explanations.
export const briefingLensSources: Source[] = [
  {
    "sourceId": "briefing-dfp-ak-tables-20260817",
    "title": "Alaska Survey — Ranked-choice vote and transfer scenarios",
    "publisher": "Data for Progress",
    "url": "https://www.filesforprogress.org/datasets/2026/8/dfp_alaska_aug_2026.pdf",
    "publishedAt": "2026-08-17",
    "referencePeriod": "2026年7月28日〜8月4日、投票予定者605人、設問21〜26",
    "retrievedAt": "2026-09-25",
    "contentVerifiedAt": "2026-09-25"
  },
  {
    "sourceId": "briefing-alaska-rcv",
    "title": "Ranked Choice Voting — Terms and Definitions",
    "publisher": "Alaska Division of Elections",
    "url": "https://www.elections.alaska.gov/election-results/e/?id=24genr",
    "publishedAt": null,
    "referencePeriod": "順位付け投票の再配分と、次順位がない票の扱い（公式の集計用語説明）",
    "retrievedAt": "2026-09-25",
    "contentVerifiedAt": "2026-09-25"
  },
  {
    "sourceId": "briefing-fox-oh-crosstabs-20260813",
    "title": "Ohio Registered Voters — August 6–10, 2026 Crosstabs",
    "publisher": "Fox News Poll",
    "url": "https://static.foxnews.com/foxnews.com/content/uploads/2026/08/fox_august-6-10-2026_ohio_cross-tabs_august-13-release.pdf",
    "publishedAt": "2026-08-13",
    "referencePeriod": "2026年8月6〜10日、上院投票先の党派別内訳（設問4）",
    "retrievedAt": "2026-09-25",
    "contentVerifiedAt": "2026-09-25"
  },
  {
    "sourceId": "briefing-marist-tx-tables-20260923",
    "title": "Texas Survey — Nature of the Sample and Tables",
    "publisher": "Marist Poll",
    "url": "https://maristpoll.marist.edu/wp-content/uploads/2026/09/Marist-Poll_TX-NOS-and-Tables_202609221131.pdf",
    "publishedAt": "2026-09-23",
    "referencePeriod": "2026年9月17〜20日、登録有権者1,139人、上院投票先SNVT26R",
    "retrievedAt": "2026-09-25",
    "contentVerifiedAt": "2026-09-25"
  }
];

export const briefingLensEvidence: EvidenceRef[] = [
  {
    "evidenceId": "ev-briefing-ak-rcv",
    "sourceId": "briefing-dfp-ak-tables-20260817",
    "locator": "PDF p.7〜8、Q21・Q24・Q26。第一希望47/41、最終再配分53/47。主要2候補に順位を付けない第三候補票だけを現職へ回す仮定52/48。",
    "checkedAt": "2026-09-25",
    "kind": "observed"
  },
  {
    "evidenceId": "ev-briefing-ak-rules",
    "sourceId": "briefing-alaska-rcv",
    "locator": "Terms and DefinitionsのRound・Total ballots・Inactive ballots。最下位候補の除外、次順位への移転、継続して数える票の分母。",
    "checkedAt": "2026-09-25",
    "kind": "observed"
  },
  {
    "evidenceId": "ev-briefing-ia-turnout",
    "sourceId": "poll-yougov-ia-2026-09",
    "locator": "PDF p.9〜10、Q6・Q7。Turek/HinsonはRV44/43、loose45/43、strict47/43。strictの『必ず投票』100%（詳しい抽出条件の説明は未記載）。2024年Harris/Trump投票者の投票意思94/90。",
    "checkedAt": "2026-09-25",
    "kind": "observed"
  },
  {
    "evidenceId": "ev-briefing-me-pastvote",
    "sourceId": "poll-yougov-me-2026-09",
    "locator": "PDF p.10、Q7の2024 Vote列。Trump投票者Collins89/Jackson4、Harris投票者Jackson86/Collins5。全登録有権者の内訳。",
    "checkedAt": "2026-09-25",
    "kind": "observed"
  },
  {
    "evidenceId": "ev-briefing-mi-ballots",
    "sourceId": "obs-emerson-mi-20260917",
    "locator": "冒頭の上院48/46、知事49/42、学歴別の上院53/42（大卒）・45/48（非大卒）、Methodologyの9月12〜14日・LV1,000人。",
    "checkedAt": "2026-09-25",
    "kind": "observed"
  },
  {
    "evidenceId": "ev-briefing-nh-ballots",
    "sourceId": "obs-coefficient-nh",
    "locator": "Q1職務不支持56、Q2知事Ayotte55/Warmington34、Q6上院Sununu46/Pappas46/未定9。職務評価とQ7本人・政策評価53は別設問。",
    "checkedAt": "2026-09-25",
    "kind": "observed"
  },
  {
    "evidenceId": "ev-briefing-nc-sabato",
    "sourceId": "sabato-senate-2026",
    "locator": "9月24日保存のNC-2はLean D (flip)。保存済みsenate-races.tsと評価の確認記録に基づく。今回の公式本文再取得は未完了。",
    "checkedAt": "2026-09-24",
    "kind": "observed"
  },
  {
    "evidenceId": "ev-briefing-nc-inside",
    "sourceId": "inside-senate-ratings-2026",
    "locator": "9月17日版・NC-2のTilt D。保存済みrating-snapshot.tsと9月25日の公開評価を照合。",
    "checkedAt": "2026-09-25",
    "kind": "observed"
  },
  {
    "evidenceId": "ev-briefing-oh-party",
    "sourceId": "briefing-fox-oh-crosstabs-20260813",
    "locator": "PDF p.3、Q4 Total/Dem/GOP/Ind。Brown全体53・民主97・共和11・無党派66、Husted全体45・民主3・共和87・無党派28。傾きの追質問を含む。",
    "checkedAt": "2026-09-25",
    "kind": "observed"
  },
  {
    "evidenceId": "ev-briefing-tx-party",
    "sourceId": "briefing-marist-tx-tables-20260923",
    "locator": "PDF p.6、SNVT26R Party Identification。Talarico/Paxtonは全体50/44、民主98/<1、共和9/87、無党派55/35。",
    "checkedAt": "2026-09-25",
    "kind": "observed"
  }
];
