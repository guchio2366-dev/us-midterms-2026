/** Private prototype contracts. A stance is evidence, never a future vote forecast. */
export type PolicyThemeId = 'healthcare' | 'tariffs';
export interface PolicyRef { policyId:string; versionId:string }
export interface PolicySpec extends PolicyRef {
  themeId:PolicyThemeId;
  issueIds:string[];
  title:string;
  definition:string;
  kind:'historical-measure'|'described-design'|'campaign-proposal';
  scopeDate:string|null;
  specification:'partial'|'identified-measure';
  sourceIds:string[];
  evidenceIds:string[];
  routes:('ordinary-law'|'reconciliation'|'oversight')[];
  unknowns:string[];
}
export interface PolicyAction {
  actionId:string;
  kind:'stated-priority'|'introduced'|'cosponsored'|'vote'|'statement'|'requested-action';
  actionDate:string|null;
  datePrecision:'day'|'unknown';
  checkedAt:string;
  scope:'exact-policy'|'whole-measure'|'topic-only';
  vote:'yea'|'nay'|null;
  text:string;
  sourceIds:string[];
  evidenceIds:string[];
  locator:string;
  targetPolicyRef?:PolicyRef;
}
export interface CandidatePolicyRecord extends PolicyRef {
  recordId:string;
  candidateId:string;
  electionId:string;
  stance:'support'|'conditional'|'oppose'|'unknown';
  stancePeriod:'historical'|'campaign-as-of'|'unknown';
  stanceAsOf:string|null;
  checkedAt:string;
  stanceEvidenceIds:string[];
  conditions:string[];
  unknowns:string[];
  actions:PolicyAction[];
  /** null means unknown, not indifference. */
  explicitlyPrioritized:boolean|null;
}
export interface PolicyContextLink {
  linkId:string;
  themeId:PolicyThemeId;
  policyRefs:PolicyRef[];
  scope:'national'|'cross-state'|'state';
  feedRefs:{kind:'news'|'observation-update'|'roll-call'|'candidate-platform';id:string}[];
  issueIds:string[];
  electionLinks:{electionId:string;candidateIds:string[];relation:'direct'|'comparison-context'}[];
  eventDate:string|null;
  publishedAt:string|null;
  checkedAt:string;
  sourceIds:string[];
  evidenceIds:string[];
  title:string;
  description:string;
  unknowns:string[];
}
export interface PublicAssumption {
  assumptionId:string;
  themeId:PolicyThemeId;
  label:string;
  description:string;
  kind:'user-hypothesis';
  electionIds:string[];
  policyRefs:PolicyRef[];
  contextLinkIds:string[];
  evidenceIds:string[];
  unknowns:string[];
}
export interface PublicRaceFactor {
  factorId:string;
  themeId:PolicyThemeId;
  electionId:string;
  candidateIds:string[];
  kind:'candidate-record'|'candidate-position'|'state-context'|'uncertainty';
  label:string;
  description:string;
  evidenceIds:string[];
  unknowns:string[];
}
export interface PolicyPrototypeData {
  prototypeVersion:1;
  builtAt:string;
  focusElectionIds:string[];
  themes:{themeId:PolicyThemeId;label:string;issueIds:string[]}[];
  policies:PolicySpec[];
  contextLinks:PolicyContextLink[];
  assumptions:PublicAssumption[];
  factors:PublicRaceFactor[];
  candidateRecords:CandidatePolicyRecord[];
  additionalEvidence:{evidenceId:string;sourceId:string;locator:string;checkedAt:string;kind:'observed'}[];
  sourceReviews:{sourceId:string;checkedAt:string;scope:string}[];
}
