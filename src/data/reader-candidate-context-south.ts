import type { Source } from './model';
import type { EvidenceRef } from './research-model';
import type { ReaderCandidateExplanation } from './reader-candidate-explanations';

// Full TX / GA / KS manuscripts supplied and primary-source audited by the parent on 2026-10-06.
// Shared roll-call Sources remain in the central registry; candidate-specific rechecks use distinct EvidenceRef IDs.
// These reader explanations do not change versioned policy records or their historical unknowns.

export const candidateExplanations: ReaderCandidateExplanation[] = [
  {
    "electionId": "2026-TX-2-regular",
    "candidateId": "cand-tx-ken-paxton",
    "checkedAt": "2026-10-06",
    "sections": [
      {
        "heading": "減税・歳出削減と規制の明確化で経済を支える",
        "paragraphs": [
          {
            "text": "パクストンは州司法長官としての経験を背景に、Trump政権の立法課題を上院で進める方針です。経済政策では減税、不要とみなす連邦歳出の削減、エネルギー企業への規制緩和を組み合わせ、生活費を下げて国内製造業と雇用を増やすと説明しています。暗号資産については、事業者が米国内で開発・成長しやすい明確な規制が必要だとして、CLARITY Actの成立を掲げます。減税の税率・財源や個別の関税への賛否は、今回確認した政策ページでは特定できません。",
            "sourceIds": [
              "candidate-paxton-issues-2026"
            ],
            "evidenceIds": [
              "ev-context-south-paxton-issues-20261006"
            ]
          }
        ]
      },
      {
        "heading": "国境管理・送還を強め、保守的な社会政策を進める",
        "paragraphs": [
          {
            "text": "移民政策は国境壁の完成と送還の強化が中心です。国家主権と市民の安全を守る理由から、Trump政権による国境管理と、犯罪に関わる不法滞在者の送還を支持します。銃所持の権利、中絶反対、女子スポーツへのトランスジェンダー選手の参加に反対する立場も示しています。国境管理の追加予算、送還対象の法的基準、中絶規制の例外条件までを定めた上院法案は、この資料からは確認できません。",
            "sourceIds": [
              "candidate-paxton-issues-2026"
            ],
            "evidenceIds": [
              "ev-context-south-paxton-issues-20261006"
            ]
          }
        ]
      },
      {
        "heading": "企業の透明性と、治療拒否をめぐる州の調査",
        "paragraphs": [
          {
            "text": "医療では、製薬・食品企業の透明性と説明責任を強め、家庭が情報に基づいて選択できるようにすると訴えています。実際の行動として、2026年10月5日の州司法長官発表では、UnitedHealthへの民事調査要求を発出し、必要な治療の拒否や承認撤回が州消費者保護法などに違反するか調べていると説明しました。本人は、患者が保険料を払っても治療や補償を受けられないことを問題視しています。これは州法に基づく調査開始であり、企業の違法行為の確定や、連邦の保険制度改革が実現したという意味ではありません。",
            "sourceIds": [
              "candidate-paxton-issues-2026",
              "context-paxton-unitedhealth-20261005"
            ],
            "evidenceIds": [
              "ev-context-south-paxton-issues-20261006",
              "ev-context-south-paxton-unitedhealth-20261006"
            ]
          }
        ]
      }
    ]
  },
  {
    "electionId": "2026-TX-2-regular",
    "candidateId": "cand-tx-james-talarico",
    "checkedAt": "2026-10-06",
    "sections": [
      {
        "heading": "公的保険の選択肢と薬の自己負担を抑える施策",
        "paragraphs": [
          {
            "text": "タラリコは医療を権利と位置づけ、年齢にかかわらずMedicareに加入できる公的保険の選択肢を提案しています。民間保険との競争を通じ、公的保険を選ばない人の費用も下げるという考えです。ACA保険料補助の復活、薬の自己負担上限、保険の事前承認の見直し、Roe v. Wadeが認めていた中絶の権利の法制化も掲げます。州議会では、2021年に成立したSB827の下院側の共同スポンサーでした。同法は、州が規制する民間医療保険や条文で指定された州職員・教職員向け制度などについて、給付対象薬リストにあるインスリンの自己負担を30日分・処方ごと25ドル以下に制限します。2022年1月以降に発行・更新される対象保険に適用され、全住民の薬の販売価格を一律25ドルにした制度ではありません。",
            "sourceIds": [
              "context-talarico-health-20261006",
              "context-talarico-sb827-history",
              "context-talarico-sb827-text",
              "context-texas-insurance-scope-20261006"
            ],
            "evidenceIds": [
              "ev-context-south-talarico-health-20261006",
              "ev-context-south-talarico-sb827-history-20261006",
              "ev-context-south-talarico-sb827-text-20261006",
              "ev-context-south-texas-insurance-scope-20261006"
            ]
          }
        ]
      },
      {
        "heading": "税負担・生活費と、関税による費用を見直す",
        "paragraphs": [
          {
            "text": "生活費では、大企業や富裕層の課税を強め、その分を働く家庭・小企業の減税や支援に回す方針です。最低賃金時給15ドル、児童・勤労所得税額控除の拡大、住宅供給を妨げる規制の見直しを掲げます。関税については、消費者と企業の費用を増やすとしてTrump政権の広範な関税の撤廃を訴え、農業では機械・肥料への関税と輸出先の報復関税を問題視しています。労働分野の政策ページでは、代わりに海外の弱い労働基準による不公正な競争を防ぐ通商協定を重視しています。",
            "sourceIds": [
              "context-talarico-tax-20261006",
              "context-talarico-rural-20261006",
              "context-talarico-labor-20261006"
            ],
            "evidenceIds": [
              "ev-context-south-talarico-tax-20261006",
              "ev-context-south-talarico-rural-20261006",
              "ev-context-south-talarico-labor-20261006"
            ]
          }
        ]
      },
      {
        "heading": "国境の安全と合法移民経路・労働基準を組み合わせる",
        "paragraphs": [
          {
            "text": "国境政策では、安全確保と合法移民経路の拡大を同時に進める立場です。国境通過地点の検査技術と移民裁判官の増員、犯罪者・人身取引業者の送還を優先し、長期滞在者やDREAMers（子どもの頃に渡米した若者）などには市民権取得の経路を設けるとします。建設や農業の人手不足を減らして価格上昇を抑える目的で、雇用主による受け入れ制度も提案しています。ただし労働基準を強化し、移民労働者の搾取や米国の賃金の押し下げを防ぐ条件も付けています。",
            "sourceIds": [
              "context-talarico-border-20261006"
            ],
            "evidenceIds": [
              "ev-context-south-talarico-border-20261006"
            ]
          }
        ]
      },
      {
        "heading": "多様なエネルギーと、送電網・追加設備への投資",
        "paragraphs": [
          {
            "text": "エネルギーでは、既存の石油・ガス関連の仕事に加え、再生可能エネルギー、地熱、水素などで雇用を増やす構想です。環境保護を維持した許認可の迅速化、送電網の耐候性向上、AIデータセンター自身による追加設備費用の負担を掲げています。これはエネルギー産業の競争力、停電への備え、家庭の電気代を結び付けた本人の説明です。提案の財源や実際の料金低下幅が確定したことを示す資料ではありません。",
            "sourceIds": [
              "context-talarico-energy-20261006"
            ],
            "evidenceIds": [
              "ev-context-south-talarico-energy-20261006"
            ]
          }
        ]
      }
    ]
  },
  {
    "electionId": "2026-GA-2-regular",
    "candidateId": "cand-ga-mike-collins",
    "checkedAt": "2026-10-06",
    "sections": [
      {
        "heading": "許認可とエネルギー供給の見直しで暮らしの費用を下げる",
        "paragraphs": [
          {
            "text": "コリンズは運送会社を経営してきた下院議員で、企業の費用を抑え、雇用と家計の手取りを増やすことを重視しています。2026年6月16日の演説では、PERMIT Actによるインフラ・住宅などの許認可の見直しと、複数のエネルギー源による供給拡大を提案しました。本人は、行政手続の簡素化で開発費用を下げ、エネルギー供給を増やして州内の暮らしを安くするという理由を示しています。党の候補者紹介でも、減税と規制緩和を主要政策に掲げています。",
            "sourceIds": [
              "context-collins-agenda-20260616",
              "ten-ga-collins-platform"
            ],
            "evidenceIds": [
              "ev-context-south-collins-agenda-20261006",
              "ev-context-south-collins-platform-20261006"
            ]
          }
        ]
      },
      {
        "heading": "医療価格・HSAの公約と、期限付きACA延長への反対票",
        "paragraphs": [
          {
            "text": "医療では、同じ演説で価格の透明化、処方薬価格の引き下げ、医療貯蓄口座HSAの利用拡大を訴えました。具体的な過去の票では、ACAの強化保険料税額控除を2028年まで延長するH.R.1834の2026年1月8日下院通過採決に反対しています。この法案は、貧困線の400％を超える所得世帯にも控除を認める特例の延長を含みます。ただし、反対票の理由を本人が説明した一次資料は今回未確認です。HSA拡大の公約を、この特定の延長案に反対した理由として代用したり、あらゆる保険料支援に反対すると広げたりすることはできません。",
            "sourceIds": [
              "context-collins-agenda-20260616",
              "policy-house-roll11",
              "policy-hr1834-eh"
            ],
            "evidenceIds": [
              "ev-context-south-collins-agenda-20261006",
              "ev-context-south-collins-roll11-20261006",
              "ev-context-south-hr1834-text-20261006"
            ]
          }
        ]
      },
      {
        "heading": "Laken Riley Actの提出と、成立法が定める拘束対象",
        "paragraphs": [
          {
            "text": "治安・移民での具体的な立法行動は、Laken Riley Actの下院案H.R.29の提出です。本人は、州内で起きた殺人事件を受け、移民当局による拘束につながらない問題を改めるためだと説明しました。最終的に成立した上院案S.5は2025年1月29日に署名され、法律で定める入国不許可事由に該当する外国人について、窃盗などの対象犯罪で逮捕・起訴された段階も含めて連邦当局の拘束対象を広げました。有罪確定者だけに限定した制度ではありません。本人の安全対策としての目的、法律が定める対象、実際の犯罪減少効果はそれぞれ分けて読む必要があります。",
            "sourceIds": [
              "context-collins-laken-hr29",
              "context-collins-laken-purpose-20250113",
              "context-laken-riley-public-law-119-1"
            ],
            "evidenceIds": [
              "ev-context-south-collins-laken-hr29-20261006",
              "ev-context-south-collins-laken-purpose-20261006",
              "ev-context-south-laken-law-20261006"
            ]
          }
        ]
      }
    ]
  },
  {
    "electionId": "2026-GA-2-regular",
    "candidateId": "cand-ga-jon-ossoff",
    "checkedAt": "2026-10-06",
    "sections": [
      {
        "heading": "保険会社の治療承認の遅れ・拒否への対応",
        "paragraphs": [
          {
            "text": "オソフは、保険に入っていても必要な治療を受けられない問題を医療費と並ぶ課題にしています。2026年9月18日、医師が必要と判断した治療について、保険会社の事前承認が遅れたり拒否されたりしたとする患者の報告を公表しました。本人は、高い保険料を払っているのに治療を受けられない状況を改めるため、保険会社による不当な遅延・拒否を防ぐと説明しています。報告は州民から寄せられた体験を集めたもので、無作為抽出の調査でも、新しい規制の成立でもありません。",
            "sourceIds": [
              "ten-ga-ossoff-health"
            ],
            "evidenceIds": [
              "ev-context-south-ossoff-health-20261006"
            ]
          }
        ]
      },
      {
        "heading": "ACA保険料支援を審議へ進める手続票",
        "paragraphs": [
          {
            "text": "保険料支援については、ACA強化税額控除の延長を扱うS.3385を審議に進めるための2025年12月11日の討論終結動議に賛成しました。これは審議入りに関する手続票で、法案の最終可決票ではありません。また、治療承認の遅延防止と保険料税額控除は対象が異なる政策です。前者は保険会社の審査の仕組み、後者は保険に加入する際の負担を扱っており、一つの「医療賛成」という評価にまとめると違いが失われます。",
            "sourceIds": [
              "policy-senate-roll644"
            ],
            "evidenceIds": [
              "ev-context-south-ossoff-roll644-20261006"
            ]
          }
        ]
      },
      {
        "heading": "育児必需品の関税免除の検討状況を照会",
        "paragraphs": [
          {
            "text": "関税では、ベビーカー、チャイルドシート、ベビーベッドなどの必需品の値上がりを問題視し、関税免除の検討状況を商務長官と通商代表に照会しました。書簡の日付は2025年12月8日、議員事務所が紹介した発表日は2026年1月14日です。家計負担を下げるための対象を絞った働きかけですが、照会がそのまま免税措置の実施を意味するわけではありません。",
            "sourceIds": [
              "context-ossoff-baby-letter-20251208",
              "context-ossoff-baby-tariffs-20260114"
            ],
            "evidenceIds": [
              "ev-context-south-ossoff-baby-letter-20261006",
              "ev-context-south-ossoff-baby-release-20261006"
            ]
          }
        ]
      },
      {
        "heading": "太陽光製品への過去の関税要求と、州内製造業",
        "paragraphs": [
          {
            "text": "一方、2024年1月26日の超党派書簡では、中国製の太陽電池モジュール・セル・ウエハーへの通商法301条関税の引き上げと執行を求めました。中国の補助金に対抗し、国内の製造業・雇用とエネルギー安全保障を守るという理由です。州内には太陽光関連の生産拠点があり、州との関係は製造業の競争条件を通じて考えられます。ただし、この過去の特定品目への立場を、2026年のすべての関税への賛成または反対に置き換えることはできません。",
            "sourceIds": [
              "context-ossoff-solar-letter-20240126",
              "context-qcells-georgia-20261006"
            ],
            "evidenceIds": [
              "ev-context-south-ossoff-solar-letter-20261006",
              "ev-context-south-qcells-georgia-20261006"
            ]
          }
        ]
      }
    ]
  },
  {
    "electionId": "2026-KS-2-regular",
    "candidateId": "cand-ks-roger-marshall",
    "checkedAt": "2026-10-06",
    "sections": [
      {
        "heading": "受診前に実際の医療価格を比較できる仕組み",
        "paragraphs": [
          {
            "text": "マーシャルは医師出身の現職上院議員で、患者が受診前に価格を比較できる医療制度を重視しています。Patients Deserve Price Tags Actについて、病院だけでなく外来手術施設、画像診断施設、検査室の交渉価格・現金価格の公表や、明細のある請求書を求めると説明しています。2026年9月23日には法案を進める全会一致同意を求めましたが、異議によって進みませんでした。本人の理由は、見積もりだけでなく実際の価格を事前に示せば患者の選択と競争が働き、雇用主や家計の医療負担も抑えられるというものです。費用が実際に下がったことを示す結果ではありません。",
            "sourceIds": [
              "context-marshall-price-introduction-20250717",
              "ten-ks-marshall-health"
            ],
            "evidenceIds": [
              "ev-context-south-marshall-price-introduction-20261006",
              "ev-context-south-marshall-health-20261006"
            ]
          }
        ]
      },
      {
        "heading": "条件付きの補助延長と、使途制限のある個人医療口座案",
        "paragraphs": [
          {
            "text": "保険料補助は、延長期間と制度変更の条件を分けて見る必要があります。2025年12月11日、ACA強化税額控除延長案S.3385の審議入りに向けた討論終結には反対しました。同じ日に、自身のS.3389を進めるよう要求し、2026年の補助をつないだうえで、2027年から支援を専用の個人医療口座へ移す案を説明しています。提出版は最低月額負担、18歳を超える加入者の政府発行写真ID確認、2027年以降の所得上限、強化部分の段階的縮小も定めています。口座で支払える医療にも制限があり、性別移行を目的とするホルモン治療・手術や、条文の例外に該当しない中絶には口座資金を使えない設計です。本人は単なる保険会社への追加補助より患者自身の選択を重視すると説明しました。この全会一致同意要求も当日は異議で止まっており、無条件の補助延長や全補助の廃止と同じ案ではありません。",
            "sourceIds": [
              "policy-senate-roll644",
              "context-marshall-health-framework-20251211",
              "context-marshall-s3389-is-20251209",
              "context-marshall-s3389-procedure-20251211"
            ],
            "evidenceIds": [
              "ev-context-south-marshall-roll644-20261006",
              "ev-context-south-marshall-framework-20261006",
              "ev-context-south-marshall-s3389-20261006",
              "ev-context-south-marshall-procedure-20261006"
            ]
          }
        ]
      },
      {
        "heading": "通商条件を引き出す手段として相互関税を支持",
        "paragraphs": [
          {
            "text": "通商では、2025年2月13日にTrump政権の相互関税を支持しました。相手国からより良い通商条件を引き出し、米国製品、国内雇用、安全保障を支える交渉手段になるという説明です。小麦・牛肉などを輸出するカンザスでは、輸出市場の確保と農業資材費の両方が検討点になると考えられます。ただし、声明は当時の相互関税の考え方への支持で、国・品目・税率や2026年のすべての追加関税への支持まで示してはいません。",
            "sourceIds": [
              "ten-ks-marshall-tariffs",
              "ten-ks-agriculture"
            ],
            "evidenceIds": [
              "ev-context-south-marshall-tariffs-20261006",
              "ev-context-south-ks-agriculture-20261006"
            ]
          }
        ]
      },
      {
        "heading": "E15通年販売で国内の農業需要を支える",
        "paragraphs": [
          {
            "text": "農業・エネルギーでは、エタノール15％混合ガソリンE15の通年販売を重視しています。2026年5月14日のインタビューで、国内のトウモロコシ需要を安定させ、中国など海外の買い付けの変動への依存を減らすという理由を述べました。9月17日の地元向け会見でも、農業法案にE15を盛り込む方針を説明しています。関税による交渉と、国内の燃料需要を増やす方法を併用する姿勢であり、本人の需要拡大予測を実績値として扱うべきではありません。",
            "sourceIds": [
              "context-marshall-e15-20260514",
              "context-marshall-farm-20260917"
            ],
            "evidenceIds": [
              "ev-context-south-marshall-e15-20261006",
              "ev-context-south-marshall-farm-20261006"
            ]
          }
        ]
      }
    ]
  },
  {
    "electionId": "2026-KS-2-regular",
    "candidateId": "cand-ks-adam-hamilton",
    "checkedAt": "2026-10-06",
    "sections": [
      {
        "heading": "保険料支援と地方病院・薬価への対応",
        "paragraphs": [
          {
            "text": "ハミルトンは、ACAの保険料補助復活とMedicaid削減の撤回を掲げ、保険を維持できる家計と地方病院を増やす方針です。医療費の高さだけでなく、保険者からの支払い不足が地方の救急・出産医療を弱めると説明し、地方病院への支援と償還の改善を求めています。Medicareの薬価交渉を拡大し、その価格を民間保険にも広げる案もあります。補助復活の期間や病院支援の金額を定めた法案は、この政策ページにはありません。",
            "sourceIds": [
              "ten-ks-hamilton-platform"
            ],
            "evidenceIds": [
              "ev-context-south-hamilton-health-20261006"
            ]
          }
        ]
      },
      {
        "heading": "新関税の議会承認と、費用を押し上げる既存関税の撤廃",
        "paragraphs": [
          {
            "text": "関税では、新関税の発効前に議会承認を必要とし、家計が負担する費用も事前公表するよう提案しています。さらに、農家の資材費や輸出を害すると考える既存関税の撤廃と、USDAの輸出促進予算の倍増を掲げます。理由は、農業生産者の採算と消費者の食費を同時に守ることです。特定の税率・国を定めた一括撤廃案ではなく、新しい関税への統制と農業・住宅・エネルギーの費用を押し上げるとする既存関税の撤廃方針を分けて読む必要があります。",
            "sourceIds": [
              "ten-ks-hamilton-platform"
            ],
            "evidenceIds": [
              "ev-context-south-hamilton-tariffs-20261006"
            ]
          }
        ]
      },
      {
        "heading": "住宅供給・消費者保護と、働く人の条件を整える",
        "paragraphs": [
          {
            "text": "生活費政策の範囲は、住宅、消費者保護、労働にも及びます。モジュール住宅の規制整備で供給を増やし、隠れた追加手数料や家賃のアルゴリズムによる価格協調を規制する案を示しています。また、労働組合の最初の契約交渉の迅速化を支持し、雇用の採否・解雇・昇進をAIだけで決めない仕組みを求めます。これらは10月6日に確認した候補者の提案で、成立済みの制度や測定済みの値下がり効果ではありません。",
            "sourceIds": [
              "ten-ks-hamilton-platform"
            ],
            "evidenceIds": [
              "ev-context-south-hamilton-living-20261006"
            ]
          }
        ]
      }
    ]
  }
];

