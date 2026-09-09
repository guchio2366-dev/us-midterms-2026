import type { Source, StateContext } from './model';

const regionByAbbr: Record<string,StateContext['region']> = {
  CT:'Northeast',ME:'Northeast',MA:'Northeast',NH:'Northeast',RI:'Northeast',VT:'Northeast',NJ:'Northeast',NY:'Northeast',PA:'Northeast',
  IN:'Midwest',IL:'Midwest',MI:'Midwest',OH:'Midwest',WI:'Midwest',IA:'Midwest',KS:'Midwest',MN:'Midwest',MO:'Midwest',NE:'Midwest',ND:'Midwest',SD:'Midwest',
  DE:'South',FL:'South',GA:'South',MD:'South',NC:'South',SC:'South',VA:'South',WV:'South',AL:'South',KY:'South',MS:'South',TN:'South',AR:'South',LA:'South',OK:'South',TX:'South',
  AZ:'West',CO:'West',ID:'West',MT:'West',NV:'West',NM:'West',UT:'West',WY:'West',AK:'West',CA:'West',HI:'West',OR:'West',WA:'West',
};

export const industryLabels: Record<string,string> = {
  '11':'農林水産','21':'鉱業・石油ガス','22':'公益事業','23':'建設','31-33':'製造業','42':'卸売','44-45':'小売','48-49':'運輸・倉庫','51':'情報','52':'金融・保険','53':'不動産・賃貸','54':'専門・科学・技術サービス','55':'企業管理','56':'業務支援・廃棄物処理','61':'教育サービス','62':'医療・社会扶助','71':'芸術・娯楽','72':'宿泊・飲食','81':'その他サービス',
};

const context = (stateFips:string,abbr:string,population2025:number,populationChange2020to2025:number,presidentialWinner2024:'D'|'R',presidentialMargin2024:number,industryCode:string,topPrivateIndustryShare2025:number,soybeanProduction2026:number|null,soybeanRank2026:number|null): StateContext => ({
  stateFips,region:regionByAbbr[abbr],population2025,populationChange2020to2025,presidentialWinner2024,presidentialMargin2024,
  topPrivateIndustry2025:industryLabels[industryCode],topPrivateIndustryShare2025,soybeanProduction2026,soybeanRank2026,
  sourceIds:['census-pop-2025','fec-pres-2024','bea-sagdp-2025',...(soybeanProduction2026 === null ? [] : ['nass-soy-2026'])],
});

export const stateContexts: StateContext[] = [
  context('01','AL',5193088,3.3,'R',30.9,'31-33',17.6,12095,24),
  context('02','AK',737270,0.5,'R',13.7,'48-49',18.1,null,null),
  context('04','AZ',7623818,6.5,'R',5.6,'53',19.4,null,null),
  context('05','AR',3114791,3.4,'R',31.3,'31-33',14.4,195510,10),
  context('06','CA',39355309,-0.5,'D',20.8,'53',15.8,null,null),
  context('08','CO',6012561,4.1,'D',11.3,'53',17.9,null,null),
  context('09','CT',3688496,2.2,'D',14.8,'52',14.5,null,null),
  context('10','DE',1059952,7.1,'D',15.0,'52',28.2,7696,27),
  context('12','FL',23462518,8.9,'R',13.2,'53',22.4,null,null),
  context('13','GA',11302748,5.5,'R',2.2,'53',16.1,7820,26),
  context('15','HI',1432820,-1.5,'D',23.6,'53',20.9,null,null),
  context('16','ID',2029733,10.4,'R',37.5,'53',17.2,null,null),
  context('17','IL',12719141,-0.8,'D',11.1,'53',14.1,698810,1),
  context('18','IN',6973333,2.8,'R',19.3,'31-33',26.3,349060,4),
  context('19','IA',3238387,1.5,'R',13.4,'31-33',17.7,603260,2),
  context('20','KS',2977220,1.3,'R',16.4,'31-33',17.1,178220,11),
  context('21','KY',4606864,2.2,'R',31.0,'31-33',18.0,92000,15),
  context('22','LA',4618189,-0.9,'R',22.4,'31-33',19.4,47940,18),
  context('23','ME',1414874,3.8,'D',7.1,'53',18.5,null,null),
  context('24','MD',6265347,1.4,'D',29.5,'53',19.0,20025,21),
  context('25','MA',7154084,1.7,'D',25.9,'54',15.7,null,null),
  context('26','MI',10127884,0.5,'R',1.4,'31-33',17.3,109500,14),
  context('27','MN',5830405,2.2,'D',4.3,'53',14.0,351840,3),
  context('28','MS',2954160,-0.2,'R',23.1,'31-33',17.4,144900,12),
  context('29','MO',6270541,1.9,'R',18.7,'53',13.7,294000,6),
  context('30','MT',1144694,5.6,'R',20.6,'53',16.9,null,null),
  context('31','NE',2018006,2.9,'R',20.8,'52',15.2,301530,5),
  context('32','NV',3282188,5.7,'R',3.2,'53',16.5,null,null),
  context('33','NH',1415342,2.7,'D',2.8,'53',16.6,null,null),
  context('34','NJ',9548215,2.8,'D',6.0,'53',17.8,4116,28),
  context('35','NM',2125498,0.4,'D',6.1,'53',15.5,null,null),
  context('36','NY',20002427,-1.0,'D',12.7,'52',24.1,15750,22),
  context('37','NC',11197968,7.2,'R',3.3,'53',14.4,66360,17),
  context('38','ND',799358,2.6,'R',37.4,'21',15.7,229160,8),
  context('39','OH',11900510,0.9,'R',11.3,'31-33',15.2,285940,7),
  context('40','OK',4123288,4.1,'R',34.9,'53',13.2,14000,23),
  context('41','OR',4273586,0.9,'D',14.9,'53',17.2,null,null),
  context('42','PA',13059432,0.4,'R',1.7,'53',14.0,27840,19),
  context('44','RI',1114521,1.6,'D',14.2,'53',17.4,null,null),
  context('45','SC',5570274,8.8,'R',18.1,'53',18.1,11385,25),
  context('46','SD',935094,5.5,'R',29.9,'52',18.3,219350,9),
  context('47','TN',7315076,5.8,'R',30.1,'53',13.8,81000,16),
  context('48','TX',31709821,8.8,'R',13.9,'53',14.2,3040,29),
  context('49','UT',3538904,8.2,'R',22.2,'53',15.6,null,null),
  context('50','VT',644663,0.2,'D',32.8,'53',15.6,null,null),
  context('51','VA',8880107,2.9,'D',5.9,'53',16.7,24780,20),
  context('53','WA',8001020,3.8,'D',18.9,'51',18.5,null,null),
  context('54','WV',1766147,-1.5,'R',42.7,'21',14.1,null,null),
  context('55','WI',5972787,1.3,'R',0.9,'31-33',17.3,122100,13),
  context('56','WY',588753,2.1,'R',47.0,'53',14.8,null,null),
];

