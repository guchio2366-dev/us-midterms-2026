import type { Source } from './model';
import type {
  CandidatePolicyRecord, PolicyAction, PolicyContextLink, PolicyPrototypeData,
  PolicyRef, PolicySpec, PublicAssumption, PublicRaceFactor,
} from './policy-prototype-model';

/** Additive checked records. Merge these arrays; never fill missing candidate cells from party. */
const checked = '2026-09-30';
const election = {
  ak: '2026-AK-2-regular', me: '2026-ME-2-regular', mi: '2026-MI-2-regular',
  nh: '2026-NH-2-regular', oh: '2026-OH-3-special', tx: '2026-TX-2-regular',
  ia: '2026-IA-2-regular', nc: '2026-NC-2-regular', ga: '2026-GA-2-regular', ks: '2026-KS-2-regular',
};
const candidate = {
  sullivan: 'cand-ak-dan-s-sullivan', peltola: 'cand-ak-mary-peltola',
  collinsMe: 'cand-me-susan-m-collins', husted: 'cand-oh-jon-husted',
  pappas: 'cand-nh-chris-pappas', sununu: 'cand-nh-john-e-sununu',
  cooper: 'cand-nc-roy-cooper', whatley: 'cand-nc-michael-whatley',
  ossoff: 'cand-ga-jon-ossoff', collinsGa: 'cand-ga-mike-collins',
  marshall: 'cand-ks-roger-marshall', hamilton: 'cand-ks-adam-hamilton',
};
const ref = (policyId: string, versionId: string): PolicyRef => ({ policyId, versionId });

export const policyAdditionRefs = {
  acaSullivan: ref('aca-enhanced-premium-credit', 'sullivan-conditional-design-2025-12-11'),
  acaProceed: ref('s3385-proceed-cloture', 'senate-roll644-2025-12-11'),
  globalEmergency: ref('end-global-tariff-emergency', 'sjres88-senate-vote-2025-10-30'),
  vaStaff: ref('va-clinical-workforce-restoration', 'peltola-platform-asof-2026-09-30'),
  vaRecords: ref('va-electronic-records-modernization', 'peltola-platform-asof-2026-09-30'),
  vaMentalHealth: ref('veterans-mental-health-expansion', 'peltola-platform-asof-2026-09-30'),
  peltolaHealthCuts: ref('unspecified-healthcare-cut-rollback', 'peltola-candidate-statement-asof-2026-09-30'),
  acaHouse2028: ref('aca-enhanced-premium-credit', 'hr1834-house-passage-2026-01-08'),
  acaPermanent: ref('aca-enhanced-premium-credit', 'pappas-permanent-campaign-2026-02-17'),
  canadaHouse: ref('end-canada-tariff-emergency', 'hjres72-house-passage-2026-02-11'),
  hsaExpansion: ref('health-savings-account-access', 'sununu-statement-2026-01-20'),
  constructionTariffs: ref('remove-building-material-tariffs', 'sununu-interview-2026-08-27'),
  acaCooper: ref('aca-enhanced-premium-credit', 'cooper-restoration-campaign-2026-03-09'),
  ncMedicaid: ref('nc-medicaid-expansion-hb76', 'governor-signature-2023-03-27'),
  farmTariffs: ref('end-farmer-cost-tariffs', 'cooper-platform-asof-2026-09-30'),
  priorAuthorization: ref('prevent-needed-care-denials', 'ossoff-statement-2026-09-18'),
  upfrontPrices: ref('upfront-healthcare-price-disclosure', 'marshall-described-design-2026-09-23'),
  priceConsentRequest: ref('patients-deserve-price-tags-consent-request', 'marshall-request-2026-09-23'),
  reciprocalTariffs: ref('reciprocal-tariffs', 'marshall-statement-2025-02-13'),
  tariffApproval: ref('congressional-approval-new-tariffs', 'hamilton-platform-asof-2026-09-30'),
  acaHamilton: ref('aca-enhanced-premium-credit', 'hamilton-restoration-platform-asof-2026-09-30'),
  ruralHospitals: ref('rural-hospital-support', 'hamilton-platform-asof-2026-09-30'),
};

const source = (
  key: string, title: string, publisher: string, url: string,
  publishedAt: string | null, referencePeriod: string, updatedAt?: string,
): Source => ({
  sourceId: `policy-${key}`, title, publisher, url, publishedAt,
  ...(updatedAt ? { updatedAt } : {}), referencePeriod, retrievedAt: checked, contentVerifiedAt: checked,
});

/** Only newly retrieved originals are marked verified here. Existing reviewed sources retain their own dates. */
export const policyAdditionSources: Source[] = [
  source('sullivan-aca', 'Sullivan Votes to Relieve Alaskans from Obamacare’s Outrageous Costs', 'Office of Senator Dan Sullivan', 'https://www.sullivan.senate.gov/newsroom/press-releases/sullivan-votes-to-relieve-alaskans-from-obamacares-outrageous-costs/', '2025-12-11', '当時の2年延長・所得上限・最低保険料等の条件付き案。成立や現在の支持表明ではない'),
  source('senate-roll644', 'Senate Roll Call 644: Cloture on the Motion to Proceed to S.3385', 'U.S. Senate', 'https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_00644.htm', null, '2025年12月11日の法案審議入り動議への討論終結。法案の最終採決ではない。ページの初回公開日は不明'),
  source('senate-roll600', 'Senate Roll Call 600: S.J.Res.88', 'U.S. Senate', 'https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_00600.htm', null, '2025年10月30日の世界関税非常事態終了決議。すべての関税への賛否ではない。ページの初回公開日は不明'),
  source('peltola-veterans', 'Keeping our Promise to Alaska Veterans and Servicemembers', 'Mary Peltola campaign', 'https://marypeltola.com/veterans/', null, 'VAの臨床職員、電子診療記録、退役軍人の精神医療をそれぞれ掲げる。ページ公開日・各提案の発表日は不明'),
  source('house-roll11', 'House Roll Call 11: H.R.1834, On Passage', 'Office of the Clerk, U.S. House of Representatives', 'https://clerk.house.gov/Votes/202611', null, '2026年1月8日の下院通過採決。Pappas Yea、Mike Collins Nay。将来の上院票ではない。ページ公開日は不明'),
  source('hr1834-eh', 'H.R.1834, Engrossed in House', 'U.S. Government Publishing Office', 'https://www.govinfo.gov/content/pkg/BILLS-119hr1834eh/html/BILLS-119hr1834eh.htm', null, '2026年1月8日下院通過版全文Section 1。ACA強化保険料税額控除を2028年まで延長する版。最終成立・ファイル公開日は未確認'),
  source('pappas-permanent-aca', 'Tax Cuts and Lower Costs Blueprint: Make Health Care Affordable', 'Chris Pappas for Senate', 'https://chrispappas.org/2026/02/chris-pappas-for-senates-tax-cuts-and-lower-costs-blueprint-spotlights-efforts-to-make-health-care-affordable/', '2026-02-17', 'ACA税額控除の恒久化を候補者が掲げる。H.R.1834の2028年までの延長とは別案'),
  source('house-roll65', 'House Roll Call 65: H.J.Res.72, On Passage', 'Office of the Clerk, U.S. House of Representatives', 'https://clerk.house.gov/Votes/202665', null, '2026年2月11日の下院通過採決でPappas Yea。2025年2月1日の非常事態を対象にする。ページ公開日は不明'),
  source('hjres72-eh', 'H.J.Res.72, Engrossed in House', 'U.S. Government Publishing Office', 'https://www.govinfo.gov/content/pkg/BILLS-119hjres72eh/html/BILLS-119hjres72eh.htm', null, '2026年2月11日下院通過版。EO14193の非常事態を終了し全関税撤廃とは扱わない。ファイル公開日は未確認'),
  source('sununu-health', 'John Sununu Campaigns in Lancaster for U.S. Senate', 'Sununu Senator campaign, reprinting The Colebrook Chronicle', 'https://www.sununusenator.com/post/seeks-to-regain-senate-seat-john-sununu-campaigns-in-lancaster-for-u-s-senate', '2026-02-03', '1月20日の町民集会と本人発言。原記事1月23日、陣営転載2月3日を区別'),
  source('sununu-nhpr', 'Primary conversations: Sununu says Congress should take back powers from executive branch', 'New Hampshire Public Radio', 'https://www.nhpr.org/politics/2026-08-28/senate-primary-conversations-john-sununu-nh-newhampshire-midterms-elections-2026', '2026-08-28', '8月27日の本人インタビュー書き起こし。建材の関税撤廃発言。陣営公式声明ではなく放送局の直接取材'),
  source('cooper-health', 'Making Health Care Affordable', 'Roy Cooper for North Carolina', 'https://roycooper.com/costless/health-care/', null, 'ACA税額控除の復活方針。期間、所得上限、法案番号は記載なし。公開日不明、表示された更新日9月5日', '2026-09-05'),
  source('cooper-health-plan', 'New Plan to Lower Health Care Costs', 'Roy Cooper for North Carolina', 'https://roycooper.com/roy-cooper-continues-make-stuff-cost-less-tour-announces-new-plan-to-lower-health-care-costs/', '2026-03-09', '3月9日の医療計画発表。項目2にACA税額控除復活。後日のFAQ更新日を発表日に置き換えない'),
  source('cooper-groceries', 'Lowering the Cost of Food & Groceries', 'Roy Cooper for North Carolina', 'https://roycooper.com/costless/groceries/', null, '農家の費用を押し上げるとして陣営が批判する関税の終了方針。法令・税率・品目は特定なし。公開日不明', '2026-09-05'),
  source('nc-hb76', 'Governor Cooper Signs Medicaid Expansion into Law', 'Office of the Governor of North Carolina', 'https://governor.nc.gov/news/press-releases/2023/03/27/governor-cooper-signs-medicaid-expansion-law', '2023-03-27', '知事としてHB76に署名した州政策の過去実績。連邦上院での採決ではない。当時は別の予算法署名を発効条件として記載'),
  source('whatley-issues', 'Michael’s Plan for North Carolina', 'Michael Whatley for Senate', 'https://michaelwhatley.com/issues/', null, 'Trump政策、治安、移民、エネルギー等の本人方針を確認。ここから特定のACA案・関税版の賛否を推定しない'),
];

