import type { Election, Seat } from '../data/model';
import { baselineCaucus } from '../logic';
import type { RatingConsensusSeat } from '../rating-consensus';
import type { SenateBaselineSnapshot, SenateOutcome } from './model';

export function createRatingSenateBaseline(input: {seats:Seat[];elections:Election[];consensus:RatingConsensusSeat[];snapshotId:string;asOf:string;methodVersion:string;seatDataVersion:string}): SenateBaselineSnapshot {
  const electionSeatIds = new Set(input.elections.map(election => election.seatId));
  const categoryBySeat = new Map(input.consensus.map(result => [result.seatId,result.category]));
  const outcomes: Record<string,SenateOutcome> = {};
  for (const seat of input.seats) {
    if (!electionSeatIds.has(seat.seatId)) outcomes[seat.seatId] = baselineCaucus(seat);
    else {
      const category = categoryBySeat.get(seat.seatId);
      outcomes[seat.seatId] = category === 'D' ? 'Democratic' : category === 'R' ? 'Republican' : 'unassigned';
    }
  }
  return {kind:'rating-consensus',snapshotId:input.snapshotId,asOf:input.asOf,methodVersion:input.methodVersion,seatDataVersion:input.seatDataVersion,outcomes};
}

export function createLegacySenateBaseline(seats: Seat[], snapshotId = 'legacy-holdings-research03-2026-09-12'): SenateBaselineSnapshot {
  return {kind:'legacy-holdings',snapshotId,asOf:'2026-09-12',methodVersion:null,seatDataVersion:'research03-2026-09-12',outcomes:Object.fromEntries(seats.map(seat => [seat.seatId,baselineCaucus(seat)]))};
}
