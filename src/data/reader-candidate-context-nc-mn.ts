import type { Source } from './model';
import type { EvidenceRef } from './research-model';
import type { ReaderCandidateExplanation } from './reader-candidate-explanations';

// Supplied primary-source-reviewed copy, checked 2026-10-06. These reader
// explanations do not change any versioned policy position or unknown record.
export const candidateExplanations: ReaderCandidateExplanation[] = [
  {
    electionId: '2026-NC-2-regular',
    candidateId: 'cand-nc-michael-whatley',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '歳出・税の抑制とエネルギー供給で生活費に対応',
        paragraphs: [
          {
            text: 'ワトリーは元共和党全国委員長で、Trump政権の政策を上院で進めることを軸にしています。経済政策では、連邦歳出の抑制と国内のエネルギー供給拡大によって、企業と家計が使うエネルギーを安定的で手頃な価格にし、雇用を増やすと説明します。9月29日のGreensboroでの会見でも、生活費や税負担への懸念を挙げ、家計の手取りを増やす方針を訴えました。ただし、その発表には減税の対象所得、税率、財源を定めた法案は示されていません。',
            sourceIds: ['context-whatley-about-20261006', 'policy-whatley-issues', 'context-whatley-costs-20260929'],
            evidenceIds: ['ev-context-whatley-about-20261006', 'ev-policy-whatley-topic-review', 'ev-context-whatley-costs-20260929'],
          },
        ],
      },
      {
        heading: '治安・移民では国境管理と警察を支援',
        paragraphs: [
          {
            text: '治安・移民では、市民の保護を政府の最優先責務と位置づけ、国境管理と、犯罪に関わる不法滞在者の送還を支持。警察への支援、銃所持の権利、中絶反対も掲げます。これらは候補者の政策目標です。対立候補の知事時代を批判する陣営の記述だけから、犯罪の原因や政策効果まで確定することはできません。',
            sourceIds: ['policy-whatley-issues'],
            evidenceIds: ['ev-policy-whatley-topic-review'],
          },
        ],
      },
      {
        heading: '災害復旧と、個別の医療・関税方針の確認範囲',
        paragraphs: [
          {
            text: '州に固有の論点として、ハリケーンHeleneからの復旧と災害対応の改善を挙げています。2025年5月20日のFEMA Review Councilの公式議事録には、ワトリーが委員として出席したことが記録されています。一方、今回確認した政策ページはACA保険料補助の延長期間・所得条件や、特定の関税率・対象国への賛否を示していません。政権への包括的支持と、個別の医療・関税法案への判断は分けて確認する必要があります。',
            sourceIds: ['policy-whatley-issues', 'context-whatley-fema-minutes-20250520'],
            evidenceIds: ['ev-policy-whatley-topic-review', 'ev-context-whatley-fema-minutes-20250520'],
          },
        ],
      },
    ],
  },
  {
    electionId: '2026-NC-2-regular',
    candidateId: 'cand-nc-roy-cooper',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '保険料・治療費・薬代を一体として下げる提案',
        paragraphs: [
          {
            text: 'クーパーは、保険料、治療費、処方薬代を一体として下げる医療政策を掲げています。2026年3月9日に発表した計画では、ACAの保険料税額控除を復活させ、Medicaidの削減を戻し、保険会社による治療の承認審査を見直すとしました。理由として、必要な医療を受けられない人を減らし、雇用主の保険に入る人も含めて保険料負担を抑えることを挙げます。9月5日更新の政策ページでも、Medicareの薬価交渉の対象拡大、年間の処方薬自己負担上限、病院合併への監督強化を確認できます。補助復活の期間や所得条件、法案番号は特定されていません。',
            sourceIds: ['policy-cooper-health-plan', 'policy-cooper-health'],
            evidenceIds: ['ev-policy-cooper-aca-announcement', 'ev-policy-cooper-aca-faq'],
          },
        ],
      },
      {
        heading: '知事時代のMedicaid拡大署名と連邦の公約を区別',
        paragraphs: [
          {
            text: '過去の行動としては、知事だった2023年3月27日にMedicaid対象拡大法HB76に署名しました。当時、本人は地方病院、精神医療、働く家庭を支える投資だと説明しています。州政府の発表では、拡大の発効に別の予算法への署名が必要とも記されていました。この州法への署名は、現在の連邦上院候補としての保険料補助復活案とは別の実績です。地方の医療提供体制と保険への加入を同時に重視してきた経緯として読むことができます。',
            sourceIds: ['policy-nc-hb76'],
            evidenceIds: ['ev-policy-cooper-hb76-signature'],
          },
        ],
      },
      {
        heading: '農業から食卓までの費用と企業間の競争を見直す',
        paragraphs: [
          {
            text: '生活費政策は医療に限りません。食料品については、農家の投入費用を上げ、その負担が店頭価格にも及ぶとして批判する関税を終える方針です。食品加工・小売の競争を弱める合併の阻止、顧客ごとに価格を引き上げるアルゴリズムや企業間の価格協調への規制も提案しています。農業から食卓までの費用の流れを変えようとする構想ですが、撤廃対象の国・品目・税率は記載されておらず、家計がいくら安くなるかを確定した計画ではありません。',
            sourceIds: ['policy-cooper-groceries'],
            evidenceIds: ['ev-policy-cooper-farm-tariffs'],
          },
        ],
      },
    ],
  },
  {
    electionId: '2026-MN-2-regular',
    candidateId: 'cand-mn-michele-tafoya',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '不正対策・法執行と、歳出・税の抑制',
        paragraphs: [
          {
            text: 'タフォヤは、公的資金の不正受給と行政の監督不足を主要問題に据えています。詐欺犯罪の最低刑の強化、不正防止措置や基本的な監査・回収手続の実施を拒む州への連邦資金停止、詐欺で有罪となった移民の送還を進める法案への参加を掲げます。警察への資金・装備・訓練を増やし、犯罪に関わる不法移民の送還や連邦・州・地方の協力を支持。ICE廃止には反対しています。',
            sourceIds: ['candidate-tafoya-issues-20261006'],
            evidenceIds: ['ev-tafoya-issues-20261006'],
          },
          {
            text: '生活費については、政府の歳出・借入と税負担を抑え、中所得層の減税を維持する方針です。医療では、保険会社による給付拒否や仲介業者の価格設定にも問題があるとして、薬価引下げと患者の選択権を訴えます。ただし、この公約ページだけでは、ACA補助の延長条件や薬価を下げる具体的な法案までは分かりません。エネルギーは米国内の多様な供給源を活用し、電気・燃料費を下げると説明しています。',
            sourceIds: ['candidate-tafoya-issues-20261006'],
            evidenceIds: ['ev-tafoya-issues-20261006'],
          },
          {
            text: '州で起きた問題への対応を、連邦の監督権限、資金配分、刑事・移民法の強化につなげる提案です。教育では保護者の関与と説明責任、選挙では本人確認と紙の投票用紙を重視します。これらは本人の公約であり、州民の支持の広さや、政策実施後の治安・物価の改善を確認した資料ではありません。',
            sourceIds: ['candidate-tafoya-issues-20261006'],
            evidenceIds: ['ev-tafoya-issues-20261006'],
          },
        ],
      },
    ],
  },
  {
    electionId: '2026-MN-2-regular',
    candidateId: 'cand-mn-peggy-flanagan',
    checkedAt: '2026-10-06',
    sections: [
      {
        heading: '医療保障と家計の支援を広げ、企業の影響を抑える',
        paragraphs: [
          {
            text: 'フラナガンは、医療保障と家計の支援を広げる方針です。Medicare for Allを掲げ、実現までの間も医療へのアクセス拡大を進めると説明しています。具体策は、保険会社の事前承認の廃止、Medicaid削減の巻戻し、Medicare・Medicaidへの歯科・視力・聴力の保障追加、薬価交渉の拡大です。理由に挙げるのは、保険があっても必要な治療を受けられないことと、地方病院の資金を守る必要です。',
            sourceIds: ['candidate-flanagan-priorities-20261006'],
            evidenceIds: ['ev-flanagan-priorities-20261006'],
          },
          {
            text: '働く人の収入と生活費には、物価に連動する連邦最低賃金17ドル、全国的な有給家族・医療休暇、保育と児童税額控除の拡充を提案。住宅の供給を増やすとともに、大企業・ヘッジファンドによる戸建て住宅の購入禁止を支持します。企業の交渉力や政治への影響も負担の原因と考え、企業献金や公職者の株取引の規制を掲げています。',
            sourceIds: ['candidate-flanagan-priorities-20261006'],
            evidenceIds: ['ev-flanagan-priorities-20261006'],
          },
          {
            text: '関税は一律に撤廃する立場ではありません。農家の輸出を傷つける関税はなくし、鉄鉱業などに必要な保護は残すと明記しています。移民政策でも、国境の安全確保と手続の近代化を支持する一方、大規模送還の停止を求めています。また、ICEを解体し、尊厳・安全・適正手続を軸に移民制度を組み直すことを求めます。タフォヤとは、連邦の取締り権限を強めるか、適正手続と監督を重視して制度を組み直すかという点で違いがあります。',
            sourceIds: ['candidate-flanagan-priorities-20261006', 'candidate-tafoya-issues-20261006'],
            evidenceIds: ['ev-flanagan-priorities-20261006', 'ev-tafoya-issues-20261006'],
          },
        ],
      },
    ],
  },
];

