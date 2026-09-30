import type { RatingSnapshotObservation } from './data/rating-snapshot';
import type { Rating } from './data/model';

export type RatingDirection = 'D'|'R'|'T';
export type RatingConsensusCategory = 'D'|'R'|'lean'|'tossup'|'split'|'missing';

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
    if (valid.length < minimumOrganizations || valid.length !== normalized.length) return {seatId,category:'missing',observations:normalized};
    const directions = new Set(valid.map(item=>item.direction));
    const direction = valid[0].direction;
    const strong = valid.every(item=>/^(likely|safe|solid)\s/i.test(item.ratingRaw.trim()));
    const category: RatingConsensusCategory = directions.size !== 1 ? 'split' : direction === 'T' ? 'tossup' : strong ? direction : 'lean';
    return {seatId,category,observations:normalized};
  });
}

export function ratingConsensusCounts(results: readonly RatingConsensusSeat[]) {
  return results.reduce((counts,result) => {
    counts[result.category] += 1;
    return counts;
  },{D:0,R:0,lean:0,tossup:0,split:0,missing:0} as Record<RatingConsensusCategory,number>);
}

/** Neutral color includes weak agreement; the UI names it unallocated, not a source Toss Up. */
export function consensusDisplayRating(result: RatingConsensusSeat|undefined): Rating {
  if (!result || result.category === 'missing') return 'unavailable';
  if (result.category === 'lean' || result.category === 'tossup' || result.category === 'split') return 'Toss Up';
  const sabato = result.observations.find(item => item.organizationId === 'sabato');
  if (sabato?.direction !== result.category) return 'unavailable';
  const raw = sabato.ratingRaw.trim().toLowerCase();
  const strength = /^(safe|solid)\b/.test(raw) ? 'Solid' : /^likely\b/.test(raw) ? 'Likely' : /^(lean|tilt)\b/.test(raw) ? 'Lean' : null;
  return strength ? `${strength} ${result.category}` : 'unavailable';
}

export function consensusDisplayLabel(result: RatingConsensusSeat|undefined): string {
  if (!result || result.category === 'missing') return '評価不足';
  if (result.category === 'lean') return '弱い優勢（Lean/Tilt）・未配分';
  if (result.category === 'tossup') return '接戦（Toss Up）';
  if (result.category === 'split') return '評価が分かれる';
  return consensusDisplayRating(result);
}
