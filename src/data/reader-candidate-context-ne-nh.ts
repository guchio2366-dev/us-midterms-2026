import type { Source } from './model';
import type { EvidenceRef } from './research-model';
import type { ReaderCandidateExplanation } from './reader-candidate-explanations';

// Full NE/NH manuscripts supplied and independently audited on 2026-10-06.
// Reader context only: preserve roster party/caucus and versioned policy unknowns.
export const candidateExplanations: ReaderCandidateExplanation[] = [
  {
    "electionId": "2026-NE-2-regular",
    "candidateId": "cand-ne-pete-ricketts",
    "checkedAt": "2026-10-06",
    "sections": [
      {
        "heading": "減税・歳出管理と農業の販路を重視",
        "paragraphs": [
          {
            "text": "リケッツは、歳出と規制の抑制、減税、国境・法執行の強化を重視します。政府の支出や無駄が物価と財政の負担を高めるという考えから、行政の効率化を進める立場です。医療では、Medicaidの就労・資格要件を、制度を必要な人のために維持する手段と説明。2026年7月の発言では、幼い子のいない就労可能な成人に、週20時間の就労・ボランティア・就学を求める設計を支持しています。",
            "sourceIds": [
              "ricketts-government-20261006",
              "ricketts-medicaid-20260716"
            ],
            "evidenceIds": [
              "ev-ricketts-government-20261006",
              "ev-ricketts-medicaid-20260715"
            ]
          },
          {
            "text": "2025年7月1日のH.R.1上院最終採決では賛成しました。本人は減税と地方医療向け基金を評価しており、オズボーンが医療財源の削減を問題視するのとは評価が異なります。ただし、法案全体への票、本人が説明する就労要件、地方病院に実際に届く資金は別々に確かめる必要があります。",
            "sourceIds": [
              "ricketts-medicaid-20260716",
              "senate-rollcall-119-372",
              "ricketts-good-life-20260102",
              "osborn-paychecks-health-20261006"
            ],
            "evidenceIds": [
              "ev-ricketts-medicaid-20260715",
              "ev-ricketts-hr1-vote-20250701",
              "ev-ricketts-good-life-20260102",
              "ev-osborn-paychecks-health-20261006"
            ]
          },
          {
            "text": "農業では、作物保険、エタノールなどの燃料需要、輸出市場の安定を掲げます。5月19日には、中国などとの貿易紛争で農産物輸出が影響を受ける場合に備え、代替市場をUSDAと通商代表部に毎年調べさせるMARKET Actを提出したと発表。特定の大口輸出先への依存を減らすのが理由です。8月にはUSMCAを支持し、カナダ・メキシコとの市場アクセスや予見可能性を守るよう要請しました。農業支援を「関税支持」の一語で済ませず、国内の需要拡大と販路の分散、近隣国との通商維持を合わせて読む必要があります。",
            "sourceIds": [
              "ricketts-agriculture-20261006",
              "ricketts-market-act-20260519",
              "ricketts-usmca-20260811"
            ],
            "evidenceIds": [
              "ev-ricketts-agriculture-20261006",
              "ev-ricketts-market-act-20260519",
              "ev-ricketts-usmca-20260811"
            ]
          }
        ]
      }
    ]
  },
  {
    "electionId": "2026-NE-2-regular",
    "candidateId": "cand-ne-dan-osborn",
    "checkedAt": "2026-10-06",
    "sections": [
      {
        "heading": "独占と政治への資金の影響を抑え、働く人の負担を減らす",
        "paragraphs": [
          {
            "text": "オズボーンは無所属候補として、二大政党と大企業の関係を改めることを政策の出発点に置きます。賃金所得への減税、企業の価格設定や市場支配への規制を掲げ、医療では保険会社が診療・薬局まで一体に所有する構造を問題視しています。保険と医療提供などを分離する法案、独立した医師・薬局への公平な支払い、地方病院の財源の回復を支持。医療費と地域の受診機会を、保険給付だけでなく競争の仕組みから変える提案です。",
            "sourceIds": [
              "osborn-paychecks-health-20261006"
            ],
            "evidenceIds": [
              "ev-osborn-paychecks-health-20261006"
            ]
          },
          {
            "text": "農業では、食肉加工などへの企業集中が生産者の取り分と消費者の価格の両方に影響すると説明し、独占への対策、原産国表示、自分で農機を修理する権利、通年E15の販売を掲げます。関税は対象を絞った利用を支持する一方、一律の関税は農家・小企業の費用を増やすとして批判しています。対象品目や税率まで共通の案を示したわけではありません。",
            "sourceIds": [
              "osborn-rural-20261006"
            ],
            "evidenceIds": [
              "ev-osborn-rural-20261006"
            ]
          },
          {
            "text": "財政面では無駄な支出と企業への優遇を削る方針もあり、支出拡大だけを訴える候補ではありません。政治改革は、議員の個別株保有・売買の規制、献金元の開示、退任後のロビー活動の制限、企業などによる独立した選挙支出を認めたCitizens United判決を覆す憲法改正を提案しています。本人も憲法改正には高いハードルがあると認めており、通常法案と同じ条件で実現できる提案ではありません。",
            "sourceIds": [
              "osborn-plans-20261006",
              "osborn-political-reform-20261006",
              "fec-citizens-united-20261006"
            ],
            "evidenceIds": [
              "ev-osborn-plans-20261006",
              "ev-osborn-political-reform-20261006",
              "ev-fec-citizens-united-20261006"
            ]
          }
        ]
      }
    ]
  },
  {
    "electionId": "2026-NH-2-regular",
    "candidateId": "cand-nh-john-e-sununu",
    "checkedAt": "2026-10-06",
    "sections": [
      {
        "heading": "医療の競争と費用の見える化、住宅・エネルギーの供給を重視",
        "paragraphs": [
          {
            "text": "スヌヌは、医療費を下げる方法として、州境を越える競争、医師・看護師の事務負担の軽減、医療価格の開示を掲げます。HSAも希望する人に広く使えるようにする方針です。HSAは、税優遇を受けながら適格な医療費に備える貯蓄口座で、保険料の補助を延長する案とは仕組みが違います。本人はこれらを、患者の選択肢と競争を増やして価格を下げる提案と説明しています。拠出上限や対象保険の条件、ACA補助の特定延長案への賛否は今回の発言では確認できません。",
            "sourceIds": [
              "policy-sununu-health",
              "policy-sununu-nhpr",
              "healthcare-gov-hsa-definition-20261006"
            ],
            "evidenceIds": [
              "ev-context-sununu-health-access-20261006",
              "ev-context-sununu-nhpr-policy-20261006",
              "ev-hsa-definition-20261006"
            ]
          },
          {
            "text": "地方の受診機会については、州北部からManchesterの退役軍人医療施設へ通う負担を挙げ、地域の医療機関による診療、遠隔診療、精神医療、地方病院と交通への支援が必要だと述べています。一方、8月のインタビューではMedicaidの就労要件を支持する考えを示しました。医療アクセスを広げる提案と、給付条件を設ける提案の両方があり、同じ政策としてひとまとめにはできません。",
            "sourceIds": [
              "policy-sununu-health",
              "policy-sununu-nhpr"
            ],
            "evidenceIds": [
              "ev-context-sununu-health-access-20261006",
              "ev-context-sununu-nhpr-policy-20261006"
            ]
          },
          {
            "text": "住宅では、建材の関税をなくして建設費を下げ、連邦の住宅補助や税額控除を地域で使いやすくする規制見直しを提案。エネルギーは、費用の高い義務付けを減らし、New Englandの供給インフラを建てやすくする方針です。関税・歳出を大統領に任せすぎたとも述べ、議会が権限を見直すべきだとしています。ただし、大統領の関税権限をすべてなくす案や、全品目の関税撤廃を表明したものではありません。",
            "sourceIds": [
              "policy-sununu-health",
              "policy-sununu-nhpr"
            ],
            "evidenceIds": [
              "ev-context-sununu-health-access-20261006",
              "ev-context-sununu-nhpr-policy-20261006"
            ]
          }
        ]
      }
    ]
  },
  {
    "electionId": "2026-NH-2-regular",
    "candidateId": "cand-nh-chris-pappas",
    "checkedAt": "2026-10-06",
    "sections": [
      {
        "heading": "保険料の補助と価格抑制、住宅の供給・購入支援を組み合わせる",
        "paragraphs": [
          {
            "text": "パパスは、保険料の負担を軽くするACAの税額控除の恒久化を掲げます。理由は、保険があっても費用のために治療や薬を控える問題を減らすことです。2月17日の医療計画では、処方薬の価格交渉や安価な後発薬、保険会社による必要な検査・治療の拒否への対策、遠隔診療と退役軍人向け医療の拡充も示しています。通院距離と費用の両方が問題になる州の医療を、公的支援と企業への規制を組み合わせて改善する考えです。",
            "sourceIds": [
              "policy-pappas-permanent-aca"
            ],
            "evidenceIds": [
              "ev-context-pappas-health-blueprint-20261006"
            ]
          },
          {
            "text": "実際の下院の行動としては、2026年1月8日にACAの強化保険料税額控除を2028年まで延長するH.R.1834へ賛成しています。この採決の対象は期限付きの延長で、2月に掲げた恒久化とは別です。下院での賛成票は確認できますが、それだけで恒久化の成立や将来の上院採決を示すことにはなりません。",
            "sourceIds": [
              "policy-house-roll11",
              "policy-hr1834-eh"
            ],
            "evidenceIds": [
              "ev-context-pappas-hr1834-vote-20261006",
              "ev-context-nh-hr1834-text-20261006"
            ]
          },
          {
            "text": "住宅では、初めて家を買う人への税額控除に加え、低所得者向け住宅の建設・改修を促す税額控除の拡充、自治体の許認可の迅速化、製造住宅の融資上限引上げと、付属住宅（ADU）の建設にも住宅改修融資を使えるようにする見直しを支持します。購入者への支援だけでなく、供給不足と建設費を同時に改善するのが狙いです。冬の暖房費には低所得世帯向け支援LIHEAPやエネルギー税負担の軽減、クリーンエネルギーの税額控除の維持を掲げています。",
            "sourceIds": [
              "pappas-housing-blueprint-20260505",
              "pappas-energy-blueprint-20260120"
            ],
            "evidenceIds": [
              "ev-pappas-housing-blueprint-20260505",
              "ev-pappas-energy-blueprint-20260120"
            ]
          },
          {
            "text": "通商では、2026年2月11日に、対カナダ関税の根拠となった2025年2月1日の非常事態を終了させるH.J.Res.72へ賛成しました。スヌヌにも建材関税の撤廃という共通する方向がありますが、対象が「特定の非常事態」と「建材」で異なります。二人を関税一般への単純な賛否に分けず、どの費用をどの手段で下げるかを比較します。",
            "sourceIds": [
              "policy-sununu-nhpr",
              "policy-house-roll65",
              "policy-hjres72-eh"
            ],
            "evidenceIds": [
              "ev-context-sununu-nhpr-policy-20261006",
              "ev-context-pappas-hjres72-vote-20261006",
              "ev-context-nh-hjres72-text-20261006"
            ]
          }
        ]
      }
    ]
  }
];

