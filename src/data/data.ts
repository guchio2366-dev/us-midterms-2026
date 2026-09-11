import type { Election, EventItem, Profile, Seat, Source, State, VicePresident } from './model';
import { civicSources } from './civics';
import { contextSources, soybeanTrade, stateContexts } from './state-context';
import { houseSources } from './house';
import { senateRaceDetails, senateRaceSources } from './senate-races';
import { researchSources } from './research-sources';
import { ROSTER_SOURCE_UPDATED_AT, ROSTER_VERIFIED_AT, verifiedRoster } from './verified-roster';

type StateSeed = [fips:string, abbr:string, nameJa:string, nameEn:string, classes:[1|2|3,1|2|3]];

// Geography is separate from the dated, reviewed membership snapshot.
const stateSeeds: StateSeed[] = [
  ["01","AL","アラバマ","Alabama",[2,3]],
  ["02","AK","アラスカ","Alaska",[2,3]],
  ["04","AZ","アリゾナ","Arizona",[1,3]],
  ["05","AR","アーカンソー","Arkansas",[2,3]],
  ["06","CA","カリフォルニア","California",[1,3]],
  ["08","CO","コロラド","Colorado",[2,3]],
  ["09","CT","コネティカット","Connecticut",[1,3]],
  ["10","DE","デラウェア","Delaware",[1,2]],
  ["12","FL","フロリダ","Florida",[1,3]],
  ["13","GA","ジョージア","Georgia",[2,3]],
  ["15","HI","ハワイ","Hawaii",[1,3]],
  ["16","ID","アイダホ","Idaho",[2,3]],
  ["17","IL","イリノイ","Illinois",[2,3]],
  ["18","IN","インディアナ","Indiana",[1,3]],
  ["19","IA","アイオワ","Iowa",[2,3]],
  ["20","KS","カンザス","Kansas",[2,3]],
  ["21","KY","ケンタッキー","Kentucky",[2,3]],
  ["22","LA","ルイジアナ","Louisiana",[2,3]],
  ["23","ME","メーン","Maine",[1,2]],
  ["24","MD","メリーランド","Maryland",[1,3]],
  ["25","MA","マサチューセッツ","Massachusetts",[1,2]],
  ["26","MI","ミシガン","Michigan",[1,2]],
  ["27","MN","ミネソタ","Minnesota",[1,2]],
  ["28","MS","ミシシッピ","Mississippi",[1,2]],
  ["29","MO","ミズーリ","Missouri",[1,3]],
  ["30","MT","モンタナ","Montana",[1,2]],
  ["31","NE","ネブラスカ","Nebraska",[1,2]],
  ["32","NV","ネバダ","Nevada",[1,3]],
  ["33","NH","ニューハンプシャー","New Hampshire",[2,3]],
  ["34","NJ","ニュージャージー","New Jersey",[1,2]],
  ["35","NM","ニューメキシコ","New Mexico",[1,2]],
  ["36","NY","ニューヨーク","New York",[1,3]],
  ["37","NC","ノースカロライナ","North Carolina",[2,3]],
  ["38","ND","ノースダコタ","North Dakota",[1,3]],
  ["39","OH","オハイオ","Ohio",[1,3]],
  ["40","OK","オクラホマ","Oklahoma",[2,3]],
  ["41","OR","オレゴン","Oregon",[2,3]],
  ["42","PA","ペンシルベニア","Pennsylvania",[1,3]],
  ["44","RI","ロードアイランド","Rhode Island",[1,2]],
  ["45","SC","サウスカロライナ","South Carolina",[2,3]],
  ["46","SD","サウスダコタ","South Dakota",[2,3]],
  ["47","TN","テネシー","Tennessee",[1,2]],
  ["48","TX","テキサス","Texas",[1,2]],
  ["49","UT","ユタ","Utah",[1,3]],
  ["50","VT","バーモント","Vermont",[1,3]],
  ["51","VA","バージニア","Virginia",[1,2]],
  ["53","WA","ワシントン","Washington",[1,3]],
  ["54","WV","ウェストバージニア","West Virginia",[1,2]],
  ["55","WI","ウィスコンシン","Wisconsin",[1,3]],
  ["56","WY","ワイオミング","Wyoming",[1,2]],
];

