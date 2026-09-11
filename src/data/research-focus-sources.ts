import type { Source } from './model';
import type { EvidenceRef } from './research-model';

const checked = '2026-09-11';

export const focusResearchSources: Source[] = [
  {sourceId:'ak-doe-2026-general-candidates',title:'2026 General Election Candidates',publisher:'Alaska Division of Elections',url:'https://www.elections.alaska.gov/candidates/?election=26genr',publishedAt:null,updatedAt:'2026-09-02',referencePeriod:'2026年連邦上院本選の認証済み4候補',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'tx-sos-2026-ballot-cert',title:'2026 General Election Ballot Certification',publisher:'Texas Secretary of State',url:'https://www.sos.state.tx.us/elections/forms/2026-ballot-cert.pdf',publishedAt:'2026-08-28',referencePeriod:'2026年連邦上院本選の認証済み3候補',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'cook-ak-race-2026',title:'Alaska Senate Race 2026',publisher:'The Cook Political Report',url:'https://www.cookpolitical.com/senate/race/488531',publishedAt:null,updatedAt:'2026-07-01',referencePeriod:'アラスカ州上院選の現行評価と変更履歴',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'inside-ak-race-2026',title:'Alaska Senate II — 2026',publisher:'Inside Elections',url:'https://insideelections.com/election-year/2026/?office=ii&state-district=ak',publishedAt:null,updatedAt:'2026-09-03',referencePeriod:'アラスカ州上院選の評価と変更履歴',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'cook-tx-race-2026',title:'Texas Senate Race 2026',publisher:'The Cook Political Report',url:'https://www.cookpolitical.com/senate/race/488686',publishedAt:null,updatedAt:'2026-08-20',referencePeriod:'テキサス州上院選の現行評価と変更履歴',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'inside-tx-race-2026',title:'Texas Senate II — 2026',publisher:'Inside Elections',url:'https://insideelections.com/election-year/2026/?office=ii&state-district=tx',publishedAt:null,updatedAt:'2026-08-06',referencePeriod:'テキサス州上院選の評価と変更履歴',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'poll-asr-ak-march-2026',title:'Alaska U.S. Senate Tracking Survey — March 2026',publisher:'Alaska Survey Research',url:'https://alaskasurveyresearch.com/wp-content/uploads/Memo-Senate-March.pdf',publishedAt:null,referencePeriod:'2026-03-19〜03-22の順位選択投票調査',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'poll-dfp-ak-august-2026',title:'As Alaska’s Affordability Crisis Deepens, Peltola Leads in Senate Race',publisher:'Data for Progress',url:'https://www.dataforprogress.org/blog/2026/8/17/as-alaskas-affordability-crisis-deepens-peltola-leads-in-senate-race',publishedAt:'2026-08-17',referencePeriod:'2026-07-28〜08-04のアラスカ州投票予定者調査',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'poll-asr-ak-august-2026',title:'August 2026 Alaska U.S. Senate Poll Result',publisher:'Alaska Survey Research',url:'https://x.com/The_Real_ASR/status/2095186398882287632',publishedAt:null,referencePeriod:'2026-08-20〜08-23調査の最終RCVラウンド',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'poll-aarp-tx-september-2026',title:'2026 Midterm Election Survey — Texas',publisher:'AARP Research',url:'https://www.aarp.org/content/dam/aarp/research/topics/voter-opinion-research/politics/2026-midterm-election-survey-texas.doi.10.26419-2fres.01065.028.pdf',publishedAt:'2026-09-10',referencePeriod:'2026-08-30〜09-01のテキサス州投票予定者調査',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'poll-emerson-tx-august-2026',title:'Texas 2026 Poll: Paxton and Talarico',publisher:'Emerson College Polling',url:'https://emersoncollegepolling.com/texas-2026-poll-paxton-and-talarico/',publishedAt:null,referencePeriod:'2026-08-09〜08-10のテキサス州投票予定者調査',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'poll-overton-tx-august-2026',title:'September 2026 Texas Poll',publisher:'Overton Insights',url:'https://overtoninsights.com/poll/september-2026/',publishedAt:null,referencePeriod:'2026-08-24〜08-26のテキサス州投票予定者調査',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'candidate-peltola-campaign-2026',title:'Priorities',publisher:'Mary Peltola for U.S. Senate',url:'https://marypeltola.com/',publishedAt:null,referencePeriod:'2026-09-11閲覧時点の選挙運動政策',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'candidate-peltola-statement-2026',title:'Official Election Pamphlet Candidate Statement — Mary Peltola',publisher:'Alaska Division of Elections',url:'https://elections.alaska.gov/doc/oep/2026/PELTOLA%2CMARY_US%20Sen_Eng_v1.pdf',publishedAt:null,referencePeriod:'2026年本選候補者公式声明',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'candidate-dan-s-sullivan-campaign-2026',title:'Dan Sullivan for Alaska',publisher:'Dan Sullivan for U.S. Senate',url:'https://dansullivanforalaska.com/',publishedAt:null,referencePeriod:'2026-09-11閲覧時点の選挙運動政策',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'candidate-dan-s-sullivan-statement-2026',title:'Official Election Pamphlet Candidate Statement — Dan S. Sullivan',publisher:'Alaska Division of Elections',url:'https://elections.alaska.gov/doc/oep/2026/SULLIVAN%2C%20DAN%20S_US%20Sen_Eng_v2.pdf',publishedAt:null,referencePeriod:'2026年本選候補者公式声明',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'candidate-daniel-j-sullivan-jr-2026',title:'Daniel J. Sullivan Jr. for U.S. Senate',publisher:'Daniel J. Sullivan Jr. campaign',url:'https://www.sullivanforsenate.com/',publishedAt:null,referencePeriod:'2026-09-11閲覧時点の候補者経歴・方針',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'candidate-talarico-issues-2026',title:'Issues',publisher:'James Talarico for U.S. Senate',url:'https://jamestalarico.com/issues/',publishedAt:null,referencePeriod:'2026-09-11閲覧時点の選挙運動政策',retrievedAt:checked,contentVerifiedAt:checked},
  {sourceId:'candidate-paxton-issues-2026',title:'Issues',publisher:'Ken Paxton for U.S. Senate',url:'https://www.kenpaxton.com/issues',publishedAt:null,referencePeriod:'2026-09-11閲覧時点の選挙運動政策',retrievedAt:checked,contentVerifiedAt:checked},
];

