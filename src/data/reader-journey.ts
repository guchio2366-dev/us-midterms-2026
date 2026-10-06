/** Four-stage order; original chapter leads are preserved. Complete opening prose comes from approved-reader-copy.json. */
export const readerIntroduction = '米国中間選挙の動向と見通しを、自ら判断できるようになるサイトです。中間選挙は、大統領の4年の任期の中間に行われます。連邦議会では下院の全議席と上院の約3分の1が改選されます。大統領は交代しませんが、議会の構成が変わることで、政権が政策を進める条件も変わります。このサイトでは、日々のニュースを、各州の事情や候補者の政策と関連づけて解説します。そのうえで、候補者の当落が議会の議席配分をどう変え、どの政策の実現につながりうるかを考えます。';

export const readerSections = [
  {id:'reader-01',number:'01',title:'中間選挙の仕組み',introduction:'上院・下院の役割と改選の仕組みを説明します。議会が法律や予算を決める権限を理解することで、今回の選挙で何が変わるのかを把握できます。'},
  {id:'reader-04',number:'02',title:'議会の議席配分',introduction:'各州の当落を議席数に置き換え、どちらの党が多数派になるかを示します。上院では、今回改選されない議席も含めて計算します。'},
  {id:'reader-03',number:'03',title:'各州の情勢と候補者',introduction:'各州の世論調査、地域の事情、候補者の政策や実績をまとめ、どのような変化が各候補者への支持につながるかを解説します。'},
  {id:'reader-06',number:'04',title:'今後の見通し',introduction:'現在の見通しと、その判断の根拠をまとめます。今後の世論調査や政策発表など、見通しを更新するために確認すべき情報を示します。'},
] as const;