export const candidateExplanationSources: Source[] = [
  {
    "sourceId": "ricketts-government-20261006",
    "title": "Reining in Big Government",
    "publisher": "Office of Senator Pete Ricketts",
    "url": "https://www.ricketts.senate.gov/issues/reining-in-big-government/",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認時点の歳出・規制・政府効率化の方針。公開・更新日は不明",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "ricketts-medicaid-20260716",
    "title": "VIDEO: Combatting Fraud, Waste, and Abuse",
    "publisher": "Office of Senator Pete Ricketts",
    "url": "https://www.ricketts.senate.gov/news/press-releases/video-combatting-fraud-waste-and-abuse/",
    "publishedAt": "2026-07-16",
    "referencePeriod": "発言は2026-07-15の記者電話会見、公表は2026-07-16。両日を区別",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "ricketts-good-life-20260102",
    "title": "Senator Ricketts’ Weekly Column: The Good Life in 2026",
    "publisher": "Office of Senator Pete Ricketts",
    "url": "https://www.ricketts.senate.gov/weekly_column/senator-ricketts-weekly-column-the-good-life-in-2026/",
    "publishedAt": "2026-01-02",
    "referencePeriod": "2026-01-02公開の本人の政策評価",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "ricketts-agriculture-20261006",
    "title": "Boosting Nebraska Agriculture",
    "publisher": "Office of Senator Pete Ricketts",
    "url": "https://www.ricketts.senate.gov/issues/boosting-nebraska-agriculture/",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認時点の農業方針。公開・更新日は不明",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "ricketts-market-act-20260519",
    "title": "Ricketts Introduces MARKET Act to Protect Agriculture Exports from Communist China",
    "publisher": "Office of Senator Pete Ricketts",
    "url": "https://www.ricketts.senate.gov/news/press-releases/ricketts-introduces-market-act-to-protect-agriculture-exports-from-communist-china/",
    "publishedAt": "2026-05-19",
    "referencePeriod": "2026-05-19のMARKET Act提出発表。成立とは区別",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "ricketts-usmca-20260811",
    "title": "Ricketts Leads Nebraska Delegation Letter Supporting USMCA",
    "publisher": "Office of Senator Pete Ricketts",
    "url": "https://www.ricketts.senate.gov/news/press-releases/ricketts-leads-nebraska-delegation-letter-supporting-usmca/",
    "publishedAt": "2026-08-11",
    "referencePeriod": "公表2026-08-11。本文 “On Friday” の厳密な送付日は今回未確定",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "osborn-paychecks-health-20261006",
    "title": "Protect our Paychecks, Social Security, and Healthcare",
    "publisher": "Dan Osborn campaign",
    "url": "https://www.osbornforsenate.com/ngfp-protect-our-paychecks-social-security-and-healthcare",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認時点の公約。公開・更新日は不明",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "osborn-rural-20261006",
    "title": "Fight like Hell for Rural Nebraska",
    "publisher": "Dan Osborn campaign",
    "url": "https://www.osbornforsenate.com/ngfp-fight-like-hell-for-rural-nebraska",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認時点の農村政策。公開・更新日は不明",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "osborn-plans-20261006",
    "title": "Plans",
    "publisher": "Dan Osborn campaign",
    "url": "https://www.osbornforsenate.com/plans",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認時点の財政方針。公開・更新日は不明",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "osborn-political-reform-20261006",
    "title": "Drain the Swamp",
    "publisher": "Dan Osborn campaign",
    "url": "https://www.osbornforsenate.com/ngfp-draintheswamp",
    "publishedAt": null,
    "referencePeriod": "2026-10-06確認時点の政治改革案。公開・更新日は不明",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "fec-citizens-united-20261006",
    "title": "Citizens United v. FEC",
    "publisher": "Federal Election Commission",
    "url": "https://www.fec.gov/legal-resources/court-cases/citizens-united-v-fec/",
    "publishedAt": null,
    "referencePeriod": "Citizens United判決についてのFECの公式説明。ページ公開日は不明、確認日2026-10-06",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "policy-sununu-health",
    "title": "John Sununu Campaigns in Lancaster for U.S. Senate",
    "publisher": "John E. Sununu campaign / The Colebrook Chronicle",
    "url": "https://www.sununusenator.com/post/seeks-to-regain-senate-seat-john-sununu-campaigns-in-lancaster-for-u-s-senate",
    "publishedAt": "2026-02-03",
    "referencePeriod": "本人発言2026-01-20、原記事2026-01-23、陣営転載2026-02-03。再確認2026-10-06",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "policy-sununu-nhpr",
    "title": "Senate Primary Conversations: John Sununu",
    "publisher": "NHPR",
    "url": "https://www.nhpr.org/politics/2026-08-28/senate-primary-conversations-john-sununu-nh-newhampshire-midterms-elections-2026",
    "publishedAt": "2026-08-28",
    "referencePeriod": "本人の直接インタビュー：取材2026-08-27、公表2026-08-28、再確認2026-10-06",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "healthcare-gov-hsa-definition-20261006",
    "title": "Health Savings Account (HSA)",
    "publisher": "HealthCare.gov",
    "url": "https://www.healthcare.gov/glossary/health-savings-account-HSA/",
    "publishedAt": null,
    "referencePeriod": "HSAの機能についての短い定義。公開・更新日は不明、確認2026-10-06",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "policy-pappas-permanent-aca",
    "title": "Tax Cuts and Lower Costs Blueprint: Make Health Care Affordable",
    "publisher": "Chris Pappas for Senate",
    "url": "https://chrispappas.org/2026/02/chris-pappas-for-senates-tax-cuts-and-lower-costs-blueprint-spotlights-efforts-to-make-health-care-affordable/",
    "publishedAt": "2026-02-17",
    "referencePeriod": "2026-02-17公開の医療計画。ACA税額控除の恒久化はH.R.1834の2028年までの延長と別案",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "pappas-housing-blueprint-20260505",
    "title": "Tax Cuts and Lower Costs Blueprint: Make Housing Affordable",
    "publisher": "Chris Pappas for Senate",
    "url": "https://chrispappas.org/2026/05/chris-pappas-for-senates-tax-cuts-and-lower-costs-blueprint-spotlights-efforts-to-make-housing-affordable/",
    "publishedAt": "2026-05-05",
    "referencePeriod": "2026-05-05公開の住宅計画。当時の提出・支持の内容を扱う",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  },
  {
    "sourceId": "pappas-energy-blueprint-20260120",
    "title": "Tax Cuts and Lower Costs Blueprint for New Hampshire",
    "publisher": "Chris Pappas for Senate",
    "url": "https://chrispappas.org/2026/01/chris-pappas-for-senate-unveils-tax-cuts-and-lower-costs-blueprint-for-new-hampshire/",
    "publishedAt": "2026-01-20",
    "referencePeriod": "2026-01-20公開の生活費計画の初回発表",
    "retrievedAt": "2026-10-06",
    "contentVerifiedAt": "2026-10-06"
  }
];

