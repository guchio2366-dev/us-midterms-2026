import type { Source } from './model';
import type { EvidenceRef } from './research-model';
import {
  candidateExplanations as alaskaExplanations,
  candidateExplanationSources as alaskaSources,
  candidateExplanationEvidence as alaskaEvidence,
} from './reader-candidate-context-ak';
import {
  candidateExplanations as northCarolinaMinnesotaExplanations,
  candidateExplanationSources as northCarolinaMinnesotaSources,
  candidateExplanationEvidence as northCarolinaMinnesotaEvidence,
} from './reader-candidate-context-nc-mn';
import {
  candidateExplanations as northernExplanations,
  candidateExplanationSources as northernSources,
  candidateExplanationEvidence as northernEvidence,
} from './reader-candidate-context-north';

export interface ReaderCandidateParagraph {
  text: string;
  sourceIds: string[];
  evidenceIds: string[];
}

export interface ReaderCandidateExplanation {
  electionId: string;
  candidateId: string;
  checkedAt: string;
  sections: {
    heading: string;
    paragraphs: ReaderCandidateParagraph[];
  }[];
}

export interface ReaderCandidateComparison extends ReaderCandidateParagraph {
  electionId: string;
  checkedAt: string;
}

// Reader copy supplied after primary-source review on 2026-10-06. It explains
// the scope of the evidence; it does not alter any versioned policy position.
export const readerCandidateExplanations: ReaderCandidateExplanation[] = [
  ...alaskaExplanations,
  ...northCarolinaMinnesotaExplanations,
  ...northernExplanations,
  {
    electionId: '2026-ME-2-regular',
    candidateId: 'cand-me-susan-m-collins',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '医療の受診機会を守りながら、給付条件は見直す',
        paragraphs: [
          {
            text: 'コリンズは、地方でも医療を受けられることと、家族・中小企業への減税を重視します。ただし、減税と医療財源の変更をまとめた2025年7月1日のH.R.1上院採決では反対しました。本人の説明では、低所得者などを支えるMedicaidの将来の資金削減が、患者の受診だけでなく、地方病院や介護施設の存続を脅かすことが主な理由です。法案に盛り込まれた地方病院向け基金も、ほかの変更を補うには足りないと判断しました。',
            sourceIds: ['collins-reconciliation-statement-2025', 'senate-rollcall-119-372'],
            evidenceIds: ['ev-collins-reconciliation-2025', 'ev-hr1-rollcall'],
          },
          {
            text: '一方、Medicaidの制度変更すべてに反対しているわけではありません。同じ声明で、働くことのできる成人への就労要件を支持し、幼い子の養育者、介護者、就学中の人を対象から外すと述べています。ここでの条件は「誰に就労を求めるか」であり、資金削減への賛否とは別です。現在の陣営資料では、通院の負担を減らすためのMedicareの遠隔診療の恒久化、医療研究、職業訓練、州内の病院・住宅・水道などへの連邦予算確保も実績・重点として訴えています。',
            sourceIds: ['collins-reconciliation-statement-2025', 'candidate-collins-track-record-20261006'],
            evidenceIds: ['ev-collins-reconciliation-2025', 'ev-collins-track-record-20261006'],
          },
        ],
      },
      {
        heading: 'カナダとの取引を守るため、広範な関税に異議',
        paragraphs: [
          {
            text: '通商では、カナダ産品に広く関税をかける政策に反対しています。2025年4月2日には、その根拠となる非常事態を終了させる決議S.J.Res.37に賛成しました。2026年8月22日の声明でも、交渉の中断と再開が企業の費用と不確実性を高めるとして、交渉再開を要求しています。理由に挙げるのは、メーンの企業・農家・漁業者が国境を越える資材や販路に依存し、代替する国内供給網をすぐ用意できないことです。これは本人が説明する州への影響であり、決議への賛成だけで関税が撤廃されたという意味ではありません。',
            sourceIds: ['senate-rollcall-119-160', 'collins-canada-negotiations-20260822'],
            evidenceIds: ['ev-rollcall-160-republicans', 'ev-collins-canada-negotiations-20260822'],
          },
        ],
      },
    ],
  },
  {
    electionId: '2026-ME-2-regular',
    candidateId: 'cand-me-troy-d-jackson',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '医療保障と働く人の交渉力を広げる',
        paragraphs: [
          {
            text: 'ジャクソンは、働く人に不利な制度や企業の力の集中が生活費の負担につながっているとして、医療・税・労働の制度改革を掲げます。現在の公約は、Medicare for Allの実現、処方薬の値下げ、富裕層・大企業への課税と労働者の減税、労働者が組織をつくる権利の保護です。Medicare for Allは医療保障を広げる制度改革の提案で、コリンズが述べたMedicaidの就労条件の調整とは対象が違います。ただし、公式の重点項目には財源、加入の仕組み、移行期間や提出する法案番号までの説明はありません。',
            sourceIds: ['jackson-priorities-2026'],
            evidenceIds: ['ev-jackson-priorities'],
          },
          {
            text: '背景として本人が挙げるのは、伐採労働者として賃金交渉に関わり、働く人の意見が政治の決定に届かないと感じた経験です。陣営は州議会時代の薬価、学校給食、地方医療、固定資産税、労働者の権利への取組を実績として紹介しています。これらは州政治での経験として読む必要があり、連邦上院で同じ制度を実現した実績ではありません。',
            sourceIds: ['candidate-jackson-about-20261006'],
            evidenceIds: ['ev-jackson-about-20261006'],
          },
        ],
      },
      {
        heading: '住宅費と政治制度にも企業の影響を問う',
        paragraphs: [
          {
            text: '住宅では、州外の投資会社による住宅団地の買収と、その後の家賃・生活環境の問題を取り上げています。9月17日の陣営発表では、WellsのBlueberry Ridgeの住民から水道などへの不満を聞き、企業の行動を是正すると表明しました。住民の訴えがあったという記録ですが、陣営が紹介した一つの現場であり、州全体の反応を示す調査ではありません。この発表だけでは、連邦でどの規制や補助制度を使うかまでは確認できません。',
            sourceIds: ['jackson-blueberry-ridge-20260917'],
            evidenceIds: ['ev-jackson-blueberry-ridge-20260917'],
          },
          {
            text: 'さらに、連邦法による中絶の権利の保障、ICEの解体・廃止、議員の株取引禁止、選挙資金規制の強化を重点に掲げています。医療や家計への提案とともに、政府の権限や政治と資金の関係をどう変えるかも評価する必要があります。',
            sourceIds: ['jackson-priorities-2026'],
            evidenceIds: ['ev-jackson-priorities'],
          },
        ],
      },
    ],
  },
];