type AdditionEvidence = PolicyPrototypeData['additionalEvidence'][number];
const evidence = (key: string, sourceId: string, locator: string): AdditionEvidence => ({
  evidenceId: `ev-policy-${key}`, sourceId, locator, checkedAt: checked, kind: 'observed',
});
export const policyAdditionEvidence: AdditionEvidence[] = [
  evidence('sullivan-aca-design', 'policy-sullivan-aca', 'December 11 statement, paragraph beginning “I offered amendments”: two years, income caps, immigration eligibility restriction, nominal payment for all plans.'),
  evidence('roll644-question', 'policy-senate-roll644', 'Vote summary: On the Cloture Motion, Motion to Proceed to S.3385; December 11, 2025; Cloture Motion Rejected.'),
  evidence('roll644-focus-votes', 'policy-senate-roll644', 'Alphabetical table: Collins (R-ME), Ossoff (D-GA), Sullivan (R-AK) Yea; Husted (R-OH), Marshall (R-KS) Nay.'),
  evidence('roll600-sullivan', 'policy-senate-roll600', 'Vote summary: On S.J.Res.88, October 30, 2025; measure title specifies global-tariff emergency termination. Alphabetical table Sullivan (R-AK), Nay.'),
  evidence('peltola-va-staff', 'policy-peltola-veterans', '“Strengthen and Expand VA Healthcare”, first bullet: restore VA clinical workforce and staff resources. No date or appropriation amount in this section.'),
  evidence('peltola-va-records', 'policy-peltola-veterans', '“Strengthen and Expand VA Healthcare”, second bullet: infrastructure modernization including electronic healthcare records.'),
  evidence('peltola-va-mental', 'policy-peltola-veterans', '“Strengthen and Expand VA Healthcare”, fourth bullet: expand mental healthcare, identify at-risk veterans and connect them to services.'),
  evidence('peltola-health-cut-rollback', 'candidate-peltola-statement-2026', '2026 official candidate statement: rollback of health care cuts, without an identified Medicaid clause, ACA extension term or bill. Existing source and September 30 research packet reused; direct PDF retrieval during supplemental review was unavailable.'),
  evidence('roll11-pappas-collins', 'policy-house-roll11', 'Roll Call 11, January 8, 2026, On Passage of H.R.1834; Pappas (D-NH) Yea, Collins (R-GA) Nay.'),
  evidence('hr1834-text', 'policy-hr1834-eh', 'House-passed text, sole Section 1(a)-(c): enhanced premium assistance and eligibility above 400% poverty through 2028; effective for taxable years after December 31, 2025.'),
  evidence('pappas-permanent-aca', 'policy-pappas-permanent-aca', 'February 17 campaign publication, “Fighting Back Against the Trump Administration’s Health Care Cuts”: making ACA tax credits permanent.'),
  evidence('roll65-pappas', 'policy-house-roll65', 'Roll Call 65, February 11, 2026, On Passage of H.J.Res.72; Pappas (D-NH) Yea.'),
  evidence('hjres72-text', 'policy-hjres72-eh', 'House-passed resolution terminates the February 1, 2025 national emergency in Executive Order 14193; House passage February 11, 2026.'),
  evidence('sununu-hsa', 'policy-sununu-health', 'Campaign’s February 3 reprint of January 23 article about January 20 event; affordability paragraph quotes access to health savings accounts for everyone who wants one.'),
  evidence('sununu-building-tariffs', 'policy-sununu-nhpr', 'NHPR transcript, housing answer: remove tariffs on building materials. Photo caption dates interview August 27; publication August 28, 2026.'),
  evidence('cooper-aca-faq', 'policy-cooper-health', 'ACA and Medicaid FAQ answer: reverse ACA tax credit expiration. Page says last updated September 5, 2026; first publication date and extension term not given.'),
  evidence('cooper-aca-announcement', 'policy-cooper-health-plan', 'March 9, 2026 announcement, plan item 2: reinstate ACA tax credits. No extension duration or federal bill identified.'),
  evidence('cooper-farm-tariffs', 'policy-cooper-groceries', '“What would Roy Cooper do to support our farmers?”: end tariffs described as raising farmers’ costs. Last updated September 5, 2026; legal instrument and action date unspecified.'),
  evidence('cooper-hb76-signature', 'policy-nc-hb76', 'March 27, 2023 official announcement: governor signed House Bill 76, Access to Healthcare Options. Final paragraph states expansion takes effect upon signing FY2023-25 appropriations act.'),
  evidence('whatley-topic-review', 'policy-whatley-issues', 'Reviewed all listed issue headings. General commitment to Trump agenda and America First economy supplies no exact ACA-extension, Canada-emergency or building-material tariff position.'),
  evidence('ossoff-care-denials', 'ten-ga-ossoff-health', 'September 18 release: third report collects patient stories; Ossoff states intent to prevent insurers denying or delaying needed care. No exact amendment text, new bill passage or random sample established.'),
  evidence('marshall-upfront-prices', 'ten-ks-marshall-health', 'September 23 release, introduction and delivered remarks: requested unanimous consent for Patients Deserve Price Tags Act; objection prevented advancement. Upfront actual prices, not merely estimates, described; complete bill version not reviewed.'),
];

