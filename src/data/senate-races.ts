import type { Candidate, Election, Rating, Source } from './model';

export interface SenateRaceDetail {
  seatId: string;
  primaryDate: string;
  contestStatus: Election['contestStatus'];
  candidates: Candidate[];
  ratingRaw: string;
  rating: Rating;
  relevance: string;
  sourceIds: string[];
}

const caucusIntent = (party: Candidate['party']): Candidate['caucusIntent'] =>
  party === 'D' ? 'Democratic' : party === 'R' ? 'Republican' : 'unconfirmed';

const candidateSlug = (value: string) => value
  .normalize('NFKD')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/^-|-$/g,'');

const candidate = (
  name: string,
  party: Candidate['party'],
  partyLabel: string,
  sourceId: string,
  ballotStage: Candidate['ballotStage'] = 'general-ballot',
  candidateId = `${sourceId}-${candidateSlug(name)}`,
): Candidate => {
  const personId = `person-${candidateSlug(name)}`;
  return {
    candidateId,
    personId,
    name,party,partyLabel,status:'confirmed',ballotStage,
    caucusIntent:caucusIntent(party),sourceIds:[sourceId,'senate-race-index'],
  };
};

const rating = (raw: string): Rating => {
  const normalized = raw.replace('Safe','Solid').replace('Tossup','Toss Up').replace(/ \(flip\)$/,'');
  return normalized as Rating;
};

const relevance = (raw: string, status: SenateRaceDetail['contestStatus']) => {
  if (status === 'primary-pending') return '予備選前です。候補者名は予備選投票用紙の掲載者で、本選候補はまだ確定していません。';
  if (status === 'primary-result-pending') return '予備選の投票日です。開票確定前のため、党候補を本選候補として扱いません。';
  if (/Tossup|Lean/.test(raw)) return '統一評価で接戦圏です。多数派シミュレーションの分岐として確認してください。';
  if (/Likely/.test(raw)) return '統一評価は優勢側を示しますが、確定結果ではありません。';
  return '統一評価では安全圏です。州全体の得票や個別候補の当選確率を示すものではありません。';
};

const race = (
  seatId: string,
  primaryDate: string,
  ratingRaw: string,
  sourceId: string,
  candidates: Candidate[],
  contestStatus: SenateRaceDetail['contestStatus'] = 'general-ballot',
): SenateRaceDetail => ({seatId,primaryDate,contestStatus,candidates,ratingRaw,rating:rating(ratingRaw),relevance:relevance(ratingRaw,contestStatus),sourceIds:[sourceId,'senate-race-index','sabato-senate-2026']});

