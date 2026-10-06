import type { Source } from './model';
import type { EvidenceRef } from './research-model';
import type { ReaderCandidateExplanation } from './reader-candidate-explanations';

// Full reader copy supplied after primary-source review on 2026-10-06.
// These explanations do not alter any versioned policy position or unknown.
export const candidateExplanations: ReaderCandidateExplanation[] = [
  {
    electionId: '2026-AK-2-regular',
    candidateId: 'cand-ak-dan-s-sullivan',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '資源開発・減税と、防衛への投資',
        paragraphs: [
          {
            text: 'Sullivanは、資源開発と減税、軍・沿岸警備隊への投資を、アラスカの雇用・州財政・生活費を改善する手段として結び付けています。2026年2月18日の州議会演説では、政権交代のたびに開発方針が揺れると長期投資が難しくなるとして、連邦地の石油・ガス鉱区リースを法律で継続する方針を説明しました。Alaska LNGも、州内の安価なエネルギーと産業・雇用を生む計画として推進しています。9月30日には韓国の投資に関する発表を歓迎しましたが、陣営・議員事務所による期待の説明と、資金拠出や事業完成の確認は分けて読む必要があります。防衛強化に加え、国境での薬物流入の取締りと学校でのfentanyl危険性の周知も重点です。',
            sourceIds: ['context-sullivan-legislature-20260218', 'context-sullivan-lng-20260930'],
            evidenceIds: ['ev-context-sullivan-legislature-20260218', 'ev-context-sullivan-lng-20260930'],
          },
        ],
      },
      {
        heading: '医療保険料の負担急増を避ける、条件付きの延長案',
        paragraphs: [
          {
            text: '医療では、ACA（医療保険制度改革法）を批判する一方、2025年12月11日には、強化された保険料税額控除が失効すると家族や自営業者・小規模事業者の負担が増すとして、民主・共和両案の審議を進めることに賛成したと説明しました。本人の修正案は「2年間延長する」「所得上限を置く」「本人が不法移民と表現する対象への給付を認めない」「全プランで少額でも本人負担を求める」という設計です。負担急増を避けつつ不正・濫用を抑える、というのが本人の理由です。上院記録でもS.3385の審議入りに向けた討論終結動議への賛成を確認できますが、延長法案の成立を意味しません。所得上限額・最低支払額・修正案全文は今回確認できておらず、2026年の新たな発言にも読み替えません。',
            sourceIds: ['policy-sullivan-aca', 'policy-senate-roll644'],
            evidenceIds: ['ev-policy-sullivan-aca-design', 'ev-policy-roll644-question', 'ev-policy-roll644-focus-votes'],
          },
        ],
      },
      {
        heading: '漁具の基準・監視・研究を組み合わせ、混獲を減らす',
        paragraphs: [
          {
            text: '漁業では、2026年9月23日にBycatch Reduction Actの全会一致による可決を求めました。事務所の説明では、網と海底の接触を減らす基準・監視、サケを網から逃がす装置、標識調査・遺伝子分析、漁具試験施設、NOAAの混獲削減研究を組み合わせる案です。本人は、魚が食料・雇用に加え地域の文化を支えることを理由に挙げています。同日の可決要求は異議で進まなかったとの発表であり、成立済みとは表示しません。Peltolaの工場型トロール漁禁止案とは、漁業資源保護という目的が重なっても手段が異なります。',
            sourceIds: ['context-sullivan-bycatch-20260923', 'context-peltola-fisheries-20261006'],
            evidenceIds: ['ev-context-sullivan-bycatch-20260923', 'ev-context-peltola-fisheries-20261006'],
          },
        ],
      },
      {
        heading: '関税の非常事態終了決議への過去の反対票',
        paragraphs: [
          {
            text: '関税について確認できた具体的な過去の行動は、2025年10月30日、世界向け関税の根拠となる非常事態を終わらせるS.J.Res.88に反対したことです。この一票だけから、対カナダ関税、建材関税など個々の税率・対象への賛成まで広げることはできません。この採決の本人による理由は今回の原資料では確認できませんでした。',
            sourceIds: ['policy-senate-roll600'],
            evidenceIds: ['ev-policy-roll600-sullivan'],
          },
        ],
      },
    ],
  },
  {
    electionId: '2026-AK-2-regular',
    candidateId: 'cand-ak-mary-peltola',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '資源開発と多様な電源・送電網への投資',
        paragraphs: [
          {
            text: 'Peltolaは、州の資源を州内の安いエネルギーにつなげることを重視しています。現在の公約は、石油・ガス開発、Alaska LNGパイプライン、許認可手続の改革を支持し、製油所への税優遇や融資保証も掲げています。同時に、太陽光・風力・水力の連邦税額控除の復活、Railbeltの送電網更新、村落の小規模電力網への投資を求めています。本人の説明は、地域の合意を得ながら供給源を増やし、輸送・送電の非効率も直して料金を下げるというものです。したがって、Sullivanとの違いを単純な「開発賛成対反対」に縮めると、公約の重要な部分が抜けます。',
            sourceIds: ['context-peltola-energy-20261006', 'context-sullivan-legislature-20260218'],
            evidenceIds: ['ev-context-peltola-energy-20261006', 'ev-context-sullivan-legislature-20260218'],
          },
        ],
      },
      {
        heading: '家計の税負担と、輸送費・住宅費を下げる提案',
        paragraphs: [
          {
            text: '家計政策では、年収9万2,000ドル未満の勤労・中所得層の連邦所得税をなくし、富裕層への増税で賄う案、拡大児童税額控除、家賃が所得の30%を超える人への還付可能な税額控除を掲げています。また、地方への荷物輸送を支えるBypass Mailの予算回復・投資と、新たなEssential Freight Serviceを提案しています。食料・燃料・住宅の高さに対し、税負担だけでなく輸送費や住宅供給にも手を入れる考えです。いずれも候補者提案であり、適用条件の全体や必要予算、成立法案はこのページからは確認できません。',
            sourceIds: ['context-peltola-affordability-20261006'],
            evidenceIds: ['ev-context-peltola-affordability-20261006'],
          },
        ],
      },
      {
        heading: '工場型トロール漁の禁止と、規制・監視の拡充',
        paragraphs: [
          {
            text: '漁業では、州外の工場型トロール船による混獲や海底への影響が地域の食料と暮らしを損なうという認識から、工場型トロール漁の禁止を掲げています。中層トロールが海底に接触しないための規則、魚群資源調査への十分な予算、NOAAによるMagnuson-Stevens法とNational Standards 8・9の執行、電子監視の拡大も求めています。魚の減少原因をこの陣営の説明だけで一つに断定することはできませんが、禁止・規制・監視を組み合わせて漁業資源と沿岸地域を守ろうとする政策の内容は確認できます。',
            sourceIds: ['context-peltola-fisheries-20261006'],
            evidenceIds: ['ev-context-peltola-fisheries-20261006'],
          },
        ],
      },
      {
        heading: '退役軍人医療の職員・記録・精神医療への具体策',
        paragraphs: [
          {
            text: '退役軍人医療では、VA（退役軍人省）の診療職員と業務資源の回復、電子診療記録・施設の近代化、精神医療と支援窓口への接続拡大を、それぞれ別の施策として掲げています。国が軍務を終えた人に約束した医療・給付を届けることが理由です。住宅支援や民間就職への移行支援も含む公約ですが、各施策の人数・予算・法案番号は未確認です。これはVA向けの具体策であり、Peltolaが特定のACA延長案やMedicaid条項を支持した証拠として代用しません。',
            sourceIds: ['policy-peltola-veterans'],
            evidenceIds: ['ev-policy-peltola-va-staff', 'ev-policy-peltola-va-records', 'ev-policy-peltola-va-mental'],
          },
        ],
      },
    ],
  },
];

