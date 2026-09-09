import type { Election, EventItem, Profile, Seat, Source, State, VicePresident } from './model';

type StateSeed = [fips:string, abbr:string, nameJa:string, nameEn:string, seats:[[1|2|3,string,Seat['party'],Seat['caucus']],[1|2|3,string,Seat['party'],Seat['caucus']]]];

// Names and affiliations are an implementation baseline for the requested 2026-09-09 snapshot.
// Network access to the primary pages was unavailable during this task, so every seat remains
// explicitly marked primary-source-recheck-required rather than being represented as verified.
const stateSeeds: StateSeed[] = [
  ['01','AL','アラバマ','Alabama',[[2,'Tommy Tuberville','R','Republican'],[3,'Katie Britt','R','Republican']]],
  ['02','AK','アラスカ','Alaska',[[2,'Dan Sullivan','R','Republican'],[3,'Lisa Murkowski','R','Republican']]],
  ['04','AZ','アリゾナ','Arizona',[[1,'Ruben Gallego','D','Democratic'],[3,'Mark Kelly','D','Democratic']]],
  ['05','AR','アーカンソー','Arkansas',[[2,'Tom Cotton','R','Republican'],[3,'John Boozman','R','Republican']]],
  ['06','CA','カリフォルニア','California',[[1,'Adam Schiff','D','Democratic'],[3,'Alex Padilla','D','Democratic']]],
  ['08','CO','コロラド','Colorado',[[2,'John Hickenlooper','D','Democratic'],[3,'Michael Bennet','D','Democratic']]],
  ['09','CT','コネティカット','Connecticut',[[1,'Chris Murphy','D','Democratic'],[3,'Richard Blumenthal','D','Democratic']]],
  ['10','DE','デラウェア','Delaware',[[1,'Lisa Blunt Rochester','D','Democratic'],[2,'Chris Coons','D','Democratic']]],
  ['12','FL','フロリダ','Florida',[[1,'Rick Scott','R','Republican'],[3,'Ashley Moody','R','Republican']]],
  ['13','GA','ジョージア','Georgia',[[2,'Jon Ossoff','D','Democratic'],[3,'Raphael Warnock','D','Democratic']]],
  ['15','HI','ハワイ','Hawaii',[[1,'Mazie Hirono','D','Democratic'],[3,'Brian Schatz','D','Democratic']]],
  ['16','ID','アイダホ','Idaho',[[2,'Jim Risch','R','Republican'],[3,'Mike Crapo','R','Republican']]],
  ['17','IL','イリノイ','Illinois',[[2,'Dick Durbin','D','Democratic'],[3,'Tammy Duckworth','D','Democratic']]],
  ['18','IN','インディアナ','Indiana',[[1,'Jim Banks','R','Republican'],[3,'Todd Young','R','Republican']]],
  ['19','IA','アイオワ','Iowa',[[2,'Joni Ernst','R','Republican'],[3,'Chuck Grassley','R','Republican']]],
  ['20','KS','カンザス','Kansas',[[2,'Roger Marshall','R','Republican'],[3,'Jerry Moran','R','Republican']]],
  ['21','KY','ケンタッキー','Kentucky',[[2,'Mitch McConnell','R','Republican'],[3,'Rand Paul','R','Republican']]],
  ['22','LA','ルイジアナ','Louisiana',[[2,'Bill Cassidy','R','Republican'],[3,'John Kennedy','R','Republican']]],
  ['23','ME','メーン','Maine',[[1,'Angus King','I','Democratic'],[2,'Susan Collins','R','Republican']]],
  ['24','MD','メリーランド','Maryland',[[1,'Angela Alsobrooks','D','Democratic'],[3,'Chris Van Hollen','D','Democratic']]],
  ['25','MA','マサチューセッツ','Massachusetts',[[1,'Elizabeth Warren','D','Democratic'],[2,'Ed Markey','D','Democratic']]],
  ['26','MI','ミシガン','Michigan',[[1,'Elissa Slotkin','D','Democratic'],[2,'Gary Peters','D','Democratic']]],
  ['27','MN','ミネソタ','Minnesota',[[1,'Amy Klobuchar','D','Democratic'],[2,'Tina Smith','D','Democratic']]],
  ['28','MS','ミシシッピ','Mississippi',[[1,'Roger Wicker','R','Republican'],[2,'Cindy Hyde-Smith','R','Republican']]],
  ['29','MO','ミズーリ','Missouri',[[1,'Josh Hawley','R','Republican'],[3,'Eric Schmitt','R','Republican']]],
  ['30','MT','モンタナ','Montana',[[1,'Tim Sheehy','R','Republican'],[2,'Steve Daines','R','Republican']]],
  ['31','NE','ネブラスカ','Nebraska',[[1,'Deb Fischer','R','Republican'],[2,'Pete Ricketts','R','Republican']]],
  ['32','NV','ネバダ','Nevada',[[1,'Jacky Rosen','D','Democratic'],[3,'Catherine Cortez Masto','D','Democratic']]],
  ['33','NH','ニューハンプシャー','New Hampshire',[[2,'Jeanne Shaheen','D','Democratic'],[3,'Maggie Hassan','D','Democratic']]],
  ['34','NJ','ニュージャージー','New Jersey',[[1,'Andy Kim','D','Democratic'],[2,'Cory Booker','D','Democratic']]],
  ['35','NM','ニューメキシコ','New Mexico',[[1,'Martin Heinrich','D','Democratic'],[2,'Ben Ray Luján','D','Democratic']]],
  ['36','NY','ニューヨーク','New York',[[1,'Kirsten Gillibrand','D','Democratic'],[3,'Chuck Schumer','D','Democratic']]],
  ['37','NC','ノースカロライナ','North Carolina',[[2,'Thom Tillis','R','Republican'],[3,'Ted Budd','R','Republican']]],
  ['38','ND','ノースダコタ','North Dakota',[[1,'Kevin Cramer','R','Republican'],[3,'John Hoeven','R','Republican']]],
  ['39','OH','オハイオ','Ohio',[[1,'Bernie Moreno','R','Republican'],[3,'Jon Husted','R','Republican']]],
  ['40','OK','オクラホマ','Oklahoma',[[2,'Markwayne Mullin','R','Republican'],[3,'James Lankford','R','Republican']]],
  ['41','OR','オレゴン','Oregon',[[2,'Jeff Merkley','D','Democratic'],[3,'Ron Wyden','D','Democratic']]],
  ['42','PA','ペンシルベニア','Pennsylvania',[[1,'Dave McCormick','R','Republican'],[3,'John Fetterman','D','Democratic']]],
  ['44','RI','ロードアイランド','Rhode Island',[[1,'Sheldon Whitehouse','D','Democratic'],[2,'Jack Reed','D','Democratic']]],
  ['45','SC','サウスカロライナ','South Carolina',[[2,'Lindsey Graham','R','Republican'],[3,'Tim Scott','R','Republican']]],
  ['46','SD','サウスダコタ','South Dakota',[[2,'Mike Rounds','R','Republican'],[3,'John Thune','R','Republican']]],
  ['47','TN','テネシー','Tennessee',[[1,'Marsha Blackburn','R','Republican'],[2,'Bill Hagerty','R','Republican']]],
  ['48','TX','テキサス','Texas',[[1,'Ted Cruz','R','Republican'],[2,'John Cornyn','R','Republican']]],
  ['49','UT','ユタ','Utah',[[1,'John Curtis','R','Republican'],[3,'Mike Lee','R','Republican']]],
  ['50','VT','バーモント','Vermont',[[1,'Bernie Sanders','I','Democratic'],[3,'Peter Welch','D','Democratic']]],
  ['51','VA','バージニア','Virginia',[[1,'Tim Kaine','D','Democratic'],[2,'Mark Warner','D','Democratic']]],
  ['53','WA','ワシントン','Washington',[[1,'Maria Cantwell','D','Democratic'],[3,'Patty Murray','D','Democratic']]],
  ['54','WV','ウェストバージニア','West Virginia',[[1,'Jim Justice','R','Republican'],[2,'Shelley Moore Capito','R','Republican']]],
  ['55','WI','ウィスコンシン','Wisconsin',[[1,'Tammy Baldwin','D','Democratic'],[3,'Ron Johnson','R','Republican']]],
  ['56','WY','ワイオミング','Wyoming',[[1,'John Barrasso','R','Republican'],[2,'Cynthia Lummis','R','Republican']]],
];

