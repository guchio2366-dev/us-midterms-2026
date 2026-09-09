import type { IssueCategory, PowerRule, Source } from './model';

export const powerRules: PowerRule[] = [
  {
    powerId:'ordinary-law',domain:'law',action:'通常法案を成立させる',
    house:'同一文面を可決',senate:'同一文面を可決。通常法案は討論終結が先に必要になる場合がある',
    threshold:'下院・上院とも出席投票者の過半数。上院の討論終結は原則、選出・宣誓済み議員の5分の3',
    nominalSeats:'下院218／上院51または50＋副大統領。上院クロージャー60',
    presidentialConstraint:'一方の院で過半数を失えば、新法・法改正を止めたり修正を求めたりできる。現行法に基づく大統領権限は自動では消えない。',
    sourceIds:['constitution-legislation','senate-cloture'],
  },
  {
    powerId:'appropriations',domain:'money',action:'予算・歳出を決める',
    house:'歳入法案の起点。歳出法案を可決',senate:'歳出法案を可決・修正',
    threshold:'通常は両院の過半数。上院では討論終結60が必要になる場合がある',
    nominalSeats:'下院218／上院51または50＋副大統領。クロージャー60',
    presidentialConstraint:'反対党が一院を取れば、政府支出・政策条件・行政機関予算を交渉材料にできる。ただし合意不成立は政府閉鎖のリスクを伴う。',
    sourceIds:['house-purse','constitution-legislation','senate-cloture'],
  },
  {
    powerId:'oversight',domain:'oversight',action:'調査・公聴会・文書要求を行う',
    house:'委員会の招致・調査・召喚状。多数党が委員長と議題を握る',senate:'委員会の招致・調査・召喚状。多数党が委員長と議題を握る',
    threshold:'委員会規則による。固定の本会議議席数ではなく、院の多数派が委員会運営を左右する',
    nominalSeats:'下院218が多数派の目安／上院51または50＋副大統領が運営多数派の目安',
    presidentialConstraint:'行政の意思決定、契約、利益相反、法執行について記録と証言を求め、政治的・法的な説明責任を強める。',
    sourceIds:['house-oversight','senate-powers'],
  },
  {
    powerId:'nominations',domain:'appointments',action:'閣僚・大使・連邦裁判官などを承認する',
    house:'原則として関与しない',senate:'助言と同意。指名の承認・否決',
    threshold:'出席投票者の過半数。指名の討論終結も単純多数',
    nominalSeats:'上院51、または50＋副大統領',
    presidentialConstraint:'上院多数派を失うと、指名の採決を遅らせる、候補変更を求める、否決する余地が大きくなる。',
    sourceIds:['senate-powers','senate-cloture','constitution-appointments'],
  },
  {
    powerId:'treaties',domain:'treaties',action:'条約への助言と同意',
    house:'条約同意には参加しない。実施法・歳出が必要なら関与',senate:'条約批准への同意',
    threshold:'出席上院議員の3分の2',
    nominalSeats:'全100人出席なら67',
    presidentialConstraint:'大統領が署名した条約でも、上院3分の2の同意がなければ批准できない。行政協定は別の制度。',
    sourceIds:['senate-treaties','constitution-appointments'],
  },
  {
    powerId:'impeachment',domain:'impeachment',action:'弾劾訴追・裁判',
    house:'弾劾条項を可決して訴追',senate:'弾劾裁判を行い、有罪なら罷免',
    threshold:'下院は出席投票者の過半数。上院の有罪は出席議員の3分の2',
    nominalSeats:'全員出席なら下院218／上院67',
    presidentialConstraint:'下院多数だけで訴追できるが、罷免には上院の非常に高い超党派水準が必要。',
    sourceIds:['house-impeachment','senate-voting','constitution-impeachment'],
  },
  {
    powerId:'veto-override',domain:'veto',action:'大統領拒否権を覆す',
    house:'再可決',senate:'再可決',
    threshold:'両院それぞれ出席議員の3分の2',
    nominalSeats:'全員出席なら下院290／上院67',
    presidentialConstraint:'反対党の単独過半数では拒否権を突破できない。各院3分の2が大統領の最終的な拒否を越える基準。',
    sourceIds:['constitution-legislation','senate-voting'],
  },
  {
    powerId:'reconciliation',domain:'money',action:'財政調整法を成立させる',
    house:'財政指示に沿う法案を過半数で可決',senate:'対象が予算に直接関係する範囲で、討論時間が制限され単純多数で可決可能',
    threshold:'両院の過半数。上院60票の通常クロージャーを要しない',
    nominalSeats:'下院218／上院51または50＋副大統領',
    presidentialConstraint:'多数党は税・歳出・債務上限の一部を60票なしで進められるが、上院のバード・ルールで非予算事項が除外される。',
    sourceIds:['crs-reconciliation','constitution-legislation'],
  },
];

