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
  detail: string;
  nextData: string;
  limitation: string;
  sourceIds: string[];
  evidenceIds: string[];
}

export const briefingLenses: BriefingLens[] = [
  {
    "electionId": "2026-AK-2-regular",
    "axis": "convert",
    "question": "第三候補の支持者の票を加えると、どちらが先行するか",
    "finding": "第三候補支持者の投票順位を加味した調査では、ペルトラが53%対47%で先行している。",
    "evidence": "Data for Progressの7月28日〜8月4日調査。順位付け投票は、第一希望で過半数に届く候補がいなければ、最下位候補を除き、票を次の希望へ移す。この調査は回答者の順位を使い、最終2人への再配分を試算した。",
    "detail": "主要2候補のどちらにも順位を付けなかった第三候補支持者が、全員サリバンを選ぶと仮定しても52%対48%。この仮定では、サリバンへの追加の票はペルトラのリードを縮めるが、逆転には届かない。",
    "nextData": "最終2人への再配分を尋ねる次の調査で、ペルトラの先行が続くか。最終候補に順位を付けない人の割合も追う。",
    "limitation": "7〜8月の605人の投票予定者調査で、実際の開票結果や最新情勢の断定ではない。52%対48%は未移転の第三候補票だけを動かす仮定。第一希望と最終集計は分母が異なり、割合の増加をそのまま移転票の量とは読めない。",
    "sourceIds": [
      "briefing-dfp-ak-tables-20260817",
      "briefing-alaska-rcv"
    ],
    "evidenceIds": [
      "ev-briefing-ak-rcv",
      "ev-briefing-ak-rules"
    ]
  },
  {
    "electionId": "2026-IA-2-regular",
    "axis": "convert",
    "question": "投票参加の違いは、どちらに有利か",
    "finding": "YouGov調査では、「必ず投票する」層で民主党チュレクの支持が厚い。",
    "evidence": "9月3〜8日の調査で、チュレク／ヒンソンは登録有権者全体では44%／43%、投票予定者を厳しく絞った集計では47%／43%。後者は全員が「必ず投票する」と回答し、民主候補のリードが大きい。",
    "detail": "「必ず投票する」と答えたのは、2024年のハリス投票者の94%、トランプ投票者の90%。この調査では、民主党側に投票参加の面で有利な材料がある。",
    "nextData": "同じ調査設問で、支持層の投票意思と未定層の投票先の変化を追う。",
    "limitation": "同一調査の集計対象を変えた比較で、支持率の時間的な上昇ではない。投票意思・過去の投票先は自己申告であり、実際の投票率や勝敗を確定しない。",
    "sourceIds": [
      "poll-yougov-ia-2026-09"
    ],
    "evidenceIds": [
      "ev-briefing-ia-turnout"
    ]
  },
  {
    "electionId": "2026-ME-2-regular",
    "axis": "broaden",
    "question": "コリンズは大統領選の陣営を越えて支持されているか",
    "finding": "YouGov調査では、コリンズの支持はトランプ投票者に厚く、ハリス投票者からは5%にとどまる。",
    "evidence": "9月2〜8日の登録有権者調査では、2024年のトランプ投票者の89%がコリンズ、ハリス投票者の86%がジャクソンを支持。支持は大統領選の投票先ごとにほぼ分かれている。",
    "detail": "ハリス投票者ではコリンズ5%・未定8%、トランプ投票者ではジャクソン4%・未定6%。この内訳では、コリンズが前回の民主党大統領候補の支持層を広く取り込んでいるとはいえない。",
    "nextData": "コリンズがトランプ投票者の支持を保ちつつ、ハリス投票者や未定層へ支持を広げられるかを同じ区分で追う。",
    "limitation": "過去の投票先は自己申告で、現在の政党支持とは異なる。登録有権者の内訳であり、投票予定者全体の集計とは分けて読む。部分標本の誤差は大きく、政権との距離を取る姿勢の効果を測った数字ではない。",
    "sourceIds": [
      "poll-yougov-me-2026-09"
    ],
    "evidenceIds": [
      "ev-briefing-me-pastvote"
    ]
  },
  {
    "electionId": "2026-MI-2-regular",
    "axis": "broaden",
    "question": "同じ州でも、選挙によって民主党の優位は違うか",
    "finding": "同じEmerson調査で、民主党のリードは知事選7ポイントに対し、上院選は2ポイントにとどまる。",
    "evidence": "9月12〜14日の調査では、上院はエルサイード48%・ロジャーズ46%、知事は民主党ベンソン49%・共和党ジェームズ42%。同じ州の選挙でも、上院は共和党候補がより競っている。",
    "detail": "上院の支持は、大卒層ではエルサイード53%・ロジャーズ42%、非大卒層では45%・48%。州全体の数字の内側にも、支持の違いがある。",
    "nextData": "エルサイードが非大卒層で差を縮めるか、ロジャーズが大卒層で支持を広げるか。次の調査も知事選と上院選を同じ回答者で比較する。",
    "limitation": "投票予定者1,000人の単回調査。選挙間の差は、候補者個人の魅力や党内対立だけで説明できない。学歴別の部分標本の誤差は全体より大きい。",
    "sourceIds": [
      "obs-emerson-mi-20260917"
    ],
    "evidenceIds": [
      "ev-briefing-mi-ballots"
    ]
  },
  {
    "electionId": "2026-NH-2-regular",
    "axis": "broaden",
    "question": "政権への不満は、民主党候補への支持に直結しているか",
    "finding": "トランプの職務不支持が56%でも、上院選は46%対46%で並んでいる。",
    "evidence": "9月9〜11日のco/efficient調査では、民主党パパスと共和党スヌヌが同率。同じ調査の知事選は共和党アヨット55%・民主党ウォーミントン34%で、政権不支持がそのまま民主党の優位にはなっていない。",
    "detail": "上院選の未定は9%。大統領への評価、上院候補の選択、知事候補の選択を同じ調査で比べると、共和党の候補者全員が同じ評価を受けているわけではないことがわかる。",
    "nextData": "トランプの職務を支持しない人の上院投票先と、未定層の候補者評価が公表されれば、政権評価と候補者選びの関係を確かめられる。",
    "limitation": "投票予定者958人の調査。個々人の回答の組合せはこの公表表にはなく、スヌヌの独立性が支持を生んだとは断定できない。職務不支持56%は、本人・政策への不支持53%という別設問と区別する。",
    "sourceIds": [
      "obs-coefficient-nh"
    ],
    "evidenceIds": [
      "ev-briefing-nh-ballots"
    ]
  },
  {
    "electionId": "2026-NC-2-regular",
    "axis": "broaden",
    "question": "民主党が共和党から議席を奪う可能性は、どう評価されているか",
    "finding": "共和党が守るこの議席では、2機関とも民主党クーパーがやや有利と評価している。",
    "evidence": "収録した9月22日版のSabatoはLean D、9月17日版のInside ElectionsはTilt D。民主党にとって、共和党から議席を奪う有力な対象と位置づけられている。",
    "detail": "相手候補は共和党ワトリー。2機関とも民主党側に傾いた評価だが、民主党の勝利が確実という評価ではない。",
    "nextData": "候補別の支持率と党派別の内訳を追加し、クーパーがどの層に支持されているかを示す。",
    "limitation": "この欄には候補別・党派別調査をまだ収録していない。上記は保存済みの情勢評価で、支持率や当選確率ではない。Sabato公式本文の再取得は未完了で、評価の確認範囲は記録に示す。",
    "sourceIds": [
      "sabato-senate-2026",
      "inside-senate-ratings-2026"
    ],
    "evidenceIds": [
      "ev-briefing-nc-sabato",
      "ev-briefing-nc-inside"
    ]
  },
  {
    "electionId": "2026-OH-3-special",
    "axis": "broaden",
    "question": "ブラウンは、民主党支持者の外にも支持を持つか",
    "finding": "8月のFox調査では、ブラウンが無党派の66%、共和党支持者の11%からも支持を得ている。",
    "evidence": "8月6〜10日の登録有権者調査では、民主党支持者の97%もブラウンを支持。自党の結束と党派を越えた支持が同時に表れ、全体ではブラウン53%・ハステッド45%だった。",
    "detail": "共和党支持者ではハステッド87%、無党派では28%。ブラウン支持の内訳を読む材料であり、9月の別調査のリードを説明する数字ではない。",
    "nextData": "次の党派別調査でもブラウンの無党派・共和党支持層での支持が続くかを確認する。",
    "limitation": "8月の単回調査で、現在の支持や支持の増減を断定しない。未定者へ、どちらに傾いているかを尋ねた回答も含む。党派別集計の誤差は全体より大きい。",
    "sourceIds": [
      "briefing-fox-oh-crosstabs-20260813"
    ],
    "evidenceIds": [
      "ev-briefing-oh-party"
    ]
  },
  {
    "electionId": "2026-TX-2-regular",
    "axis": "broaden",
    "question": "タラリコは民主党支持者以外からも支持を得ているか",
    "finding": "Marist調査では、タラリコが無党派で20ポイント先行し、共和党支持者の9%からも支持を得ている。",
    "evidence": "9月17〜20日の登録有権者調査で、無党派はタラリコ55%・パクストン35%。民主党支持者の98%もタラリコを選び、自党の結束と党派を越えた支持が全体の50%対44%という先行を支えている。",
    "detail": "共和党支持者はパクストン87%・タラリコ9%・その他3%・未定1%。この調査では、共和党支持者の多くが投票先未定なのではなく、一部が民主党候補を選んでいる。",
    "nextData": "投票予定者に絞った調査でも、タラリコの無党派での優位と共和党支持層からの支持が続くかを追う。",
    "limitation": "登録有権者1,139人の単回調査で、支持の増加や実際の投票参加は示さない。党派別集計の誤差は全体より大きい。党幹部の支援の違いがこの支持を生んだかは特定できない。",
    "sourceIds": [
      "briefing-marist-tx-tables-20260923"
    ],
    "evidenceIds": [
      "ev-briefing-tx-party"
    ]
  }
];