const termByClass: Record<1|2|3, [string,string]> = {
  1: ['2025-01-03','2031-01-03'],
  2: ['2021-01-03','2027-01-03'],
  3: ['2023-01-03','2029-01-03'],
};

export const states: State[] = stateSeeds.map(([fips,abbr,nameJa,nameEn,stateSeats]) => ({
  fips, abbr, nameJa, nameEn, classes: [stateSeats[0][0],stateSeats[1][0]],
}));

export const seats: Seat[] = stateSeeds.flatMap(([fips,abbr,,,stateSeats]) => stateSeats.map(([senateClass,incumbent,party,caucus]) => ({
  seatId: `${abbr}-${senateClass}`,
  stateFips: fips,
  senateClass,
  incumbent,
  party,
  caucus,
  vacant: false,
  termStart: termByClass[senateClass][0],
  termEnd: termByClass[senateClass][1],
  verificationStatus: 'primary-source-recheck-required',
  sourceIds: ['senate-members','senate-classes','senate-party-division'],
})));

const unresearchedElection = (seat: Seat, type: Election['type'], sourceIds: string[]): Election => ({
  electionId: `2026-${seat.seatId}-${type}`,
  seatId: seat.seatId,
  year: 2026,
  date: '2026-11-03',
  type,
  termStart: type === 'regular' ? '2027-01-03' : null,
  termStartLabel: type === 'regular' ? '2027-01-03' : '当選者の就任後（開始日未確認）',
  termEnd: type === 'regular' ? '2033-01-03' : '2029-01-03',
  congressAsOf: '2027-01-03',
  candidates: [],
  candidateResearchStatus: 'not-started',
  rating: {raw:null,category:'unavailable',organization:null,ratedAt:null,retrievedAt:null,sourceIds:[]},
  electionRelevance: '候補者調査は未着手、情勢評価は未取得です。',
  verificationStatus: 'primary-source-recheck-required',
  sourceIds,
});