const spec = (
  r: PolicyRef, themeId: PolicySpec['themeId'], title: string, definition: string,
  sourceIds: string[], evidenceIds: string[], kind: PolicySpec['kind'], scopeDate: string | null,
  unknowns: string[], routes?: PolicySpec['routes'],
): PolicySpec => ({
  ...r, themeId, title, definition, sourceIds, evidenceIds, kind, scopeDate,
  issueIds: [themeId === 'healthcare' ? 'health-family' : 'trade-industry'],
  specification: kind === 'historical-measure' ? 'identified-measure' : 'partial',
  routes: routes ?? (themeId === 'healthcare' ? ['ordinary-law', 'reconciliation', 'oversight'] : ['ordinary-law', 'oversight']),
  unknowns: [...unknowns, '当選後の採決、必要な賛成票、現在の法的状態は、この記録から補完しない。'],
});
const p = policyAdditionRefs;
const ev = (key: string) => `ev-policy-${key}`;

export const policyAdditionPolicies: PolicySpec[] = [
  spec(p.acaSullivan, 'healthcare', 'ACA補助の2年延長・所得上限等の条件付き案', 'Sullivanが2025年12月11日に説明した修正案の設計。所得上限、移民の資格制限、全プランで最低限の支払いを条件に2年延長。', ['policy-sullivan-aca'], [ev('sullivan-aca-design')], 'described-design', '2025-12-11', ['所得上限の数値、最低支払額、修正案番号・全文は未確認。']),
  spec(p.acaProceed, 'healthcare', 'S.3385の審議入りに向けた討論終結動議', '2025年12月11日の上院roll 644。S.3385へ進む動議に対する討論終結の手続票で、法案通過票ではない。', ['policy-senate-roll644'], [ev('roll644-question')], 'historical-measure', '2025-12-11', ['手続への票を法案全文や別の延長設計への賛否に置き換えない。'], ['ordinary-law']),
  spec(p.globalEmergency, 'tariffs', '世界向け関税の非常事態終了決議 S.J.Res.88', '2025年10月30日に上院が採決した非常事態終了決議。対カナダ決議や建材の関税撤廃とは別の対象。', ['policy-senate-roll600'], [ev('roll600-sullivan')], 'historical-measure', '2025-10-30', ['上院通過と最終成立は別。個別税率や他の関税権限は今回確認していない。'], ['ordinary-law', 'oversight']),
  spec(p.vaStaff, 'healthcare', 'VA臨床職員の回復', 'Peltolaの退役軍人向け方針にある、VAの臨床職員と診療に必要な資源の回復。', ['policy-peltola-veterans'], [ev('peltola-va-staff')], 'campaign-proposal', null, ['人数、予算額、対象施設、法案は未確認。'], ['ordinary-law', 'oversight']),
  spec(p.vaRecords, 'healthcare', 'VAの電子診療記録等の近代化', 'Peltolaが掲げる、電子診療記録を含むVA医療インフラの近代化投資。', ['policy-peltola-veterans'], [ev('peltola-va-records')], 'campaign-proposal', null, ['調達・実施時期、予算額、法案は未確認。'], ['ordinary-law', 'oversight']),
  spec(p.vaMentalHealth, 'healthcare', '退役軍人の精神医療と支援への接続拡大', 'Peltolaが掲げる精神医療の拡大と、リスクのある退役軍人を支援へつなぐ方針。', ['policy-peltola-veterans'], [ev('peltola-va-mental')], 'campaign-proposal', null, ['支援の対象、予算、具体法案は未確認。'], ['ordinary-law', 'oversight']),
  spec(p.peltolaHealthCuts, 'healthcare', '対象未特定の医療削減を戻す方針', 'Peltolaの公式候補者声明にある医療削減の巻き戻し。特定のMedicaid条項やACA補助案は識別できない。', ['candidate-peltola-statement-2026'], [ev('peltola-health-cut-rollback')], 'campaign-proposal', null, ['対象制度・条文・財源は未特定。PDFはこの追加作業では取得できず既存照合資料を再利用。']),
  spec(p.acaHouse2028, 'healthcare', 'ACA強化補助を2028年まで延長する H.R.1834下院通過版', '2026年1月8日の下院通過版全体。唯一のSection 1は強化保険料税額控除と所得上限特例を2028年まで延長する。', ['policy-house-roll11', 'policy-hr1834-eh'], [ev('roll11-pappas-collins'), ev('hr1834-text')], 'historical-measure', '2026-01-08', ['下院通過を連邦法の成立や将来の上院票とは扱わない。']),
  spec(p.acaPermanent, 'healthcare', 'ACA保険料税額控除の恒久化', 'Pappasが2026年2月17日の陣営資料で掲げた恒久化。2028年までの下院通過版と期間が異なる。', ['policy-pappas-permanent-aca'], [ev('pappas-permanent-aca')], 'campaign-proposal', '2026-02-17', ['財源、法案番号、所得・保険料条件は未確認。']),
  spec(p.canadaHouse, 'tariffs', '対カナダ非常事態を終了する H.J.Res.72下院通過版', 'Executive Order 14193の2025年2月1日非常事態を終了する2026年2月11日の下院通過決議。', ['policy-house-roll65', 'policy-hjres72-eh'], [ev('roll65-pappas'), ev('hjres72-text')], 'historical-measure', '2026-02-11', ['S.J.Res.37やS.J.Res.88と同一の採決ではない。現在の関税と最終成立は未確認。'], ['ordinary-law', 'oversight']),
  spec(p.hsaExpansion, 'healthcare', '希望する人へのHSA利用拡大', 'Sununuが1月20日の発言で述べ、2月3日に陣営が転載したhealth savings accountへのアクセス拡大。', ['policy-sununu-health'], [ev('sununu-hsa')], 'campaign-proposal', '2026-01-20', ['加入資格、拠出上限、財源、具体法案は未確認。ACA補助延長への賛否とは別。']),
  spec(p.constructionTariffs, 'tariffs', '建材の関税を撤廃する方針', 'Sununuが8月27日のNHPR直接取材で述べた建材関税の撤廃。記事の公開日は8月28日。', ['policy-sununu-nhpr'], [ev('sununu-building-tariffs')], 'campaign-proposal', '2026-08-27', ['品目、原産国、税率、行政・議会の具体的手段は未確認。']),
  spec(p.acaCooper, 'healthcare', 'ACA保険料税額控除の復活', 'Cooperが3月9日に掲げ、9月5日更新のFAQにも載せる補助復活方針。延長期間の特定はない。', ['policy-cooper-health', 'policy-cooper-health-plan'], [ev('cooper-aca-faq'), ev('cooper-aca-announcement')], 'campaign-proposal', '2026-03-09', ['期限、所得条件、具体法案は未確認。2年延長・2028年延長・恒久化のいずれとも同一と断定しない。']),
  spec(p.ncMedicaid, 'healthcare', 'NC Medicaid拡大法 HB76への知事署名', '2023年3月27日の州HB76へのCooperの知事署名を扱う過去実績。連邦上院の票ではない。', ['policy-nc-hb76'], [ev('cooper-hb76-signature')], 'historical-measure', '2023-03-27', ['当時の発効条件と現在の州制度は別途確認。州法署名を連邦Medicaid案への支持に換算しない。州の過去行動なので連邦の立法経路は付けない。'], []),
  spec(p.farmTariffs, 'tariffs', '農家の費用を押し上げる関税を終える方針', 'Cooperの9月5日更新FAQが、農家の負担増として批判する関税の終了を掲げる。対象法令は特定されていない。', ['policy-cooper-groceries'], [ev('cooper-farm-tariffs')], 'campaign-proposal', null, ['対象品目・原産国・税率・法令、発言日、経済効果は未確認。']),
  spec(p.priorAuthorization, 'healthcare', '必要な治療の保険承認遅延・拒否を防ぐ方針', 'Ossoffが9月18日に患者報告を公表し、医師が必要とする治療を保険会社が遅延・拒否することを防ぐ意図を表明。', ['ten-ga-ossoff-health'], [ev('ossoff-care-denials')], 'described-design', '2026-09-18', ['具体条文、対象保険、例外、法案の可決は未確認。患者の訴えは無作為世論調査ではない。'], ['ordinary-law', 'oversight']),
  spec(p.upfrontPrices, 'healthcare', '受診前の実際の医療価格開示', 'Marshallの9月23日発表が説明する価格透明化。Patients Deserve Price Tags Actを進める全会一致同意を求めたが異議があった。', ['ten-ks-marshall-health'], [ev('marshall-upfront-prices')], 'described-design', '2026-09-23', ['法案全文・版・条項は未収録。手続の働きかけを可決・成立とは扱わない。'], ['ordinary-law', 'oversight']),
  spec(p.priceConsentRequest, 'healthcare', 'Patients Deserve Price Tags Actへの全会一致同意要求', '2026年9月23日にMarshallが同名法案を進める同意を求め、異議で進まなかったという特定の手続。', ['ten-ks-marshall-health'], [ev('marshall-upfront-prices')], 'historical-measure', '2026-09-23', ['法案全体の要求を個別条項への賛否に置き換えない。法案番号・全文・可決は未確認。'], ['ordinary-law']),
  spec(p.reciprocalTariffs, 'tariffs', '交渉手段としての相互関税', 'Marshallの2025年2月13日の支持声明が説明する相互関税。個別税率や後日の法令全体ではない。', ['ten-ks-marshall-tariffs'], ['ev-ten-ks-marshall-tariffs'], 'described-design', '2025-02-13', ['対象国・品目・税率、2026年の同一設計への立場は未確認。']),
  spec(p.tariffApproval, 'tariffs', '新関税への議会承認を求める方針', 'Hamiltonの候補者方針にある、新しい関税への議会承認。既存関税の一括撤廃案とは区別。', ['ten-ks-hamilton-platform'], ['ev-ten-ks-hamilton-platform'], 'campaign-proposal', null, ['承認の時期・例外・法案番号は未確認。公開日・発言日不明。既存の9月30日照合を再利用。']),
  spec(p.acaHamilton, 'healthcare', 'ACA保険料補助の復活', 'Hamiltonの候補者方針にあるACA保険料補助の復活。延長期間と具体法案は特定されていない。', ['ten-ks-hamilton-platform'], ['ev-ten-ks-hamilton-platform'], 'campaign-proposal', null, ['期間・所得条件・財源は未確認。公開日・発言日不明。']),
  spec(p.ruralHospitals, 'healthcare', '地方病院への支援', 'Hamiltonが候補者方針で掲げる地方病院支援。Medicaidの個別条項や他候補の透明化案とは別政策。', ['ten-ks-hamilton-platform'], ['ev-ten-ks-hamilton-platform'], 'campaign-proposal', null, ['支援額、対象施設、財源、法案は未確認。公開日・発言日不明。'], ['ordinary-law', 'oversight']),
];

