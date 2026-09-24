/** Editorial questions are explicit and independent of source/material ordering.
 * Revisit the finding, limitations and sources together when a new observation arrives.
 */
export const briefingAxes = {
  consolidate: { label:'支持を固める', description:'自党支持者や、まだ候補を決めていない人が、どちらを選ぶか。' },
  broaden: { label:'支持を広げる', description:'無党派や相手党の支持者にも、候補者の支持が広がっているか。' },
  convert: { label:'支持を票にする', description:'支持する人が実際に投票するか。順位付け投票では、次の希望が誰へ移るか。' },
} as const;

export interface BriefingLens {
  electionId: string;
  axis: keyof typeof briefingAxes;
  question: string;
  finding: string;
  evidence: string;
  nextData: string;
  limitation: string;
  sourceIds: string[];
}

export const briefingLenses: BriefingLens[] = [
  {
    electionId:'2026-AK-2-regular',axis:'convert',
    question:'第一希望で届かない票は、誰へ移るか',
    finding:'順位付け投票では、最初の支持率だけで勝敗は読めない。第一希望の差と、他候補から票が移った後の差を分けて見る必要がある。',
    evidence:'9月のAARP公表調査は第一希望と最終2人の集計を掲載。Peltolaの割合は第一希望46%、最終集計53%と、同じ調査でも段階が異なる。',
    nextData:'第三候補の支持者の次順位、順位を付けず集計から外れる票、最終2人の組み合わせ。第一希望同士・最終集計同士で比較する。',
    limitation:'調査内の再配分は実際の開票結果ではない。異なる調査の第一希望と最終集計を、支持率の増減として比較できない。',
    sourceIds:['obs-aarp-ak-20260917'],
  },
  {
    electionId:'2026-IA-2-regular',axis:'convert',
    question:'誰が投票に来ると、差が変わるか',
    finding:'同じYouGov調査でも、投票者の想定を変えると民主候補のリードは1〜4ポイントに変わる。支持率の差だけでなく、投票に来る層の違いが重要だ。',
    evidence:'9月3〜8日のYouGov調査で、Turekのリードは登録有権者で1、広い投票者想定で2、厳しい想定で4ポイント。同じ回答を異なる条件で集計した結果。',
    nextData:'同一調査の投票者想定別の結果と、党派・年齢別の投票意欲。想定を変えても優勢側が同じかを確認する。',
    limitation:'独立した3調査ではなく、4ポイントが最も正確という意味でもない。今後の投票参加の変化は、この比較だけでは分からない。',
    sourceIds:['poll-yougov-ia-2026-09'],
  },
  {
    electionId:'2026-ME-2-regular',axis:'broaden',
    question:'政権と距離を取る姿勢は、支持を広げるか',
    finding:'コリンズは政権への賛否を案件ごとに分けている。無党派に届く可能性はあるが、発言や採決だけで支持の広がりまでは判断できない。',
    evidence:'給付構想やカナダ関税には異論を示す一方、9月15日のMatthew Byrne氏の判事承認には賛成。ジャクソンは承認票や関税対応を批判している。',
    nextData:'コリンズの共和党支持層での支持と、無党派・民主党支持層での支持。政策への賛否と候補者への投票先を区別する。',
    limitation:'今回の解説には、これらの行動による党派別支持の変化を示す比較調査は収録していない。',
    sourceIds:['obs-maine-public-collins-payout','obs-reuters-byrne','obs-reuters-canada-tariffs-20260917','obs-jackson-byrne'],
  },
  {
    electionId:'2026-MI-2-regular',axis:'consolidate',
    question:'予備選後の結束は、有権者にも届くか',
    finding:'ハリス氏とエルサイードの共同登壇は、民主党側の結束を示す動き。ただし、政治家の協力と有権者の支持回復は分けて判断したい。',
    evidence:'9月22日、両氏は黒人女性の妊産婦医療を扱う場で登壇し、予備選後の結束を訴えた。',
    nextData:'民主党支持者の投票先・未定割合・投票意欲。予備選後の同じ設問の調査で、支持が固まっているかを確認する。',
    limitation:'共同登壇後の支持率への効果は、現時点の収録資料から特定できない。出来事の前後だけで因果関係とはしない。',
    sourceIds:['obs-ap-mi-harris-elsayed-result-20260922'],
  },
  {
    electionId:'2026-NH-2-regular',axis:'consolidate',
    question:'並ぶ支持率を、未定層がどう動かすか',
    finding:'9月調査は両候補46%で、未定が9%残る。未定者をどちらかへ足し込まず、候補への評価と投票先がどう固まるかが焦点になる。',
    evidence:'co/efficientの9月調査はPappas、Sununuとも46%、未定9%。トランプへの評価は別設問であり、上院候補の支持率とは区別する。',
    nextData:'未定者の党派構成、候補者の認知・好感度、重視する争点。同じ設問の次回調査で未定割合と候補支持の両方を確認する。',
    limitation:'未定9%が均等に分かれるとも、全員が投票するとも限らない。収録資料だけでは配分を判断できない。',
    sourceIds:['obs-coefficient-nh'],
  },
  {
    electionId:'2026-NC-2-regular',axis:'broaden',
    question:'州の党派傾向を越えて、支持を集めるか',
    finding:'2024年大統領選は共和党が勝利した一方、今回の上院の統合評価は民主党寄り。州の党派傾向と、候補者を含む選挙ごとの評価は同じではない。',
    evidence:'2024年の公式得票と、収録したSabato・Inside Electionsの上院評価を比較した。異なる選挙・時点の材料であり、支持率の推移ではない。',
    nextData:'両候補の支持率と党派別の内訳、未定割合。民主候補への支持が、どの層から来ているかを確認する。',
    limitation:'この欄にはノースカロライナの候補別・党派別調査をまだ収録していない。評価機関の分類から支持率や当選確率を計算しない。',
    sourceIds:['fec-pres-2024','sabato-senate-2026','inside-senate-ratings-2026'],
  },
  {
    electionId:'2026-OH-3-special',axis:'broaden',
    question:'共和党寄りの州で、ブラウンは支持を広げるか',
    finding:'2024年大統領選では共和党が勝った州で、9月の収録調査はブラウンが先頭。州の党派傾向だけで、上院候補の支持を決め付けられない。',
    evidence:'9月公表のTrafalgar調査でブラウンが先行。2024年大統領選の公式結果は州の背景であり、上院候補の現在の支持を測る調査とは別の材料。',
    nextData:'ブラウンの民主党支持層での支持に加え、無党派・共和党支持層での支持。同じ傾向が別の調査でも見られるかを確認する。',
    limitation:'現在の収録資料だけでは、先行がどの支持層によるものかを特定できない。州全体の結果から個人の投票変更は推定しない。',
    sourceIds:['obs-trafalgar-oh-20260917','fec-pres-2024'],
  },
  {
    electionId:'2026-TX-2-regular',axis:'consolidate',
    question:'共和党支持者は、パクストンにまとまるか',
    finding:'党内の支援は一様ではない。ただし、有力者の行動だけでは有権者の離反までは分からない。党派別の投票先を確かめることが、接戦の中身を読む鍵になる。',
    evidence:'トランプの支持やクルーズとの共同集会がある一方、9月21日夜のブッシュ、コーニンの資金集めにはパクストンが含まれなかった（記事公表は22日）。',
    nextData:'共和党支持者の投票先・未定割合・投票意欲と、無党派の支持。全体の支持率だけでは見えない、党内の結束と党派を越える支持を分けて確認する。',
    limitation:'資金集めに含まれなかった理由や、一般有権者への影響は未確認。現在のこの解説には党派別支持の時系列比較を収録していない。',
    sourceIds:['obs-houston-chronicle-tx-rally-result-20260921','obs-chron-tx-bush-cornyn-fundraiser-20260922'],
  },
];