// Existing IDs carry rechecked metadata for this reader explanation's lookup.
// They do not rewrite the policy registry's historical records or scope dates.
export const candidateExplanationSources: Source[] = [
  {
    sourceId: 'policy-whatley-issues',
    title: 'Michael’s Plan for North Carolina',
    publisher: 'Michael Whatley for Senate',
    url: 'https://michaelwhatley.com/issues/',
    publishedAt: null,
    referencePeriod: '2026-10-06確認時点の経済、エネルギー、治安・移民、保守的価値、Helene復旧の公約。公表日不明。ACA補助の具体条件や個別関税版への賛否は未確認',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'context-whatley-about-20261006',
    title: 'About Michael',
    publisher: 'Michael Whatley for Senate',
    url: 'https://michaelwhatley.com/about/',
    publishedAt: null,
    referencePeriod: '2026-10-06確認時点の本人経歴。元州党・共和党全国委員長。公表日不明',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'context-whatley-costs-20260929',
    title: 'Michael Whatley Hosts “Make More, Keep More” Press Conference in Greensboro',
    publisher: 'Michael Whatley for Senate',
    url: 'https://michaelwhatley.com/michael-whatley-hosts-make-more-keep-more-press-conference-in-greensboro/',
    publishedAt: '2026-09-29',
    referencePeriod: '2026-09-29のGreensboro会見・陣営発表。生活費や税負担への懸念を挙げ、家計の手取りを増やす本人方針。対象所得・税率・財源を定めた法案は未提示',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'context-whatley-fema-minutes-20250520',
    title: 'FEMA Review Council Meeting Minutes, May 20, 2025',
    publisher: 'U.S. Department of Homeland Security',
    url: 'https://www.dhs.gov/sites/default/files/2025-08/2025_0520_fema_review_council_meetingminutes.pdf',
    publishedAt: null,
    referencePeriod: '会議日2025-05-20の公式議事録。1頁PARTICIPANTSにWhatleyの委員出席を記録。ファイル公開日不明。URLの2025-08を会議日にしない',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'policy-cooper-health-plan',
    title: 'New Plan to Lower Health Care Costs',
    publisher: 'Roy Cooper for North Carolina',
    url: 'https://roycooper.com/roy-cooper-continues-make-stuff-cost-less-tour-announces-new-plan-to-lower-health-care-costs/',
    publishedAt: '2026-03-09',
    referencePeriod: '2026-03-09の医療計画発表、項目1–9。ACA税額控除の復活・Medicaid削減の巻戻し・承認審査の見直し。後日のFAQ更新日を発表日にしない',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'policy-cooper-health',
    title: 'Making Health Care Affordable',
    publisher: 'Roy Cooper for North Carolina',
    url: 'https://roycooper.com/costless/health-care/',
    publishedAt: null,
    updatedAt: '2026-09-05',
    referencePeriod: '医療政策FAQ。初回公表日不明、表示更新日2026-09-05。ACA補助復活の期間・所得条件・法案番号は特定されていない',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'policy-nc-hb76',
    title: 'Governor Cooper Signs Medicaid Expansion into Law',
    publisher: 'Office of the Governor of North Carolina',
    url: 'https://governor.nc.gov/news/press-releases/2023/03/27/governor-cooper-signs-medicaid-expansion-law',
    publishedAt: '2023-03-27',
    referencePeriod: '2023-03-27の知事によるHB76署名発表。地方病院・精神医療・働く家庭への説明。当時の発効条件に別予算法への署名を記載。現在の連邦上院公約とは別の州法実績',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'policy-cooper-groceries',
    title: 'Lowering the Cost of Food & Groceries',
    publisher: 'Roy Cooper for North Carolina',
    url: 'https://roycooper.com/costless/groceries/',
    publishedAt: null,
    updatedAt: '2026-09-05',
    referencePeriod: '食料品政策FAQ。初回公表日不明、表示更新日2026-09-05。農家への投入費用、関税、企業合併、アルゴリズムによる価格設定と価格協調。撤廃対象国・品目・税率は未記載',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'candidate-tafoya-issues-20261006',
    title: 'Issues',
    publisher: 'Michele Tafoya for U.S. Senate',
    url: 'https://micheletafoya.com/issues/',
    publishedAt: null,
    referencePeriod: '2026-10-06確認時点の公約。公表日・更新日不明。不正防止、法執行、歳出・税、医療・エネルギー、教育・選挙。連邦資金停止は不正防止措置や基本的な監査・回収手続の実施を拒む州が対象という条件を保持',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
  {
    sourceId: 'candidate-flanagan-priorities-20261006',
    title: 'Priorities',
    publisher: 'Peggy Flanagan for Minnesota',
    url: 'https://peggyflanagan.com/priorities/',
    publishedAt: null,
    referencePeriod: '2026-10-06確認時点の公約。初回公表日・更新日不明。医療、生活費、住宅、政治と資金、農業通商・鉄鉱業、移民。ICEを解体し、尊厳・安全・適正手続を軸に移民制度を組み直す提案。政策実施後の効果や成立見込みを確認した資料ではない',
    retrievedAt: '2026-10-06',
    contentVerifiedAt: '2026-10-06',
  },
];

export const candidateExplanationEvidence: EvidenceRef[] = [
  {
    evidenceId: 'ev-policy-whatley-topic-review',
    sourceId: 'policy-whatley-issues',
    locator: '公式政策の経済・エネルギー、治安・移民・保守的価値、Helene復旧の各節。Trump政権への一般的な支持と個別の医療・関税法案への判断を区別',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: 'ACA補助の延長期間・所得条件や、特定関税率・対象国への賛否は未確認。対立候補批判から犯罪の原因や政策効果を確定しない。州全体の住民反応を示す原調査は今回未確認。',
  },
  {
    evidenceId: 'ev-context-whatley-about-20261006',
    sourceId: 'context-whatley-about-20261006',
    locator: 'About Michael。元州党・共和党全国委員長の経歴',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '公表日不明。確認日を経歴や公約の発表日にしない。',
  },
  {
    evidenceId: 'ev-context-whatley-costs-20260929',
    sourceId: 'context-whatley-costs-20260929',
    locator: '2026-09-29のGreensboro会見についての本文と本人引用。生活費や税負担への懸念を挙げ、家計の手取りを増やす方針',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '減税対象所得・税率・財源の法案は未提示。対立候補への費用増加率・税額批判は独立検証していないため本文に採用しない。会見同席者や支持団体の反応を州民一般へ拡張しない。',
  },
  {
    evidenceId: 'ev-context-whatley-fema-minutes-20250520',
    sourceId: 'context-whatley-fema-minutes-20250520',
    locator: '2025-05-20のFEMA Review Council公式議事録1頁PARTICIPANTS。Michael Whatleyの委員出席',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '会議日とファイル公開日を区別。出席の記録を災害対応の改善効果や法案成立の証拠にしない。',
  },
  {
    evidenceId: 'ev-policy-cooper-aca-announcement',
    sourceId: 'policy-cooper-health-plan',
    locator: '2026-03-09の計画発表、項目1–9。ACA税額控除復活、Medicaid削減の巻戻し、保険会社による治療の承認審査を見直す方針',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '候補者の提案であり成立法ではない。補助復活の期間・所得条件・連邦法案番号は未特定。会見で紹介された医療体験を州全体の支持の根拠にしない。',
  },
  {
    evidenceId: 'ev-policy-cooper-aca-faq',
    sourceId: 'policy-cooper-health',
    locator: '2026-09-05更新表示の医療政策FAQ。ACAとMedicaid、Medicare薬価交渉、年間処方薬自己負担、病院合併への監督の説明',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '初回公表日は不明。補助復活の期間・所得条件・法案番号は未特定。9月5日の更新日を新しい発表日や3月9日の計画の発表日に読み替えない。',
  },
  {
    evidenceId: 'ev-policy-cooper-hb76-signature',
    sourceId: 'policy-nc-hb76',
    locator: '2023-03-27の州政府署名発表。HB76への署名、地方病院・精神医療・働く家庭についての本人説明、別予算法への署名を要する当時の発効条件',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '州知事時代の署名を連邦上院の採決・現在の連邦公約と混同しない。当時の州法の発効条件と現在の州制度は別に扱う。',
  },
  {
    evidenceId: 'ev-policy-cooper-farm-tariffs',
    sourceId: 'policy-cooper-groceries',
    locator: '2026-09-05更新表示の食料品政策FAQ。農家の投入費用を上げるとして批判する関税の終了、食品加工・小売合併、顧客別アルゴリズム価格と企業間価格協調への規制',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '初回公表日・撤廃対象国・品目・税率・法令は未特定。家計への確定した値下げ額や政策実施後の効果を示す資料ではない。',
  },
  {
    evidenceId: 'ev-tafoya-issues-20261006',
    sourceId: 'candidate-tafoya-issues-20261006',
    locator: 'Stop The Fraud、Law and Order、Cut Costs and Taxes for the Middle Class、Bring Back Courage and Common Sense。不正防止措置や基本的な監査・回収手続の実施を拒む州への連邦資金停止、法執行、家計と医療・エネルギー、教育・選挙の公約',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '日付表示なし。連邦資金停止は不正防止措置や基本的な監査・回収手続の実施を拒む州という条件を保持。ACA補助延長条件・薬価法案はこのページでは未確認。犯罪件数・経済効果の陣営主張を検証した数値や州民一般の反応として扱わない。',
  },
  {
    evidenceId: 'ev-flanagan-priorities-20261006',
    sourceId: 'candidate-flanagan-priorities-20261006',
    locator: 'Healthcare、Affording Your Life、Housing、Ending Corruption、Foreign Policy、Immigration。関税の留保はForeign Policyの最初の箇条書き。ImmigrationではICEを解体し、尊厳・安全・適正手続を軸に移民制度を組み直す提案',
    checkedAt: '2026-10-06',
    kind: 'observed',
    note: '公表日・更新日表示なし。Medicare for All成立までの別の保障拡大、農家の輸出を傷つける関税と鉄鉱業に必要な保護の区別を保持。ICE解体後に組み直す対象は移民制度であり、ICE組織自体を再構築する提案とは扱わない。予算・法案番号・効果・実施日程と州全体の政策別反応は未確定。本人表現だけで特定の現行法の内容を断定しない。',
  },
];
