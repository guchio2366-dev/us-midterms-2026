import type { Source } from './model';
import type { EvidenceRef } from './research-model';
import type { ReaderCandidateExplanation } from './reader-candidate-explanations';

// Verbatim reader copy supplied after primary-source review on 2026-10-06.
// AK is in its own package. These paragraphs do not change policy records,
// version IDs, vote dates, or existing unknown stances.
export const candidateExplanations: ReaderCandidateExplanation[] = [
  {
    electionId: '2026-MI-2-regular',
    candidateId: 'cand-mi-mike-rogers',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '州内産業に合う通商交渉の手段として関税を使う',
        paragraphs: [{
          text: '8月29日付の陣営声明では、Rogersは対カナダ通商問題について、関税は必要だがどの状況にも一律に使える解決策ではないと説明し、Trump政権と協力してカナダとの貿易合意を実現する方針を示しました。本人が目的に挙げるのは、ミシガンの農家、自動車労働者、製造業に有利な条件を得ることです。「関税への条件付き支持」とは、この発言では関税を手段として残しつつ州内産業に合った交渉結果を求めるという意味です。どの品目の関税を何%にするか、何を達成すれば解除するかはこの声明にはなく、すべての一律関税を撤回すると約束したわけでもありません。',
          sourceIds: ['rogers-tariffs-2026'],
          evidenceIds: ['ev-rogers-tariffs'],
        }],
      },
      {
        heading: '頭金・信用履歴・供給の障壁を減らして住宅購入を支える',
        paragraphs: [{
          text: '住宅では、初めて家を買う際の頭金に529貯蓄制度を使えるようにすること、家賃を期限どおり払った履歴を信用評価に反映すること、住宅購入を妨げる規制を州と協力して減らすことを提案しています。建設業者向けには、新築を非課税とする住宅建設区域も掲げています。本人の説明では、頭金を貯めにくい、信用履歴を作りにくい、供給が増えにくいという別々の障壁に対応して持ち家への道を広げる狙いです。税優遇の対象となる税、制度の費用、具体法案は未確認で、州・地方の住宅規則を上院議員一人で変更できるという意味ではありません。',
          sourceIds: ['rogers-housing-2026'],
          evidenceIds: ['ev-rogers-housing'],
        }],
      },
      {
        heading: '読み書きと数学、実習を職業上の機会につなげる',
        paragraphs: [{
          text: '教育では2026年9月1日の本人寄稿で、読み書きと数学を職業上の機会の基礎と位置付けました。文字と音を対応させるphonics、小学3年時点の読解力に応じた進級規則の復活、Title Iの連邦資金を使った個別の読解補習、高校での実習・職業教育を支持しています。実習で分数・測定を使うことが、技能職の準備と数学の理解につながるという説明です。ここでも州の進級制度への提言と連邦教育予算の使い方を分ける必要があります。本人が紹介した工場の採用担当者の話は問題意識の例であり、州全体の学力や政策支持を測る調査ではありません。',
          sourceIds: ['rogers-education-2026'],
          evidenceIds: ['ev-rogers-education'],
        }],
      },
    ],
  },
  {
    electionId: '2026-MI-2-regular',
    candidateId: 'cand-mi-abdul-el-sayed',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '全員向けの医療保障と、移行中の既存保障の回復',
        paragraphs: [{
          text: 'El-SayedのMedicare for Allは、Medicareを全員へ自動的に広げ、眼科・歯科・聴覚を含む必要な医療を、保険料・受診時負担・免責額なしで保障する提案です。本人は、必要な治療と借金のどちらかを選ぶ状況をなくすためだと説明しています。雇用主や労組による追加の民間保険を必ずしも禁止する必要はないとも明記しています。移行中の方針としてMedicaidとACA補助の削減撤回、Medicareによる薬価交渉の対象拡大、大規模医療企業の集中対策を掲げています。全員向け保障、公的保険への選択加入、既存制度の削減撤回は対象が異なる政策であり、同じ「医療拡大」にまとめ過ぎないことが重要です。財源の全体像や採用する法案版はこの公約からは確認できません。',
          sourceIds: ['context-elsayed-health-20261006'],
          evidenceIds: ['ev-context-elsayed-health-20261006'],
        }],
      },
      {
        heading: '現行の対カナダ関税批判と、条件を付けた産業育成の関税案',
        paragraphs: [{
          text: '通商では、2026年9月1日の陣営発表で、Trump政権の対カナダ関税が州の自動車雇用と家計を損なうとして批判しました。一方、現在の詳細公約は関税そのものを全否定せず、成長産業を育てる対象限定の関税を支持しています。条件は、貿易相手に基準を明確に伝え、国内製造業が定着すれば終了させ、労組を産業政策の意思決定に加えることです。研究開発投資と組み合わせて州の製造業を育てる、というのが本人の理由です。Rogersも州内産業の利益を掲げますが、El-Sayedは現行の広範な運用への反対と、育成目的・終了条件を伴う別の関税案を分けて述べています。対象企業・税率・期間の数字は未提示です。',
          sourceIds: ['elsayed-tariffs-2026', 'context-elsayed-pocket-20261006', 'rogers-tariffs-2026'],
          evidenceIds: ['ev-elsayed-tariffs', 'ev-context-elsayed-pocket-20261006', 'ev-rogers-tariffs'],
        }],
      },
      {
        heading: '政治資金・議会・裁判所の改革と環境政策',
        paragraphs: [{
          text: '制度面では、企業や特別利益が政策を左右し過ぎるという問題意識から、企業系資金・外部支出の規制、公的な選挙資金、上院filibusterの廃止、最高裁判事の任期制を支持しています。環境では、五大湖を守るためのLine 5停止と再生可能エネルギーへの移行も公約です。これらは本人の政策選択であり、法律改正、議会規則の変更、司法上の制約など実現経路が同じという意味ではありません。',
          sourceIds: ['context-elsayed-democracy-20261006'],
          evidenceIds: ['ev-context-elsayed-democracy-20261006'],
        }],
      },
      {
        heading: 'AI開発の一時停止と、雇用・安全性への対応案',
        paragraphs: [{
          text: 'AIについては、2026年9月9日に、急速な能力向上のリスクを十分理解するまで開発を一時停止するよう求めたと陣営が発表しました。背景に挙げるのは、取り返しのつかない損害への懸念と雇用の自動化です。関連案には、強力なAI企業の統治への公的関与、自動化への課税を原資にした給付・賃金保険、導入前に安全性を評価する独立機関があります。停止を解除する数値基準・期間、対象モデルの境界、法案の最終版はこの発表からは確認できません。',
          sourceIds: ['elsayed-ai-2026'],
          evidenceIds: ['ev-elsayed-ai'],
        }],
      },
    ],
  },
  {
    electionId: '2026-IA-2-regular',
    candidateId: 'cand-ia-ashley-hinson',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '保険会社の判断の透明性を高め、患者の選択を支える',
        paragraphs: [{
          text: 'Hinsonの医療政策は、保険料・薬価の負担軽減と、保険会社の判断を比較できるようにする透明性を中心に説明できます。2026年8月5日にはHealth Insurance Transparency for Patients Actを提出したと発表しました。給付を認めなかった件数・割合と理由、判断や異議申立てにかかる時間、後で判断が覆った割合、事前承認の対象治療を、消費者に分かりやすい形で公表させる案です。本人は、保険会社の判断が見えないことが患者の不利益を生むため、情報公開で保険選びと説明責任を改善するとしています。これは保険の給付拒否を一律に禁止する案や、公的保険を新設する案とは仕組みが異なります。',
          sourceIds: ['context-hinson-insurance-transparency-20260805', 'hinson-costs-2026'],
          evidenceIds: ['ev-context-hinson-insurance-transparency-20260805', 'ev-hinson-costs'],
        }],
      },
      {
        heading: '農産物の売り先と生産費の両方を重視する',
        paragraphs: [{
          text: '農業では、E15（エタノール15%混合ガソリン）の通年販売、輸出先などの市場拡大、投入費の低減を掲げています。2026年9月2日の本人声明は、農家が生産を続けられるよう、California Proposition 12の規制に対抗することも明示しています。陣営は、5年間のFarm Bill、精密農業技術への支援、農場の世代間継承に関わる税負担軽減、若手農家の作物保険を関連実績に挙げています。これらの「下院通過」という陣営の説明と、法案の最終成立・実施は区別します。編集上の整理では、生産物の売り先と生産費の両方を重視する政策ですが、農家全体の支持率を示すものではありません。',
          sourceIds: ['hinson-farm-2026'],
          evidenceIds: ['ev-hinson-farm'],
        }],
      },
      {
        heading: '関税回避や強制労働の取締りを強化する',
        paragraphs: [{
          text: '2026年9月1日に事務所が掲載した下院演説では、Protecting American Industry and Labor from International Trade Crimes Actを支持しました。関税回避のための第三国経由の積替え、強制労働などに対する司法省の捜査・訴追能力を強化する案です。本人は、違法な輸入が米国の賃金や地方製造業を弱め、現行の取締り能力では不十分だと説明しています。事務所は前夜の下院通過を発表していますが、これは関税率を一律に引き上げる提案への支持ではありません。Turekが掲げる現行関税の終了とは対象の違う政策なので、単純な関税「賛成対反対」にしないことが重要です。',
          sourceIds: ['hinson-trade-2026', 'turek-platform-2026'],
          evidenceIds: ['ev-hinson-trade', 'ev-turek-platform'],
        }],
      },
      {
        heading: '住宅・育児・税負担の公約と、H.R.1への過去の票',
        paragraphs: [{
          text: '家計全体では、医療費に加え、住宅頭金の非課税貯蓄、機関投資家による一戸建て取得の規制、育児支援と税負担軽減を9月8日の陣営資料に挙げています。2025年7月3日にはH.R.1の上院修正への同意に賛成したことを下院の記録で確認できます。ただし、この法案全体への一票から、医療の各条項すべてについて本人が述べた理由を補うことはできません。',
          sourceIds: ['hinson-costs-2026', 'context-house-hr1-roll190-20250703'],
          evidenceIds: ['ev-hinson-costs', 'ev-context-hinson-hr1-roll190-20250703'],
        }],
      },
    ],
  },
  {
    electionId: '2026-IA-2-regular',
    candidateId: 'cand-ia-josh-turek',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '農家の収益、地域サービス、水・土壌の保全を合わせて考える',
        paragraphs: [{
          text: 'Turekは、地方経済を農家の収益、地域サービス、水・土壌の保全を合わせた課題として捉えています。2026年5月4日の地方政策発表では、農機を自分で修理しやすくするright-to-repair、肉などの原産国表示、肥料や農業関連企業の寡占対策を挙げました。小規模な農家・牧場が競争でき、資材や修理を限られた企業に依存し過ぎないようにする、というのが本人の説明です。現在の公約は、Farm Billの更新と連邦のright-to-repairに加え、本人が農家の危機を深めると批判する「混乱した関税」の終了も求めています。ただし、撤廃対象の関税命令・品目・税率は特定していません。',
          sourceIds: ['turek-rural-plan-2026', 'turek-platform-2026'],
          evidenceIds: ['ev-turek-rural', 'ev-turek-platform'],
        }],
      },
      {
        heading: '公的保険を選べる仕組みと、地方医療・薬価への支援',
        paragraphs: [{
          text: '医療では、Medicaidの資金回復、ACAの保護・拡大、地方病院と遠隔医療への支援を掲げ、公的な保険を選べるpublic optionの導入を求めています。2026年6月22日に陣営が報告した医療関係者・患者との意見交換会では、自分が子どもの頃に多くの手術を受けた経験を挙げ、医療へのアクセスを権利と考えることを提案理由として説明しました。現在の公約は、Medicareの薬価交渉、医師が必要とした治療の保険会社による拒否への規制も含みます。public optionの加入資格・保険料・財源・法案版は未確認で、El-Sayedの全員を対象にしたMedicare for Allと同一制度として扱いません。',
          sourceIds: ['turek-health-2026', 'turek-platform-2026', 'context-elsayed-health-20261006'],
          evidenceIds: ['ev-turek-health', 'ev-turek-platform', 'ev-context-elsayed-health-20261006'],
        }],
      },
      {
        heading: '労働者の交渉力、住宅、医療の権利と政治資金',
        paragraphs: [{
          text: '家計・労働では、最低賃金を引き上げて物価に連動させること、PRO Actによる団体交渉権の強化、私募投資会社による一戸建て・農地購入の禁止、住宅建設の許認可の簡素化を提案しています。企業の集中や住宅投資が働く人の負担を増やすという認識を、税・住宅・労働政策につなげています。さらにRoe v. Wadeが保障していた中絶の権利の法制化、避妊・IVFへのアクセス、企業PAC資金や議員・配偶者の株取引の禁止も公約です。これらは現在の候補者提案であり、各法案が成立したことを意味しません。',
          sourceIds: ['turek-platform-2026'],
          evidenceIds: ['ev-turek-platform'],
        }],
      },
      {
        heading: '陣営主催の意見交換会で紹介された、限定的な現場の声',
        paragraphs: [{
          text: '6月22日に陣営が報告した陣営主催の意見交換会では、Colfaxの薬局経営者Brad Maggが、Medicaid患者を受け入れる医療提供者が見つからず、精神科の処方を継続しにくいケースを紹介しています。これは陣営が掲載した一人の現場の経験談です。アイオワ住民全体の賛否、発生率、特定法案との因果関係、Turekへの支持率を測った資料ではありません。',
          sourceIds: ['turek-health-2026'],
          evidenceIds: ['ev-context-turek-health-roundtable-example-20260622'],
        }],
      },
    ],
  },
  {
    electionId: '2026-OH-3-special',
    candidateId: 'cand-oh-jon-husted',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '企業投資、技能訓練と行政手続の費用を雇用につなげる',
        paragraphs: [{
          text: 'Hustedは、企業が投資しやすい環境と技能習得を雇用拡大の柱に置いています。陣営の経歴説明では、IntelのLicking County工場誘致、企業の需要に沿ったTechCredなどの職業訓練、InnovateOhioによる行政手続のデジタル化、減税を実績として掲げています。規制や手続の費用を減らし、働く人を企業の必要な技能につなげるという組合せです。法執行機関への支援と中絶反対の立場も示しています。州政府での実績の自己説明と、今後の連邦上院で実現できる政策は区別して読む必要があります。',
          sourceIds: ['husted-bio-2026'],
          evidenceIds: ['ev-husted-bio'],
        }],
      },
      {
        heading: 'H.R.1への賛成票と、本人が説明するMedicaid就労要件',
        paragraphs: [{
          text: '2025年7月1日には、税・歳出などをまとめたH.R.1の上院最終採決に賛成しました。本人は、2017年減税の維持、児童税額控除、設備・研究開発投資、国境・国防予算を賛成理由に挙げています。医療についても同日の声明は、Medicaidの重複登録などを取り締まり、本人の表現では「働くことができ、幼い子どもがいない成人」に週20時間の就労またはボランティアを求める方針を説明しています。支援が必要な人のために制度を維持し、不正や歳出を抑えるというのが本人の説明です。ただし法案全体への賛成票と、声明に書かれた就労要件への支持は別の証拠であり、対象・免除・実施時期の全条文をこの短い説明だけで確定しません。',
          sourceIds: ['senate-rollcall-119-372', 'husted-hr1-statement-2025'],
          evidenceIds: ['ev-context-husted-hr1-vote-20250701', 'ev-husted-hr1', 'ev-context-husted-medicaid-statement-20250701'],
        }],
      },
      {
        heading: '条件付きの自案S.3391と、別案S.3385への手続票を分ける',
        paragraphs: [
          {
            text: 'ACAの保険料税額控除では、単に延長に反対と括れません。Hustedは2025年12月9日にS.3391、Accountability for Better Care Actを提出し、強化控除を2027年までの2年間延ばす代わりに、月5ドルの最低保険料負担、所得に応じた負担と上限、米国市民への資格限定、中絶給付を含む保険プランへの制限を付ける案を示しました。月5ドルの最低保険料負担などは2026年から、貧困線の600%という所得上限は2027年から適用する設計です。法案は2027年から低所得加入者の自己負担軽減への予算措置も設けます。本人は、家計の急激な保険料上昇を避け、その間に費用の根本原因を直すこと、不正な加入を抑えることを理由にしています。中絶関連の制限には、強姦・近親相姦・母体の生命の危険に関する例外が法案にあります。',
            sourceIds: ['context-husted-abc-introduction-20251209', 'context-husted-s3391-is-20251209'],
            evidenceIds: ['ev-context-husted-abc-introduction-20251209', 'ev-context-husted-s3391-is-20251209'],
          },
          {
            text: '12月10日にはこの自案の全会一致での可決を求めたものの、事務所発表によれば異議で進みませんでした。翌11日は、別の延長法案S.3385の審議入りに向けた討論終結動議には反対しています。したがって、「条件付きの自案を提出した」「別案の手続票に反対した」「どちらが成立したか」を分ける必要があります。この記録は2025年12月の行動であり、2026年のすべての延長案への現在の賛否や最終成立状況までは示しません。',
            sourceIds: ['context-husted-abc-consent-20251210', 'policy-senate-roll644'],
            evidenceIds: ['ev-context-husted-abc-consent-20251210', 'ev-context-husted-s3385-cloture-20251211'],
          },
        ],
      },
    ],
  },
  {
    electionId: '2026-OH-3-special',
    candidateId: 'cand-oh-sherrod-brown',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '保険の給付拒否と薬の販売価格に規制を求める',
        paragraphs: [{
          text: 'Brownは、家計の負担を下げるため、保険・製薬・公共料金会社に対する規制を前面に出しています。2026年6月9日の本人声明では、保険会社が不当に医療費の給付を拒否した場合に罰金を科すことと、同じ薬を米国で海外より高く売ることを禁止する方針を示しました。現在の公約でも、治療の必要性は患者と医師が判断すべきで、保険会社が妨げるべきではないと説明しています。これは保険会社の行動と薬の販売価格を変える提案であり、ACA補助の延長期間や新しい公的保険の設計を示したものではありません。罰金額、比較対象となる国・価格、例外、具体法案は未確認です。',
          sourceIds: ['context-brown-health-20260609', 'brown-issues-2026'],
          evidenceIds: ['ev-context-brown-health-20260609', 'ev-brown-issues'],
        }],
      },
      {
        heading: 'データセンターの費用負担と公共料金の値上げ上限',
        paragraphs: [{
          text: '電気・公共料金では、データセンターが使う電気・水道などの費用を全面的に事業者へ負担させ、一般家庭へ転嫁させないことを求めています。施設を建てるかどうかは地域住民が決めるべきだとも述べています。さらに、公共料金の値上げ幅に上限を置き、請求額を払いやすく予測可能にする方針です。本人は生活費と企業誘致の負担配分を結び付けていますが、すべてのデータセンター建設に反対すると明記した公約ではありません。値上げ上限の数値や、連邦・州・地方の権限分担をどう制度化するかはこの資料では確認できません。',
          sourceIds: ['brown-issues-2026'],
          evidenceIds: ['ev-brown-issues'],
        }],
      },
      {
        heading: '政治倫理と、働く人の保護を経済政策の軸にする',
        paragraphs: [{
          text: '政治倫理では、議員本人と配偶者の株取引禁止、議員退任後のロビイストへの転身禁止を掲げ、私的利益が政策判断に入り込むことを問題にしています。より広い経済的な軸は「働くことの尊厳」で、公式サイトは雇用を海外へ移す貿易協定への反対、労働者の年金、処方薬負担、退役軍人医療、公務関係の仕事をした人のSocial Securityを自身の活動として挙げています。編集上は、Hustedの企業投資・技能訓練という説明と、Brownの労働者保護・企業の費用負担という説明を比較できます。ただし、どちらの政策が地域で支持されているかは、これらの候補者資料からは分かりません。',
          sourceIds: ['brown-issues-2026', 'context-brown-work-20261006', 'husted-bio-2026'],
          evidenceIds: ['ev-brown-issues', 'ev-context-brown-work-20261006', 'ev-husted-bio'],
        }],
      },
    ],
  },
];