const action = (
  actionId: string, kind: PolicyAction['kind'], text: string, sourceIds: string[], evidenceIds: string[],
  actionDate: string | null, locator: string, options: Partial<Pick<PolicyAction, 'scope' | 'vote' | 'targetPolicyRef'>> = {},
): PolicyAction => ({
  actionId, kind, text, sourceIds, evidenceIds, actionDate, datePrecision: actionDate ? 'day' : 'unknown',
  checkedAt: checked, scope: 'exact-policy', vote: null, locator, ...options,
});
const position = (
  recordId: string, candidateId: string, electionId: string, r: PolicyRef,
  stance: CandidatePolicyRecord['stance'], stancePeriod: CandidatePolicyRecord['stancePeriod'],
  stanceAsOf: string | null, actions: PolicyAction[], conditions: string[] = [], unknowns: string[] = [],
): CandidatePolicyRecord => ({
  recordId, candidateId, electionId, ...r, stance, stancePeriod, stanceAsOf, checkedAt: checked, actions, conditions,
  stanceEvidenceIds: stance === 'unknown' ? [] : [...new Set(actions.filter(a => a.scope === 'exact-policy').flatMap(a => a.evidenceIds))],
  explicitlyPrioritized: actions.some(a => a.kind === 'stated-priority' && a.scope === 'exact-policy') ? true : null,
  unknowns: [...unknowns, '将来の上院採決や党会派としての票は推定しない。'],
});

