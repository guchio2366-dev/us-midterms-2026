export type Party = 'D' | 'R' | 'I' | 'other' | 'vacant' | 'unknown';
export type Caucus = 'Democratic' | 'Republican' | 'none' | 'unconfirmed' | 'vacant';
export type VerificationStatus = 'confirmed' | 'primary-source-recheck-required';
export type SeatField = 'incumbent'|'party'|'caucus'|'vacant'|'senateClass'|'termStart'|'termEnd';
export type ElectionField = 'seatId'|'type'|'date'|'termStart'|'termEnd';
export type AttributeSources<T extends string> = Partial<Record<T,string[]>>;
export type Rating = 'Solid D'|'Likely D'|'Lean D'|'Toss Up'|'Lean R'|'Likely R'|'Solid R'|'unavailable';

export interface State {
  fips: string;
  abbr: string;
  nameJa: string;
  nameEn: string;
  classes: [1|2|3, 1|2|3];
}

export interface Seat {
  seatId: string;
  stateFips: string;
  senateClass: 1|2|3;
  incumbent: string|null;
  party: Party;
  caucus: Caucus;
  vacant: boolean;
  termStart: string|null;
  termEnd: string|null;
  verificationStatus: VerificationStatus;
  verifiedAt: string|null;
  attributeSourceIds: AttributeSources<SeatField>;
  sourceIds: string[];
}

export interface Candidate {
  name: string;
  party: Party;
  partyLabel: string;
  status: 'confirmed'|'unconfirmed';
  ballotStage: 'general-ballot'|'primary-ballot'|'write-in';
  caucusIntent: Caucus;
  sourceIds: string[];
}

export interface Election {
  electionId: string;
  seatId: string;
  year: 2026;
  date: string;
  type: 'regular'|'special';
  termStart: string|null;
  termStartLabel: string;
  termStartStatus: 'scheduled'|'pending-inauguration';
  termStartRule: string|null;
  termEnd: string;
  congressAsOf: '2027-01-03';
  primaryDate: string|null;
  contestStatus: 'general-ballot'|'primary-pending'|'primary-result-pending';
  candidates: Candidate[];
  candidateResearchStatus: 'not-started'|'partial'|'complete';
  rating: {
    raw: string|null;
    category: Rating;
    organization: string|null;
    ratedAt: string|null;
    retrievedAt: string|null;
    sourceIds: string[];
  };
  electionRelevance: string;
  verificationStatus: VerificationStatus;
  verifiedAt: string|null;
  attributeSourceIds: AttributeSources<ElectionField>;
  sourceIds: string[];
}

export interface Source {
  sourceId: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string|null;
  updatedAt?: string|null;
  referencePeriod: string;
  retrievedAt: string|null;
  contentVerifiedAt: string|null;
}

export interface VicePresident {
  name: string;
  party: 'D'|'R'|'unknown';
  asOf: string;
  verificationStatus: VerificationStatus;
  verifiedAt: string|null;
  attributeSourceIds: AttributeSources<'name'|'party'>;
  sourceIds: string[];
}

export interface Profile { stateFips:string; asOf:string; contentStatus:'確認済み'|'一部未確認'|'未作成'; politicalBase:{text:string;sourceIds:string[]}; industryAndIssues:{text:string;sourceIds:string[]}; historicalTrajectory:{text:string;sourceIds:string[]}; electionMeaning:{text:string;sourceIds:string[]}; eventIds:string[] }
export interface EventItem { eventId:string; stateFips:string[]; relatedElectionIds:string[]; period:string; precision:'day'|'month'|'year'|'range'; title:string; eventText:string; localEffect:string|null; observedPoliticalChange:string|null; causalInterpretation:{text:string;evidenceStatus:'confirmed'|'interpretation'|'unconfirmed'}; sourceIds:string[] }

export interface PowerRule {
  powerId: string;
  domain: 'law'|'money'|'oversight'|'appointments'|'treaties'|'impeachment'|'veto';
  action: string;
  house: string;
  senate: string;
  threshold: string;
  nominalSeats: string;
  presidentialConstraint: string;
  sourceIds: string[];
}

export interface IssueCategory {
  issueId: string;
  label: string;
  scope: string;
  voterQuestion: string;
  presidentialLevers: string;
  congressionalChecks: string;
  indicatorLabels: string[];
  relatedPowerIds: string[];
  sourceIds: string[];
}

export interface StateContext {
  stateFips: string;
  region: 'Northeast'|'Midwest'|'South'|'West';
  population2025: number;
  populationChange2020to2025: number;
  presidentialWinner2024: 'D'|'R';
  presidentialMargin2024: number|null;
  topPrivateIndustry2025: string;
  topPrivateIndustryShare2025: number;
  soybeanProduction2026: number|null;
  soybeanRank2026: number|null;
  sourceIds: string[];
}

export interface HouseDistrict {
  districtId: string;
  stateFips: string;
  stateAbbr: string;
  district: number;
  incumbent: string|null;
  currentParty: Party;
  vacant: boolean;
  ratingRaw: string;
  rating: Rating;
  sourceIds: string[];
}
