import type { Party, Rating } from './model';

export type PublicationStatus = 'draft' | 'reviewed' | 'published' | 'withdrawn';
export type EvidenceKind = 'observed' | 'interpretation' | 'hypothesis';
export type DatePrecision = 'day' | 'month' | 'year' | 'range' | 'unknown';

export interface EvidenceRef {
  evidenceId: string;
  sourceId: string;
  locator: string;
  checkedAt: string;
  kind: EvidenceKind;
  note?: string;
}

export interface PollResult {
  label: string;
  value: number;
  candidateId?: string;
  party?: Party;
  category: 'candidate' | 'other-candidate' | 'undecided' | 'other' | 'not-voting';
}

export interface Poll {
  pollId: string;
  studyId?: string;
  electionId: string;
  pollster: string;
  sponsor: string | null;
  fieldStart: string;
  fieldEnd: string;
  population: 'LV' | 'RV' | 'adult' | 'general-voters' | 'subgroup';
  populationLabel: string;
  sampleSize: number;
  method: string;
  question: string;
  precisionLabel: string | null;
  results: PollResult[];
  resultStage?: 'base' | 'leaner-follow-up' | 'cumulative-with-leaners' | 'first-choice' | 'elimination' | 'calculated-head-to-head' | 'final';
  conditionLabel?: string;
  questionExact?: boolean;
  completeness?: 'full' | 'partial';
  residualTreatment?: 'unreported' | 'rounding' | 'none';
  notes: string[];
  sourceIds: string[];
  evidenceIds: string[];
  status: PublicationStatus;
}

export interface RatingObservation {
  ratingId: string;
  electionId: string;
  organization: string;
  ratingRaw: string;
  category: Rating | 'Tilt D' | 'Tilt R';
  ratedAt: string;
  retrievedAt: string;
  sourceIds: string[];
  evidenceIds: string[];
  status: PublicationStatus;
}

export interface HistoricalCandidateResult {
  label: string;
  party: Party;
  votes: number;
}

export interface HistoricalResult {
  resultId: string;
  stateFips: string;
  electionDate: string;
  office: 'president' | 'senate';
  candidates: HistoricalCandidateResult[];
  sourceIds: string[];
  evidenceIds: string[];
  status: PublicationStatus;
}

export interface ResearchSection {
  heading: string;
  body: string;
  evidenceKind: EvidenceKind;
  evidenceIds: string[];
}

export interface RaceBrief {
  electionId: string;
  updatedAt: string;
  status: PublicationStatus;
  completeness: 'partial' | 'substantial';
  headline: string;
  summary: string;
  balance: string;
  keyIssues: string[];
  analysis: ResearchSection[];
  supportChange: string;
  turnout: string;
  updateConditions: string[];
  pollIds: string[];
  ratingIds: string[];
  relatedIssueIds: string[];
  sourceIds: string[];
  evidenceIds: string[];
}

export interface CandidateBrief {
  candidateId: string;
  updatedAt: string;
  status: PublicationStatus;
  summary: string;
  currentPositions: string[];
  record: string[];
  supportAndFinance: string[];
  differences: string[];
  policyPositions: string[];
  opposedPolicies: string[];
  sourceIds: string[];
  evidenceIds: string[];
}

export interface IssueCaseStudy {
  caseId: string;
  title: string;
  stateFips: string[];
  electionIds: string[];
  body: string;
  sourceIds: string[];
  evidenceIds: string[];
}

export interface IssueReport {
  issueId: string;
  updatedAt: string;
  status: PublicationStatus;
  completeness: 'partial' | 'substantial';
  summary: string;
  readingGuide: string;
  sections: ResearchSection[];
  caseStudies: IssueCaseStudy[];
  sourceIds: string[];
  evidenceIds: string[];
}

export interface RollCallVote {
  rollCallId: string;
  chamber: 'Senate' | 'House';
  congress: string;
  session: string;
  question: string;
  measure: string;
  voteDate: string;
  result: string;
  yea: number;
  nay: number;
  notVoting: number;
  summary: string;
  notableVotes: string[];
  relatedPowerIds: string[];
  relatedIssueIds: string[];
  sourceIds: string[];
  evidenceIds: string[];
  status: PublicationStatus;
}

export interface PolicyPosition {
  positionId: string;
  candidateId: string;
  policyId: string;
  stance: 'support' | 'oppose' | 'conditional' | 'unknown';
  evidenceType: 'statement' | 'roll-call' | 'record' | 'editorial-inference';
  asOf: string;
  text: string;
  sourceIds: string[];
  evidenceIds: string[];
  status: PublicationStatus;
}

export type NewsKind = 'policy' | 'speech' | 'protest' | 'election' | 'economy' | 'data-update';
export type PolicyStage = 'statement' | 'proposal' | 'filed' | 'passed-one-chamber' | 'enacted' | 'implemented' | 'effect-observed' | 'court-action' | 'not-applicable';

export interface NewsPoint {
  latitude: number;
  longitude: number;
  label: string;
}

export interface NewsLocation {
  mapMode: 'none' | 'region' | 'points';
  precision: 'national' | 'state' | 'city';
  stateFips?: string[];
  points?: NewsPoint[];
  label?: string;
}

export interface ResearchNewsItem {
  newsId: string;
  kind: NewsKind;
  headline: string;
  eventDate: string | null;
  datePrecision: DatePrecision;
  publishedAt: string;
  updatedAt: string;
  summary: string;
  possibleImpact: string;
  impactKind: EvidenceKind;
  policyStage: PolicyStage;
  selectionReason: string;
  whatChanged: string;
  issueIds: string[];
  relatedElectionIds: string[];
  relatedCandidateIds: string[];
  sourceIds: string[];
  evidenceIds: string[];
  location: NewsLocation;
  supersedesId?: string;
  status: PublicationStatus;
}