export const policyAdditionRecords: CandidatePolicyRecord[] = [
  position('position-sullivan-aca-conditional', candidate.sullivan, election.ak, p.acaSullivan, 'conditional', 'historical', '2025-12-11', [action('action-sullivan-aca-design', 'statement', '2年延長に所得上限・資格制限・最低限の支払いを付ける修正を説明。', ['policy-sullivan-aca'], [ev('sullivan-aca-design')], '2025-12-11', 'December 11 statement, amendments paragraph.')], ['所得上限を置く。', '対象の移民資格を制限する。', '全プランで最低限の支払いを求める。'], ['具体的数値・修正案全文は未確認。2026年現在の再表明ではない。']),
  ...([
    ['sullivan', candidate.sullivan, election.ak, 'support', 'yea'],
    ['collins-me', candidate.collinsMe, election.me, 'support', 'yea'],
    ['ossoff', candidate.ossoff, election.ga, 'support', 'yea'],
    ['husted', candidate.husted, election.oh, 'oppose', 'nay'],
    ['marshall', candidate.marshall, election.ks, 'oppose', 'nay'],
  ] as const).map(([key, cid, electionId, stance, vote]) => position(
    `position-${key}-s3385-cloture`, cid, electionId, p.acaProceed, stance, 'historical', '2025-12-11',
    [action(`action-${key}-roll644`, 'vote', `S.3385の審議入りに向けた討論終結動議に${vote === 'yea' ? '賛成' : '反対'}。最終法案票ではない。`, ['policy-senate-roll644'], [ev('roll644-focus-votes')], '2025-12-11', 'Vote summary and alphabetical senator table.', { vote })],
    [], ['ACA補助の延長期間・条件への実体的賛否はこの手続票だけでは確定しない。'],
  )),
  position('position-sullivan-global-emergency', candidate.sullivan, election.ak, p.globalEmergency, 'oppose', 'historical', '2025-10-30', [action('action-sullivan-roll600', 'vote', 'S.J.Res.88の非常事態終了決議に反対。すべての関税を支持したとの意味には広げない。', ['policy-senate-roll600'], [ev('roll600-sullivan')], '2025-10-30', 'Vote summary and Sullivan (R-AK), Nay.', { vote: 'nay' })]),
  ...([
    ['va-staff', p.vaStaff, 'peltola-va-staff', 'VAの臨床職員と診療資源の回復を掲げる。'],
    ['va-records', p.vaRecords, 'peltola-va-records', '電子診療記録を含むVA医療インフラの近代化を掲げる。'],
    ['va-mental', p.vaMentalHealth, 'peltola-va-mental', '退役軍人の精神医療と支援への接続拡大を掲げる。'],
  ] as const).map(([key, r, evidenceKey, text]) => position(`position-peltola-${key}`, candidate.peltola, election.ak, r, 'support', 'campaign-as-of', checked, [action(`action-peltola-${key}-priority`, 'stated-priority', text, ['policy-peltola-veterans'], [ev(evidenceKey)], null, 'Strengthen and Expand VA Healthcare, corresponding bullet.')], [], ['資料公開日・発言日、法案、予算額は未確認。'])),
  position('position-peltola-health-cut-rollback', candidate.peltola, election.ak, p.peltolaHealthCuts, 'support', 'campaign-as-of', checked, [action('action-peltola-unspecified-cuts-priority', 'stated-priority', '対象を特定しない医療削減の巻き戻しを候補者声明で掲げる。', ['candidate-peltola-statement-2026'], [ev('peltola-health-cut-rollback')], null, 'Official candidate statement, health care cuts passage; existing checked packet reused.')], [], ['Medicaidの個別条項、ACAの特定延長案への支持とは推定しない。']),
  position('position-pappas-hr1834', candidate.pappas, election.nh, p.acaHouse2028, 'support', 'historical', '2026-01-08', [action('action-pappas-roll11', 'vote', '2028年までのACA強化補助延長を内容とするH.R.1834下院通過版全体に賛成。', ['policy-house-roll11'], [ev('roll11-pappas-collins')], '2026-01-08', 'Roll Call 11, On Passage, Pappas Yea.', { vote: 'yea' })]),
  position('position-collins-ga-hr1834', candidate.collinsGa, election.ga, p.acaHouse2028, 'oppose', 'historical', '2026-01-08', [action('action-collins-ga-roll11', 'vote', 'H.R.1834の下院通過採決で反対。期間や条件の違う案への立場は別に確認する。', ['policy-house-roll11'], [ev('roll11-pappas-collins')], '2026-01-08', 'Roll Call 11, On Passage, Collins Republican GA Nay.', { vote: 'nay' })]),
  position('position-pappas-permanent-aca', candidate.pappas, election.nh, p.acaPermanent, 'support', 'campaign-as-of', '2026-02-17', [action('action-pappas-permanent-aca-priority', 'stated-priority', 'ACA税額控除の恒久化を候補者方針として掲げる。', ['policy-pappas-permanent-aca'], [ev('pappas-permanent-aca')], '2026-02-17', 'Fighting Back Against the Trump Administration’s Health Care Cuts.')]),
  position('position-pappas-hjres72', candidate.pappas, election.nh, p.canadaHouse, 'support', 'historical', '2026-02-11', [action('action-pappas-roll65', 'vote', 'EO14193の非常事態を終了するH.J.Res.72下院通過採決に賛成。', ['policy-house-roll65'], [ev('roll65-pappas')], '2026-02-11', 'Roll Call 65, On Passage, Pappas Yea.', { vote: 'yea' })]),
  position('position-sununu-hsa', candidate.sununu, election.nh, p.hsaExpansion, 'support', 'campaign-as-of', '2026-01-20', [action('action-sununu-hsa-statement', 'statement', '希望する人がHSAを使えるようにする方針を発言。陣営が2月3日に転載した。', ['policy-sununu-health'], [ev('sununu-hsa')], '2026-01-20', 'Affordability paragraph in reprinted January 20 event report.')]),
  position('position-sununu-building-tariffs', candidate.sununu, election.nh, p.constructionTariffs, 'support', 'campaign-as-of', '2026-08-27', [action('action-sununu-building-tariffs-statement', 'statement', 'NHPRの本人インタビューで建材の関税撤廃を求めた。', ['policy-sununu-nhpr'], [ev('sununu-building-tariffs')], '2026-08-27', 'Interview transcript, housing response; interview date in photo caption.')], [], ['他の関税やH.J.Res.72への賛否に広げない。']),
  position('position-sununu-hr1834-unconfirmed', candidate.sununu, election.nh, p.acaHouse2028, 'unknown', 'unknown', null, [action('action-sununu-hsa-aca-context', 'statement', 'HSA利用拡大の発言はH.R.1834の同じ延長版への賛否を示さない。', ['policy-sununu-health'], [ev('sununu-hsa')], '2026-01-20', 'Affordability paragraph describes HSA access, not H.R.1834.', { scope: 'topic-only' })], [], ['同じ延長版への立場は未確認。未確認を反対と扱わない。']),
  position('position-cooper-aca-restore', candidate.cooper, election.nc, p.acaCooper, 'support', 'campaign-as-of', checked, [action('action-cooper-aca-announcement', 'stated-priority', '3月9日の医療計画でACA税額控除の復活を掲げる。9月5日更新FAQでも確認。', ['policy-cooper-health-plan', 'policy-cooper-health'], [ev('cooper-aca-announcement'), ev('cooper-aca-faq')], '2026-03-09', 'March 9 plan item 2 and ACA FAQ updated September 5.')], [], ['特定の延長期間や既存法案への支持は未確認。']),
  position('position-cooper-nc-hb76', candidate.cooper, election.nc, p.ncMedicaid, 'support', 'historical', '2023-03-27', [action('action-cooper-hb76-signature-reported', 'statement', '州知事としてHB76に署名したと公式発表。連邦議会の採決行動ではない。', ['policy-nc-hb76'], [ev('cooper-hb76-signature')], '2023-03-27', 'Official governor announcement, first paragraph: signed HB76.')], [], ['連邦Medicaid資金変更や就労要件の特定版への将来の票は未確認。']),
  position('position-cooper-farm-tariffs', candidate.cooper, election.nc, p.farmTariffs, 'support', 'campaign-as-of', checked, [action('action-cooper-farm-tariffs-priority', 'stated-priority', '農家の費用を押し上げるとして陣営が批判する関税を終える方針を掲げる。', ['policy-cooper-groceries'], [ev('cooper-farm-tariffs')], null, 'FAQ: What would Roy Cooper do to support our farmers?')], [], ['公開日・発言日と具体的な対象法令は未確認。']),
  position('position-ossoff-needed-care', candidate.ossoff, election.ga, p.priorAuthorization, 'support', 'campaign-as-of', '2026-09-18', [action('action-ossoff-denials-statement', 'statement', '9月18日の患者報告発表で、必要な治療の遅延・拒否を防ぐ意図を表明。', ['ten-ga-ossoff-health'], [ev('ossoff-care-denials')], '2026-09-18', 'Third-report press release, Ossoff statement following investigation background.')], [], ['具体法案・修正条文の提出や可決をこの発表だけから記録しない。']),
  position('position-marshall-upfront-prices', candidate.marshall, election.ks, p.upfrontPrices, 'support', 'campaign-as-of', '2026-09-23', [
    action('action-marshall-upfront-price-statement', 'statement', '受診前に見積もりではなく実際の価格を開示する設計への支持を演説で説明。', ['ten-ks-marshall-health'], [ev('marshall-upfront-prices')], '2026-09-23', 'Delivered remarks, final pricing paragraph: actual upfront price rather than estimate.'),
    action('action-marshall-price-consent-request', 'requested-action', '価格開示法案全体を進める全会一致同意を求めたが異議で停止。可決や成立ではない。', ['ten-ks-marshall-health'], [ev('marshall-upfront-prices')], '2026-09-23', 'Release introduction: unanimous-consent request and objection.', { scope: 'whole-measure', targetPolicyRef: p.priceConsentRequest }),
  ], [], ['法案全文・番号・版、現在の手続段階は未確認。']),
  position('position-marshall-reciprocal-tariffs', candidate.marshall, election.ks, p.reciprocalTariffs, 'support', 'historical', '2025-02-13', [action('action-marshall-reciprocal-statement', 'statement', '相互関税を通商交渉の手段として支持する当時の声明。', ['ten-ks-marshall-tariffs'], ['ev-ten-ks-marshall-tariffs'], '2025-02-13', 'February 13, 2025 statement, reciprocal tariffs paragraph.')], [], ['全関税や2026年の法令版への支持と断定しない。']),
  ...([
    ['tariff-approval', p.tariffApproval, '新関税への議会承認を求める方針を掲げる。'],
    ['aca-restore', p.acaHamilton, 'ACA保険料補助の復活を掲げる。'],
    ['rural-hospitals', p.ruralHospitals, '地方病院への支援を掲げる。'],
  ] as const).map(([key, r, text]) => position(`position-hamilton-${key}`, candidate.hamilton, election.ks, r, 'support', 'campaign-as-of', checked, [action(`action-hamilton-${key}-priority`, 'stated-priority', text, ['ten-ks-hamilton-platform'], ['ev-ten-ks-hamilton-platform'], null, 'Existing September 30 candidate-platform review; corresponding tariff or health section.')], [], ['公開日・発言日、具体法案は未確認。今回の取得失敗を新たな本文照合の成功とは扱わない。'])),
];

