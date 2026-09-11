/**
 * Stable first-visit copy. Dated research, news, candidate and issue material
 * lives in the research modules so that publication state is enforced once.
 */
export interface GuideSection {
  title: string;
  body: string;
}

export const guideContent: { intro: string; sections: GuideSection[] } = {
  intro: 'このサイトは、2026年の米国中間選挙を「議席が動くと、議会の権限がどう変わるか」という順番で読むための入口です。ニュース、議席と権限、地図・シミュレーション、出典を行き来しながら、確認できた事実と仮定を分けてご覧ください。',
  sections: [
    { title: '米国議会', body: '議会は下院と上院から成ります。法案、歳出、監督、指名承認、条約、弾劾などで役割と必要な票数が異なります。' },
    { title: '中間選挙', body: '大統領選の2年後に行われ、下院は全435議席、上院は通常一つのClass（約3分の1）の議席を改選します。2026年はClass IIの通常選挙33議席に加え、フロリダ州とオハイオ州の特別選挙2議席を行います。フロリダではマルコ・ルビオ前議員が国務長官に、オハイオではJ.D.ヴァンス前議員が副大統領に就任して任期途中の欠員が生じました。両州は州法に基づく暫定任命を置き、2026年の特別選挙で残任期を担う議員に置き換えます。' },
    { title: '上院のClass制度', body: '上院議員の任期は6年です。議席をClass I・II・IIIに分け、2年ごとに一つのClassを順番に改選します。各州の二つの上院議席は、原則として異なるClassに属します。' },
    { title: '地図の読み方', body: '選挙情勢モードは評価機関の分類、投票前の議席構成モードは現職会派を示します。色は州全体の支持率や当選確率そのものではありません。' },
    { title: 'シミュレーションの読み方', body: '手動シミュレーションは、各対象議席の会派を利用者が置き換えた場合の議席数です。権限から逆算する州の自動経路と因果係数は研究中で、未確認の確率は表示しません。' },
    { title: '出典と更新', body: 'カード、州詳細、権限表、論点レポートには対応する出典と対象期間を付けます。内容が更新された場合は、画面上の基準日とデータ版を確認してください。' },
  ],
};

export const replaceableContentVersion = 'research-contract-2026-09-11';
