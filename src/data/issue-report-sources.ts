import type { Source } from './model';
import type { EvidenceRef } from './research-model';

export const issueReportSources: Source[] = [
  {sourceId:'issue-talarico-border',title:'Immigration & Border Security',publisher:'James Talarico for U.S. Senate',url:'https://jamestalarico.com/issue/immigration-border-security/',publishedAt:null,referencePeriod:'2026-09-14閲覧時点の候補者公約',retrievedAt:'2026-09-14',contentVerifiedAt:'2026-09-14'},
  {sourceId:'issue-peltola-energy',title:'Making Energy Affordable for Alaskans',publisher:'Mary Peltola for U.S. Senate',url:'https://marypeltola.com/energy/',publishedAt:null,referencePeriod:'2026-09-14閲覧時点の候補者公約',retrievedAt:'2026-09-14',contentVerifiedAt:'2026-09-14'},
  {sourceId:'issue-elsayed-institutions',title:'Money Out of Politics',publisher:'Abdul El-Sayed for U.S. Senate',url:'https://abdulforsenate.com/priority/money-out-of-politics/',publishedAt:null,referencePeriod:'2026-09-14閲覧時点の制度改革・外交政策公約',retrievedAt:'2026-09-14',contentVerifiedAt:'2026-09-14'},
  {sourceId:'issue-elsayed-economy',title:'Money in Your Pocket',publisher:'Abdul El-Sayed for U.S. Senate',url:'https://abdulforsenate.com/priority/money-in-your-pocket/',publishedAt:null,referencePeriod:'2026-09-14閲覧時点の候補者公約。政策効果の検証ではない',retrievedAt:'2026-09-14',contentVerifiedAt:'2026-09-14'},
];
export const issueReportEvidence: EvidenceRef[] = [
  {evidenceId:'ev-issue-talarico-border',sourceId:'issue-talarico-border',locator:'My Priorities in the U.S. Senate：執行の優先対象、合法化・合法就労、庇護審査。効果の予測は陣営の主張',checkedAt:'2026-09-14',kind:'observed'},
  {evidenceId:'ev-issue-peltola-energy',sourceId:'issue-peltola-energy',locator:'Developing Alaska Resources for Alaskans / Delivering for Rural Alaska：LNG支援、許認可、地元供給、地方電力と家計支援',checkedAt:'2026-09-14',kind:'observed'},
  {evidenceId:'ev-issue-elsayed-institutions',sourceId:'issue-elsayed-institutions',locator:'Banning Corporate Money in Politics / Abolishing the Filibuster：候補者の制度改革案',checkedAt:'2026-09-14',kind:'observed'},
  {evidenceId:'ev-issue-elsayed-economy',sourceId:'issue-elsayed-economy',locator:'Jobs and Trade：対象を絞った関税と産業投資。Housing and Homelessness：住宅政策',checkedAt:'2026-09-14',kind:'observed'},
];
