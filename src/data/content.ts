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
      {text:'今回の中間選挙は、トランプ大統領への信任を問う意味合いが強い。',strong:true},
    ],
    [
      {text:'物価・雇用・移民・医療などへの政権の対応を、有権者がどう評価するかが大きな焦点となる。'},
    ],
    [
      {text:'都市部では民主党、地方部では共和党の支持が強い傾向がある。',strong:true},
    ],
    [
      {text:'郊外では支持が分かれ、地域の産業や暮らしによって政策の受け止め方も異なる。'},
    ],
    [
      {text:'候補者の実績・政策・地元との関係も、勝敗を左右する。',strong:true},
    ],
    [{text:'全国的な政権評価や党派の傾向に加え、候補者個人への評価と、支持者が実際に投票に行くかを見る。'}],
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

/** Approved reader copy; changing figures are supplied by the current data. */
export const approvedIntroduction = {
  purpose: '米国中間選挙の動向、見通しを自ら判断できるようになるサイトです。',
  goals: [
    '米国中間選挙が米国政治においてどのような位置づけで、米国の何を変えうるのかを理解すること',
    '日々のニュースが米国中間選挙へ与える影響を自ら考察できるようになること',
    '米国中間選挙にかかわるニュースを継続的に更新し、読者のキャッチアップを助けること',
  ],
  institution: (senateTotal:number,contested:number,houseTotal:number,regular:number,special:number,states:number) => [
    `米国中間選挙は大統領の４年の任期の中間に行われる選挙で、今回は上院${senateTotal}議席のうち${contested}議席と、下院全${houseTotal}議席を選び直します。投票日は2026年11月３日です。`,
    '米国議会は上院・下院の二院制です。上院が下院に優越するわけではなく、法律を成立させるには原則として両院が同じ内容を可決し、大統領への手続を経る必要があります。',
    `上院議員の任期は６年で、２年に一度、約３分の１が改選されます。議席を３つの組に分ける仕組みをClass制度といい、今回通常改選されるのはClass IIの${regular}議席です。米国には${states}州あり、それぞれの州から２人ずつ選出されます。`,
    `残る${special}議席は、前任者が任期途中で副大統領、国務長官に就任するため辞職した、オハイオ州とフロリダ州の特別選挙です。現在は任命された後任議員が務めており、今回は残りの任期を担う議員を選びます。`,
  ],
  issues: [
    '選挙では、物価や雇用、移民、外交など、候補者や政党を選ぶ際に争点となる課題は数多くあります。',
    'ここでは、米国全土で共通する争点やいくつかの隣接する州にまたがる争点、候補者や州に固有の争点を整理します。各ニュースが米国でどのように受け止められ、投票行動に表れると考えられるかを理解できます。',
  ],
  updates: (count:number) => [
    'ここでは未配分とした州を注目州として、注目州での争点や候補者の違い、その州に関連するニュースをまとめています。',
    `${count}州の中から一つの州を選択すると、左側にはその州での投票調査の結果とその解釈、真ん中にはその州民の投票行動を左右しうる論点を、右側にはその州に関するニュースや今後投票行動が変化しうる予定とその解説が表示されます。`,
    '各注目州で議論されていることや各候補者の特徴的な発言を引用しつつその州特有の論点を挙げ、直近のニュースや投票行動を左右しうると思われる今後の予定を確認できます。',
  ],
} as const;