export const candidateExplanationEvidence: EvidenceRef[] = [
  {
    "evidenceId": "ev-ricketts-government-20261006",
    "sourceId": "ricketts-government-20261006",
    "locator": "歳出と政府の無駄、物価・財政への負担、効率化を説明する本文",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "歳出と物価の因果関係は本人の考えとして記載し、測定された効果としない。"
  },
  {
    "evidenceId": "ev-ricketts-medicaid-20260715",
    "sourceId": "ricketts-medicaid-20260716",
    "locator": "書き起こし後半 “We placed work and eligibility requirements on Medicaid and SNAP” 以降。幼い子のいない就労可能な成人、週20時間の就労・ボランティア・就学についての本人説明",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "現行法の資格条件すべてをこの発言から復元しない。不正件数・節約効果の推計は本文に採用しない。"
  },
  {
    "evidenceId": "ev-ricketts-hr1-vote-20250701",
    "sourceId": "senate-rollcall-119-372",
    "locator": "Question: On Passage of the Bill (H.R.1, as Amended); Ricketts (R-NE), Yea",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "法案全体への最終票であり、地方病院に実際に届く資金や個別条文への将来の票を示さない。"
  },
  {
    "evidenceId": "ev-ricketts-good-life-20260102",
    "sourceId": "ricketts-good-life-20260102",
    "locator": "減税、地方医療、国境・治安の各段落",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "減税と地方医療向け基金の評価は本人に帰属させる。税効果や犯罪減少の数量は独立検証せず本文に採用しない。"
  },
  {
    "evidenceId": "ev-ricketts-agriculture-20261006",
    "sourceId": "ricketts-agriculture-20261006",
    "locator": "末尾3段落：crop insurance / voluntary conservation / foreign market access / renewable fuels",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "作物保険、任意保全、輸出市場、再生可能燃料についての方針であり、農業支援を関税一般への支持へ置き換えない。"
  },
  {
    "evidenceId": "ev-ricketts-market-act-20260519",
    "sourceId": "ricketts-market-act-20260519",
    "locator": "本人の理由と “The MARKET Act would” の2項目。中国などとの貿易紛争による農産物輸出への影響に備えた代替市場の年次調査",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "貿易の完全途絶に限定しない。全米大豆協会の賛意は特定団体の意見であり、ネブラスカ州民一般の支持とは扱わない。"
  },
  {
    "evidenceId": "ev-ricketts-usmca-20260811",
    "sourceId": "ricketts-usmca-20260811",
    "locator": "後半の全文書簡：market access / regulatory certainty / market stability",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "市場アクセス・規制上の予見可能性・市場安定を支持する要請であり、将来の成果は確定していない。"
  },
  {
    "evidenceId": "ev-osborn-paychecks-health-20261006",
    "sourceId": "osborn-paychecks-health-20261006",
    "locator": "A、O “Break Up Healthcare Monopolies”、P “Protect Independent Doctors and Pharmacies”、R “Protect Rural Hospitals”",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "保険・医療提供の分離、公平な支払い、地方病院の財源回復は候補者提案。公約と現行法を区別し、薬価交渉が現在一切できないという説明は転載しない。"
  },
  {
    "evidenceId": "ev-osborn-rural-20261006",
    "sourceId": "osborn-rural-20261006",
    "locator": "A/B各政策項目：企業集中、原産国表示、農機修理、通年E15、対象を絞った関税と一律関税への評価",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "表示タイトルは本文見出しを使用する。HTML titleの “Good Jobs and Affordable Housing (Copy)” は内容と区別。対象品目・税率を一つの共通案として補わない。"
  },
  {
    "evidenceId": "ev-osborn-plans-20261006",
    "sourceId": "osborn-plans-20261006",
    "locator": "“Cut Waste and Balance the Budget”",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "無駄な支出と企業への優遇を減らすという候補者方針。政策別の州全体の反応を測る原調査は今回未取得。"
  },
  {
    "evidenceId": "ev-osborn-political-reform-20261006",
    "sourceId": "osborn-political-reform-20261006",
    "locator": "A “Overturn Citizens United”、B 個別株取引、C 献金元の開示、E 退任後のロビー活動",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "憲法改正のハードルは本人も認める。候補者への直接献金と独立した選挙支出を区別する。他候補への腐敗等の未検証の非難は本文に採用しない。"
  },
  {
    "evidenceId": "ev-fec-citizens-united-20261006",
    "sourceId": "fec-citizens-united-20261006",
    "locator": "判決が企業などによる独立した選挙支出の規制に与えた影響と、企業による候補者への献金禁止への影響はないとする説明",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "独立支出と候補への直接献金は別。ここでは判例の対象を説明し、憲法改正の公約はOsborn本人の資料で確認する。"
  },
  {
    "evidenceId": "ev-context-sununu-health-access-20261006",
    "sourceId": "policy-sununu-health",
    "locator": "北部の退役軍人医療・地方病院の発言、末尾のaffordability3分野。価格開示・HSA・建材関税・住宅支援・エネルギーインフラの本人説明",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "陣営による取材記事の転載。集会参加者の記述を州全体の支持や政策効果に置き換えない。HSAの発言からACAの特定延長案への賛否を補わない。"
  },
  {
    "evidenceId": "ev-context-sununu-nhpr-policy-20261006",
    "sourceId": "policy-sununu-nhpr",
    "locator": "生活費・住宅の回答、Medicaid就労要件への回答、末尾の関税と議会権限の回答",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "取材日と公表日を分ける。本人の「住民に広く支持される」という主張を原調査による住民反応としない。建材関税の撤廃を全品目への立場に広げない。"
  },
  {
    "evidenceId": "ev-hsa-definition-20261006",
    "sourceId": "healthcare-gov-hsa-definition-20261006",
    "locator": "冒頭定義：税優遇のある口座で適格医療費に備える機能",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "現行の加入条件全体の説明ではない。候補者の利用拡大案と現行制度を混同しない。"
  },
  {
    "evidenceId": "ev-context-pappas-health-blueprint-20261006",
    "sourceId": "policy-pappas-permanent-aca",
    "locator": "“Taking on Big Pharma and Insurance Companies”, “Fighting Back Against…”, “Cutting Red Tape…”, “Protecting Veterans…” の各節",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "候補者の公約。薬価・保険審査・遠隔診療・退役軍人医療の設計と、その成立や測定済みの効果を区別する。"
  },
  {
    "evidenceId": "ev-context-pappas-hr1834-vote-20261006",
    "sourceId": "policy-house-roll11",
    "locator": "Roll Call 11, 2026-01-08, On Passage of H.R.1834; Pappas, Democratic, NH, Yea",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "下院通過への賛成票。恒久化の成立や将来の上院票は示さない。2026-10-06の再確認はPappasの票と採決対象。"
  },
  {
    "evidenceId": "ev-context-nh-hr1834-text-20261006",
    "sourceId": "policy-hr1834-eh",
    "locator": "Section 1(a)–(c)：強化保険料税額控除の2028年への延長と2025-12-31後の課税年への適用",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "2026-10-06に当該条文を再確認。下院通過版であり最終成立や公約の恒久化とは別。"
  },
  {
    "evidenceId": "ev-pappas-housing-blueprint-20260505",
    "sourceId": "pappas-housing-blueprint-20260505",
    "locator": "“Supporting First Time Homebuyers & Current Homeowners”, “Creating More Housing Supply & Cutting Red Tape”。製造住宅の融資上限引上げと、付属住宅（ADU）の建設にも住宅改修融資を使えるようにする見直し",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "ADU向けの見直しを一般の増築向け融資に広げない。各法案の現在の成立状況・具体額はここで断定しない。"
  },
  {
    "evidenceId": "ev-pappas-energy-blueprint-20260120",
    "sourceId": "pappas-energy-blueprint-20260120",
    "locator": "エネルギー税負担、LIHEAP、クリーンエネルギー税額控除の各段落",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "支持者の投書抜粋は政策別の住民反応を代表する原調査ではない。成立や費用低下の測定結果と公約を区別する。"
  },
  {
    "evidenceId": "ev-context-pappas-hjres72-vote-20261006",
    "sourceId": "policy-house-roll65",
    "locator": "Roll Call 65, 2026-02-11, On Passage of H.J.Res.72; Pappas Yea",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "2026-10-06にPappasの票と採決対象を再確認。特定の非常事態を対象とする過去の採決。関税一般への単純な賛否ではない。"
  },
  {
    "evidenceId": "ev-context-nh-hjres72-text-20261006",
    "sourceId": "policy-hjres72-eh",
    "locator": "EO14193の2025-02-01非常事態を終了させる決議本文",
    "checkedAt": "2026-10-06",
    "kind": "observed",
    "note": "2026-10-06に当該本文を再確認。下院通過版と現在の成立状態を分け、全関税の撤廃とは扱わない。"
  }
];