export const senateRaceDetails: SenateRaceDetail[] = [
  race('FL-3','2026-08-18','Safe R','cand-fl',[
    candidate('Neil Gillespie','I','Independent','cand-fl'),candidate('Ashley Moody','R','Republican','cand-fl'),candidate('Angie Nixon','D','Democratic','cand-fl'),
  ]),
  race('OH-3','2026-05-05','Tossup','oh-candidate-list-2026',[
    candidate('Sherrod Brown','D','Democratic','oh-candidate-list-2026','general-ballot','cand-oh-sherrod-brown'),candidate('Jon Husted','R','Republican','oh-candidate-list-2026','general-ballot','cand-oh-jon-husted'),candidate('Greg Levy','other','Other-party candidate','oh-candidate-list-2026','general-ballot','cand-oh-greg-levy'),candidate('William B. Redpath','other','Libertarian','oh-candidate-list-2026','general-ballot','cand-oh-william-b-redpath'),candidate('Stephen Faris','other','Declared write-in','oh-candidate-list-2026','write-in','cand-oh-stephen-faris'),candidate('Anthony Holliman','other','Declared write-in','oh-candidate-list-2026','write-in','cand-oh-anthony-holliman'),candidate('Timothy Telymonde','other','Declared write-in','oh-candidate-list-2026','write-in','cand-oh-timothy-telymonde'),
  ]),
  race('AL-2','2026-05-19','Safe R','cand-al',[
    candidate('Barry Moore','R','Republican','cand-al'),candidate('Everett Wess','D','Democratic','cand-al-d'),
  ]),
  race('AK-2','2026-08-18','Tossup','ak-doe-2026-general-candidates',[
    candidate('Gerald L. Heikes','R','Republican','ak-doe-2026-general-candidates','general-ballot','cand-ak-gerald-l-heikes'),candidate('Mary Peltola','D','Democratic','ak-doe-2026-general-candidates','general-ballot','cand-ak-mary-peltola'),candidate('Dan S. Sullivan','R','Republican','ak-doe-2026-general-candidates','general-ballot','cand-ak-dan-s-sullivan'),candidate('Daniel J. Sullivan Jr.','R','Republican','ak-doe-2026-general-candidates','general-ballot','cand-ak-daniel-j-sullivan-jr'),
  ]),
  race('AR-2','2026-03-03','Safe R','cand-ar',[
    candidate('Tom Cotton','R','Republican','cand-ar'),candidate('Hallie Shoffner','D','Democratic','cand-ar'),candidate('Jeff Wadlin','other','Libertarian','cand-ar'),
  ]),
  race('CO-2','2026-06-30','Safe D','cand-co',[
    candidate('Mark Baisley','R','Republican','cand-co'),candidate('John Hickenlooper','D','Democratic','cand-co'),
  ]),
  race('DE-2','2026-09-15','Safe D','cand-de',[
    candidate('Jeff Appelhans','D','Democratic','cand-de','primary-ballot'),candidate('Chris Coons','D','Democratic','cand-de','primary-ballot'),candidate('E. No-Trump Hansen','D','Democratic','cand-de','primary-ballot'),candidate('Michael Katz','R','Republican','cand-de','primary-ballot'),candidate('Mary Louve','D','Democratic','cand-de','primary-ballot'),candidate('John Shulli','R','Republican','cand-de','primary-ballot'),
  ],'primary-pending'),
  race('GA-2','2026-05-19','Likely D','cand-ga',[
    candidate('Mike Collins','R','Republican','cand-ga'),candidate('Jon Ossoff','D','Democratic','cand-ga'),
  ]),
  race('ID-2','2026-05-19','Safe R','cand-id',[
    candidate('Todd Achilles','I','Independent','cand-id'),candidate('Natalie Fleming','I','Independent','cand-id'),candidate('Matt Loesby','other','Libertarian','cand-id'),candidate('Jim Risch','R','Republican','cand-id'),
  ]),
  race('IL-2','2026-03-17','Safe D','cand-il',[
    candidate('Juliana Stratton','D','Democratic','cand-il'),candidate('Don Tracy','R','Republican','cand-il'),
  ]),
  race('IA-2','2026-06-02','Lean R','ia-candidate-list-2026',[
    candidate('Ashley Hinson','R','Republican','ia-candidate-list-2026','general-ballot','cand-ia-ashley-hinson'),candidate('Thomas Laehn','other','Libertarian','ia-candidate-list-2026','general-ballot','cand-ia-thomas-laehn'),candidate('Josh Turek','D','Democratic','ia-candidate-list-2026','general-ballot','cand-ia-josh-turek'),
  ]),
  race('KS-2','2026-08-04','Likely R','cand-ks',[
    candidate('Adam Hamilton','D','Democratic','cand-ks'),candidate('Roger Marshall','R','Republican','cand-ks'),
  ]),
  race('KY-2','2026-05-19','Safe R','cand-ky',[
    candidate('Andy Barr','R','Republican','cand-ky'),candidate('Charles Booker','D','Democratic','cand-ky'),
  ]),
  race('LA-2','2026-05-16','Safe R','cand-la',[
    candidate('Jamie Davis','D','Democratic','cand-la'),candidate('Julia Letlow','R','Republican','cand-la'),
  ]),
  race('ME-2','2026-06-09','Tossup','me-candidate-list-2026',[
    candidate('Susan M. Collins','R','Republican','me-candidate-list-2026','general-ballot','cand-me-susan-m-collins'),candidate('Troy D. Jackson','D','Democratic','me-candidate-list-2026','general-ballot','cand-me-troy-d-jackson'),candidate('Brent Andrews','other','Declared write-in','me-writein-list-2026','write-in','cand-me-brent-andrews'),candidate('Sigrid Ann Olson','other','Declared write-in','me-writein-list-2026','write-in','cand-me-sigrid-ann-olson'),candidate('Gina Oswald','other','Declared write-in','me-writein-list-2026','write-in','cand-me-gina-oswald'),candidate('Joseph Steinberger','other','Declared write-in','me-writein-list-2026','write-in','cand-me-joseph-steinberger'),candidate('Michael Turcotte','other','Declared write-in','me-writein-list-2026','write-in','cand-me-michael-turcotte'),candidate('Ashley J. Webb','other','Declared write-in','me-writein-list-2026','write-in','cand-me-ashley-j-webb'),
  ]),
  race('MA-2','2026-09-01','Safe D','cand-ma',[
    candidate('John Deaton','R','Republican','cand-ma'),candidate('Ed Markey','D','Democratic','cand-ma'),candidate('Joe Tache','other','Party for Socialism and Liberation','cand-ma'),
  ]),
  race('MI-2','2026-08-04','Tossup','mi-candidate-list-2026',[
    candidate('Lydia Christensen','other','Libertarian','mi-candidate-list-2026','general-ballot','cand-mi-lydia-christensen'),candidate('Abdul El-Sayed','D','Democratic','mi-candidate-list-2026','general-ballot','cand-mi-abdul-el-sayed'),candidate('Tim Long','other','U.S. Taxpayers','mi-candidate-list-2026','general-ballot','cand-mi-tim-long'),candidate('Douglas P. Marsh','other','Green','mi-candidate-list-2026','general-ballot','cand-mi-douglas-p-marsh'),candidate('Mike Rogers','R','Republican','mi-candidate-list-2026','general-ballot','cand-mi-mike-rogers'),candidate('Walter P. Kristy','other','Natural Law','mi-candidate-list-2026','general-ballot','cand-mi-walter-p-kristy'),
  ]),
  race('MN-2','2026-08-11','Likely D','cand-mn',[
    candidate('Peggy Flanagan','D','DFL','cand-mn'),candidate('Michele Tafoya','R','Republican','cand-mn'),
  ]),
  race('MS-2','2026-03-10','Safe R','cand-ms',[
    candidate('Scott Colom','D','Democratic','cand-ms'),candidate('Cindy Hyde-Smith','R','Republican','cand-ms'),candidate('Ty Pinkins','I','Independent','cand-ms'),
  ]),
  race('MT-2','2026-06-02','Safe R','cand-mt',[
    candidate('Kurt Alme','R','Republican','cand-mt'),candidate('Kyle Austin','other','Libertarian','cand-mt'),candidate('Alani Bankhead','D','Democratic','cand-mt'),candidate('Seth Bodnar','I','Independent','cand-mt'),
  ]),
  race('NE-2','2026-05-12','Likely R','cand-ne',[
    candidate('Mike Marvin','other','Legal Marijuana Now','cand-ne'),candidate('Dan Osborn','I','Independent','cand-ne'),candidate('Pete Ricketts','R','Republican','cand-ne'),
  ]),
  race('NH-2','2026-09-08','Lean D','cand-nh',[
    candidate('Chris Pappas','D','Democratic','cand-nh'),candidate('John E. Sununu','R','Republican','cand-nh'),
  ]),
  race('NJ-2','2026-06-02','Safe D','cand-nj',[
    candidate('Cory Booker','D','Democratic','cand-nj'),candidate('Justin Murphy','R','Republican','cand-nj'),
  ]),
  race('NM-2','2026-06-02','Safe D','cand-nm',[
    candidate('Ben Ray Luján','D','Democratic','cand-nm'),candidate('Larry Marker','R','Republican write-in nominee','cand-nm','write-in'),
  ]),
  race('NC-2','2026-03-03','Lean D (flip)','cand-nc',[
    candidate('Shannon Bray','other','Libertarian','cand-nc'),candidate('Roy Cooper','D','Democratic','cand-nc'),candidate('Michael Whatley','R','Republican','cand-nc'),
  ]),
  race('OK-2','2026-06-16','Safe R','cand-ok',[
    candidate('Kevin Hern','R','Republican','cand-ok'),candidate('Ron Meinhardt','I','Independent','cand-ok'),candidate('Curtis Stinnett','I','Independent','cand-ok'),candidate("N'Kiyla Jasmine Thomas",'D','Democratic','cand-ok'),candidate('Sevier White','other','Libertarian','cand-ok'),
  ]),
  race('OR-2','2026-05-19','Safe D','cand-or',[
    candidate('Jeff Merkley','D','Democratic','cand-or'),candidate('David Brock Smith','R','Republican','cand-or'),
  ]),
  race('RI-2','2026-09-09','Safe D','cand-ri',[
    candidate('Michael Bahry','I','Independent','cand-ri'),candidate('Connor Burbridge','D','Democratic','cand-ri','primary-ballot'),candidate('Raymond McKay','R','Republican','cand-ri','primary-ballot'),candidate('Luis Munoz','D','Democratic','cand-ri','primary-ballot'),candidate('Jack Reed','D','Democratic','cand-ri','primary-ballot'),
  ],'primary-result-pending'),
  race('SC-2','2026-06-09','Safe R','cand-sc',[
    candidate('Annie Andrews','D','Democratic','cand-sc'),candidate('Darline Graham','R','Republican','cand-sc'),candidate('Mark Hackett','other','Constitution','cand-sc'),candidate('Kasie Whitener','other','Libertarian','cand-sc'),candidate('Catherine Fleming Bruce','D','Democratic write-in','cand-sc','write-in'),
  ]),
  race('SD-2','2026-06-02','Safe R','cand-sd',[
    candidate('Brian Bengs','I','Independent','cand-sd'),candidate('Mike Rounds','R','Republican','cand-sd'),
  ]),
  race('TN-2','2026-08-06','Safe R','cand-tn',[
    candidate('Marquita Bradshaw','D','Democratic','cand-tn'),candidate('Tharon Chandler','I','Independent','cand-tn'),candidate('Andrew Gerena','I','Independent','cand-tn'),candidate('Bill Hagerty','R','Republican','cand-tn'),candidate('Jeremy Hearn','I','Independent','cand-tn'),candidate('Robert Jones','I','Independent','cand-tn'),candidate('James Macon III','I','Independent','cand-tn'),candidate('Yoshi Matthews','I','Independent','cand-tn'),candidate('David Sutman Jr.','I','Independent','cand-tn'),candidate('Catherine Whitson','I','Independent','cand-tn'),
  ]),
  race('TX-2','2026-03-03','Tossup','tx-sos-2026-ballot-cert',[
    candidate('Ted Brown','other','Libertarian','tx-sos-2026-ballot-cert','general-ballot','cand-tx-ted-brown'),candidate('Ken Paxton','R','Republican','tx-sos-2026-ballot-cert','general-ballot','cand-tx-ken-paxton'),candidate('James Talarico','D','Democratic','tx-sos-2026-ballot-cert','general-ballot','cand-tx-james-talarico'),
  ]),
  race('VA-2','2026-08-04','Safe D','cand-va',[
    candidate('Bert Mizusawa','R','Republican','cand-va'),candidate('Mark Warner','D','Democratic','cand-va'),
  ]),
  race('WV-2','2026-05-12','Safe R','cand-wv',[
    candidate('Rachel Fetty Anderson','D','Democratic','cand-wv'),candidate('Shelley Moore Capito','R','Republican','cand-wv'),candidate('Rio Phillips','other','Write-in','cand-wv','write-in'),candidate('S. Marshall Wilson','other','Constitution','cand-wv'),
  ]),
  race('WY-2','2026-08-18','Safe R','cand-wy',[
    candidate('James W. Byrd','D','Democratic','cand-wy'),candidate('Harriet Hageman','R','Republican','cand-wy'),
  ]),
];