export const candidateExplanationSources: Source[] = [
  {
    "sourceId": "candidate-paxton-issues-2026",
    "title": "Issues",
    "publisher": "Ken Paxton for U.S. Senate",
    "url": "https://www.kenpaxton.com/issues",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認の候補者公約。公開日・更新日・発言日は不明。減税・国境・医療・暗号資産の本人方針であり、成立法や効果の検証ではない。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-paxton-unitedhealth-20261005",
    "title": "Attorney General Ken Paxton Investigates UnitedHealth Group for Denying Patients the Coverage They Need",
    "publisher": "Office of the Texas Attorney General",
    "url": "https://www.texasattorneygeneral.gov/news/releases/attorney-general-ken-paxton-investigates-unitedhealth-group-denying-patients-coverage-they-need-and",
    "publishedAt": "2026-10-05",
    "referencePeriod": "2026-10-05は州司法長官発表の公開日。民事調査要求の発出日は未確定。州法に基づく調査と、違法行為の認定・連邦法の成立を分ける。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-talarico-health-20261006",
    "title": "Health Care",
    "publisher": "James Talarico for U.S. Senate",
    "url": "https://jamestalarico.com/issue/health-care/",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認時点の候補者公約。公開日・更新日・発言日は不明。集会写真・陣営の観衆描写を支持率の裏付けに使わない。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-talarico-tax-20261006",
    "title": "Taxes & Cost of Living",
    "publisher": "James Talarico for U.S. Senate",
    "url": "https://jamestalarico.com/issue/taxes-cost-of-living/",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認時点の候補者公約。公開日・更新日・発言日は不明。集会写真・陣営の観衆描写を支持率の裏付けに使わない。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-talarico-rural-20261006",
    "title": "Rural Investment",
    "publisher": "James Talarico for U.S. Senate",
    "url": "https://jamestalarico.com/issue/rural-investment/",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認時点の候補者公約。公開日・更新日・発言日は不明。集会写真・陣営の観衆描写を支持率の裏付けに使わない。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-talarico-labor-20261006",
    "title": "Labor & Business",
    "publisher": "James Talarico for U.S. Senate",
    "url": "https://jamestalarico.com/issue/labor-business/",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認時点の候補者公約。公開日・更新日・発言日は不明。集会写真・陣営の観衆描写を支持率の裏付けに使わない。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-talarico-border-20261006",
    "title": "Immigration & Border Security",
    "publisher": "James Talarico for U.S. Senate",
    "url": "https://jamestalarico.com/issue/immigration-border-security/",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認時点の候補者公約。公開日・更新日・発言日は不明。集会写真・陣営の観衆描写を支持率の裏付けに使わない。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-talarico-energy-20261006",
    "title": "Energy & Environment",
    "publisher": "James Talarico for U.S. Senate",
    "url": "https://jamestalarico.com/issue/energy-environment/",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認時点の候補者公約。公開日・更新日・発言日は不明。集会写真・陣営の観衆描写を支持率の裏付けに使わない。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-talarico-sb827-history",
    "title": "SB827 — History, 87th Legislature, Regular Session",
    "publisher": "Texas Legislature Online",
    "url": "https://capitol.texas.gov/BillLookup/History.aspx?Bill=SB827&LegSess=87R",
    "publishedAt": null,
    "referencePeriod": "2021年SB827のスポンサー・成立経過。2021-06-14知事署名、2021-09-01施行。ページ初回公開日は不明。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-talarico-sb827-text",
    "title": "SB827 — Enrolled bill text",
    "publisher": "Texas Legislature Online",
    "url": "https://capitol.texas.gov/tlodocs/87R/billtext/html/SB00827F.HTM",
    "publishedAt": null,
    "referencePeriod": "2021年成立のSB827条文。給付対象薬リストのインスリン自己負担上限と対象保険を確認。条文ページの初回公開日は不明。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-texas-insurance-scope-20261006",
    "title": "Get health coverage for your employees",
    "publisher": "Texas Department of Insurance",
    "url": "https://tdi.texas.gov/business/get-health-coverage-for-your-employees.html",
    "publishedAt": null,
    "referencePeriod": "2026-10-06に確認した州規制保険と民間自家保険の適用範囲に関する補助説明。ページ公開日は未確認。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "ten-ga-collins-platform",
    "title": "Mike Collins (R) Georgia",
    "publisher": "National Republican Senatorial Committee",
    "url": "https://www.nrsc.org/mike-collins/",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認の党による候補者紹介。公開日・更新日は不明。減税・規制緩和・国境管理等の方針と、実績効果を区別する。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-collins-agenda-20260616",
    "title": "Mike Collins Wins U.S. Senate Primary, Advances to General Election Against Jon Ossoff",
    "publisher": "Mike Collins campaign",
    "url": "https://mikecollinsga.com/press/mike-collins-wins-u-s-senate-primary-advances-to-general-election-against-jon-ossoff/",
    "publishedAt": "2026-06-16",
    "referencePeriod": "2026-06-16の演説と掲載。PERMIT Act、エネルギー、医療価格・薬価・HSAについての本人の提案。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-collins-laken-hr29",
    "title": "H.R.29 — Laken Riley Act, Introduced in House",
    "publisher": "U.S. Government Publishing Office",
    "url": "https://www.govinfo.gov/app/details/BILLS-119hr29ih/related",
    "publishedAt": null,
    "referencePeriod": "2025-01-03のH.R.29提出者記録。ページ初回公開日は不明。最終成立した上院案S.5と区別する。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-collins-laken-purpose-20250113",
    "title": "Collins and McClain Publish Op-Ed on Laken Riley Act",
    "publisher": "House Republicans",
    "url": "https://www.gop.gov/2025/01/13/collins-and-mcclain-publish-op-ed-on-laken-riley-act/",
    "publishedAt": "2025-01-13",
    "referencePeriod": "2025-01-13掲載のMike Collins・Lisa McClain連名寄稿。本人の立法目的を確認。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-laken-riley-public-law-119-1",
    "title": "Public Law 119–1 — Laken Riley Act",
    "publisher": "U.S. Government Publishing Office",
    "url": "https://www.govinfo.gov/content/pkg/PLAW-119publ1/html/PLAW-119publ1.htm",
    "publishedAt": null,
    "referencePeriod": "最終上院案S.5は2025-01-29署名。成立法の第2節を参照。条文ページの初回公開日は不明。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "ten-ga-ossoff-health",
    "title": "Georgians Report Insurance Companies Deny or Delay Care",
    "publisher": "Office of Senator Jon Ossoff",
    "url": "https://www.ossoff.senate.gov/press-releases/new-georgians-report-experiencing-prolonged-pain-as-insurance-companies-deny-or-delay-care-doctors-say-they-need/",
    "publishedAt": "2026-09-18",
    "referencePeriod": "2026-09-18公表の第3報。州民が寄せた患者体験と本人の対応方針。2026-10-06再確認。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-ossoff-baby-tariffs-20260114",
    "title": "Sen. Ossoff Working to Address Rising Cost of Baby Products for Georgia Families Due to Tariffs",
    "publisher": "Office of Senator Jon Ossoff",
    "url": "https://www.ossoff.senate.gov/press-releases/sen-ossoff-working-to-address-rising-cost-of-baby-products-for-georgia-families-due-to-tariffs/",
    "publishedAt": "2026-01-14",
    "referencePeriod": "2026-01-14の紹介発表。書簡の本文日付2025-12-08とは別。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-ossoff-baby-letter-20251208",
    "title": "Letter on Tariffs and Essential Baby Products",
    "publisher": "Office of Senator Jon Ossoff",
    "url": "https://www.ossoff.senate.gov/wp-content/uploads/2026/01/162026_14552PM_Letter_from_Sen._Ossoff.pdf",
    "publishedAt": null,
    "referencePeriod": "本文日付2025-12-08の書簡。事務所紹介発表は2026-01-14。PDF初回公開日は未確定。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-ossoff-solar-letter-20240126",
    "title": "Bipartisan Letter on Section 301 Solar Tariffs",
    "publisher": "Office of Senator Jon Ossoff",
    "url": "https://www.ossoff.senate.gov/wp-content/uploads/2024/01/24.01.26_Sen.-Ossoff-301-Solar-Letter.pdf",
    "publishedAt": null,
    "referencePeriod": "書簡本文日付2024-01-26。紹介発表は2024-01-30で別日。PDF初回公開日は未確定。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-qcells-georgia-20261006",
    "title": "Our Commitment",
    "publisher": "Qcells",
    "url": "https://us.qcells.com/complete-energy-solutions/our-commitment/",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認のDalton / Cartersvilleの生産拠点に関する企業説明。公開日不明。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "ten-ks-marshall-health",
    "title": "Patients Deserve Upfront Healthcare Prices",
    "publisher": "Office of Senator Roger Marshall",
    "url": "https://www.marshall.senate.gov/newsroom/press-releases/senator-marshall-patients-deserve-upfront-healthcare-prices/",
    "publishedAt": "2026-09-23",
    "referencePeriod": "2026-09-23の同意要求・異議と本人の価格透明化説明。可決・成立ではない。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-marshall-price-introduction-20250717",
    "title": "Senators Marshall, Hickenlooper Introduce Legislation Requiring Price Transparency in Healthcare",
    "publisher": "Office of Senator Roger Marshall",
    "url": "https://www.marshall.senate.gov/newsroom/press-releases/senators-marshall-hickenlooper-introduce-legislation-requiring-price-transparency-in-healthcare/",
    "publishedAt": "2025-07-17",
    "referencePeriod": "2025-07-17の提出発表と設計説明。公開日と提出発表日。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-marshall-health-framework-20251211",
    "title": "Democrats Walked Away from a One-Year Subsidy Extension, Real Solutions to Fix Our Healthcare Crisis",
    "publisher": "Office of Senator Roger Marshall",
    "url": "https://www.marshall.senate.gov/newsroom/press-releases/senator-marshall-democrats-walked-away-from-a-one-year-subsidy-extension-real-solutions-to-fix-our-healthcare-crisis/",
    "publishedAt": "2025-12-11",
    "referencePeriod": "2025-12-11の発言・掲載。2026年のつなぎと2027年からの専用口座、S.3389へのUC要求。成立法ではない。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-marshall-s3389-is-20251209",
    "title": "S.3389 — Introduced in Senate",
    "publisher": "U.S. Government Publishing Office",
    "url": "https://www.govinfo.gov/content/pkg/BILLS-119s3389is/html/BILLS-119s3389is.htm",
    "publishedAt": null,
    "referencePeriod": "2025-12-09提出版。ページ初回公開日は未確認。101–105条および109条の条件を区別する。当時の提出案であり成立法ではない。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-marshall-s3389-procedure-20251211",
    "title": "Thursday, December 11, 2025",
    "publisher": "U.S. Senate Daily Press Gallery",
    "url": "https://www.dailypress.senate.gov/thursday-december-11-2025/",
    "publishedAt": "2025-12-11",
    "referencePeriod": "2025-12-11の上院手続の記録。S.3389を進めるUC要求と異議。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "ten-ks-marshall-tariffs",
    "title": "Statement in Support of Reciprocal Tariffs",
    "publisher": "Office of Senator Roger Marshall",
    "url": "https://www.marshall.senate.gov/newsroom/press-releases/senator-marshall-releases-statement-in-support-of-reciprocal-tariffs/",
    "publishedAt": "2025-02-13",
    "referencePeriod": "2025-02-13の相互関税支持声明を2026-10-06再確認。2026年の全追加関税の賛否には広げない。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "ten-ks-agriculture",
    "title": "Kansas Agriculture",
    "publisher": "Kansas Department of Agriculture",
    "url": "https://www.agriculture.ks.gov/kansas-agriculture",
    "publishedAt": null,
    "referencePeriod": "2024年生産・2025年輸出など州農業の背景。2026-10-06再確認。公開日不明。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-marshall-e15-20260514",
    "title": "Lowering the Cost of Living Is My Biggest Priority",
    "publisher": "Office of Senator Roger Marshall",
    "url": "https://www.marshall.senate.gov/newsroom/press-releases/senator-marshall-lowering-the-cost-of-living-is-my-biggest-priority/",
    "publishedAt": "2026-05-14",
    "referencePeriod": "2026-05-14掲載の本人インタビュー。E15通年販売についての理由。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "context-marshall-farm-20260917",
    "title": "Not a Single Democrat Voted for the Farm Bill",
    "publisher": "Office of Senator Roger Marshall",
    "url": "https://www.marshall.senate.gov/newsroom/press-releases/senator-marshall-not-a-single-democrat-voted-for-the-farm-bill/",
    "publishedAt": "2026-09-17",
    "referencePeriod": "2026-09-17の会見・掲載。農業法案にE15を盛り込むという本人方針。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "ten-ks-hamilton-platform",
    "title": "Adam Hamilton — Issues",
    "publisher": "Hamilton for Kansas",
    "url": "https://hamiltonforkansas.com/issues/",
    "publishedAt": null,
    "referencePeriod": "2026-10-06に直接再取得した候補者方針。公開日・更新日・発言日は不明で、確認日を提案日としない。旧9月30日の政策版とは区別する。",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  }
];