export const issueCategories: IssueCategory[] = [
  {issueId:'household-economy',label:'家計・税・財政',scope:'物価、賃金、税制、債務、社会保障、政府支出',voterQuestion:'生活費と税負担は改善したか。誰が政策コストを負担したか。',presidentialLevers:'行政運用、規制、予算要求、拒否権',congressionalChecks:'税法・歳出・債務上限・予算調整、監督',indicatorLabels:['実質賃金','消費者物価','州別所得','連邦支出'],relatedPowerIds:['ordinary-law','appropriations','reconciliation','oversight'],sourceIds:['constitution-legislation','house-purse']},
  {issueId:'trade-industry',label:'貿易・産業・農業',scope:'関税、対中政策、輸出、製造業、農業、サプライチェーン',voterQuestion:'関税と輸出市場の変化は地域の所得・雇用・価格にどう波及したか。',presidentialLevers:'既存法から委任された関税・通商措置、交渉、輸出管理',congressionalChecks:'通商法の改正、歳出、監督、実施法',indicatorLabels:['品目別輸出','州別生産','製造業雇用','投入価格'],relatedPowerIds:['ordinary-law','appropriations','oversight','veto-override'],sourceIds:['ustr-trade-agenda','usda-trade']},
  {issueId:'immigration',label:'移民・国境',scope:'国境管理、送還、庇護、合法移民、州・都市への財政影響',voterQuestion:'執行強化と法的手続、労働力、地域負担のバランスをどう評価するか。',presidentialLevers:'法執行の優先順位、行政機関運用、緊急措置',congressionalChecks:'移民法、国境・収容予算、監督、指名承認',indicatorLabels:['国境遭遇件数','移民裁判滞留','地域財政','労働力'],relatedPowerIds:['ordinary-law','appropriations','oversight','nominations'],sourceIds:['constitution-legislation']},
  {issueId:'health-family',label:'医療・家族・教育',scope:'医療保険、薬価、公衆衛生、中絶、教育、家族支援',voterQuestion:'医療アクセス、自己負担、権利、州との役割分担はどう変わったか。',presidentialLevers:'行政規則、助成条件、法執行、指名',congressionalChecks:'制度法、保険・研究予算、監督、承認',indicatorLabels:['無保険率','保険料','医療アクセス','教育費'],relatedPowerIds:['ordinary-law','appropriations','oversight','nominations'],sourceIds:['constitution-legislation']},
  {issueId:'energy-climate',label:'エネルギー・気候・環境',scope:'石油・ガス、電力、再エネ、許認可、災害、環境規制',voterQuestion:'価格・雇用・供給安定と環境・災害リスクをどう比較するか。',presidentialLevers:'許認可、国有地、環境規則、緊急対応',congressionalChecks:'エネルギー法、税額控除、機関予算、監督',indicatorLabels:['電力価格','産出量','エネルギー雇用','災害損失'],relatedPowerIds:['ordinary-law','appropriations','oversight'],sourceIds:['constitution-legislation']},
  {issueId:'security-foreign',label:'外交・安全保障',scope:'戦争、同盟、対外援助、制裁、軍事、条約',voterQuestion:'安全保障上の目的・費用・期間・議会承認は妥当か。',presidentialLevers:'外交、軍の最高司令官としての運用、制裁の執行',congressionalChecks:'宣戦・軍事権限、国防・援助予算、監督、条約、指名',indicatorLabels:['軍事費','派遣規模','対外援助','同盟負担'],relatedPowerIds:['appropriations','oversight','nominations','treaties'],sourceIds:['constitution-appointments','senate-treaties']},
  {issueId:'rights-institutions',label:'法の支配・権利・選挙制度',scope:'司法、選挙運営、公民権、行政独立性、利益相反、情報公開',voterQuestion:'権力行使は法と手続に従い、検証可能で、権利を等しく守っているか。',presidentialLevers:'司法・行政機関人事、大統領令、法執行方針',congressionalChecks:'監督、召喚、制度法、歳出条件、承認、弾劾',indicatorLabels:['裁判判断','監察報告','投票アクセス','公務員人事'],relatedPowerIds:['oversight','nominations','impeachment','ordinary-law'],sourceIds:['house-oversight','constitution-impeachment']},
  {issueId:'place-services',label:'地域基盤・住宅・公共サービス',scope:'住宅、交通、通信、水、災害復旧、地域開発、先住民政策',voterQuestion:'連邦政策が地域の具体的な不足と成長制約に届いたか。',presidentialLevers:'補助金配分、事業執行、緊急対応、規則',congressionalChecks:'歳出・授権法、選挙区サービス、監督',indicatorLabels:['住宅費','通勤・物流','ブロードバンド','災害復旧'],relatedPowerIds:['appropriations','ordinary-law','oversight'],sourceIds:['house-purse']},
];

