import type { PolicySpec } from '../data/policy-prototype-model';

/** Checked version descriptions; an as-of date is not a publication date. */
const labels=new Map<string,string>([
  ['hr1-package@senate-passage-2025-07-01','2025年7月1日・上院通過版'],
  ['medicaid-funding-reduction@collins-description-2025-07-01','2025年7月1日・本人声明（資金削減への対応設計）'],
  ['medicaid-work-requirement@collins-exemptions-2025-07-01','2025年7月1日・本人声明（就労要件の例外条件）'],
  ['medicare-for-all@elsayed-platform-asof-2026-09-11','2026年9月11日確認の公約（El-Sayedの制度改革案）'],
  ['federal-public-option@campaign-principle-asof-2026-09-11','2026年9月11日確認の公約（公的医療選択肢）'],
  ['end-canada-tariff-emergency@sjres37-senate-vote-2025-04-02','2025年4月2日・上院採決版（S.J.Res.37）'],
  ['blanket-canada-tariffs@campaign-description-2026-09-01','2026年9月1日・陣営発表（広範な対カナダ関税への立場）'],
  ['targeted-tariffs@campaign-principle-asof-2026-09-11','2026年9月11日確認の公約（対象限定・交渉利用）'],
  ['trade-law-enforcement@hinson-statement-2026-09-01','2026年9月1日・本人声明（関税回避の取締り）'],
  ['aca-enhanced-premium-credit@sullivan-conditional-design-2025-12-11','2025年12月11日・Sullivan声明（2年延長・条件付き設計）'],
  ['s3385-proceed-cloture@senate-roll644-2025-12-11','2025年12月11日・審議入り動議への討論終結票（S.3385）'],
  ['end-global-tariff-emergency@sjres88-senate-vote-2025-10-30','2025年10月30日・上院採決版（S.J.Res.88）'],
  ['va-clinical-workforce-restoration@peltola-platform-asof-2026-09-30','2026年9月30日確認の公約（VA職員の回復）'],
  ['va-electronic-records-modernization@peltola-platform-asof-2026-09-30','2026年9月30日確認の公約（VA電子診療記録の近代化）'],
  ['veterans-mental-health-expansion@peltola-platform-asof-2026-09-30','2026年9月30日確認の公約（退役軍人の精神医療）'],
  ['unspecified-healthcare-cut-rollback@peltola-candidate-statement-asof-2026-09-30','2026年9月30日確認の公約（候補者声明・削減対象未特定）'],
  ['aca-enhanced-premium-credit@hr1834-house-passage-2026-01-08','2026年1月8日・下院通過版（2028年まで延長）'],
  ['aca-enhanced-premium-credit@pappas-permanent-campaign-2026-02-17','2026年2月17日・陣営発表（恒久化方針）'],
  ['end-canada-tariff-emergency@hjres72-house-passage-2026-02-11','2026年2月11日・下院通過版（H.J.Res.72）'],
  ['health-savings-account-access@sununu-statement-2026-01-20','2026年1月20日・本人発言（HSA利用拡大）'],
  ['remove-building-material-tariffs@sununu-interview-2026-08-27','2026年8月27日・取材での発言（建材関税の撤廃）'],
  ['aca-enhanced-premium-credit@cooper-restoration-campaign-2026-03-09','2026年3月9日・陣営発表（補助復活・期間未特定）'],
  ['nc-medicaid-expansion-hb76@governor-signature-2023-03-27','2023年3月27日・知事署名（NC州法HB76）'],
  ['end-farmer-cost-tariffs@cooper-platform-asof-2026-09-30','2026年9月30日確認の公約（農家の費用を押し上げる関税の終了）'],
  ['prevent-needed-care-denials@ossoff-statement-2026-09-18','2026年9月18日・本人声明（治療承認の遅延・拒否への対応）'],
  ['upfront-healthcare-price-disclosure@marshall-described-design-2026-09-23','2026年9月23日・本人発表（受診前価格の開示設計）'],
  ['patients-deserve-price-tags-consent-request@marshall-request-2026-09-23','2026年9月23日・全会一致同意要求（異議により停止）'],
  ['reciprocal-tariffs@marshall-statement-2025-02-13','2025年2月13日・本人声明（交渉手段としての相互関税）'],
  ['congressional-approval-new-tariffs@hamilton-platform-asof-2026-09-30','2026年9月30日確認の公約（新関税の議会承認）'],
  ['aca-enhanced-premium-credit@hamilton-restoration-platform-asof-2026-09-30','2026年9月30日確認の公約（補助復活・期間未特定）'],
  ['rural-hospital-support@hamilton-platform-asof-2026-09-30','2026年9月30日確認の公約（地方病院支援）'],
]);

/** Internal version IDs remain lookup keys and never become fallback display text. */
export function policyVersionLabel(policy:PolicySpec):string {
  return labels.get(`${policy.policyId}@${policy.versionId}`)??'版説明未収録';
}