const context = (
  linkId: string, themeId: PolicyContextLink['themeId'], policyRefs: PolicyRef[],
  scope: PolicyContextLink['scope'], electionLinks: PolicyContextLink['electionLinks'],
  sourceIds: string[], evidenceIds: string[], title: string, description: string,
  eventDate: string | null = null, publishedAt: string | null = null,
  feedRefs: PolicyContextLink['feedRefs'] = [], unknowns: string[] = [],
): PolicyContextLink => ({
  linkId, themeId, policyRefs, scope, electionLinks, sourceIds, evidenceIds, title, description,
  eventDate, publishedAt, feedRefs, checkedAt: checked,
  issueIds: [themeId === 'healthcare' ? 'health-family' : 'trade-industry', 'household-economy'],
  unknowns: [...unknowns, '候補者の発言・過去行動から支持移動、当落、政策成立を推定しない。'],
});
const direct = (electionId: string, candidateIds: string[]): PolicyContextLink['electionLinks'][number] => ({ electionId, candidateIds, relation: 'direct' });
const comparison = (electionId: string, candidateIds: string[]): PolicyContextLink['electionLinks'][number] => ({ electionId, candidateIds, relation: 'comparison-context' });

export const policyAdditionContexts: PolicyContextLink[] = [
  context('context-aca-procedure-20251211', 'healthcare', [p.acaProceed, p.acaSullivan], 'cross-state', [direct(election.ak, [candidate.sullivan]), direct(election.me, [candidate.collinsMe]), direct(election.oh, [candidate.husted]), direct(election.ga, [candidate.ossoff]), direct(election.ks, [candidate.marshall])], ['policy-senate-roll644', 'policy-sullivan-aca'], [ev('roll644-question'), ev('roll644-focus-votes'), ev('sullivan-aca-design')], '同じ審議入り手続と、条件の違うACA案を分ける', '同じ手続でSullivan・Collins・Ossoffは賛成、Husted・Marshallは反対。Sullivanの2年延長案は本人の条件付き設計として別記録。', '2025-12-11', null, [], ['手続票は延長案そのものの最終票ではない。資料ごとの公開日が異なるため、共通の公開日は置かない。']),
  context('context-ak-va-platform', 'healthcare', [p.vaStaff, p.vaRecords, p.vaMentalHealth, p.peltolaHealthCuts], 'state', [direct(election.ak, [candidate.peltola]), comparison(election.ak, [candidate.sullivan])], ['policy-peltola-veterans', 'candidate-peltola-statement-2026'], [ev('peltola-va-staff'), ev('peltola-va-records'), ev('peltola-va-mental'), ev('peltola-health-cut-rollback')], 'アラスカのVA提案と、対象未特定の医療削減撤回', 'PeltolaのVA職員、記録近代化、精神医療を別政策にする。一般的な医療削減撤回から特定のACA・Medicaid案への支持は補わない。', null, null, [{ kind: 'candidate-platform', id: candidate.peltola }], ['公開日・予算・法案版は不明。']),
  context('context-ak-global-tariff-emergency', 'tariffs', [p.globalEmergency], 'state', [direct(election.ak, [candidate.sullivan]), comparison(election.ak, [candidate.peltola])], ['policy-senate-roll600'], [ev('roll600-sullivan')], 'アラスカ現職の世界関税非常事態終了決議への票', 'Sullivanの反対票はS.J.Res.88という過去の特定決議に限定。Peltolaの同一版への立場は未確認。', '2025-10-30', null),
  context('context-house-aca-2028', 'healthcare', [p.acaHouse2028, p.acaPermanent], 'cross-state', [direct(election.nh, [candidate.pappas]), comparison(election.nh, [candidate.sununu]), direct(election.ga, [candidate.collinsGa])], ['policy-house-roll11', 'policy-hr1834-eh', 'policy-pappas-permanent-aca'], [ev('roll11-pappas-collins'), ev('hr1834-text'), ev('pappas-permanent-aca')], '下院の2028年延長票と、Pappasの恒久化方針', '同じ下院通過版でPappasは賛成、Mike Collinsは反対。Pappasの恒久化方針とSununuのHSA方針は別案。', null, null, [], ['1月8日の採決と2月17日の恒久化発表の共通日は置かない。Sununuの同一延長版への立場は未確認。']),
  context('context-nh-hsa-platform', 'healthcare', [p.hsaExpansion], 'state', [direct(election.nh, [candidate.sununu]), comparison(election.nh, [candidate.pappas])], ['policy-sununu-health'], [ev('sununu-hsa')], 'SununuのHSAアクセス拡大方針', '1月20日の発言と2月3日の陣営転載を区別。ACA強化補助の延長とは別の制度設計。', '2026-01-20', '2026-02-03', [{ kind: 'candidate-platform', id: candidate.sununu }]),
  context('context-nh-tariff-scopes', 'tariffs', [p.canadaHouse, p.constructionTariffs], 'state', [direct(election.nh, [candidate.pappas, candidate.sununu])], ['policy-house-roll65', 'policy-hjres72-eh', 'policy-sununu-nhpr'], [ev('roll65-pappas'), ev('hjres72-text'), ev('sununu-building-tariffs')], '対カナダ非常事態終了票と、建材関税撤廃の発言', 'Pappasの2月11日の決議票とSununuの8月27日の建材発言は対象が異なる。二人の同じ政策版への賛否とは扱わない。', null, null, [{ kind: 'candidate-platform', id: candidate.sununu }], ['異なる出来事を一つの日付のニュースとして表示しない。']),
  context('context-nc-health-record-and-plan', 'healthcare', [p.acaCooper, p.ncMedicaid], 'state', [direct(election.nc, [candidate.cooper]), comparison(election.nc, [candidate.whatley])], ['policy-cooper-health', 'policy-cooper-health-plan', 'policy-nc-hb76', 'policy-whatley-issues'], [ev('cooper-aca-faq'), ev('cooper-aca-announcement'), ev('cooper-hb76-signature'), ev('whatley-topic-review')], '州知事としての医療実績と、連邦候補としてのACA復活案', 'Cooperの2023年署名と2026年提案を区別。Whatleyの一般的な政権方針から同じACA案への反対を補わない。', null, null, [{ kind: 'candidate-platform', id: candidate.cooper }, { kind: 'candidate-platform', id: candidate.whatley }], ['複数の過去行動・発表・更新があるため共通の出来事日は置かない。']),
  context('context-nc-farm-tariffs', 'tariffs', [p.farmTariffs], 'state', [direct(election.nc, [candidate.cooper]), comparison(election.nc, [candidate.whatley])], ['policy-cooper-groceries', 'policy-whatley-issues'], [ev('cooper-farm-tariffs'), ev('whatley-topic-review')], '農家の費用と関税への陣営方針', 'Cooperが批判する関税の対象は未特定。WhatleyのAmerica First economyの説明は、特定関税版への支持の証拠としない。', null, null, [{ kind: 'candidate-platform', id: candidate.cooper }], ['9月5日はFAQの更新日で、最初の公開日・発言日ではない。']),
  context('context-ga-care-denials', 'healthcare', [p.priorAuthorization], 'state', [direct(election.ga, [candidate.ossoff]), comparison(election.ga, [candidate.collinsGa])], ['ten-ga-ossoff-health'], [ev('ossoff-care-denials')], 'ジョージアの治療承認遅延・拒否についての患者報告', '9月18日の患者報告とOssoffの対応方針を結び付ける。報告は無作為調査でも具体法案の成立でもない。', '2026-09-18', '2026-09-18', [{ kind: 'news', id: 'news-ga-ossoff-health-20260918' }]),
  context('context-ga-trade-background', 'tariffs', [], 'state', [comparison(election.ga, [candidate.ossoff, candidate.collinsGa])], ['ten-ga-trade'], ['ev-ten-ga-trade'], 'ジョージアの輸出入・港湾物流という州背景', '航空機・自動車・港湾物流の貿易資料は関税の影響経路を考える材料。両候補の具体的関税版への賛否や有権者の反応は未確認。', null, '2026-03-05', [], ['経済的な曝露と支持先の変化は別に確認する。']),
  context('context-ks-health-distinct-designs', 'healthcare', [p.upfrontPrices, p.priceConsentRequest, p.acaHamilton, p.ruralHospitals], 'state', [direct(election.ks, [candidate.marshall, candidate.hamilton])], ['ten-ks-marshall-health', 'ten-ks-hamilton-platform'], [ev('marshall-upfront-prices'), 'ev-ten-ks-hamilton-platform'], '受診前価格の透明化と、補助・地方病院への支援', 'Marshallの9月23日の全会一致同意要求は異議で停止。Hamiltonの補助復活・地方病院支援は日付不明の候補者方針。別政策として比較する。', '2026-09-23', null, [{ kind: 'news', id: 'news-ks-marshall-health-20260923' }, { kind: 'candidate-platform', id: candidate.hamilton }], ['9月23日はMarshallの行動日で、Hamiltonの発表日ではない。資料ごとの公開日が異なるため共通の公開日は置かない。']),
  context('context-ks-tariff-designs', 'tariffs', [p.reciprocalTariffs, p.tariffApproval], 'state', [direct(election.ks, [candidate.marshall, candidate.hamilton])], ['ten-ks-marshall-tariffs', 'ten-ks-hamilton-platform'], ['ev-ten-ks-marshall-tariffs', 'ev-ten-ks-hamilton-platform'], '相互関税を支持した過去声明と、新関税の議会承認案', 'Marshallの2025年声明とHamiltonの現在の陣営方針は別の時点・設計。新関税の承認案を全関税反対へ置き換えない。', null, null, [{ kind: 'candidate-platform', id: candidate.hamilton }], ['共通の法案・税率・発言日は未確認。']),
];

