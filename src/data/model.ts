export type Party = 'D' | 'R' | 'I' | 'other' | 'vacant' | 'unknown';
export type Caucus = 'Democratic' | 'Republican' | 'none' | 'unconfirmed' | 'vacant';
export type VerificationStatus = 'confirmed' | 'primary-source-recheck-required';
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
  sourceIds: string[];
}

export interface Candidate {
  name: string|null;
  party: Party;
  status: 'confirmed'|'unconfirmed'|'none';
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
  termEnd: string;
  congressAsOf: '2027-01-03';
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
  sourceIds: string[];
}

export interface Source {
  sourceId: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string|null;
  referencePeriod: string;
  retrievedAt: string|null;
  contentVerifiedAt: string|null;
}

export interface VicePresident {
  name: string;
  party: 'D'|'R'|'unknown';
  asOf: string;
  verificationStatus: VerificationStatus;
  sourceIds: string[];
}

export interface Profile { stateFips:string; asOf:string; contentStatus:'確認済み'|'一部未確認'|'未作成'; politicalBase:{text:string;sourceIds:string[]}; industryAndIssues:{text:string;sourceIds:string[]}; historicalTrajectory:{text:string;sourceIds:string[]}; electionMeaning:{text:string;sourceIds:string[]}; eventIds:string[] }
export interface EventItem { eventId:string; stateFips:string[]; relatedElectionIds:string[]; period:string; precision:'day'|'month'|'year'|'range'; title:string; eventText:string; localEffect:string|null; observedPoliticalChange:string|null; causalInterpretation:{text:string;evidenceStatus:'confirmed'|'interpretation'|'unconfirmed'}; sourceIds:string[] }