const termByClass: Record<1|2|3, [string,string]> = {
  1: ['2025-01-03','2031-01-03'],
  2: ['2021-01-03','2027-01-03'],
  3: ['2023-01-03','2029-01-03'],
};

export const states: State[] = stateSeeds.map(([fips,abbr,nameJa,nameEn,classes]) => ({
  fips, abbr, nameJa, nameEn, classes,
}));

const rosterBySeat = new Map(verifiedRoster.map(member => [member.seatId,member]));
const raceBySeat = new Map(senateRaceDetails.map(race => [race.seatId,race]));
export const seats: Seat[] = states.flatMap(state => state.classes.map(senateClass => {
  const seatId = `${state.abbr}-${senateClass}`;
  const member = rosterBySeat.get(seatId);
  if (!member) throw new Error(`Reviewed roster is missing ${seatId}`);
  const classSource = `senate-class-${senateClass}`;
  const attributeSourceIds: Seat['attributeSourceIds'] = {
    incumbent: ['senate-members','senate-members-xml'],
    party: ['senate-members','senate-members-xml'],
    caucus: [member.caucusSourceId],
    vacant: ['senate-members'],
    senateClass: [classSource,'senate-members-xml'],
    termStart: [classSource],
    termEnd: [classSource],
  };
  return {
    seatId, stateFips:state.fips, senateClass,
    incumbent:member.incumbent, party:member.party, caucus:member.caucus, vacant:false,
    // These are the seat's six-year cycle dates, not the incumbent's personal tenure.
    termStart:termByClass[senateClass][0], termEnd:termByClass[senateClass][1],
    verificationStatus:'confirmed', verifiedAt:ROSTER_VERIFIED_AT,
    attributeSourceIds, sourceIds:[...new Set(Object.values(attributeSourceIds).flat())],
  };
}));

const electionBase = (seat: Seat, type: Election['type'], attributeSourceIds: Election['attributeSourceIds'], termStartRule: string|null = null): Election => {
  const race = raceBySeat.get(seat.seatId);
  if (!race) throw new Error(`Reviewed race data is missing ${seat.seatId}`);
  return ({
  electionId: `2026-${seat.seatId}-${type}`,
  seatId: seat.seatId,
  year: 2026,
  date: '2026-11-03',
  type,
  termStart: type === 'regular' ? '2027-01-03' : null,
  termStartLabel: type === 'regular' ? '2027-01-03' : '当選者の就任時（就任日未定）',
  termStartStatus: type === 'regular' ? 'scheduled' : 'pending-inauguration',
  termStartRule,
  termEnd: type === 'regular' ? '2033-01-03' : '2029-01-03',
  congressAsOf: '2027-01-03',
  primaryDate: race.primaryDate,
  contestStatus: race.contestStatus,
  candidates: race.candidates,
  candidateResearchStatus: race.contestStatus === 'general-ballot' ? 'complete' : 'partial',
  rating: {raw:race.ratingRaw,category:race.rating,organization:"Sabato's Crystal Ball",ratedAt:'2026-08-26',retrievedAt:'2026-09-09',sourceIds:['sabato-senate-2026']},
  electionRelevance: race.relevance,
  // Verification covers election type, date, seat and term rules, not candidates or ratings.
  verificationStatus: 'confirmed',
  verifiedAt: '2026-09-09',
  attributeSourceIds,
  sourceIds: [...new Set([...Object.values(attributeSourceIds).flat(),...race.sourceIds,...race.candidates.flatMap(candidate => candidate.sourceIds)])],
  });
};

