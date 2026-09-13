/**
 * Stable introductory copy. Dated research, news, candidate and issue material
 * lives in the research modules so that publication state is enforced once.
 */
export interface IntroductionSection {
  id: string;
  title: string;
  body: string;
}

export type IntroTextPart = { text: string; strong?: true };
export type IntroSentence = readonly IntroTextPart[];

export const introductionContent = {
  purpose: '2026年11月3日（米国現地）に行われる中間選挙の情勢と争点を知り、州ごとの当選者を仮定して、議席配分と議会の権限への影響を確かめるサイト。',
  institution: (senateTotal: number, contested: number, houseTotal: number) => `米国議会は上院と下院から成り、中間選挙は大統領の4年の任期の中間に行われる。2026年は上院の${senateTotal}議席中${contested}議席と、下院の全${houseTotal}議席を選び直す。`,
  impact: '議席配分が変わると、法案や予算を決め、大統領の政策や人事を進めたり制約したりする議会の力関係が変わる。',
  issueOverview: [
    [
      {text:'今回の中間選挙では、'},
      {text:'トランプ政権の運営や政策への評価',strong:true},
      {text:'が、全国の選挙情勢を左右する大きな要因となる。'},
    ],
    [
      {text:'都市部',strong:true},{text:'では民主党、'},
      {text:'地方部',strong:true},{text:'では共和党の支持が強い傾向があり、'},
      {text:'郊外',strong:true},{text:'では支持が分かれている。'},
    ],
    [
      {text:'物価や雇用、移民、医療',strong:true},
      {text:'などは複数の州に共通する論点で、同じ政策でも地域の産業や暮らしによって受け止め方が異なる。'},
    ],
    [
      {text:'候補者の実績や政策姿勢、地元との関係',strong:true},
      {text:'によって、全国的な党派の傾向と異なる結果になる場合もある。'},
    ],
    [
      {text:'支持する相手が変わることに加え、'},
      {text:'どの支持層が実際に投票に行くか',strong:true},
      {text:'も結果を左右する。'},
    ],
    [{text:'全国の傾向と各州の事情を併せて読むことで、接戦の理由や議席が動く条件を考えやすくなる。'}],
  ] satisfies readonly IntroSentence[],
  capability: '地図で州の情勢・候補者・争点を確認し、当選者や会派を選ぶと、上院の議席配分がどう変わるか試せる。',
  institutionSourceIds: ['senate-class-2','house-explained','house-legislative-process','federal-election-date'],
  issueSourceIds: [
    'pew-midterms-2026',
    'pew-community-partisanship-2024',
    'pew-turnout-2022',
  ],
} as const;

export const introductionDetails: IntroductionSection[] = [
  {
    id: 'classes',
    title: '上院のClass制度',
    body: '上院議員の任期は6年である。議席をClass I・II・IIIに分け、2年ごとに一つのClassを順番に改選する。各州の二つの上院議席は異なるClassに属する。',
  },
  {
    id: 'special-elections',
    title: '2026年の上院選挙',
    body: 'Class IIの通常選挙に加え、フロリダ州とオハイオ州で特別選挙を行う。フロリダではマルコ・ルビオ前議員の国務長官就任、オハイオではJ.D.ヴァンス前議員の副大統領就任に伴う辞職で、任期途中の欠員が生じた。暫定任命された議員が在職し、特別選挙で残任期を担う議員を選ぶ。新たな6年任期が始まる選挙ではない。',
  },
];

export const congressionalControlCases: IntroductionSection[] = [
  {id:'house',title:'下院だけ反対党',body:'法案・歳出の修正を求め、委員会調査を主導し、過半数で弾劾訴追できる。上院の指名承認や大統領罷免は単独ではできない。'},
  {id:'senate',title:'上院だけ反対党',body:'指名承認、議題、委員会調査を主導し、法案に条件を付けられる。条約への同意や弾劾有罪には、出席議員の3分の2が必要である。'},
  {id:'both',title:'両院とも反対党',body:'立法・予算・監督を通じた制約が強まる。既存法に基づく行政権限は残り、大統領の拒否権を覆すには両院それぞれで3分の2の賛成が必要となる。'},
];

export const replaceableContentVersion = 'research-contract-2026-09-11';