export const focusEvidenceRefs: EvidenceRef[] = [
  {evidenceId:'ev-ak-official-general-candidates-2026',sourceId:'ak-doe-2026-general-candidates',locator:'Certified U.S. Senate candidates：4候補の公式名・登録・現職表示',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-ak-sullivan-identity-2026',sourceId:'ak-doe-2026-general-candidates',locator:'Dan S. SullivanはIncumbent、Daniel J. Sullivan Jr.は別人の非現職候補',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-tx-official-general-candidates-2026',sourceId:'tx-sos-2026-ballot-cert',locator:'U.S. Senator欄：Paxton、Talarico、Ted Brown',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-ak-cook-rating-path-2026',sourceId:'cook-ak-race-2026',locator:'2026-01-12 Lean R、2026-07-01 Toss Up',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-ak-inside-rating-path-2026',sourceId:'inside-ak-race-2026',locator:'2025-01-09 Solid R、2026-01-12 Lean R、2026-09-03 Tilt R',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-ak-inside-tilt-direction-2026',sourceId:'inside-ak-race-2026',locator:'同一機関内のLean R→Tilt RはToss-upへ近づく変更',checkedAt:checked,kind:'interpretation'},
  {evidenceId:'ev-tx-cook-rating-path-2026',sourceId:'cook-tx-race-2026',locator:'2025-07-17 Likely R、2026-05-26 Lean R、2026-08-20 Toss Up',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-tx-inside-rating-path-2026',sourceId:'inside-tx-race-2026',locator:'2025-07-24 Likely R、2026-08-06 Lean R',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-tx-aarp-topline-2026-09',sourceId:'poll-aarp-tx-september-2026',locator:'ballot test：Talarico 48、Paxton 44、Undecided 8',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-tx-aarp-method-2026-09',sourceId:'poll-aarp-tx-september-2026',locator:'LV n=895、2026-08-30〜09-01、phone＋SMS-to-web、±3.3',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-tx-emerson-topline-2026-08',sourceId:'poll-emerson-tx-august-2026',locator:'full results：Paxton 47.2、Talarico 46.2、Someone else 2.0、Undecided 4.5',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-tx-emerson-method-2026-08',sourceId:'poll-emerson-tx-august-2026',locator:'LV n=1,000、2026-08-09〜08-10、MMS-to-web＋panel、credibility interval ±3.0',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-tx-overton-base-2026-08',sourceId:'poll-overton-tx-august-2026',locator:'初回ballot test：Talarico 44.0、Paxton 43.4、Undecided 12.6',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-tx-overton-leaners-2026-08',sourceId:'poll-overton-tx-august-2026',locator:'未定者追質問と累積値：Paxton 50.0、Talarico 50.0',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-tx-overton-method-2026-08',sourceId:'poll-overton-tx-august-2026',locator:'LV n=1,167、2026-08-24〜08-26、MMS-to-web、±2.9',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-ak-asr-march-rcv-2026',sourceId:'poll-asr-ak-march-2026',locator:'Round 1・Round 2と比較用head-to-headの各値',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-ak-asr-march-method-2026',sourceId:'poll-asr-ak-march-2026',locator:'一般選挙設問n=1,340 general voters、text-to-online＋panel、±2.5〜3.0',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-ak-dfp-rcv-2026-08',sourceId:'poll-dfp-ak-august-2026',locator:'4候補Round 1、simulated final、exhaustion感度',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-ak-dfp-method-2026-08',sourceId:'poll-dfp-ak-august-2026',locator:'LV n=605、2026-07-28〜08-04、SMS＋web panel、±4',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-ak-asr-final-round-2026-08',sourceId:'poll-asr-ak-august-2026',locator:'最終RCVラウンドsubset n=1,495：Peltola 50.6、現職Sullivan 49.4',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-ak-candidate-positions-peltola-2026',sourceId:'candidate-peltola-campaign-2026',locator:'生活費、医療、住宅、漁業、エネルギー、地方サービス等の重点',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-ak-candidate-positions-dan-s-sullivan-2026',sourceId:'candidate-dan-s-sullivan-campaign-2026',locator:'資源開発、減税、防衛、国境、医療、漁業等の重点',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-ak-candidate-profile-daniel-j-sullivan-jr-2026',sourceId:'candidate-daniel-j-sullivan-jr-2026',locator:'Alaska-first、独立性、説明責任と経歴',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-tx-candidate-positions-talarico-2026',sourceId:'candidate-talarico-issues-2026',locator:'生活費、医療、移民、関税等の候補者方針',checkedAt:checked,kind:'observed'},
  {evidenceId:'ev-tx-candidate-positions-paxton-2026',sourceId:'candidate-paxton-issues-2026',locator:'減税、国境、エネルギー、銃、中絶、外交等の候補者方針',checkedAt:checked,kind:'observed'},
];