const regularElections = seats.filter(seat => seat.senateClass === 2).map(seat => electionBase(seat,'regular',{
  seatId:['senate-class-2'], type:['senate-class-2'], date:['federal-election-date'],
  termStart:['senate-class-2','senate-constitution'], termEnd:['senate-class-2','senate-constitution'],
}));
const specialSeatIds = ['FL-3','OH-3'];
const specialElections = specialSeatIds.map(seatId => {
  const seat = seats.find(item => item.seatId === seatId);
  if (!seat) throw new Error(`Missing special-election seat: ${seatId}`);
  if (seatId === 'FL-3') return electionBase(seat,'special',{
    seatId:['fl-offices-2026','fl-ballot-2026','senate-class-3','fl-vacancy-law'],
    type:['fl-offices-2026','fl-vacancy-law'], date:['fl-election-dates'],
    termStart:['fl-vacancy-law'], termEnd:['senate-class-3'],
  },'州法は次の一般選挙で欠員を補充し、それまでの暫定任命を認めています。当選者の具体的な就任日は確定後に更新します。');
  return electionBase(seat,'special',{
    seatId:['oh-election-schedule','senate-class-3'], type:['oh-election-schedule','oh-vacancy-law'],
    date:['oh-election-schedule'], termStart:['oh-vacancy-law'], termEnd:['oh-election-schedule','senate-class-3'],
  },'州法上、暫定任命の在職期限は対象選挙後の12月15日です。当選者の具体的な宣誓・就任日は未定であり、通常選挙の任期開始日とは区別します。');
});
export const elections: Election[] = [...regularElections,...specialElections];

export const vicePresident: VicePresident = {
  name: 'JD Vance',
  party: 'R',
  asOf: '2026-09-09',
  verificationStatus: 'confirmed',
  verifiedAt: '2026-09-09',
  attributeSourceIds: {name:['white-house-vance'],party:['white-house-vance']},
  sourceIds: ['white-house-vance','senate-vice-president'],
};

