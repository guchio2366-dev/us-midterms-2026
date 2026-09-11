import type { Candidate, Election, Source } from './data/model';
import type { CandidateBrief, EvidenceRef, HistoricalResult, IssueReport, Poll, PublicationStatus, RaceBrief, RatingObservation, ResearchNewsItem, RollCallVote } from './data/research-model';

const visibleStatuses = new Set<PublicationStatus>(['published']);
export const isPublic = (status: PublicationStatus) => visibleStatuses.has(status);

export function getPublishedNews(items: ResearchNewsItem[]): ResearchNewsItem[] {
  return items
    .filter(item => isPublic(item.status))
    .sort((left,right) => right.updatedAt.localeCompare(left.updatedAt) || right.publishedAt.localeCompare(left.publishedAt) || left.newsId.localeCompare(right.newsId));
}

export function getPublishedNewsById(items: ResearchNewsItem[], newsId: string): ResearchNewsItem | undefined {
  return items.find(item => item.newsId === newsId && isPublic(item.status));
}

export function getPublishedNewsForElection(items: ResearchNewsItem[], electionId: string): ResearchNewsItem[] {
  return getPublishedNews(items).filter(item => item.relatedElectionIds.includes(electionId));
}

export function getPublishedNewsForIssue(items: ResearchNewsItem[], issueId: string): ResearchNewsItem[] {
  return getPublishedNews(items).filter(item => item.issueIds.includes(issueId));
}

export function getPublishedPolls(items: Poll[], electionId: string): Poll[] {
  return items
    .filter(item => item.electionId === electionId && isPublic(item.status))
    .sort((left,right) => right.fieldEnd.localeCompare(left.fieldEnd) || left.pollId.localeCompare(right.pollId));
}

export function getRatingComparisons(items: RatingObservation[], electionId: string): RatingObservation[] {
  return items
    .filter(item => item.electionId === electionId && isPublic(item.status))
    .sort((left,right) => left.organization.localeCompare(right.organization) || right.ratedAt.localeCompare(left.ratedAt));
}

export function getRatingHistory(items: RatingObservation[], electionId: string, organization: string): RatingObservation[] {
  return items
    .filter(item => item.electionId === electionId && item.organization === organization && isPublic(item.status))
    .sort((left,right) => left.ratedAt.localeCompare(right.ratedAt) || left.ratingId.localeCompare(right.ratingId));
}

export function getRaceBrief(items: RaceBrief[], electionId: string): RaceBrief | undefined {
  return items.find(item => item.electionId === electionId && isPublic(item.status));
}

export function getCandidateBrief(items: CandidateBrief[], candidateId: string): CandidateBrief | undefined {
  return items.find(item => item.candidateId === candidateId && isPublic(item.status));
}

export function twoPartyResultShares(result: HistoricalResult): {D:number;R:number} | null {
  const democratic = result.candidates.filter(item => item.party === 'D').reduce((sum,item) => sum + item.votes,0);
  const republican = result.candidates.filter(item => item.party === 'R').reduce((sum,item) => sum + item.votes,0);
  const denominator = democratic + republican;
  if (!denominator) return null;
  return {D:democratic / denominator * 100,R:republican / denominator * 100};
}

