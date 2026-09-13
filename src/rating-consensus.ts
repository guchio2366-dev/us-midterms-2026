import type { RatingSnapshotObservation } from './data/rating-snapshot';
import type { Rating } from './data/model';

export type RatingDirection = 'D'|'R'|'T';
export type RatingConsensusCategory = 'D'|'R'|'tossup'|'split'|'missing';

export interface RatingConsensusSeat {
  seatId: string;
  category: RatingConsensusCategory;
  observations: Array<RatingSnapshotObservation & {direction:RatingDirection|null}>;
}

export function normalizeRatingDirection(raw: string): RatingDirection|null {
  const value = raw.trim().toLowerCase().replaceAll('-',' ');
  if (/toss\s*up|tossup/.test(value)) return 'T';
  if (/^(safe|solid|likely|lean|tilt)\s+d(?:em(?:ocratic)?)?\b/.test(value)) return 'D';
  if (/^(safe|solid|likely|lean|tilt)\s+r(?:ep(?:ublican)?)?\b/.test(value)) return 'R';
  return null;
}

export function aggregateRatingConsensus(
  seatIds: readonly string[],
  observations: readonly RatingSnapshotObservation[],
  minimumOrganizations = 2,
): RatingConsensusSeat[] {
  return seatIds.map(seatId => {
    const byOrganization = new Map<string,RatingSnapshotObservation>();
    observations.filter(item => item.seatId === seatId).forEach(item => byOrganization.set(item.organizationId,item));
    const normalized = [...byOrganization.values()].map(item => ({...item,direction:normalizeRatingDirection(item.ratingRaw)}));
    const valid = normalized.filter((item): item is typeof item & {direction:RatingDirection} => item.direction !== null);
    if (valid.length < minimumOrganizations) return {seatId,category:'missing',observations:normalized};
    const counts: Record<RatingDirection,number> = {D:0,R:0,T:0};
    valid.forEach(item => { counts[item.direction] += 1; });
    const winner = (Object.entries(counts) as Array<[RatingDirection,number]>).find(([,count]) => count > valid.length / 2)?.[0];
    const category: RatingConsensusCategory = winner === 'D' ? 'D' : winner === 'R' ? 'R' : winner === 'T' ? 'tossup' : 'split';
    return {seatId,category,observations:normalized};
  });
}

export function ratingConsensusCounts(results: readonly RatingConsensusSeat[]) {
  return results.reduce((counts,result) => {
    counts[result.category] += 1;
    return counts;
  },{D:0,R:0,tossup:0,split:0,missing:0} as Record<RatingConsensusCategory,number>);
}

/** Direction follows the shared consensus. Strength is Sabato's, not an average. */
export function consensusDisplayRating(result: RatingConsensusSeat|undefined): Rating {
  if (!result || result.category === 'missing') return 'unavailable';
  if (result.category === 'tossup' || result.category === 'split') return 'Toss Up';
  const sabato = result.observations.find(item => item.organizationId === 'sabato');
  if (sabato?.direction !== result.category) return 'unavailable';
  const raw = sabato.ratingRaw.trim().toLowerCase();
  const strength = /^(safe|solid)\b/.test(raw) ? 'Solid' : /^likely\b/.test(raw) ? 'Likely' : /^(lean|tilt)\b/.test(raw) ? 'Lean' : null;
  return strength ? `${strength} ${result.category}` : 'unavailable';
}
