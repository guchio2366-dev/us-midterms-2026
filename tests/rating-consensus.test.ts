import { describe,expect,it } from 'vitest';
import { elections } from '../src/data/data';
import { ratingSnapshotObservations } from '../src/data/rating-snapshot';
import { aggregateRatingConsensus,normalizeRatingDirection,ratingConsensusCounts } from '../src/rating-consensus';

describe('senate rating consensus',() => {
  it('normalizes source vocabulary without converting strength into probability',() => {
    expect(normalizeRatingDirection('Safe D')).toBe('D');
    expect(normalizeRatingDirection('Tilt R')).toBe('R');
    expect(normalizeRatingDirection('Toss-up')).toBe('T');
    expect(normalizeRatingDirection('unavailable')).toBeNull();
  });

  it('requires two current organizations and leaves disagreement unassigned',() => {
    const results = aggregateRatingConsensus(['A-2','B-2','C-2'],[
      {seatId:'A-2',organizationId:'sabato',organizationLabel:'Sabato',ratingRaw:'Lean D',currentConfirmedAt:'2026-09-01',sourceId:'a'},
      {seatId:'A-2',organizationId:'inside',organizationLabel:'Inside',ratingRaw:'Tilt D',currentConfirmedAt:'2026-09-02',sourceId:'b'},
      {seatId:'B-2',organizationId:'sabato',organizationLabel:'Sabato',ratingRaw:'Tossup',currentConfirmedAt:'2026-09-01',sourceId:'a'},
      {seatId:'B-2',organizationId:'inside',organizationLabel:'Inside',ratingRaw:'Tilt R',currentConfirmedAt:'2026-09-02',sourceId:'b'},
      {seatId:'C-2',organizationId:'inside',organizationLabel:'Inside',ratingRaw:'Solid R',currentConfirmedAt:'2026-09-02',sourceId:'b'},
    ]);
    expect(results.map(item => item.category)).toEqual(['D','split','missing']);
  });

  it('covers each 2026 senate election once and preserves the 35-seat total',() => {
    const seatIds = elections.map(election => election.seatId);
    const results = aggregateRatingConsensus(seatIds,ratingSnapshotObservations);
    const counts = ratingConsensusCounts(results);
    expect(new Set(results.map(item => item.seatId)).size).toBe(35);
    expect(Object.values(counts).reduce((sum,value) => sum+value,0)).toBe(35);
    expect(counts.missing).toBe(0);
    expect(results.find(item => item.seatId === 'NC-2')?.category).toBe('D');
    expect(results.find(item => item.seatId === 'ME-2')?.category).toBe('split');
  });
});