const factor = (
  factorId: string, themeId: PublicRaceFactor['themeId'], electionId: string, candidateIds: string[],
  kind: PublicRaceFactor['kind'], label: string, description: string, evidenceIds: string[], unknowns: string[],
): PublicRaceFactor => ({ factorId, themeId, electionId, candidateIds, kind, label, description, evidenceIds, unknowns });

export const policyAdditionFactors: PublicRaceFactor[] = [
  factor('factor-ak-sullivan-aca-conditions', 'healthcare', election.ak, [candidate.sullivan], 'candidate-record', 'Sullivanの条件付き案と手続票を評価', '過去の2年延長案と審議入りへの賛成を個人実績としてどう評価するか。', [ev('sullivan-aca-design'), ev('roll644-focus-votes')], ['同じ条件の2026年案への再表明と将来の票は未確認。']),
  factor('factor-ak-peltola-va-expectation', 'healthcare', election.ak, [candidate.peltola], 'candidate-position', 'PeltolaのVA医療提案への期待', '職員、電子診療記録、精神医療への方針を評価する仮定。', [ev('peltola-va-staff'), ev('peltola-va-records'), ev('peltola-va-mental')], ['予算と実現条件、支持移動は未確認。']),
  factor('factor-ak-tariff-record-limit', 'tariffs', election.ak, [candidate.sullivan, candidate.peltola], 'candidate-record', '特定の非常事態終了票と未確認を分ける', 'SullivanのS.J.Res.88反対票は個人記録。Peltolaの同じ版への立場は未確認。', [ev('roll600-sullivan')], ['全関税への賛否、2026年の票に広げない。']),
  factor('factor-nh-aca-duration', 'healthcare', election.nh, [candidate.pappas, candidate.sununu], 'candidate-record', '延長期間と医療制度の違いを評価', 'Pappasの2028年延長票・恒久化方針とSununuのHSA案を別々に評価する仮定。', [ev('roll11-pappas-collins'), ev('pappas-permanent-aca'), ev('sununu-hsa')], ['Sununuの同じACA延長案への立場は未確認。']),
  factor('factor-nh-tariff-scope', 'tariffs', election.nh, [candidate.pappas, candidate.sununu], 'candidate-position', '関税の対象と行動の違いを評価', 'Pappasの対カナダ決議票とSununuの建材関税発言を同じ採決の二択にしない。', [ev('roll65-pappas'), ev('sununu-building-tariffs')], ['相手候補の同一政策版への立場と政策効果は未確認。']),
  factor('factor-nc-cooper-health-record', 'healthcare', election.nc, [candidate.cooper], 'candidate-record', 'Cooperの州実績と連邦提案を評価', 'HB76への知事署名とACA補助復活への期待を分けて評価する仮定。', [ev('cooper-hb76-signature'), ev('cooper-aca-announcement')], ['州実績を将来の連邦上院票に換算しない。']),
  factor('factor-nc-whatley-health-unknown', 'healthcare', election.nc, [candidate.whatley], 'uncertainty', 'Whatleyの同じACA案への判断を保留', '一般的な政権方針の支持から、期間・条件を特定したACA案への賛否は判断できない。', [ev('whatley-topic-review')], ['同一政策の資料不足は反対や無関心の証拠ではない。']),
  factor('factor-nc-farm-tariff-uncertainty', 'tariffs', election.nc, [candidate.cooper, candidate.whatley], 'uncertainty', '農家向け関税方針の対象を確認', 'Cooperの関税終了方針と、同じ対象について未確認のWhatleyを比較する際の留保。', [ev('cooper-farm-tariffs'), ev('whatley-topic-review')], ['税率・品目・法令、同条件の候補者資料、支持反応は未確認。']),
  factor('factor-ga-ossoff-care-actions', 'healthcare', election.ga, [candidate.ossoff], 'candidate-record', 'Ossoffの患者報告と対応方針を評価', '治療承認の遅延・拒否への働きかけを評価する仮定。', [ev('ossoff-care-denials')], ['患者報告は州全体の支持率や実現済みの規制ではない。']),
  factor('factor-ga-collins-aca-vote', 'healthcare', election.ga, [candidate.collinsGa], 'candidate-record', 'Mike Collinsの特定延長版への票を評価', 'H.R.1834下院通過版への反対を、期間が特定された過去票として読む。', [ev('roll11-pappas-collins')], ['別の延長期間、保険政策全体、将来の票は未確認。']),
  factor('factor-ga-tariff-background', 'tariffs', election.ga, [candidate.ossoff, candidate.collinsGa], 'state-context', '貿易の州背景を共通に置く', '航空機・自動車・港湾物流への経路を考える。背景資料は候補者の特定関税票ではない。', ['ev-ten-ga-trade'], ['関税版への両候補の立場と有権者の反応は未確認。']),
  factor('factor-ks-marshall-price-action', 'healthcare', election.ks, [candidate.marshall], 'candidate-record', 'Marshallの価格開示への働きかけを評価', '全会一致同意を求めた行動を評価する仮定。異議で止まったことも合わせて読む。', [ev('marshall-upfront-prices')], ['可決・成立や費用低下の実測ではない。']),
  factor('factor-ks-hamilton-health-plan', 'healthcare', election.ks, [candidate.hamilton], 'candidate-position', 'Hamiltonの補助と地方病院支援への期待', '陣営のACA補助復活・地方病院支援を評価する仮定。', ['ev-ten-ks-hamilton-platform'], ['期間、財源、成立の見込みは未確認。']),
  factor('factor-ks-tariff-design-choice', 'tariffs', election.ks, [candidate.marshall, candidate.hamilton], 'candidate-position', '交渉利用と議会承認の設計を区別', '相互関税を支持した過去のMarshall声明とHamiltonの新関税承認案のどこを評価するか。', ['ev-ten-ks-marshall-tariffs', 'ev-ten-ks-hamilton-platform'], ['同じ税率・法令への賛否ではない。']),
  factor('factor-ia-health-design-limit', 'healthcare', election.ia, ['cand-ia-ashley-hinson', 'cand-ia-josh-turek'], 'candidate-position', '医療費方針とpublic optionの違いを評価', '既存のHinson医療費資料とTurekのpublic option提案を、異なる制度設計として読む。', ['ev-hinson-costs', 'ev-turek-health'], ['両者の同じ法案版への将来の票は未確認。']),
  factor('factor-tx-public-option-expectation', 'healthcare', election.tx, ['cand-tx-james-talarico', 'cand-tx-ken-paxton'], 'candidate-position', 'Talaricoのpublic optionへの期待を評価', '既存の候補者資料にある公的医療選択肢への期待を個人判断にする。', ['ev-tx-candidate-positions-talarico-2026'], ['Paxtonの同じ制度設計への賛否、財源・法案版は未確認。']),
  factor('factor-tx-tariff-research-gap', 'tariffs', election.tx, ['cand-tx-james-talarico', 'cand-tx-ken-paxton'], 'uncertainty', 'Texasの同一関税版への判断を保留', 'この政策資料群では両候補の同じ関税版への行動を収録していない。党派から補わない。', [], ['未調査のセルは未確認のまま。反対や無関心とは扱わない。']),
  factor('factor-oh-tariff-research-gap', 'tariffs', election.oh, ['cand-oh-jon-husted', 'cand-oh-sherrod-brown'], 'uncertainty', 'Ohioの同一関税版への判断を保留', 'この政策資料群では両候補の同じ関税版への行動を収録していない。一般的な経済方針から補わない。', [], ['未調査のセルは未確認のまま。将来の採決を党派から推定しない。']),
];