// Only sources whose relevant contents were actually read in this verification pass use checked().
const checked = (source: Omit<Source,'retrievedAt'|'contentVerifiedAt'>): Source => ({
  ...source, retrievedAt:'2026-09-09', contentVerifiedAt:'2026-09-09',
});
export const sources: Source[] = [
  checked({sourceId:'senate-members',title:'U.S. Senators — current roster',publisher:'U.S. Senate',url:'https://www.senate.gov/senators/',publishedAt:null,referencePeriod:'2026-09-09閲覧時点の100人・党籍・州・空席照合'}),
  checked({sourceId:'senate-members-xml',title:'Senators contact information — XML roster',publisher:'U.S. Senate',url:'https://www.senate.gov/general/contact_information/senators_cfm.xml',publishedAt:null,updatedAt:ROSTER_SOURCE_UPDATED_AT,referencePeriod:'現職の原表記・Bioguide ID・党籍・州・Class。HTML名簿と照合'}),
  ...([1,2,3] as const).map(senateClass => checked({sourceId:`senate-class-${senateClass}`,title:`Class ${['I','II','III'][senateClass-1]} — Senators and terms`,publisher:'U.S. Senate',url:`https://www.senate.gov/senators/Class_${['I','II','III'][senateClass-1]}.htm`,publishedAt:null,referencePeriod:`Class ${senateClass}の議席一覧と6年任期 ${termByClass[senateClass].join('〜')}`})),
  checked({sourceId:'democratic-caucus',title:'Our Caucus — Senate Democrats',publisher:'Senate Democratic Caucus',url:'https://www.democrats.senate.gov/about-senate-dems/our-caucus',publishedAt:null,referencePeriod:'2026-09-09閲覧時点の47人。King・Sandersの会派所属も個別照合'}),
  checked({sourceId:'republican-conference',title:'Senate Republicans — member directory',publisher:'Senate Republican Conference',url:'https://www.republican.senate.gov/',publishedAt:null,referencePeriod:'2026-09-09閲覧時点の53人の会派所属。ページ内の議員一覧を参照'}),
  checked({sourceId:'senate-party-division',title:'Party Division — 119th Congress',publisher:'U.S. Senate',url:'https://www.senate.gov/history/partydiv.htm',publishedAt:null,referencePeriod:'119th Congressの党籍合計 R53・D45・I2。個人の会派判定には使用しない'}),
  checked({sourceId:'senate-constitution',title:'U.S. Constitution — Amendments XVII and XX',publisher:'U.S. Senate',url:'https://www.senate.gov/about/origins-foundations/senate-and-constitution/constitution.htm',publishedAt:null,referencePeriod:'上院の6年任期と通常任期が1月3日正午に交代する規定'}),
  checked({sourceId:'senate-vice-president',title:'Vice President of the United States',publisher:'U.S. Senate',url:'https://www.senate.gov/about/officers-staff/vice-president.htm',publishedAt:null,referencePeriod:'上院で賛否同数の場合の副大統領決裁票'}),
  checked({sourceId:'white-house-vance',title:'Vice President JD Vance',publisher:'The White House',url:'https://www.whitehouse.gov/administration/jd-vance/',publishedAt:null,referencePeriod:'2026-09-09閲覧時点の現副大統領・共和党所属。将来の在職は別途仮定'}),
  checked({sourceId:'federal-election-date',title:'2026 Congressional Primary Dates and Candidate Filing Deadlines',publisher:'Federal Election Commission',url:'https://www.fec.gov/resources/cms-content/documents/2026pdates.pdf',publishedAt:null,updatedAt:'2026-05-18',referencePeriod:'2026年連邦一般選挙日 11月3日。予備選日程の更新判定には使用しない'}),
  checked({sourceId:'fl-election-dates',title:'Election Dates — 2026',publisher:'Florida Department of State, Division of Elections',url:'https://dos.fl.gov/elections/for-voters/election-dates/',publishedAt:null,referencePeriod:'2026年一般選挙日 11月3日'}),
  checked({sourceId:'fl-offices-2026',title:'Offices Up for Election and Retention in 2026',publisher:'Florida Department of State, Division of Elections',url:'https://dos.fl.gov/elections/candidates-committees/offices-up-for-election/',publishedAt:null,updatedAt:'2025-04-14',referencePeriod:'2026年に連邦上院1議席が選挙対象。Class一覧・補充規定と併用'}),
  checked({sourceId:'fl-ballot-2026',title:'Official General Election Ballot — November 3, 2026',publisher:'Miami-Dade County Elections',url:'https://www.miamidade.gov/elections/library/2026-11-03-general-election-master-ballot.pdf',publishedAt:null,referencePeriod:'p.1の連邦上院選挙。Moodyの現職議席・Class IIIとの対応照合に使用'}),
  checked({sourceId:'fl-vacancy-law',title:'Florida Statutes 100.161 — Senate vacancies',publisher:'Florida Legislature',url:'https://www.flsenate.gov/Laws/Statutes/2026/100.161',publishedAt:null,referencePeriod:'2026年版。次回一般選挙での補充と暫定任命の規定'}),
  checked({sourceId:'oh-election-schedule',title:'2026 Election Schedule with Candidate Requirements',publisher:'Franklin County Board of Elections, Ohio',url:'https://vote.franklincountyohio.gov/getmedia/5a24ba93-6eaa-4cfe-ad8c-77c5aed0e496/2026-Election-Schedule-with-Candidate-Requirements-6',publishedAt:null,updatedAt:'2026-05-28',referencePeriod:'p.1：一般選挙11月3日、Hustedの連邦上院残任期は2029年1月3日まで'}),
  checked({sourceId:'oh-vacancy-law',title:'Ohio Revised Code 3521.02 — Senate vacancies',publisher:'Ohio Laws',url:'https://codes.ohio.gov/ohio-revised-code/section-3521.02',publishedAt:null,referencePeriod:'1995-08-22施行の現行規定。特別選挙と暫定任命の12月15日期限'}),
  ...senateRaceSources,
  ...researchSources,
  ...civicSources,
  ...contextSources,
  ...houseSources,
  {sourceId:'census-profile',title:'Data Profiles | American Community Survey',publisher:'U.S. Census Bureau',url:'https://www.census.gov/acs/www/data/data-tables-and-tools/data-profiles/',publishedAt:null,referencePeriod:'州別人口・社会属性',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'bls-qcew',title:'Quarterly Census of Employment and Wages',publisher:'U.S. Bureau of Labor Statistics',url:'https://www.bls.gov/cew/',publishedAt:null,referencePeriod:'州別産業雇用・賃金',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'bea-state',title:'GDP by State',publisher:'U.S. Bureau of Economic Analysis',url:'https://www.bea.gov/data/gdp/gdp-state',publishedAt:null,referencePeriod:'州別・産業別GDP',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'atlas',title:'us-atlas states-10m',publisher:'TopoJSON',url:'https://github.com/topojson/us-atlas',publishedAt:'2021-06-05',referencePeriod:'2020 Census cartographic boundary files',retrievedAt:null,contentVerifiedAt:null},
];