const checked = (source: Omit<Source,'retrievedAt'|'contentVerifiedAt'>): Source => ({...source,retrievedAt:'2026-09-09',contentVerifiedAt:'2026-09-09'});
export const civicSources: Source[] = [
  checked({sourceId:'constitution-legislation',title:'Constitution Annotated — Article I legislative process',publisher:'Library of Congress',url:'https://constitution.congress.gov/browse/article-1/section-7/',publishedAt:null,referencePeriod:'両院可決、歳入法案、大統領署名・拒否権と3分の2再可決'}),
  checked({sourceId:'constitution-appointments',title:'Constitution Annotated — Article II, Section 2',publisher:'Library of Congress',url:'https://constitution.congress.gov/browse/article-2/section-2/',publishedAt:null,referencePeriod:'上院の条約・指名への助言と同意'}),
  checked({sourceId:'constitution-impeachment',title:'Constitution Annotated — Impeachment',publisher:'Library of Congress',url:'https://constitution.congress.gov/browse/essay/artI-S2-C5-1/ALDE_00000030/',publishedAt:null,referencePeriod:'下院の弾劾訴追権と上院裁判'}),
  checked({sourceId:'senate-cloture',title:'About Filibusters and Cloture',publisher:'U.S. Senate',url:'https://www.senate.gov/about/powers-procedures/filibusters-cloture/overview.htm',publishedAt:null,referencePeriod:'通常法案の討論終結60票、指名の単純多数'}),
  checked({sourceId:'senate-powers',title:'Powers and Procedures',publisher:'U.S. Senate',url:'https://www.senate.gov/about/powers-procedures.htm',publishedAt:null,referencePeriod:'指名・条約・弾劾・調査の上院権限'}),
  checked({sourceId:'senate-voting',title:'About Voting',publisher:'U.S. Senate',url:'https://www.senate.gov/about/powers-procedures/voting.htm',publishedAt:null,referencePeriod:'上院の単純多数、3分の2、5分の3の要件'}),
  checked({sourceId:'senate-treaties',title:'About Treaties',publisher:'U.S. Senate',url:'https://www.senate.gov/about/powers-procedures/treaties.htm',publishedAt:null,referencePeriod:'条約同意に出席上院議員の3分の2'}),
  checked({sourceId:'house-purse',title:'Power of the Purse',publisher:'U.S. House of Representatives',url:'https://history.house.gov/Institution/Origins-Development/Power-of-the-Purse/',publishedAt:null,referencePeriod:'歳入法案の起点と議会の歳出権'}),
  checked({sourceId:'house-impeachment',title:'House Civics 101 — Impeachment and revenue powers',publisher:'U.S. House of Representatives',url:'https://history.house.gov/Blog/2017/April/4-5-Education-Civics/',publishedAt:'2017-04-05',referencePeriod:'下院の弾劾訴追・歳入法案・調査権限'}),
  checked({sourceId:'house-oversight',title:'Congressional Oversight Manual',publisher:'Congressional Research Service',url:'https://crsreports.congress.gov/product/pdf/RL/RL30240',publishedAt:null,referencePeriod:'委員会調査、文書要求、召喚状などの監督手段'}),
  checked({sourceId:'crs-reconciliation',title:'The Budget Reconciliation Process',publisher:'Congressional Research Service',url:'https://crsreports.congress.gov/product/pdf/R/R44058',publishedAt:null,referencePeriod:'財政調整法と上院の討論制限・バードルール'}),
  checked({sourceId:'ustr-trade-agenda',title:'2026 Trade Policy Agenda and 2025 Annual Report',publisher:'Office of the U.S. Trade Representative',url:'https://ustr.gov/sites/default/files/files/Press/Releases/2026/2026%20Trade%20Policy%20Agenda%202025%20Annual%20Report.pdf',publishedAt:'2026-02-16',referencePeriod:'トランプ政権の通商政策方針と2025年措置'}),
  checked({sourceId:'usda-trade',title:'Agricultural Trade — Charting the Essentials',publisher:'USDA Economic Research Service',url:'https://ers.usda.gov/data-products/ag-and-food-statistics-charting-the-essentials/agricultural-trade',publishedAt:null,updatedAt:'2026-06-30',referencePeriod:'2025年農産物輸出、対中輸出減少と大豆需要'}),
];