export const policyAdditionAssumptions: PublicAssumption[] = [
  {
    assumptionId: 'assume-ten-state-health-costs', themeId: 'healthcare', kind: 'user-hypothesis',
    label: '医療費とアクセスを10州の共通前提に置く',
    description: '医療費・診療へのアクセスを重視すると利用者が仮定する。同じ前提でも、過去実績、提案の設計、資料不足への評価により候補者選択は異なり得る。',
    electionIds: Object.values(election),
    policyRefs: [p.acaSullivan, p.acaHouse2028, p.acaPermanent, p.acaCooper, p.acaHamilton, p.vaStaff, p.priorAuthorization, p.upfrontPrices, p.ruralHospitals],
    contextLinkIds: ['context-aca-procedure-20251211', 'context-ak-va-platform', 'context-house-aca-2028', 'context-nc-health-record-and-plan', 'context-ga-care-denials', 'context-ks-health-distinct-designs'],
    evidenceIds: [ev('sullivan-aca-design'), ev('hr1834-text'), ev('cooper-aca-announcement'), ev('ossoff-care-denials'), ev('marshall-upfront-prices'), 'ev-ten-ks-hamilton-platform'],
    unknowns: ['各州の重視する人の比率、得票効果、当落確率は未確認。', '同じテーマでも異なる期間・対象・制度を一つの賛否へまとめない。'],
  },
  {
    assumptionId: 'assume-ten-state-tariff-costs', themeId: 'tariffs', kind: 'user-hypothesis',
    label: '関税の費用と議会の役割を10州の共通前提に置く',
    description: '関税の家計・地域産業への負担と議会の関与を重視すると仮定する。特定決議の実績、対象限定の撤廃、交渉利用、承認制度への評価を候補者ごとに残す。',
    electionIds: Object.values(election),
    policyRefs: [p.globalEmergency, p.canadaHouse, p.constructionTariffs, p.farmTariffs, p.reciprocalTariffs, p.tariffApproval],
    contextLinkIds: ['context-ak-global-tariff-emergency', 'context-nh-tariff-scopes', 'context-nc-farm-tariffs', 'context-ga-trade-background', 'context-ks-tariff-designs'],
    evidenceIds: [ev('roll600-sullivan'), ev('hjres72-text'), ev('sununu-building-tariffs'), ev('cooper-farm-tariffs'), 'ev-ten-ga-trade', 'ev-ten-ks-marshall-tariffs', 'ev-ten-ks-hamilton-platform'],
    unknowns: ['経済的な曝露を得票変化へ自動換算しない。', '10州を対象にすることは、全候補の同一政策版を調査済みという意味ではない。'],
  },
];

export const policyAdditionSourceReviews: PolicyPrototypeData['sourceReviews'] = [
  ...policyAdditionSources.map(s => ({ sourceId: s.sourceId, checkedAt: checked, scope: s.referencePeriod })),
  { sourceId: 'ten-ga-ossoff-health', checkedAt: checked, scope: '9月18日の患者報告と本人の遅延・拒否を防ぐ意図を再読。患者報告を無作為調査や具体法案可決と扱わない。' },
  { sourceId: 'ten-ks-marshall-health', checkedAt: checked, scope: '9月23日の全会一致同意要求・異議と価格開示の説明を再読。可決・成立の新規確認ではない。' },
  { sourceId: 'ten-ks-marshall-tariffs', checkedAt: checked, scope: '2025年2月13日の相互関税声明を再読。2026年の政策版への支持ではない。' },
];

export type PolicyAdditions = Pick<PolicyPrototypeData, 'focusElectionIds' | 'policies' | 'candidateRecords' | 'contextLinks' | 'factors' | 'assumptions' | 'additionalEvidence' | 'sourceReviews'>;

export const policyAdditions: PolicyAdditions = {
  focusElectionIds: [...Object.values(election), '2026-MN-2-regular', '2026-NE-2-regular'], policies: policyAdditionPolicies,
  candidateRecords: policyAdditionRecords, contextLinks: policyAdditionContexts,
  factors: policyAdditionFactors, assumptions: policyAdditionAssumptions,
  additionalEvidence: policyAdditionEvidence, sourceReviews: policyAdditionSourceReviews,
};