export const candidateExplanationEvidence: EvidenceRef[] = [
  {
    "evidenceId": "ev-context-south-paxton-issues-20261006",
    "sourceId": "candidate-paxton-issues-2026",
    "locator": "Carry the Torch / TAKE ON BIG FOOD AND BIG PHARMA / Sovereignty Matters / No Compromise / No More Blank Checks / Support Crypto Innovation and Growth",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "減税の税率・財源、個別関税の賛否、追加国境予算、送還対象の法的基準、中絶規制の例外条件を定める上院法案は未確認。住民全体の賛否の資料ではない。"
  },
  {
    "evidenceId": "ev-context-south-paxton-unitedhealth-20261006",
    "sourceId": "context-paxton-unitedhealth-20261005",
    "locator": "本文第1–5段落、とくに最後のCivil Investigative Demands。必要な治療の拒否・承認撤回をめぐる調査と本人の目的説明",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "has issuedは要求が発出済みという記述であり、発出日を10月5日と確定しない。本人引用は目的、報道された疑惑は未認定。紹介患者事例は調査の端緒であり支持率・州全体の反応ではない。"
  },
  {
    "evidenceId": "ev-context-south-talarico-health-20261006",
    "sourceId": "context-talarico-health-20261006",
    "locator": "My Priorities in the U.S. Senate",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "公的保険の選択肢、ACA補助・薬価・事前承認・中絶に関する公約。SB827のスポンサー・成立・対象保険は別の議会記録と成立条文に接続する。"
  },
  {
    "evidenceId": "ev-context-south-talarico-tax-20261006",
    "sourceId": "context-talarico-tax-20261006",
    "locator": "My Prioritiesの税、最低賃金、児童・勤労所得税額控除、住宅、Trump tariffs",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "本人の費用・分配に関する提案。減税の効果を実現済みとしない。"
  },
  {
    "evidenceId": "ev-context-south-talarico-rural-20261006",
    "sourceId": "context-talarico-rural-20261006",
    "locator": "My Prioritiesのfarm inputs / retaliatory tariffs",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "機械・肥料への関税と輸出先の報復関税を区別する。農村全体の支持率・反応を示す資料ではない。"
  },
  {
    "evidenceId": "ev-context-south-talarico-labor-20261006",
    "sourceId": "context-talarico-labor-20261006",
    "locator": "Keep more jobs in Texas with fair trade policies",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "海外の労働基準と通商協定に関する本人の提案。提案の成立・効果は未確認。"
  },
  {
    "evidenceId": "ev-context-south-talarico-border-20261006",
    "sourceId": "context-talarico-border-20261006",
    "locator": "My Prioritiesのlegalization / employer sponsorship / guest worker standards",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "取締り・合法経路と労働基準強化を合わせた本人方針。市民権・受入制度が成立したとしない。"
  },
  {
    "evidenceId": "ev-context-south-talarico-energy-20261006",
    "sourceId": "context-talarico-energy-20261006",
    "locator": "冒頭、My Prioritiesのenergy / data centers / workforce / grid",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "雇用・送電網・追加設備費負担の候補者構想。財源や実際の料金低下幅は未確定。"
  },
  {
    "evidenceId": "ev-context-south-talarico-sb827-history-20261006",
    "sourceId": "context-talarico-sb827-history",
    "locator": "Sponsor: Lucio III | Talarico。2021-06-14知事署名、2021-09-01施行の履歴",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "下院側の共同スポンサーであることと成立を確認。州法の施行日と、対象保険が2022年1月以降に発行・更新される場合の適用を区別する。"
  },
  {
    "evidenceId": "ev-context-south-talarico-sb827-text-20261006",
    "sourceId": "context-talarico-sb827-text",
    "locator": "Sec.1358.101–.104、特に.103(b)の処方ごと・30日分25ドル、Section 2の2022-01-01以降発行・更新される保険への適用",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "州規制の民間医療保険や指定された州職員・教職員向け制度などが対象。全住民の薬の販売価格を25ドルにしたものではない。静脈投与のインスリンはこの要件の対象外。ERISAの民間自家保険への州保険法の適用免除とは区別する。"
  },
  {
    "evidenceId": "ev-context-south-texas-insurance-scope-20261006",
    "sourceId": "context-texas-insurance-scope-20261006",
    "locator": "雇用主向け説明のself-funded health plansと州保険法の適用に関する節",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "ERISAの民間自家保険は州保険法の適用を免除される。SB827の対象保険を全雇用主・全州民へ広げないための補助資料。"
  },
  {
    "evidenceId": "ev-context-south-collins-platform-20261006",
    "sourceId": "ten-ga-collins-platform",
    "locator": "減税と規制緩和などの候補者方針の説明",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "党や陣営による支持の広がりの説明を、測定済みの住民反応としない。"
  },
  {
    "evidenceId": "ev-context-south-collins-agenda-20261006",
    "sourceId": "context-collins-agenda-20260616",
    "locator": "全文演説のFirst / Second / Third。PERMIT / energy / price transparency / HSA",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "相手候補への因果批判・送還実績数は独立検証せず不採用。HSA拡大公約をH.R.1834反対票の理由に代用しない。"
  },
  {
    "evidenceId": "ev-context-south-collins-roll11-20261006",
    "sourceId": "policy-house-roll11",
    "locator": "U.S. House Clerk Roll Call11（2026-01-08）、H.R.1834 On Passage。Collins (GA), Republican, Nay",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "下院通過採決への反対を確認。本人が反対理由を説明した一次資料は今回未確認。あらゆる保険料支援への反対に広げない。"
  },
  {
    "evidenceId": "ev-context-south-hr1834-text-20261006",
    "sourceId": "policy-hr1834-eh",
    "locator": "H.R.1834 Engrossed in House（2026-01-08）、Section 1(a)-(c)。延長年2028、400%FPL超への適用特例、2025-12-31後の課税年",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "下院通過条文の期限付き延長。最終成立や永久延長ではない。"
  },
  {
    "evidenceId": "ev-context-south-collins-laken-hr29-20261006",
    "sourceId": "context-collins-laken-hr29",
    "locator": "Introduced 2025-01-03。Sponsor: Mike Collins",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "H.R.29の提出者の事実であり、この下院提出版自体が最終成立法という意味ではない。"
  },
  {
    "evidenceId": "ev-context-south-collins-laken-purpose-20261006",
    "sourceId": "context-collins-laken-purpose-20250113",
    "locator": "Collins / McClain連名寄稿の、殺人事件と移民当局の拘束をめぐる法案目的の説明",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "文中のYesterdayを掲載日の前日と機械的に扱わない。本人の安全対策としての目的と、法律の対象・実際の犯罪減少効果は別。"
  },
  {
    "evidenceId": "ev-context-south-laken-law-20261006",
    "sourceId": "context-laken-riley-public-law-119-1",
    "locator": "Sec.2。法律指定の入国不許可条項と、対象犯罪による逮捕・起訴等を含む拘束対象",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "入国不許可事由と犯罪事由の両条件を保つ。有罪確定者だけに限定しない。H.R.29提出とS.5最終成立を区別。効果をこの法文だけから認定しない。"
  },
  {
    "evidenceId": "ev-context-south-ossoff-health-20261006",
    "sourceId": "ten-ga-ossoff-health",
    "locator": "報告発表の患者体験収集、必要と判断された治療の遅延・拒否、本人の説明",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "本人が募集した患者体験という観察資料。無作為抽出、州全体の発生率・賛否・選挙支持変化、新規制の成立を示さない。"
  },
  {
    "evidenceId": "ev-context-south-ossoff-roll644-20261006",
    "sourceId": "policy-senate-roll644",
    "locator": "Vote Summary: Cloture on the Motion to Proceed to S.3385、2025-12-11。Alphabetical table: Ossoff (D-GA), Yea",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "審議入りに向けた討論終結動議への賛成。法案の最終可決・成立とは異なる。保険承認の遅延防止策と保険料税額控除は対象の違う政策。"
  },
  {
    "evidenceId": "ev-context-south-ossoff-baby-release-20261006",
    "sourceId": "context-ossoff-baby-tariffs-20260114",
    "locator": "ベビーカー・チャイルドシート・ベビーベッド等の費用と、商務長官・通商代表への照会の紹介",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "免除の検討状況を尋ねる働きかけであり、免税実施の確認ではない。"
  },
  {
    "evidenceId": "ev-context-south-ossoff-baby-letter-20261006",
    "sourceId": "context-ossoff-baby-letter-20251208",
    "locator": "1頁の本文日付とquestions 1–2：免除の検討状況、中国との交渉に費用を含めたか",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "PDF埋込タイトル2025.12.02、ファイル名2026年1月より、本文日付2025-12-08を優先。照会と実施を区別。"
  },
  {
    "evidenceId": "ev-context-south-ossoff-solar-letter-20261006",
    "sourceId": "context-ossoff-solar-letter-20240126",
    "locator": "1頁第1–4段落。中国製太陽電池モジュール・セル・ウエハーへの301条関税の引上げ・執行。Ossoff / Brown / Rubio / Warnock連名",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "2024年の特定品目に関する立場を、2026年の全関税への賛成・反対に置き換えない。本人らの国内雇用・安全保障上の理由と実績効果を分離する。"
  },
  {
    "evidenceId": "ev-context-south-qcells-georgia-20261006",
    "sourceId": "context-qcells-georgia-20261006",
    "locator": "GeorgiaのDalton / Cartersvilleに関する拠点の説明",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "生産・雇用の将来見込み数は本文へ採用しない。州との関係を製造業の競争条件として読む背景であり、候補者支持率・住民の投票理由を示さない。"
  },
  {
    "evidenceId": "ev-context-south-marshall-health-20261006",
    "sourceId": "ten-ks-marshall-health",
    "locator": "発表冒頭と本人演説：Patients Deserve Price Tags ActのUC要求、異議、actual upfront pricesと明細請求",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "7月17日説明へのリンク先番号未記入草稿を、この日の版と同一と断定しない。費用が実際に下がったという効果の記録ではない。"
  },
  {
    "evidenceId": "ev-context-south-marshall-price-introduction-20261006",
    "sourceId": "context-marshall-price-introduction-20250717",
    "locator": "第1–3段落と本人引用。病院、外来手術施設、画像診断施設、検査室の交渉価格・現金価格、明細のある請求書",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "リンク先100頁PDFは法案番号未記入の草稿。法案番号を補完せず、2026-09-23の版と同一と断定しない。本人の費用削減理由を効果の測定値と扱わない。"
  },
  {
    "evidenceId": "ev-context-south-marshall-roll644-20261006",
    "sourceId": "policy-senate-roll644",
    "locator": "Vote Summary: Cloture on the Motion to Proceed to S.3385、2025-12-11。Alphabetical table: Marshall (R-KS), Nay",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "特定の延長案の審議入りへ向けた討論終結に反対した手続票。本人の条件付き案の設計や、すべての保険料支援への反対とは同一ではない。"
  },
  {
    "evidenceId": "ev-context-south-marshall-framework-20261006",
    "sourceId": "context-marshall-health-framework-20251211",
    "locator": "本人説明の患者の選択、1年つなぎ、2027年からの口座、S.3389へのUC要求と異議",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "この演説の最低月額「5ドル」と、2025-12-09提出版101条の所得帯別10～40ドルは異なる。数字を混同しない。法案は口座移行後も強化控除の規定を残すため「補助を1年で全廃」としない。"
  },
  {
    "evidenceId": "ev-context-south-marshall-s3389-20261006",
    "sourceId": "context-marshall-s3389-is-20251209",
    "locator": "101条：最低月額10 / 20 / 30 / 40ドル。102条：18歳を超える加入者の政府発行写真ID。103–104条：2027年からのHealthcare Affordability Accountsと使途制限。105条：2027–2031年の700%FPL所得上限、2028–2031年の強化額20 / 40 / 60 / 80%縮小。109条：適格保険の給付範囲制限",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "演説の月5ドルと提出版10～40ドルの差を保持。103条の口座終了年は2031と2030年末の内部不一致があるため本文は「2027年から」以上を補完しない。104条は法案定義の性別移行目的のホルモン治療・手術、および条文例外に該当しない中絶への口座資金使用を制限。中絶の例外には強姦・近親相姦・母体の生命等がある。109条にも適格保険の給付範囲制限があり、単純な口座化とは扱わない。後日の全改訂・最終成立状況は今回の追跡対象外。"
  },
  {
    "evidenceId": "ev-context-south-marshall-procedure-20261006",
    "sourceId": "context-marshall-s3389-procedure-20251211",
    "locator": "10:43 a.m.：S.3389へのMarshallのunanimous-consent要求、Blunt Rochesterの異議",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "要求が異議で止まったことの記録。可決・成立ではない。"
  },
  {
    "evidenceId": "ev-context-south-marshall-tariffs-20261006",
    "sourceId": "ten-ks-marshall-tariffs",
    "locator": "相互関税をより良い通商条件、米国製品・国内雇用・安全保障のための交渉手段とする本人声明",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "当時の考え方への支持。対象国・品目・税率、2026年の同一設計への立場は未確認。"
  },
  {
    "evidenceId": "ev-context-south-ks-agriculture-20261006",
    "sourceId": "ten-ks-agriculture",
    "locator": "小麦・牛肉などの農業と輸出に関する説明",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "輸出市場と農業資材費が州の検討点になり得るという編集上の解釈の背景。資料間で一致しない輸出先順位は使わず、州全体の支持率・反応を推定しない。"
  },
  {
    "evidenceId": "ev-context-south-marshall-e15-20261006",
    "sourceId": "context-marshall-e15-20260514",
    "locator": "On year-round E15。国内のトウモロコシ需要を安定させ、海外買付け変動への依存を減らす説明",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "本人の需要拡大予測を実績値・農家全体の賛否としない。"
  },
  {
    "evidenceId": "ev-context-south-marshall-farm-20261006",
    "sourceId": "context-marshall-farm-20260917",
    "locator": "On year-round E15",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "党派的な責任追及や需要予測を確定事実にしない。本人の「多くの州民」の説明は原調査ではない。"
  },
  {
    "evidenceId": "ev-context-south-hamilton-health-20261006",
    "sourceId": "ten-ks-hamilton-platform",
    "locator": "Adam's Agenda to Lower Health Care Costs。ACA補助、Medicaid、薬価交渉、地方病院・償還",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "ACA復活の期間・所得条件・財源、地方病院の支援額と対象基準は未確認。病院閉鎖リスク・無保険率・負担増の数値は原報告を確認せず採用しない。"
  },
  {
    "evidenceId": "ev-context-south-hamilton-tariffs-20261006",
    "sourceId": "ten-ks-hamilton-platform",
    "locator": "Protecting the Security Kansas Seniors Have Earned / Housing Kansans Can Afford / Support Kansas Agriculture, Producers, and Consumers。新関税は発効前の議会承認・費用事前公表、既存関税、USDA輸出促進予算倍増",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "今回の確認範囲では承認時期は「発効前」。旧9月30日版の「承認の時期は未確認」や過去の取得失敗とは分ける。既存関税撤廃は農業・住宅・エネルギーの費用への影響という理由を保ち、農業だけや全関税の一括撤廃へ狭めたり広げたりしない。特定税率・国・法案番号は未確認。"
  },
  {
    "evidenceId": "ev-context-south-hamilton-living-20261006",
    "sourceId": "ten-ks-hamilton-platform",
    "locator": "Housing Kansans Can Afford / Strengthening Consumer Protections and Supporting Small Business / Standing with Kansas Workers。modular homes、家賃算法、追加手数料、組合契約、AIの雇用判断",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "2026-10-06に確認した提案であり、成立制度や測定済み値下がり効果ではない。陣営が会った州民・農家の声は公開日・選定方法・代表性不明で州全体の支持に使わない。"
  }
];
