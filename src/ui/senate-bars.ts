import type { Election, Seat } from '../data/model';
import { currentCaucusCounts, uniqueElectionSeatIds, type CaucusCounts } from '../logic';
import { prepareSeatBar, type SeatBarSegment, type SeatBarTarget } from './seat-bars';

export function senateBreakdown(seats: Seat[], elections: Election[]) {
  const targetIds = new Set(uniqueElectionSeatIds(elections));
  if ([...targetIds].some(id => !seats.some(seat => seat.seatId === id))) throw new Error('Unknown election seat');
  return {
    total: seats.length,
    contested: targetIds.size,
    fixed: currentCaucusCounts(seats.filter(seat => !targetIds.has(seat.seatId))),
    currentContested: currentCaucusCounts(seats.filter(seat => targetIds.has(seat.seatId))),
  };
}

type Breakdown = ReturnType<typeof senateBreakdown>;
const neutralGroups = [
  ['none', '会派非所属'], ['unconfirmed', '会派未確認'], ['vacant', '空席'],
] as const;

function fixedLeft(fixed: CaucusCounts): SeatBarSegment[] {
  return [
    {count:fixed.Democratic,label:`非改選・民主党会派 ${fixed.Democratic}`,shortLabel:`非改選 ${fixed.Democratic}`,className:'fixed-d'},
    ...neutralGroups.map(([key,label]) => ({count:fixed[key],label:`非改選・${label} ${fixed[key]}`,className:'fixed-other'})),
  ];
}

function fixedRight(fixed: CaucusCounts): SeatBarSegment {
  return {count:fixed.Republican,label:`非改選・共和党会派 ${fixed.Republican}`,shortLabel:`非改選 ${fixed.Republican}`,className:'fixed-r'};
}

export function senateCompositionSegments(data: Breakdown, counts = data.currentContested): SeatBarSegment[] {
  const segments = [
    ...fixedLeft(data.fixed),
    {count:counts.Democratic,label:`今回改選・民主党会派 ${counts.Democratic}`,shortLabel:String(counts.Democratic),className:'target-d'},
    ...neutralGroups.map(([key,label]) => ({count:counts[key],label:`今回改選・${label} ${counts[key]}`,className:key === 'vacant' ? 'target-vacant' : 'target-other'})),
    {count:counts.Republican,label:`今回改選・共和党会派 ${counts.Republican}`,shortLabel:String(counts.Republican),className:'target-r'},
    fixedRight(data.fixed),
  ];
  prepareSeatBar(segments,data.total);
  return segments;
}

export function senateMajorityPath(data: Breakdown, party: 'Democratic'|'Republican', threshold = Math.floor(data.total / 2) + 1):
  {status:'ready';required:number;segments:SeatBarSegment[];target:SeatBarTarget} | {status:'unavailable';reason:string} {
  if (data.fixed.unconfirmed) return {status:'unavailable',reason:'非改選議席の会派に未確認があるため、必要議席数は要確認。'};
  const required = Math.max(0,threshold - data.fixed[party]);
  if (required > data.contested) return {status:'unavailable',reason:'今回の選挙だけでは届かない。'};
  const label = party === 'Democratic' ? '民主党会派' : '共和党会派';
  const need = {count:required,label:`今回獲得が必要・${label} ${required}`,className:party === 'Democratic' ? 'target-d' : 'target-r'};
  const rest = {count:data.contested - required,label:`今回改選・配分未指定 ${data.contested - required}`,className:'goal-other'};
  const segments = [...fixedLeft(data.fixed),...(party === 'Democratic' ? [need,rest] : [rest,need]),fixedRight(data.fixed)];
  prepareSeatBar(segments,data.total);
  return {status:'ready',required,segments,target:{value:threshold,from:party === 'Democratic' ? 'left' : 'right',label:`${label} ${threshold}議席の位置`}};
}
