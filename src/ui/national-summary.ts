import type { Seat, Election } from '../data/model';
import { ratingConsensusCounts, type RatingConsensusSeat } from '../rating-consensus';
import { senateBreakdown } from './senate-bars';
import type { SeatBarSegment } from './seat-bars';

export function nationalSummary(seats: Seat[], elections: Election[], consensus: RatingConsensusSeat[]) {
  const breakdown = senateBreakdown(seats,elections);
  const electionIds = new Set(elections.map(e => e.seatId));
  const bySeat = new Map(consensus.map(r => [r.seatId,r]));
  if (bySeat.size !== consensus.length) throw new Error('Duplicate consensus seat');
  const counts = ratingConsensusCounts([...electionIds].map(seatId => bySeat.get(seatId) ?? {seatId,category:'missing',observations:[]}));
  const fixed = breakdown.fixed;
  const Democratic = fixed.Democratic + counts.D;
  const Republican = fixed.Republican + counts.R;
  const unassigned = counts.tossup + counts.split + counts.missing;
  const other = fixed.none + fixed.unconfirmed + fixed.vacant;
  if (Democratic + Republican + unassigned + other !== breakdown.total) throw new Error('Invalid national total');
  const segments: SeatBarSegment[] = [
    {count:fixed.Democratic,label:`非改選・民主党会派 ${fixed.Democratic}`,shortLabel:`非改選 ${fixed.Democratic}`,className:'fixed-d'},
    ...([['none','会派非所属'],['unconfirmed','会派未確認'],['vacant','空席']] as const).map(([key,label]) => ({count:fixed[key],label:`非改選・${label} ${fixed[key]}`,className:'fixed-other'})),
    {count:counts.D,label:`改選・民主党側 ${counts.D}`,className:'consensus-d'},
    {count:counts.tossup,label:`接戦評価一致 ${counts.tossup}`,className:'consensus-unresolved'},
    {count:counts.split,label:`評価分裂 ${counts.split}`,className:'consensus-split'},
    {count:counts.missing,label:`評価資料不足 ${counts.missing}`,className:'consensus-missing'},
    {count:counts.R,label:`改選・共和党側 ${counts.R}`,className:'consensus-r'},
    {count:fixed.Republican,label:`非改選・共和党会派 ${fixed.Republican}`,shortLabel:`非改選 ${fixed.Republican}`,className:'fixed-r'},
  ];
  return {total:breakdown.total,contested:breakdown.contested,fixed,counts,Democratic,Republican,unassigned,other,segments};
}

export function nationalTarget(summary: ReturnType<typeof nationalSummary>, party:'Democratic'|'Republican', target:number) {
  const additional = Math.max(0,target-summary[party]);
  return {additional,requiredContested:Math.max(0,target-summary.fixed[party]),beyondUnassigned:Math.max(0,additional-summary.unassigned)};
}
