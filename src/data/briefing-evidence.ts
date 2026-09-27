/** Presentation of the evidence already recorded for each editorial finding.
 * Subgroup tables are not whole-electorate Poll records: their sample sizes and
 * uncertainty must not be borrowed from the complete survey.
 */
export interface BriefingEvidenceDisplay {
  electionId: string;
  sourceLabel: string;
  periodLabel: string;
  populationLabel: string;
  note: string;
  pollRows?: { pollId: string; label: string; sampleScope?: 'study' }[];
  table?: { caption: string; columns: string[]; rows: string[][] };
}

export const briefingEvidenceDisplays: BriefingEvidenceDisplay[] = [
  {
    electionId: '2026-AK-2-regular',
    sourceLabel: 'Data for Progress',
    periodLabel: '2026年7月28日〜8月4日',
    populationLabel: '順位を付けた回答を反映した、仮想の最終集計',
    pollRows: [{ pollId: 'poll-ak-dfp-2026-08-final', label: '最終2候補への再配分後', sampleScope: 'study' }],
    note: '第一希望とは集計の分母が異なる。53%対47%は勝率や支持の増加を示す数字ではない。',
  },
  {
    electionId: '2026-IA-2-regular',
    sourceLabel: 'YouGov',
    periodLabel: '2026年9月3〜8日',
    populationLabel: '同じ調査を、登録有権者と厳しい投票予定者基準で比較',
    pollRows: [
      { pollId: 'poll-ia-yougov-2026-09', label: '登録有権者全体' },
      { pollId: 'poll-ia-yougov-2026-09-strict-lv', label: '厳しい投票予定者基準（strict LV）' },
    ],
    note: '時系列の支持変化ではない。strict集計では「必ず投票する」が100%だが、詳しい抽出条件は未記載。',
  },
  {
    electionId: '2026-ME-2-regular',
    sourceLabel: 'YouGov',
    periodLabel: '2026年9月2〜8日',
    populationLabel: '登録有権者の、自己申告による2024年大統領選の投票先別',
    table: {
      caption: '過去の投票先と、今回の上院投票先',
      columns: ['2024年の投票先', 'ジャクソン', 'コリンズ'],
      rows: [['ハリス', '86%', '5%'], ['トランプ', '4%', '89%']],
    },
    note: '現在の支持政党別ではない。投票予定者全体の48%対44%とは対象が異なり、部分集計の誤差も大きい。',
  },
  {
    electionId: '2026-MI-2-regular',
    sourceLabel: 'Emerson College Polling',
    periodLabel: '2026年9月12〜14日',
    populationLabel: '同じ投票予定者調査の、上院選と知事選の別設問',
    table: {
      caption: '選挙ごとの候補者支持率',
      columns: ['選挙', '民主党候補', '共和党候補'],
      rows: [['上院', 'エルサイード 48%', 'ロジャーズ 46%'], ['知事', 'ベンソン 49%', 'ジェームズ 42%']],
    },
    note: '民主党候補の差は上院2ポイント、知事7ポイント。選挙間の差だけで、個人の投票理由は特定できない。',
  },
  {
    electionId: '2026-NH-2-regular',
    sourceLabel: 'co/efficient',
    periodLabel: '2026年9月9〜11日',
    populationLabel: '同じ投票予定者調査の、大統領評価と上院投票先の別設問',
    table: {
      caption: '大統領への評価と、上院候補への支持',
      columns: ['設問', '公表結果'],
      rows: [['大統領の職務評価', '不支持 56%'], ['上院の投票先', 'パパス 46% ／ スヌヌ 46%']],
    },
    note: '職務不支持56%と、本人・政策への不支持53%は別設問。個々人の回答の組合せは分からない。',
  },
  {
    electionId: '2026-NC-2-regular',
    sourceLabel: 'Sabato / Inside Elections',
    periodLabel: 'Sabato 9月22日版 ／ Inside 9月17日版',
    populationLabel: '民主党クーパーと共和党ワトリーの選挙に対する機関の評価',
    table: {
      caption: '収録した2機関の情勢評価',
      columns: ['評価機関', '原評価'],
      rows: [['Sabato', 'Lean D'], ['Inside Elections', 'Tilt D']],
    },
    note: 'いずれも民主党寄りの評価。支持率や当選確率ではない。確認範囲は出典に記載。',
  },
  {
    electionId: '2026-OH-3-special',
    sourceLabel: 'Fox News Poll',
    periodLabel: '2026年8月6〜10日',
    populationLabel: '登録有権者の支持政党別。未定者への傾きの追質問を含む',
    table: {
      caption: '支持政党別の上院投票先',
      columns: ['支持政党', 'ブラウン', 'ハステッド'],
      rows: [['民主党', '97%', '3%'], ['共和党', '11%', '87%'], ['無党派', '66%', '28%']],
    },
    note: '8月の単回調査。部分集計の誤差は全体より大きく、9月の別調査の先行理由には転用できない。',
  },
  {
    electionId: '2026-TX-2-regular',
    sourceLabel: 'Marist Poll',
    periodLabel: '2026年9月17〜20日',
    populationLabel: '登録有権者の支持政党別',
    table: {
      caption: '支持政党別の上院投票先',
      columns: ['支持政党', 'タラリコ', 'パクストン'],
      rows: [['民主党', '98%', '1%未満'], ['共和党', '9%', '87%'], ['無党派', '55%', '35%']],
    },
    note: '無党派では20ポイント差。部分集計の誤差は全体より大きく、支持の増加や実際の投票参加を示さない。',
  },
];

export function briefingEvidenceDisplay(electionId: string) {
  return briefingEvidenceDisplays.find(item => item.electionId === electionId);
}