export const readerCandidateComparisons: ReaderCandidateComparison[] = [
  {
    electionId: '2026-ME-2-regular',
    checkedAt: '2026-10-06',
    text: '医療では、コリンズが既存の保障と地方医療の維持を条件に制度を調整しようとするのに対し、ジャクソンはMedicare for Allを含む保障の拡大を掲げます。この違いを、法案全体への過去の票と、公約の制度設計に分けて読みます。住宅や労働、州への予算配分まで含めた提案の違いも重要です。今回確認した資料だけでは、どの提案がどれだけ州民の支持を変えたかは判断できません。',
    sourceIds: ['collins-reconciliation-statement-2025', 'senate-rollcall-119-372', 'candidate-collins-track-record-20261006', 'jackson-priorities-2026', 'candidate-jackson-about-20261006', 'jackson-blueberry-ridge-20260917'],
    evidenceIds: ['ev-collins-reconciliation-2025', 'ev-hr1-rollcall', 'ev-collins-track-record-20261006', 'ev-jackson-priorities', 'ev-jackson-about-20261006', 'ev-jackson-blueberry-ridge-20260917'],
  },
];

// M1, M2, M4 and M6 reuse the existing source IDs. The state packages also
// include rechecked metadata, applied after the base registry in reader lookups.
export const readerCandidateExplanationSources: Source[] = [
  ...alaskaSources,
  ...northCarolinaMinnesotaSources,
  ...northernSources,
  {
    sourceId: 'candidate-collins-track-record-20261006',
    title: 'Track Record',
    publisher: 'Susan Collins for Maine',
    url: 'https://susancollins.com/track-record/',
    publishedAt: null,
    referencePeriod: '2026-10-06閲覧時点の陣営による政策重点・実績紹介。公表日不明。実績効果の第三者検証は未実施',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'collins-canada-negotiations-20260822',
    title: 'Statement on the Breakdown of U.S.-Canada Trade Negotiations',
    publisher: 'Office of Senator Susan Collins',
    url: 'https://www.collins.senate.gov/newsroom/senator-collins-statement-on-the-breakdown-of-us-canada-trade-negotiations',
    publishedAt: '2026-08-22',
    referencePeriod: '2026-08-22の本人声明。交渉再開要求と本人が説明する州への影響。関税の実施状況・現在の税率の確認資料とはしない',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'candidate-jackson-about-20261006',
    title: 'About Troy Jackson',
    publisher: 'Troy Jackson for Maine',
    url: 'https://www.jacksonformaine.com/about',
    publishedAt: null,
    referencePeriod: '2026-10-06閲覧時点の陣営による経歴・州議会実績紹介。公表日不明。各州法の採決・効果は独立検証していない',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'jackson-blueberry-ridge-20260917',
    title: 'Jackson Stands With Residents Protesting Out-Of-State Private Equity Firms Increasing Costs',
    publisher: 'Troy Jackson for Maine',
    url: 'https://www.jacksonformaine.com/news/jackson-stands-with-residents-protesting-out-of-state-private-equity-firms-increasing-costs',
    publishedAt: '2026-09-17',
    referencePeriod: '2026-09-17のWells・Blueberry Ridgeの住民との面会についての陣営発表。選択された現場記録であり、州全体の反応・支持移動は測っていない',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
];

export const readerCandidateExplanationEvidence: EvidenceRef[] = [
  ...alaskaEvidence,
  ...northCarolinaMinnesotaEvidence,
  ...northernEvidence,
  {
    evidenceId: 'ev-collins-track-record-20261006',
    sourceId: 'candidate-collins-track-record-20261006',
    locator: 'Maine Jobs and Workforce Development、Health Care、Delivering for Maine。Medicare遠隔診療、医療研究、職業訓練、州内の病院・住宅・水道への予算についての陣営による重点・実績訴求',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '陣営の説明を確認した記録。数量・実績効果の第三者検証は今回未実施。',
  },
  {
    evidenceId: 'ev-collins-canada-negotiations-20260822',
    sourceId: 'collins-canada-negotiations-20260822',
    locator: '冒頭の本人声明3段落、後半の法案・要請履歴。交渉中断・再開による費用と不確実性、州の企業・農家・漁業者の取引と供給網への依存、交渉再開要求',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '本人が説明する政策の影響。現在の税率・関税実施状態をこの声明から確定しない。',
  },
  {
    evidenceId: 'ev-jackson-about-20261006',
    sourceId: 'candidate-jackson-about-20261006',
    locator: '州議会へ出た理由を述べる本文、20年の州議会・6年の上院議長と実績紹介。伐採労働者の賃金交渉経験、薬価・学校給食・地方医療・固定資産税・労働者の権利についての陣営説明',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '州政治での経験についての陣営紹介。個別州法の採決・効果の独立検証、連邦上院での実績確認とは区別する。',
  },
  {
    evidenceId: 'ev-jackson-blueberry-ridge-20260917',
    sourceId: 'jackson-blueberry-ridge-20260917',
    locator: '日付以降の本文・動画書き起こし。WellsのBlueberry Ridgeの住民から水道などへの不満を聞いたという陣営記録、州外投資会社の買収後の負担への批判',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '陣営による参加者反応の選択的記録。州民一般の反応・支持移動の証拠にしない。連邦で用いる規制・補助制度はこの発表では未確認。',
  },
];
