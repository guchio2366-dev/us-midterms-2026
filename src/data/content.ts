/**
 * Stable introductory copy. Dated research, news, candidate and issue material
 * lives in the research modules so that publication state is enforced once.
 */
export interface IntroductionSection {
  title: string;
  body: string;
}

export const introductionContent = {
  purpose: '米国中間選挙の情勢と争点を知り、州ごとの当選者を仮定して、議席配分と議会の権限への影響を確かめるサイト。',
  institution: '米国議会は上院と下院から成り、中間選挙は大統領の4年の任期の中間に行われる。2026年は上院の100議席中35議席と、下院の全435議席を選び直す。',
  impact: '議席配分が変わると、法案や予算を決め、大統領の政策や人事を進めたり制約したりする議会の力関係が変わる。',
  issueOverview: [
    '今回の中間選挙では、トランプ政権の運営や政策への評価が、全国の選挙情勢を左右する大きな要因となる。',
    '都市部では民主党、地方部では共和党の支持が強い傾向があり、郊外では支持が分かれている。',
    '物価や雇用、移民、医療などは複数の州に共通する論点で、同じ政策でも地域の産業や暮らしによって受け止め方が異なる。',
    '候補者の実績や政策姿勢、地元との関係によって、全国的な党派の傾向と異なる結果になる場合もある。',
    '支持する相手が変わることに加え、どの支持層が実際に投票に行くかも結果を左右する。',
    '全国の傾向と各州の事情を併せて読むことで、接戦の理由や議席が動く条件を考えやすくなる。',
  ],
  capability: '地図で州の情勢・候補者・争点を確認し、当選者や会派を選ぶと、上院の議席配分がどう変わるか試せる。',
  sourceIds: [
    'senate-class-2',
    'house-explained',
    'house-legislative-process',
    'pew-midterms-2026',
    'pew-community-partisanship-2024',
    'pew-turnout-2022',
  ],
} as const;

export const introductionDetails: IntroductionSection[] = [
  {
    title: '上院のClass制度',
    body: '上院議員の任期は6年です。議席をClass I・II・IIIに分け、2年ごとに一つのClassを順番に改選します。各州の二つの上院議席は、原則として異なるClassに属します。',
  },
  {
    title: '2026年の上院選挙',
    body: 'Class IIの通常選挙33議席に加え、フロリダ州とオハイオ州で特別選挙を行います。フロリダではマルコ・ルビオ前議員が国務長官に、オハイオではJ.D.ヴァンス前議員が副大統領に就任して任期途中の欠員が生じました。両州では暫定任命された議員が在職し、特別選挙で残任期を担う議員を選びます。',
  },
];

export const replaceableContentVersion = 'research-contract-2026-09-11';