export function validateResearchData(input: {
  elections: Election[];
  sources: Source[];
  evidenceRefs: EvidenceRef[];
  polls: Poll[];
  ratingObservations: RatingObservation[];
  raceBriefs: RaceBrief[];
  candidateBriefs: CandidateBrief[];
  historicalResults: HistoricalResult[];
  issueReports: IssueReport[];
  rollCalls: RollCallVote[];
  newsItems: ResearchNewsItem[];
  stateFips?: string[];
  powerIds?: string[];
}): string[] {
  const errors: string[] = [];
  const electionIds = new Set(input.elections.map(item => item.electionId));
  const candidates: Candidate[] = input.elections.flatMap(item => item.candidates);
  const candidateIds = new Set(candidates.map(item => item.candidateId));
  const candidateElection = new Map(input.elections.flatMap(election => election.candidates.map(candidate => [candidate.candidateId,election.electionId] as const)));
  const sourceIds = new Set(input.sources.map(item => item.sourceId));
  const evidenceIds = new Set(input.evidenceRefs.map(item => item.evidenceId));
  const pollIds = new Set(input.polls.map(item => item.pollId));
  const ratingIds = new Set(input.ratingObservations.map(item => item.ratingId));
  const issueIds = new Set(input.issueReports.map(item => item.issueId));
  const stateFips = new Set(input.stateFips ?? []);
  const powerIds = new Set(input.powerIds ?? []);
  const duplicateCheck = (values: string[], label: string) => {
    if (new Set(values).size !== values.length) errors.push(`duplicate ${label}`);
  };
  duplicateCheck(candidates.map(item => item.candidateId),'candidate_id');
  duplicateCheck(input.evidenceRefs.map(item => item.evidenceId),'evidence_id');
  duplicateCheck(input.polls.map(item => item.pollId),'poll_id');
  duplicateCheck(input.ratingObservations.map(item => item.ratingId),'rating_id');
  duplicateCheck(input.raceBriefs.map(item => item.electionId),'race brief election_id');
  duplicateCheck(input.candidateBriefs.map(item => item.candidateId),'candidate brief candidate_id');
  duplicateCheck(input.historicalResults.map(item => item.resultId),'historical result_id');
  duplicateCheck(input.issueReports.map(item => item.issueId),'issue report issue_id');
  duplicateCheck(input.rollCalls.map(item => item.rollCallId),'roll_call_id');
  duplicateCheck(input.newsItems.map(item => item.newsId),'news_id');
  const checkReferences = (id: string, sourceRefs: string[], evidenceRefs: string[]) => {
    for (const sourceId of sourceRefs) if (!sourceIds.has(sourceId)) errors.push(`${id}: unknown source ${sourceId}`);
    for (const evidenceId of evidenceRefs) if (!evidenceIds.has(evidenceId)) errors.push(`${id}: unknown evidence ${evidenceId}`);
  };
  for (const item of input.evidenceRefs) if (!sourceIds.has(item.sourceId)) errors.push(`${item.evidenceId}: unknown source ${item.sourceId}`);
  for (const item of input.polls) {
    if (!electionIds.has(item.electionId)) errors.push(`${item.pollId}: unknown election ${item.electionId}`);
    const sum = item.results.reduce((total,result) => total + result.value,0);
    if (sum > 101.01) errors.push(`${item.pollId}: results total ${sum}`);
    for (const result of item.results) if (result.candidateId) {
      if (!candidateIds.has(result.candidateId)) errors.push(`${item.pollId}: unknown candidate ${result.candidateId}`);
      else if (candidateElection.get(result.candidateId) !== item.electionId) errors.push(`${item.pollId}: candidate ${result.candidateId} belongs to another election`);
    }
    checkReferences(item.pollId,item.sourceIds,item.evidenceIds);
  }
  for (const item of input.ratingObservations) {
    if (!electionIds.has(item.electionId)) errors.push(`${item.ratingId}: unknown election ${item.electionId}`);
    checkReferences(item.ratingId,item.sourceIds,item.evidenceIds);
  }
  for (const item of input.raceBriefs) {
    if (!electionIds.has(item.electionId)) errors.push(`${item.electionId}: unknown election`);
    for (const pollId of item.pollIds) if (!pollIds.has(pollId)) errors.push(`${item.electionId}: unknown poll ${pollId}`);
    for (const ratingId of item.ratingIds) if (!ratingIds.has(ratingId)) errors.push(`${item.electionId}: unknown rating ${ratingId}`);
    for (const issueId of item.relatedIssueIds) if (!issueIds.has(issueId)) errors.push(`${item.electionId}: unknown issue ${issueId}`);
    for (const section of item.analysis) for (const evidenceId of section.evidenceIds) if (!evidenceIds.has(evidenceId)) errors.push(`${item.electionId}: section unknown evidence ${evidenceId}`);
    checkReferences(item.electionId,item.sourceIds,item.evidenceIds);
  }
  for (const item of input.candidateBriefs) {
    if (!candidateIds.has(item.candidateId)) errors.push(`${item.candidateId}: unknown candidate`);
    checkReferences(item.candidateId,item.sourceIds,item.evidenceIds);
  }
  for (const item of input.historicalResults) {
    if (stateFips.size && !stateFips.has(item.stateFips)) errors.push(`${item.resultId}: unknown state ${item.stateFips}`);
    if (item.candidates.some(candidate => !Number.isInteger(candidate.votes) || candidate.votes < 0)) errors.push(`${item.resultId}: invalid vote total`);
    if (isPublic(item.status)) checkReferences(item.resultId,item.sourceIds,item.evidenceIds);
  }
  for (const item of input.issueReports) {
    checkReferences(item.issueId,item.sourceIds,item.evidenceIds);
    for (const section of item.sections) for (const evidenceId of section.evidenceIds) if (!evidenceIds.has(evidenceId)) errors.push(`${item.issueId}: section unknown evidence ${evidenceId}`);
    for (const caseStudy of item.caseStudies) {
      for (const electionId of caseStudy.electionIds) if (!electionIds.has(electionId)) errors.push(`${caseStudy.caseId}: unknown election ${electionId}`);
      for (const fips of caseStudy.stateFips) if (stateFips.size && !stateFips.has(fips)) errors.push(`${caseStudy.caseId}: unknown state ${fips}`);
      checkReferences(caseStudy.caseId,caseStudy.sourceIds,caseStudy.evidenceIds);
    }
  }
  for (const item of input.rollCalls) {
    for (const issueId of item.relatedIssueIds) if (!issueIds.has(issueId)) errors.push(`${item.rollCallId}: unknown issue ${issueId}`);
    for (const powerId of item.relatedPowerIds) if (powerIds.size && !powerIds.has(powerId)) errors.push(`${item.rollCallId}: unknown power ${powerId}`);
    checkReferences(item.rollCallId,item.sourceIds,item.evidenceIds);
  }
  for (const item of input.newsItems) {
    for (const electionId of item.relatedElectionIds) if (!electionIds.has(electionId)) errors.push(`${item.newsId}: unknown election ${electionId}`);
    for (const candidateId of item.relatedCandidateIds) if (!candidateIds.has(candidateId)) errors.push(`${item.newsId}: unknown candidate ${candidateId}`);
    for (const issueId of item.issueIds) if (!issueIds.has(issueId)) errors.push(`${item.newsId}: unknown issue ${issueId}`);
    for (const fips of item.location.stateFips ?? []) if (stateFips.size && !stateFips.has(fips)) errors.push(`${item.newsId}: unknown state ${fips}`);
    if (item.supersedesId && !input.newsItems.some(candidate => candidate.newsId === item.supersedesId)) errors.push(`${item.newsId}: unknown superseded news ${item.supersedesId}`);
    if (isPublic(item.status)) checkReferences(item.newsId,item.sourceIds,item.evidenceIds);
  }
  return errors;
}