const source = (sourceId: string, title: string, publisher: string, url: string, publishedAt: string | null, referencePeriod: string): Source => ({
  sourceId, title, publisher, url, publishedAt, referencePeriod,
  retrievedAt: '2026-10-06', contentVerifiedAt: '2026-10-06',
});

// Existing IDs carry rechecked metadata in the reader lookup only. Shared
// Senate sources are supplied by the main registry / AK package, not duplicated.
export const candidateExplanationSources: Source[] = [
  source('rogers-tariffs-2026', 'Michigan Democrats Have Managed Our State’s Decline', 'Mike Rogers for U.S. Senate', 'https://rogersforsenate.com/news/michigan-democrats-have-managed-our-states-decline-now-its-time-for-a-change', null, 'ページのAug 29という月日のみ確認できる本人声明。公表年・行動年は不明で、2026年という独立した根拠は未確認。関税は必要だが一律に通用する解決策とはしないという条件であり、全ての一律関税の撤回や税率・品目・免除条件の確認ではない。'),
  source('rogers-housing-2026', 'Housing Plan', 'Mike Rogers for U.S. Senate', 'https://rogersforsenate.com/housingplan', null, '2026-10-06確認時点の住宅公約。公表日・発言日不明。529、家賃履歴、規制、住宅建設区域の提案。税優遇の対象税、費用、法案、実現効果は未確認。'),
  source('rogers-education-2026', 'Michigan’s Education Crisis Is the Civil Rights Issue of Our Lifetime', 'Mike Rogers for U.S. Senate', 'https://rogersforsenate.com/news/rogers-michigans-education-crisis-is-the-civil-rights-issue-of-our-lifetime', '2026-09-01', '2026-09-01の本人寄稿を陣営が転載。州の進級制度への提言と連邦のTitle I予算を区別。採用担当者の経験談は州全体の学力・政策支持の調査ではない。'),
  source('elsayed-priorities-2026', 'Priorities', 'Abdul El-Sayed for U.S. Senate', 'https://abdulforsenate.com/priorities/', null, '2026-10-06確認時点の公約入口。公表日・発言日不明。新しい具体策の根拠は各詳細公約の別URLに接続し、古い発言日へ遡及しない。'),
  source('context-elsayed-health-20261006', 'Medicare for All: The Path to a Healthier America', 'Abdul El-Sayed for U.S. Senate', 'https://abdulforsenate.com/priority/medicare-for-all-the-path-to-a-healthier-america/', null, '2026-10-06確認時点の未日付公約。全員向け保障と移行中のMedicaid・ACA削減撤回、薬価交渉・医療企業集中対策。特定条項番号・法案版・財源全体は未確認。'),
  source('context-elsayed-pocket-20261006', 'Money in Your Pocket', 'Abdul El-Sayed for U.S. Senate', 'https://abdulforsenate.com/priority/money-in-your-pocket/', null, '2026-10-06確認時点の未日付公約。対象限定関税の目的・基準の明示・終了条件・労組参加はこの詳細公約で確認し、9月1日の現行関税批判記事だけへ帰属させない。'),
  source('elsayed-tariffs-2026', 'Abdul El-Sayed on Tariffs and Michigan Costs', 'Abdul El-Sayed for U.S. Senate', 'https://abdulforsenate.com/2026/09/icymi-abdul-blasts-mike-rogers-for-choosing-trumps-tariffs-over-michiganders-pocketbooks/', '2026-09-01', '2026-09-01公表の陣営発表。Monday-night interviewは暦上8月31日と推定できるが既存の公表日を黙って行動日に置き換えない。現行の対カナダ関税批判の資料。対象限定関税の条件は別の詳細公約による。'),
  source('context-elsayed-democracy-20261006', 'Money Out of Politics', 'Abdul El-Sayed for U.S. Senate', 'https://abdulforsenate.com/priority/money-out-of-politics/', null, '2026-10-06確認時点の未日付公約。企業資金、公的選挙資金、filibuster、最高裁、Line 5と環境の提案。法律改正・議会規則・司法上の制約など実現経路は異なる。'),
  source('elsayed-ai-2026', 'Dr. Abdul El-Sayed Calls for Pausing AI Development', 'Abdul El-Sayed for U.S. Senate', 'https://abdulforsenate.com/2026/09/new-dr-abdul-el-sayed-calls-for-pausing-ai-development/', '2026-09-09', '2026-09-09のインタビューと政策項目を伝える陣営発表。本人のAI政策の主張であり、リスクの独立評価や対立候補の投資に関する非難の検証資料ではない。'),
  source('context-hinson-insurance-transparency-20260805', 'Hinson Introduces Bill to Hold Big Health Insurance Accountable', 'Office of Representative Ashley Hinson', 'https://hinson.house.gov/media/press-releases/hinson-introduces-bill-hold-big-health-insurance-accountable', '2026-08-05', '2026-08-05の法案提出発表。直接openはinternal error、同じ公式URLの検索インデックス全文で2026-10-06に確認。法案全文・最新の立法段階は未取得。成立とはしない。'),
  source('hinson-farm-2026', 'Iowa Farm Bureau Endorses Ashley Hinson for United States Senate', 'Ashley Hinson for U.S. Senate', 'https://ashleyhinson.com/iowa-farm-bureau-endorses-ashley-hinson-for-united-states-senate/', '2026-09-02', '2026-09-02の本人引用と陣営の実績箇条書き。E15、市場、投入費、Proposition 12、Farm Bill等。下院通過という陣営説明と最終成立・実施は区別し、対立候補攻撃は政策根拠にしない。'),
  source('hinson-trade-2026', 'Hinson: China Shouldn’t Be Allowed to Cheat Our Trade Laws', 'Office of Representative Ashley Hinson', 'https://hinson.house.gov/media/press-releases/hinson-china-shouldnt-be-allowed-cheat-our-trade-laws-expense-american-workers', '2026-09-01', '2026-09-01掲載の演説と、前夜2026-08-31の下院通過を伝える事務所発表。直接openは403、同じ公式URLの検索インデックス本文で2026-10-06に確認。原本を直接取得済みとはせず、掲載日を演説実施日と断定しない。下院通過は事務所発表に帰属させ、最終成立は未確認。'),
  source('hinson-costs-2026', 'Hinson Releases New Ad “Squeezed”', 'Ashley Hinson for U.S. Senate', 'https://ashleyhinson.com/hinson-releases-new-ad-squeezed/', '2026-09-08', '2026-09-08の広告書き起こしと政策一覧。住宅・育児・医療・税負担の陣営の提案。tips/overtimeの税負担軽減を税の完全撤廃と言い換えない。'),
  source('context-house-hr1-roll190-20250703', 'U.S. House Roll Call 190: H.R.1 Senate Amendment', 'U.S. House Clerk', 'https://clerk.house.gov/Votes/2025190', null, '行動日2025-07-03。On Motion to Concur in the Senate Amendment、Hinson (IA), Aye。ページの初回公開日は不明。上院Vote 372とは別の下院採決。法案全体への票から各条項への本人理由を補わない。'),
  source('turek-rural-plan-2026', 'Josh Turek Releases Plan to Rebuild Rural Iowa', 'Josh Turek for Iowa', 'https://turek4iowa.com/news/josh-turek-releases-plan-to-rebuild-rural-iowa/', '2026-05-04', '2026-05-04の地方政策発表。3本の柱と末尾2段落。州法共同提案等は本人の経歴説明であり、今回新たな成立実績を断定していない。'),
  source('turek-health-2026', 'Josh Turek Hosts Roundtable on Health Care', 'Josh Turek for Iowa', 'https://turek4iowa.com/news/recap-nearly-one-year-since-hinson-supported-medicaid-cuts-passed-josh-turek-hosts-roundtable-to-hear-directly-from-iowans-about-state-of-health-care/', '2026-06-22', '2026-06-22に陣営が報告した意見交換会。確認できたのは報告の掲載日で、開催日とは断定しない。本人の理由とBrad Maggの限定的経験談。対立候補の動機、未検証の保険喪失人数・病院閉鎖との因果関係は採用しない。州全体の反応を示す調査ではない。'),
  source('turek-platform-2026', 'Platform', 'Josh Turek for Iowa', 'https://turek4iowa.com/platform/', null, '2026-10-06確認時点の未日付公約。医療、労働、住宅、農業、政治資金、中絶・避妊・IVF。6月24日の個別中絶記事は今回直接再取得できず、この現行Platformを本文の根拠とする。水質とがんの因果断定は医学的検証がないため採用していない。'),
  source('husted-bio-2026', 'Biography', 'Jon Husted for U.S. Senate', 'https://www.jonhustedforsenate.com/bio/', null, '2026-10-06確認時点の経歴・州政府での実績の自己説明。公表日・発言日不明。Intel、TechCred、InnovateOhio、税、法執行、中絶。将来の連邦政策の効果実証とは区別する。'),
  source('husted-hr1-statement-2025', 'Husted Statement on Increasing Tax Cuts and Public Safety', 'Office of Senator Jon Husted', 'https://www.husted.senate.gov/media/press-releases/husted-statement-on-increasing-tax-cuts-for-working-ohioans-making-americans-safer-and-more-prosperous/', '2025-07-01', '2025-07-01のH.R.1賛成理由とMedicaid項目の本人声明。法案全体への票、本人が説明する就労要件、全ての法定対象・免除・施行時期を区別する。2026-10-06は再確認日。'),
  source('context-husted-abc-introduction-20251209', 'Husted Introduces Plan to Make Health Care More Affordable, Prevent Fraud, Provide Premium Stability', 'Office of Senator Jon Husted', 'https://www.husted.senate.gov/media/press-releases/husted-introduces-plan-to-make-health-care-more-affordable-prevent-fraud-provide-premium-stability/', '2025-12-09', '2025-12-09のS.3391、Accountability for Better Care Act提出説明。本人理由と条項の要約。Sullivan案やS.3385とは別の案。2026年の全ての延長案への立場や現在の成立状況は示さない。'),
  source('context-husted-s3391-is-20251209', 'S.3391 — Accountability for Better Care Act, Introduced in Senate', 'U.S. Government Publishing Office', 'https://www.govinfo.gov/content/pkg/BILLS-119s3391is/html/BILLS-119s3391is.htm', null, '2025-12-09提出版。初回公開日は独立未確認。Sections 2–3。月5ドルの最低保険料負担などは2026年から、600% FPL上限は2026年12月31日後開始の課税年に適用。550–600%行に14.5/10.5という非単調な印字があるため本文に細かい負担率を転記せず、2026年からの全世帯負担を計算しない。'),
  source('context-husted-abc-consent-20251210', 'Husted Bill to Extend ACA Premium Tax Credits and Cut Health Care Costs for Ohio Families Blocked from Passage', 'Office of Senator Jon Husted', 'https://www.husted.senate.gov/media/press-releases/husted-bill-to-extend-aca-premium-tax-credits-and-cut-health-care-costs-for-ohio-families-blocked-from-passage/', '2025-12-10', '2025-12-10のS.3391全会一致同意要求と異議についての事務所発表。翌日の別法案S.3385手続票や法案成立と同一にしない。'),
  source('brown-issues-2026', 'Our Fight', 'Sherrod Brown for U.S. Senate', 'https://www.sherrodbrown.com/our-fight/', null, '2026-10-06確認時点の未日付公約。保険給付拒否、データセンター費用、公共料金上限、議員株取引・ロビー活動。対立候補の不正・寄附額、料金変化の原因に関する陣営の非難は事実認定していない。'),
  source('context-brown-health-20260609', 'Jon Husted Blocks Efforts to Crack Down on Insurance Companies Denying Ohioans Health Care', 'Sherrod Brown for U.S. Senate', 'https://www.sherrodbrown.com/2026/06/09/jon-husted-blocks-efforts-to-crack-down-on-insurance-companies-denying-ohioans-health-care/', '2026-06-09', '2026-06-09のBrown本人の将来方針に関する引用のみを採用。保険給付拒否への罰金と海外より高い薬価への規制。Hustedへの献金額・投票回数・動機の非難は独立未確認。'),
  source('context-brown-work-20261006', 'Sherrod Brown for U.S. Senate', 'Sherrod Brown for U.S. Senate', 'https://www.sherrodbrown.com/', null, '2026-10-06確認時点の公式サイト経歴。公表日・発言日不明。寄付欄下の「働くことの尊厳」と幅広い活動の自己説明。数値付き成果を政府の独立検証済み実績として採用しない。'),
];