const officialCandidateSources: Array<[string,string,string,string]> = [
  ['fl','Candidate Listing for 2026 General Election','Florida Department of State','https://dos.elections.myflorida.com/candidates/CanList.asp'],
  ['oh','2026 statewide candidate list','Ohio Secretary of State','https://www.ohiosos.gov/media-center/press-releases/2026/2026-02-04/'],
  ['al','2026 qualified candidates','Alabama political parties','https://algop.org/qualified-2026-republican-candidates/'],
  ['al-d','2026 qualified Democratic candidates','Alabama Democratic Party','https://aldemocrats.org/2026-qualified-candidates'],
  ['ak','2026 General Election candidates','Alaska Division of Elections','https://www.elections.alaska.gov/candidates/?election=26genr'],
  ['ar','2026 candidates','Arkansas Secretary of State','https://candidates.arkansas.gov/'],
  ['co','2026 candidate list','Colorado Secretary of State','https://www.sos.state.co.us/pubs/elections/vote/primaryCandidates.html'],
  ['de','Filed candidates by office','Delaware Department of Elections','https://elections.delaware.gov/candidates/candidatelist/prim_fcddt_2026.shtml'],
  ['ga','Qualifying candidate information','Georgia Secretary of State','https://mvp.sos.ga.gov/s/qualifying-candidate-information'],
  ['id','Search filed candidates','Idaho Secretary of State','https://run.voteidaho.gov/search'],
  ['il','Candidate filing search','Illinois State Board of Elections','https://www.elections.il.gov/ElectionOperations/CandidateFilingSearch.aspx'],
  ['ia','2026 primary election candidate list','Iowa Secretary of State','https://sos.iowa.gov/primary-election'],
  ['ks','Candidates for the 2026 primary','Kansas Secretary of State','https://www.sos.ks.gov/elections/elections_upcoming_candidate.aspx'],
  ['ky','Candidate filings','Kentucky Secretary of State','https://web.sos.ky.gov/CandidateFilings/default.aspx?elecid=86&id=3'],
  ['la','Candidate inquiry','Louisiana Secretary of State','https://voterportal.sos.la.gov/candidateinquiry'],
  ['me','2026 primary candidate list','Maine Secretary of State','https://www.maine.gov/sos/elections-voting/upcoming-elections'],
  ['ma','2026 Senate ballot candidates','Massachusetts Secretary of the Commonwealth','https://www.sec.state.ma.us/divisions/elections/elections-and-voting.htm'],
  ['mi','2026 general election candidate listing','Michigan Department of State','https://mi-boe.entellitrak.com/etk-mi-boe-prod/page.request.do?page=page.miboePublicReport&electionType=GEN&electionYear=2026'],
  ['mn','Candidate filings','Minnesota Secretary of State','https://candidates.sos.mn.gov/CandidateFilingResults.aspx'],
  ['ms','2026 candidate qualifying list','Mississippi Secretary of State','https://www.sos.ms.gov/elections-voting/candidate-referenda-information'],
  ['mt','Federal primary 2026','Montana Secretary of State','https://candidatefiling.mt.gov/candidatefiling/CandidateList.aspx?e=450002928'],
  ['ne','2026 elections','Nebraska Secretary of State','https://sos.nebraska.gov/elections'],
  ['nh','2026 state primary results','New Hampshire Secretary of State','https://www.sos.nh.gov/elections/elections/2026-election-information'],
  ['nj','2026 election information','New Jersey Secretary of State','https://www.nj.gov/state/elections/election-information-2026.shtml'],
  ['nm','2026 candidate list','New Mexico Secretary of State','https://candidateportal.servis.sos.state.nm.us/CandidateList.aspx?eid=2911&cty=99'],
  ['nc','Candidate lists','North Carolina State Board of Elections','https://www.ncsbe.gov/results-data/candidate-lists'],
  ['ok','Candidate filing','Oklahoma State Election Board','https://filings.okelections.gov/ViewCandidates/2026040120260403/99/all'],
  ['or','Candidate search','Oregon Secretary of State','https://secure.sos.state.or.us/orestar/CFSearchPage.do'],
  ['ri','Candidates in upcoming elections','Rhode Island Department of State','https://vote.sos.ri.gov/Candidates/CandidateSearch'],
  ['sc','Candidate listing','South Carolina Election Commission','https://vrems.scvotes.sc.gov/Candidate/CandidateSearch?electionId=22598'],
  ['sd','2026 candidate list','South Dakota Secretary of State','https://vip.sdsos.gov/candidatelist.aspx?eid=773'],
  ['tn','2026 candidate lists','Tennessee Secretary of State','https://sos.tn.gov/elections/2026-candidate-lists'],
  ['tx','2026 General Election ballot certification','Texas Secretary of State','https://www.sos.state.tx.us/elections/forms/2026-ballot-cert.pdf'],
  ['va','2026 primary election candidates','Virginia Department of Elections','https://www.elections.virginia.gov/casting-a-ballot/candidate-list/'],
  ['wv','Candidates listing by office','West Virginia Secretary of State','https://candidates.wvsos.gov/'],
  ['wy','2026 election information','Wyoming Secretary of State','https://sos.wyo.gov/elections/'],
];

export const senateRaceSources: Source[] = [
  ...officialCandidateSources.map(([abbr,title,publisher,url]) => ({sourceId:`cand-${abbr}`,title,publisher,url,publishedAt:null,referencePeriod:'2026年連邦上院候補者・投票用紙掲載状況',retrievedAt:'2026-09-09',contentVerifiedAt:'2026-09-09'})),
  {sourceId:'senate-race-index',title:'2026 United States Senate elections — race summary',publisher:'Wikipedia contributors',url:'https://en.wikipedia.org/wiki/2026_United_States_Senate_elections',publishedAt:null,updatedAt:'2026-09-09',referencePeriod:'各州選挙当局の候補者一覧を横断照合するための二次資料',retrievedAt:'2026-09-09',contentVerifiedAt:'2026-09-09'},
  {sourceId:'sabato-senate-2026',title:"2026 Senate ratings",publisher:"Sabato's Crystal Ball, University of Virginia Center for Politics",url:'https://centerforpolitics.org/crystalball/2026-senate/',publishedAt:null,updatedAt:'2026-08-26',referencePeriod:'全35選挙の統一情勢評価。Safeは表示上Solidへ正規化',retrievedAt:'2026-09-09',contentVerifiedAt:'2026-09-09'},
];