const contextByFips = new Map(stateContexts.map(context => [context.stateFips,context]));
const stateEventIds = (state: State) => {
  const context = contextByFips.get(state.fips)!;
  const ids = [`population-${state.fips}`,`presidential-${state.fips}`];
  if (electionByStateData(state).length) ids.push(`senate-${state.fips}`);
  if (context.soybeanRank2026 && context.soybeanRank2026 <= 10) ids.push(`soybean-${state.fips}`);
  return ids;
};
const electionByStateData = (state: State) => elections.filter(election => election.seatId.startsWith(`${state.abbr}-`));
const electionStatusText = (election: Election) => election.contestStatus === 'general-ballot'
  ? (() => {
      const printed = election.candidates.filter(candidate => candidate.ballotStage !== 'write-in').length;
      const writeIns = election.candidates.length - printed;
      return `本選の印刷候補${printed}人${writeIns ? `・宣言済み書き込み候補${writeIns}人` : ''}を確認、情勢は${election.rating.category}`;
    })()
  : election.contestStatus === 'primary-pending' ? '予備選前で本選候補未確定' : '予備選投票日で結果確定待ち';

export const profiles: Profile[] = states.map(state => {
  const context = contextByFips.get(state.fips)!;
  const stateElections = electionByStateData(state);
  const winner = context.presidentialWinner2024 === 'R' ? '共和党候補' : '民主党候補';
  const growth = context.populationChange2020to2025 >= 0 ? `${context.populationChange2020to2025}%増` : `${Math.abs(context.populationChange2020to2025)}%減`;
  const soybean = context.soybeanRank2026
    ? ` USDAの2026年8月予測では大豆${context.soybeanProduction2026!.toLocaleString('en-US')}千ブッシェル、全米${context.soybeanRank2026}位です。`
    : ' USDA州別表に大豆生産量の掲載はありません。';
  return {
    stateFips:state.fips,asOf:'2026-09-09',contentStatus:'確認済み',
    politicalBase:{text:`2024年大統領選は${winner}が二大候補票で${context.presidentialMargin2024!.toFixed(1)}ポイント上回りました。2025年推計人口は${context.population2025.toLocaleString('en-US')}人です。`,sourceIds:['fec-pres-2024','census-pop-2025']},
    industryAndIssues:{text:`2025年の民間GDPで最大の2桁産業は${context.topPrivateIndustry2025}（民間GDPの${context.topPrivateIndustryShare2025.toFixed(1)}%）です。${soybean}`,sourceIds:['bea-sagdp-2025',...(context.soybeanProduction2026 === null ? [] : ['nass-soy-2026'])]},
    historicalTrajectory:{text:`2020年基準から2025年までの人口変化は${growth}です。人口・産業・過去の得票は背景指標であり、個々の有権者の投票理由を直接示しません。`,sourceIds:['census-pop-2025','fec-pres-2024']},
    electionMeaning:{text:stateElections.length ? `2026年上院選：${stateElections.map(electionStatusText).join('／')}。下院は全選挙区が改選されます。` : '2026年の上院選はありません。下院は州内の全選挙区が改選されます。',sourceIds:stateElections.length ? [...new Set(stateElections.flatMap(election => election.sourceIds))] : ['house-consensus-2026']},
    eventIds:stateEventIds(state),
  };
});