const evidence = (evidenceId: string, sourceId: string, locator: string, note: string): EvidenceRef => ({
  evidenceId, sourceId, locator, checkedAt: '2026-10-06', kind: 'observed', note,
});

export const candidateExplanationEvidence: EvidenceRef[] = [
  evidence('ev-rogers-tariffs', 'rogers-tariffs-2026', '本人の声明引用第1〜4段落。関税はnecessaryだがnot a one-size-fits-all solutionと述べ、カナダとの貿易合意と農家・自動車労働者・製造業に有利な条件を求める。ページ表示はAug 29。確認できたのは月日のみで、公表年・行動年は不明', '公表年を2026年とする独立根拠は今回確認できておらず、以前の政策記録の日付をこの再確認で裏付けたとはしない。「一律の関税適用に反対」という強い要約へ広げない。税率・品目・免除・終了条件は未確認。'),
  evidence('ev-rogers-housing', 'rogers-housing-2026', '番号付き提案1〜4：529の頭金利用、期限内家賃履歴の信用評価、州と連携した規制削減、非課税の住宅建設区域', '未日付公約。税優遇の対象税、費用、法案は未確認。州・地方の住宅規則を上院議員一人で変えられるとはしない。'),
  evidence('ev-rogers-education', 'rogers-education-2026', '日付付き本人寄稿。First、Getting kids reading、Each year、That is whereで始まる段落。phonics、3年時読解、Title I補習、実習・職業教育。公表2026-09-01', '州の進級制度と連邦教育予算は別。工場採用担当者の話は問題意識の例で、州全体の学力・政策支持の測定ではない。'),
  evidence('ev-elsayed-priorities', 'elsayed-priorities-2026', 'Priorities indexの詳細政策ページへのリンク入口', '未日付の公約入口。今回の新しい条件・理由は別の詳細公約に帰属し、古い資料や発言日へ遡及しない。'),
  evidence('ev-context-elsayed-health-20261006', 'context-elsayed-health-20261006', '冒頭4段落、Break up Big Healthcare、Prescription Drugs。全員自動加入、眼科・歯科・聴覚、保険料・受診時負担・免責額、追加民間保険、移行中のMedicaid・ACA削減撤回と薬価交渉', '未日付公約で条項番号・採用法案版・財源全体は未確認。既存のエルサイードのMedicaid財源についての未確認という判定を、特定条項への将来票に変更しない。新しい削減撤回の説明は今回確認した詳細公約の範囲に限る。'),
  evidence('ev-context-elsayed-pocket-20261006', 'context-elsayed-pocket-20261006', 'Jobs and Tradeのtargeting、benchmarks、sunsetを説明する段落。育成目的、相手への基準明示、国内産業定着後の終了、労組参加、研究開発投資', '対象限定関税の条件はこの未日付詳細公約で確認。既存のエルサイードの対象限定関税の政策記録を、9月1日の記事だけに帰属させない。税率・期間・対象企業の数値は未提示で、既存政策版の日時や判定を上書きしない。'),
  evidence('ev-elsayed-tariffs', 'elsayed-tariffs-2026', '2026-09-01陣営発表で引用するMonday-night interviewの対カナダ関税・自動車雇用・家計への批判', '取材日は暦上2026-08-31と推論できるが、既存記録の公表日を黙って変更しない。家計5,600ドルや対立候補の人格批判は採用せず、対象限定関税の条件は別の詳細公約へ接続する。'),
  evidence('ev-context-elsayed-democracy-20261006', 'context-elsayed-democracy-20261006', 'Banning Corporate Money、Supreme Court Reform、Abolishing the Filibuster、Environmentの各節', '本人の未日付公約。企業資金、公的選挙資金、上院規則、最高裁任期、Line 5と再生可能エネルギーは実現経路が異なり、成立済みとはしない。'),
  evidence('ev-elsayed-ai', 'elsayed-ai-2026', '2026-09-09の当日インタビューに帰属させた発表と政策箇条書き。開発一時停止、公的統治、自動化課税による給付・賃金保険、独立安全評価', '本人の主張。AIリスクの事実評価や相手候補の投資に関する非難まで検証した資料としない。停止解除基準・期間・対象モデル境界・法案最終版は未確認。'),
  evidence('ev-context-hinson-insurance-transparency-20260805', 'context-hinson-insurance-transparency-20260805', '2026-08-05公式法案発表の本人声明とreporting-requirement箇条書き。給付拒否の件数・率・理由、判断や異議申立ての時間、覆った割合、事前承認対象', '直接openはinternal error。同じ公式URLの検索インデックス全文で確認し、二次まとめ・評価は使っていない。原法案全文・最新立法段階は未取得で、成立とは表示しない。'),
  evidence('ev-hinson-farm', 'hinson-farm-2026', '2026-09-02のHinson引用とtrack-record箇条書き。通年E15、市場、投入費、Proposition 12、5年間のFarm Bill、精密農業、世代間継承税、若手農家の作物保険', '下院通過という陣営の説明と最終成立・執行を分ける。対立候補攻撃、団体の支持を農家一般の支持率へ変換しない。'),
  evidence('ev-hinson-trade', 'hinson-trade-2026', '2026-09-01掲載の演説、passed the House last nightという導入。第三国積替え・関税回避・強制労働への司法省取締り強化', '直接openは403、同じ公式URLの検索インデックス本文で確認。原本直接取得済みとはせず、掲載日を演説実施日と断定しない。下院行動は2026-08-31との事務所発表として記述。原法案全文・最終成立は未取得。一律の関税率引上げへの支持ではない。'),
  evidence('ev-hinson-costs', 'hinson-costs-2026', '2026-09-08広告書き起こしとリンクされた政策一覧。保険料・薬価・透明性、住宅頭金貯蓄、一戸建て取得、育児と税負担', 'tips/overtime税の完全撤廃と置き換えず税負担軽減とする。将来の効果・現在の成立状態を確定した資料ではない。'),
  evidence('ev-context-hinson-hr1-roll190-20250703', 'context-house-hr1-roll190-20250703', '2025-07-03、On Motion to Concur in the Senate Amendment、Hinson, IA, Aye', 'H.R.1上院修正への同意という下院全体票。上院第372号の採決とは区別し、各医療条項への本人理由をこの一票から補わない。'),
  evidence('ev-turek-rural', 'turek-rural-plan-2026', '2026-05-04地方政策発表の3本の柱と末尾2段落。right-to-repair、原産国表示、肥料等の寡占、地域サービスと水・土壌', '州法案の共同提案等は本人の経歴説明。新たな成立実績や農家一般の反応として記述しない。'),
  evidence('ev-turek-health', 'turek-health-2026', '2026-06-22の陣営報告に掲載された意見交換会のTurek本人引用。医療へのアクセスを権利とする理由、Medicaid、地方医療、public option', '対立候補の動機、保険喪失人数、病院閉鎖との因果関係は独立未確認。public optionの加入資格・保険料・財源・法案版は未確認。'),
  evidence('ev-context-turek-health-roundtable-example-20260622', 'turek-health-2026', '2026-06-22掲載の陣営主催意見交換会の記事中のColfaxの薬局経営者Brad Magg引用。Medicaid受入提供者と精神科処方継続についての経験', '陣営が選び掲載した一人の現場の経験談。州全体の賛否、発生率、特定法案との因果関係、支持率の測定ではない。'),
  evidence('ev-turek-platform', 'turek-platform-2026', 'Each and every American、Health care is a human right、Stop the corruption、Iowa’s farmers、We must protectの各項目。医療、最低賃金、PRO Act、住宅、農業、関税、中絶・避妊・IVF', '公表日・発言日不明。6月24日の中絶に関する陣営記事は直接再取得失敗のため今回再確認扱いにせず、中絶の現行方針はこのPlatformだけに帰属。水質とがんの因果断定は医学的検証なしに採用しない。'),
  evidence('ev-husted-bio', 'husted-bio-2026', '陣営経歴の4見出し。IntelのLicking County工場、TechCred、InnovateOhio、税、法執行、中絶に関する自己説明', '公表日・発言日不明。州政府での実績の本人説明と将来の連邦上院政策を区別し、効果を独立実証した資料としない。'),
  evidence('ev-husted-hr1', 'husted-hr1-statement-2025', '2025-07-01の冒頭声明、manufacturing/R&Dの箇条書き。2017年減税、児童税額控除、設備・研究開発、国境・国防という賛成理由', '法案全体への賛成票と本人の政策説明は別の証拠。Medicaidの全対象・免除・実施時期までこの短い声明から確定しない。'),
  evidence('ev-context-husted-medicaid-statement-20250701', 'husted-hr1-statement-2025', '2025-07-01声明のMedicaid箇条書き。重複登録、働くことができ幼い子どもがいない成人への週20時間の就労またはボランティアという本人説明', 'Husted自身の2025年7月1日の声明。コリンズが同日の声明で説明した例外付き就労要件へのHustedの立場は、未確認のまま保持する。この声明を全ての法定例外について確認された採決とせず、Husted本人が説明した要件として別に扱う。'),
  evidence('ev-context-husted-hr1-vote-20250701', 'senate-rollcall-119-372', '行動日2025-07-01。On Passage of the Bill (H.R.1, as Amended)、Husted (R-OH), Yea', '今回再確認したHusted固有の全法案への最終票。Collinsの既存再確認範囲を置き換えず、個別条項への賛否・理由は別証拠とする。'),
  evidence('ev-context-husted-abc-introduction-20251209', 'context-husted-abc-introduction-20251209', '2025-12-09の本人声明とprovision箇条書き。S.3391、2年延長、最低保険料、所得、資格、プラン制限と負担急増・不正への理由', 'ACA強化保険料税額控除についてのS.3391の2025年12月9日提出版。Sullivan修正案やS.3385と混同せず、提出・手続・成立を分離する。'),
  evidence('ev-context-husted-s3391-is-20251209', 'context-husted-s3391-is-20251209', '2025-12-09提出版のヘッダー、Sections 2–3。2026年からの最低月額5ドル、資格・プラン制限、中絶制限の強姦・近親相姦・母体生命危険の例外、2027年からの自己負担軽減財源', 'Section 2(a)の600% FPL上限は2026年12月31日後開始の課税年、つまり2027年から適用する設計。月5ドルの最低保険料負担などの2026年からの適用と区別する。2(b)の550–600%行に14.5/10.5という非単調な印字があり、本文は細率を転記しない。要約だけで2026年からの全世帯負担を計算しない。初回公表日は未確認、提出日は2025-12-09。'),
  evidence('ev-context-husted-abc-consent-20251210', 'context-husted-abc-consent-20251210', '冒頭の手続説明とS.3391引用。2025-12-10に自案の全会一致での可決を求め、異議で進まなかったとの事務所発表', '自案の可決要求、別案S.3385の手続票、最終成立は別。2026年のすべての延長案への現在の賛否は示さない。'),
  evidence('ev-context-husted-s3385-cloture-20251211', 'policy-senate-roll644', '2025-12-11、On the Cloture Motion、Motion to Proceed to S.3385、Husted (R-OH), Nay', 'S.3385審議入りに向けた討論終結動議という手続票。Husted自身のS.3391提出・可決要求と分け、ACA延長一般への反対としない。'),
  evidence('ev-brown-issues', 'brown-issues-2026', 'Holding Health Insurance Companies Accountable、Making Data Centers Pay、Capping utility rate increases、Banning Congressional Stock Trading and Lobbyingの各節', '未日付公約。保険給付拒否、薬価、データセンター費用分担、公共料金上限は別の政策。対立候補の不正・寄附額、データセンター原因論は事実認定せず、施設の全面禁止とも読まない。'),
  evidence('ev-context-brown-health-20260609', 'context-brown-health-20260609', '2026-06-09のBrown本人引用のうち、罰金と海外薬価比較で終わる将来方針', '採用対象は本人の将来方針のみ。Hustedへの献金額・投票回数・動機の非難は独立未確認。罰金額、比較対象国・価格、例外、法案は未確認。'),
  evidence('ev-context-brown-work-20261006', 'context-brown-work-20261006', '寄付欄の下の経歴。Dignity of Work、雇用を海外へ移す通商協定、年金、薬価、退役軍人医療、公務関係職のSocial Security', '公表日・発言日不明の幅広い活動の自己説明。数量付き成果を政府による独立検証済み実績として採用せず、地域での政策支持を推定しない。'),
];