// The first four IDs are reader-scoped rechecks of existing sources. Preserve
// original publication dates; the renderer merges these by ID after old data.
export const candidateExplanationSources: Source[] = [
  {
    sourceId: 'policy-sullivan-aca',
    title: 'Sullivan Votes to Relieve Alaskans from Obamacare’s Outrageous Costs',
    publisher: 'Office of Senator Dan Sullivan',
    url: 'https://www.sullivan.senate.gov/newsroom/press-releases/sullivan-votes-to-relieve-alaskans-from-obamacares-outrageous-costs/',
    publishedAt: '2025-12-11',
    referencePeriod: '2025-12-11の本人声明と修正案の設計。2年延長、所得上限、移民資格、最低支払いの条件を説明。2026年の新発言・延長法の成立とは扱わない',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'policy-senate-roll644',
    title: 'Senate Roll Call 644: Cloture on the Motion to Proceed to S.3385',
    publisher: 'U.S. Senate',
    url: 'https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_00644.htm',
    publishedAt: null,
    referencePeriod: '2025-12-11のS.3385審議入り動議に対する討論終結の手続票。法案通過・最終成立とは異なる。ページの初回公開日は不明',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'policy-senate-roll600',
    title: 'Senate Roll Call 600: S.J.Res.88',
    publisher: 'U.S. Senate',
    url: 'https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_00600.htm',
    publishedAt: null,
    referencePeriod: '2025-10-30の世界向け関税の根拠となる非常事態を終了する決議S.J.Res.88への票。個別の関税率・対象への賛否を示す資料とはしない。ページの初回公開日は不明',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'policy-peltola-veterans',
    title: 'Keeping our Promise to Alaska Veterans and Servicemembers',
    publisher: 'Mary Peltola campaign',
    url: 'https://marypeltola.com/veterans/',
    publishedAt: null,
    referencePeriod: '2026-10-06確認時点の退役軍人向け公約。VAの職員・記録・精神医療を区別する。公表日・発言日不明。特定のACA・Medicaid条項への支持は示さない',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'context-sullivan-legislature-20260218',
    title: 'Sullivan Touts Alaska Comeback, Historic Opportunities in Annual Address to Legislature',
    publisher: 'Office of Senator Dan Sullivan',
    url: 'https://www.sullivan.senate.gov/newsroom/press-releases/sullivan-touts-alaska-comeback-historic-opportunities-in-annual-address-to-legislature/',
    publishedAt: '2026-02-18',
    referencePeriod: '2026-02-18の州議会演説。資源開発、Alaska LNG、税、軍備、地域の安全についての本人説明。自己評価・将来効果は本人に帰属させる',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'context-sullivan-lng-20260930',
    title: 'Alaska Congressional Delegation, Governor Celebrate Historic $54 Billion Korean Investment in Alaska LNG',
    publisher: 'Office of Senator Dan Sullivan',
    url: 'https://www.sullivan.senate.gov/newsroom/press-releases/alaska-congressional-delegation-governor-celebrate-historic-54-billion-korean-investment-in-alaska-lng/',
    publishedAt: '2026-09-30',
    referencePeriod: '2026-09-30の発表に対するSullivanの声明。本人の期待と資金拠出・事業完成の確認を分離し、投資額や最終投資決定を確定事実にしない',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'context-sullivan-bycatch-20260923',
    title: 'Senate Democrats Block Sullivan’s Bycatch Reduction Act',
    publisher: 'Office of Senator Dan Sullivan',
    url: 'https://www.sullivan.senate.gov/newsroom/press-releases/senate-democrats-block-sullivans-bycatch-reduction-act/',
    publishedAt: '2026-09-23',
    referencePeriod: '2026-09-23のBycatch Reduction Act可決要求と異議による停止についての議員事務所発表。S.4938と代替案を識別する2026年改訂版。2025年版や成立済み法とは区別する',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'context-peltola-energy-20261006',
    title: 'Energy',
    publisher: 'Mary Peltola campaign',
    url: 'https://marypeltola.com/energy/',
    publishedAt: null,
    referencePeriod: '2026-10-06確認時点のエネルギー公約。公表日・発言日不明。石油・ガスとAlaska LNGの支持、再生可能エネルギー税額控除、送電網・村落電力網への投資を並記する',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'context-peltola-affordability-20261006',
    title: 'Affordability',
    publisher: 'Mary Peltola campaign',
    url: 'https://marypeltola.com/affordability/',
    publishedAt: null,
    referencePeriod: '2026-10-06確認時点の税・家計・輸送・住宅についての公約。公表日・発言日不明。適用条件全体・必要予算・成立法案の確認とは区別する',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'context-peltola-fisheries-20261006',
    title: 'Fisheries',
    publisher: 'Mary Peltola campaign',
    url: 'https://marypeltola.com/fish/',
    publishedAt: null,
    referencePeriod: '2026-10-06確認時点の工場型トロール漁禁止、漁業資源の保護・監視についての公約。公表日・発言日不明。魚の減少原因・政策効果・住民全体の賛否を確認した資料とはしない',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
];

export const candidateExplanationEvidence: EvidenceRef[] = [
  {
    evidenceId: 'ev-policy-sullivan-aca-design',
    sourceId: 'policy-sullivan-aca',
    locator: '2025-12-11声明の「Nevertheless」と「I offered amendments」で始まる段落。2年間延長、所得上限、本人が不法移民と表現する対象への給付制限、全プランでの少額の本人負担',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '移民資格の表現は本人に帰属させ、現行法による給付実態の認定にはしない。所得上限額・最低支払額・修正案全文は今回未確認。2026年の新発言ではない。',
  },
  {
    evidenceId: 'ev-policy-roll644-question',
    sourceId: 'policy-senate-roll644',
    locator: 'Vote Summary: On the Cloture Motion, Motion to Proceed to S.3385; 2025-12-11; Cloture Motion Rejected',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '審議入りに向けた討論終結の手続票であり、延長法案の通過・成立ではない。',
  },
  {
    evidenceId: 'ev-policy-roll644-focus-votes',
    sourceId: 'policy-senate-roll644',
    locator: 'Vote SummaryおよびAlphabetical table: Sullivan (R-AK), Yea。既存の同IDが参照するCollins・Ossoff・Husted・Marshallの各票は元の確認記録を保持する',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '今回の再確認範囲はSullivanの票。本人の修正案設計や別の延長案への賛否とは同一に扱わない。',
  },
  {
    evidenceId: 'ev-policy-roll600-sullivan',
    sourceId: 'policy-senate-roll600',
    locator: 'Vote SummaryのS.J.Res.88という対象・世界向け関税の非常事態終了という題名と、Alphabetical table: Sullivan (R-AK), Nay。行動日2025-10-30',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: 'この採決の本人による理由は今回未確認。対カナダ・建材等の個別税率や対象への支持を推定しない。',
  },
  {
    evidenceId: 'ev-policy-peltola-va-staff',
    sourceId: 'policy-peltola-veterans',
    locator: 'Strengthen and Expand VA Healthcareの職員・業務資源回復の項目。Restore and Protect Veterans’ Benefits、Support the Military to Civilian Transitionの給付・住宅・移行支援も参照',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: 'VA向け公約。公表日・発言日、人数、予算、法案番号は未確認。特定のACA延長案・Medicaid条項の支持の証拠にしない。',
  },
  {
    evidenceId: 'ev-policy-peltola-va-records',
    sourceId: 'policy-peltola-veterans',
    locator: 'Strengthen and Expand VA Healthcareの電子診療記録を含むVAの医療インフラ近代化の項目',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '職員回復・精神医療拡大とは別の施策。公表日・発言日、予算、実施時期、法案番号は未確認。',
  },
  {
    evidenceId: 'ev-policy-peltola-va-mental',
    sourceId: 'policy-peltola-veterans',
    locator: 'Strengthen and Expand VA Healthcareの精神医療拡大、リスクのある退役軍人の特定と支援への接続の項目',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '職員回復・記録近代化とは別の施策。公表日・発言日、人数、予算、法案番号は未確認。',
  },
  {
    evidenceId: 'ev-context-sullivan-legislature-20260218',
    sourceId: 'context-sullivan-legislature-20260218',
    locator: 'IV Resource Development、V AK LNG、VI Taxes and Child Care、VII Military Build-up、VIII Safer Communities。連邦地の鉱区リース、政権ごとの開発方針変更、軍・沿岸警備隊、薬物流入取締りとfentanyl周知についての本人説明',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '自己評価・将来の雇用、州財政、生活費への効果は本人の説明として扱い、実証された効果に置き換えない。',
  },
  {
    evidenceId: 'ev-context-sullivan-lng-20260930',
    sourceId: 'context-sullivan-lng-20260930',
    locator: '2026-09-30発表のSullivan statement。韓国のAlaska LNG投資に関する発表への歓迎',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '発表と期待を確認。資金拠出、最終投資決定、事業完成をこの声明から確定しない。',
  },
  {
    evidenceId: 'ev-context-sullivan-bycatch-20260923',
    sourceId: 'context-sullivan-bycatch-20260923',
    locator: '冒頭の経緯説明、toolkitの各段落、末尾のS.4938とsubstituteを識別する全会一致可決要求。漁具・海底接触、サケ脱出装置、標識・遺伝子分析、試験施設、NOAA研究',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '2026-09-23要求の改訂版。2025年版と同じ政策版にしない。異議で進まなかったとの事務所発表で、成立確認ではない。住民全体の賛否・支持変化の原調査は未確認。',
  },
  {
    evidenceId: 'ev-context-peltola-energy-20261006',
    sourceId: 'context-peltola-energy-20261006',
    locator: 'Cutting Red Tape、Developing Alaska Resources for Alaskans、Delivering for Rural Alaska。石油・ガス、Alaska LNG、製油所税優遇・融資保証、再生可能エネルギー税額控除、Railbelt送電網、村落電力網',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '公表日・発言日不明の候補者公約。確認日を新発表日にしない。SullivanとPeltolaの両候補が資源開発を支持する点を保つ。料金低下は本人の政策目的。',
  },
  {
    evidenceId: 'ev-context-peltola-affordability-20261006',
    sourceId: 'context-peltola-affordability-20261006',
    locator: 'Lower Taxes Higher Wages、Supporting Alaska Families、Strengthening Supply Chains & Lowering Shipping Costs、Lowering Housing Prices。年収92,000ドル未満の所得税、児童税額控除、家賃が所得の30%を超える場合の還付可能控除、Bypass Mail、Essential Freight Service',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '公表日・発言日不明。候補者の提案であり、適用条件全体、必要予算、成立法案を確認した記録ではない。',
  },
  {
    evidenceId: 'ev-context-peltola-fisheries-20261006',
    sourceId: 'context-peltola-fisheries-20261006',
    locator: 'Banning Factory Trawling、Restoring Our Fisheries、Bringing Innovation Into Our Traditions。工場型トロール漁禁止、中層トロールの海底非接触規則、資源調査、Magnuson-Stevens法とNational Standards 8・9の執行、電子監視',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '公表日・発言日不明。漁業資源減少の原因を陣営資料だけで確定しない。両陣営の漁業政策について住民全体の賛否・支持変化の原調査は未確認。',
  },
];