const regularElections = seats.filter(seat => seat.senateClass === 2).map(seat => unresearchedElection(seat,'regular',['senate-classes','federal-election-date']));
const specialSeatIds = ['FL-3','OH-3'];
const specialElections = specialSeatIds.map(seatId => {
  const seat = seats.find(item => item.seatId === seatId);
  if (!seat) throw new Error(`Missing special-election seat: ${seatId}`);
  return unresearchedElection(seat,'special',[seatId === 'FL-3' ? 'fl-election-dates' : 'oh-election-calendar']);
});
export const elections: Election[] = [...regularElections,...specialElections];

export const vicePresident: VicePresident = {
  name: 'JD Vance',
  party: 'R',
  asOf: '2026-09-09',
  verificationStatus: 'primary-source-recheck-required',
  sourceIds: ['white-house-administration','senate-vice-president'],
};

export const sources: Source[] = [
  {sourceId:'senate-members',title:'U.S. Senators',publisher:'U.S. Senate',url:'https://www.senate.gov/senators/',publishedAt:null,referencePeriod:'現職・党籍・州',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'senate-classes',title:'Classes of United States Senators',publisher:'U.S. Senate',url:'https://www.senate.gov/senators/Classes.htm',publishedAt:null,referencePeriod:'上院議席のClass・任期',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'senate-party-division',title:'Party Division',publisher:'U.S. Senate',url:'https://www.senate.gov/history/partydiv.htm',publishedAt:null,referencePeriod:'党派・会派構成',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'senate-vice-president',title:'Vice President of the United States',publisher:'U.S. Senate',url:'https://www.senate.gov/about/officers-staff/vice-president.htm',publishedAt:null,referencePeriod:'副大統領の決裁票',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'white-house-administration',title:'The Administration',publisher:'The White House',url:'https://www.whitehouse.gov/administration/',publishedAt:null,referencePeriod:'副大統領の氏名・党籍',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'federal-election-date',title:'Federal law establishing the federal election date',publisher:'U.S. House of Representatives, Office of the Law Revision Counsel',url:'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title2-section7',publishedAt:null,referencePeriod:'2026年連邦一般選挙日',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'fl-election-dates',title:'Election Dates',publisher:'Florida Department of State, Division of Elections',url:'https://dos.fl.gov/elections/for-voters/election-dates/',publishedAt:null,referencePeriod:'2026年フロリダ州選挙日程・特別選挙',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'oh-election-calendar',title:'2026 Elections Calendar',publisher:'Ohio Secretary of State',url:'https://www.ohiosos.gov/elections/voters/current-voting-schedule/',publishedAt:null,referencePeriod:'2026年オハイオ州選挙日程・特別選挙',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'census-profile',title:'Data Profiles | American Community Survey',publisher:'U.S. Census Bureau',url:'https://www.census.gov/acs/www/data/data-tables-and-tools/data-profiles/',publishedAt:null,referencePeriod:'州別人口・社会属性',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'bls-qcew',title:'Quarterly Census of Employment and Wages',publisher:'U.S. Bureau of Labor Statistics',url:'https://www.bls.gov/cew/',publishedAt:null,referencePeriod:'州別産業雇用・賃金',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'bea-state',title:'GDP by State',publisher:'U.S. Bureau of Economic Analysis',url:'https://www.bea.gov/data/gdp/gdp-state',publishedAt:null,referencePeriod:'州別・産業別GDP',retrievedAt:null,contentVerifiedAt:null},
  {sourceId:'atlas',title:'us-atlas states-10m',publisher:'TopoJSON',url:'https://github.com/topojson/us-atlas',publishedAt:'2021-06-05',referencePeriod:'2020 Census cartographic boundary files',retrievedAt:null,contentVerifiedAt:null},
];

export const profiles: Profile[] = states.map(state => ({
  stateFips: state.fips,
  asOf: '2026-09-09',
  contentStatus: '未作成',
  politicalBase: {text:`${state.nameJa}の地域別選挙結果と人口構成を対応させた確認済み原稿は準備中です。`,sourceIds:[]},
  industryAndIssues: {text:'州別QCEW・BEA表の対象年と指標を確認したうえで掲載します。未確認の産業構成から党派支持を推定しません。',sourceIds:['bls-qcew','bea-state']},
  historicalTrajectory: {text:'同種選挙の公式結果を用いた時系列比較は未作成です。異なる選挙種別の得票差を連続した指標として扱いません。',sourceIds:[]},
  electionMeaning: {text:elections.some(election => election.seatId.startsWith(`${state.abbr}-`))?'2026年の選挙がありますが、候補者と情勢の説明は未確認です。':'2026年の対象選挙はありません。州政治の背景説明は調査中です。',sourceIds:[]},
  eventIds: [],
}));
export const events: EventItem[] = [];
export const DATA_AS_OF = '2026-09-09';
export const APP_VERSION = 'task01-2026-09-09';