export const soybeanTrade = {
  period:'2025年10月〜2026年7月',
  chinaMetricTons:12356115,
  priorYearChinaMetricTons:21598375.9,
  worldMetricTons:36805330.8,
  yearOverYearPercent:-42.8,
  chinaSharePercent:33.6,
  sourceIds:['ers-soy-markets','usda-trade','nass-soy-2026','ustr-trade-agenda'],
};

const checked = (source: Omit<Source,'retrievedAt'|'contentVerifiedAt'>): Source => ({...source,retrievedAt:'2026-09-09',contentVerifiedAt:'2026-09-09'});
export const contextSources: Source[] = [
  checked({sourceId:'census-pop-2025',title:'Annual State Population Estimates: 2020–2025',publisher:'U.S. Census Bureau',url:'https://www2.census.gov/programs-surveys/popest/tables/2020-2025/state/totals/NST-EST2025-POP.xlsx',publishedAt:'2026-01-01',referencePeriod:'2025年7月1日人口推計と2020年基準からの変化'}),
  checked({sourceId:'fec-pres-2024',title:'Official 2024 Presidential General Election Results',publisher:'Federal Election Commission',url:'https://www.fec.gov/documents/5644/2024presgeresults.pdf',publishedAt:'2025-01-28',referencePeriod:'州選挙当局の認証値をFECが集計。二大候補の得票差を再計算'}),
  checked({sourceId:'bea-sagdp-2025',title:'SAGDP2 — GDP by State by Industry',publisher:'U.S. Bureau of Economic Analysis',url:'https://apps.bea.gov/regional/zip/SAGDP.zip',publishedAt:'2026-04-08',referencePeriod:'2025年名目GDP。民間2桁NAICS部門の最大構成と民間GDP比'}),
  checked({sourceId:'nass-soy-2026',title:'Crop Production — August 2026',publisher:'USDA National Agricultural Statistics Service',url:'https://esmis.nal.usda.gov/sites/default/release-files/796015/crop0826.pdf',publishedAt:'2026-08-12',referencePeriod:'2026年8月1日予測の州別大豆生産量（1,000 bushels）'}),
  checked({sourceId:'ers-soy-markets',title:'Top 10 U.S. agricultural export markets by volume',publisher:'USDA Economic Research Service',url:'https://www.ers.usda.gov/media/5031/top-10-us-agricultural-export-markets-for-wheat-corn-soybeans-and-cotton-by-volume.xlsx',publishedAt:'2026-09-08',referencePeriod:'2025/26年度10月〜7月の大豆輸出先別数量と前年同期'}),
];