export const events: EventItem[] = states.flatMap(state => {
  const context = contextByFips.get(state.fips)!;
  const stateElections = electionByStateData(state);
  const items: EventItem[] = [
    {eventId:`population-${state.fips}`,stateFips:[state.fips],relatedElectionIds:[],period:'2020–2025',precision:'range',title:'人口推計の変化',eventText:`2025年人口は${context.population2025.toLocaleString('en-US')}人。2020年基準比${context.populationChange2020to2025 >= 0 ? '+' : ''}${context.populationChange2020to2025.toFixed(1)}%。`,localEffect:'人口増減は住宅、公共サービス、労働市場、選挙運営の規模に関係します。',observedPoliticalChange:null,causalInterpretation:{text:'人口変化から党派支持の変化を推定しません。',evidenceStatus:'interpretation'},sourceIds:['census-pop-2025']},
    {eventId:`presidential-${state.fips}`,stateFips:[state.fips],relatedElectionIds:[],period:'2024-11-05',precision:'day',title:'2024年大統領選',eventText:`${context.presidentialWinner2024 === 'R' ? '共和党' : '民主党'}候補が二大候補票で${context.presidentialMargin2024!.toFixed(1)}ポイント上回りました。`,localEffect:null,observedPoliticalChange:'同じ州の直近大統領選の基準点として表示します。',causalInterpretation:{text:'大統領選と中間選挙は候補・投票率が異なり、そのまま予測には使えません。',evidenceStatus:'interpretation'},sourceIds:['fec-pres-2024']},
  ];
  if (stateElections.length) items.push({eventId:`senate-${state.fips}`,stateFips:[state.fips],relatedElectionIds:stateElections.map(election => election.electionId),period:'2026-11-03',precision:'day',title:'2026年上院選',eventText:stateElections.map(election => `${election.type === 'special' ? '特別' : '通常'}選挙：${electionStatusText(election)}`).join('／'),localEffect:'当選者の会派は2027年上院の多数派判定に直接1議席として加わります。',observedPoliticalChange:null,causalInterpretation:{text:'情勢分類は評価であり、当選確率や確定結果ではありません。',evidenceStatus:'confirmed'},sourceIds:[...new Set(stateElections.flatMap(election => election.sourceIds))]});
  if (context.soybeanRank2026 && context.soybeanRank2026 <= 10) items.push({eventId:`soybean-${state.fips}`,stateFips:[state.fips],relatedElectionIds:stateElections.map(election => election.electionId),period:'2026-08-12',precision:'day',title:'大豆生産予測',eventText:`2026年生産予測は${context.soybeanProduction2026!.toLocaleString('en-US')}千ブッシェルで全米${context.soybeanRank2026}位。`,localEffect:'対中需要、価格、投入費の変化にさらされる生産基盤の大きさを示します。',observedPoliticalChange:null,causalInterpretation:{text:'生産量は政策への賛否や投票先を直接示しません。',evidenceStatus:'interpretation'},sourceIds:['nass-soy-2026',...soybeanTrade.sourceIds]});
  return items;
});
export const DATA_AS_OF = '2026-09-09';
export const APP_VERSION = 'research02-2026-09-11';
