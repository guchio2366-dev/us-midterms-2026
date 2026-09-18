import { describe,expect,it } from 'vitest';
import { elections,seats } from '../src/data/data';
import { ratingSnapshotObservations } from '../src/data/rating-snapshot';
import { aggregateRatingConsensus,consensusDisplayRating,normalizeRatingDirection,ratingConsensusCounts } from '../src/rating-consensus';
import { createRatingSenateBaseline } from '../src/scenario/baseline';

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
    expect(results.find(item => item.seatId === 'ME-2')?.category).toBe('tossup');
  });

  it('shows exactly the six unassigned seats as Toss Up, including New Hampshire',() => {
    const results = aggregateRatingConsensus(elections.map(election => election.seatId),ratingSnapshotObservations);
    const mapSeatIds = results.filter(result => consensusDisplayRating(result) === 'Toss Up').map(result => result.seatId).sort();
    expect(mapSeatIds).toEqual(['AK-2','ME-2','MI-2','NH-2','OH-3','TX-2']);
    const baseline = createRatingSenateBaseline({seats,elections,consensus:results,snapshotId:'test',asOf:'test',methodVersion:'test',seatDataVersion:'test'});
    expect(mapSeatIds).toEqual(Object.entries(baseline.outcomes).filter(([,value]) => value === 'unassigned').map(([seatId]) => seatId).sort());
    expect(elections.find(election => election.seatId === 'NH-2')?.rating.category).toBe('Lean D');
  });

  it('retains Sabato strength only after the direction agrees',() => {
    const results = aggregateRatingConsensus(elections.map(election => election.seatId),ratingSnapshotObservations);
    expect(consensusDisplayRating(results.find(result => result.seatId === 'GA-2'))).toBe('Likely D');
    expect(consensusDisplayRating(results.find(result => result.seatId === 'IA-2'))).toBe('Lean R');
    expect(consensusDisplayRating(results.find(result => result.seatId === 'FL-3'))).toBe('Solid R');
    expect(results.filter(result => / D$/.test(consensusDisplayRating(result)))).toHaveLength(12);
    expect(results.filter(result => / R$/.test(consensusDisplayRating(result)))).toHaveLength(17);
  });

  it('keeps conflicting party directions neutral and missing evidence distinct',() => {
    const results = aggregateRatingConsensus(['A-2','B-2'],[
      {seatId:'A-2',organizationId:'sabato',organizationLabel:'Sabato',ratingRaw:'Lean D',currentConfirmedAt:'2026-09-01',sourceId:'a'},
      {seatId:'A-2',organizationId:'inside',organizationLabel:'Inside',ratingRaw:'Tilt R',currentConfirmedAt:'2026-09-02',sourceId:'b'},
      {seatId:'B-2',organizationId:'sabato',organizationLabel:'Sabato',ratingRaw:'Solid D',currentConfirmedAt:'2026-09-02',sourceId:'a'},
    ]);
    expect(results.map(consensusDisplayRating)).toEqual(['Toss Up','unavailable']);
    expect(consensusDisplayRating(undefined)).toBe('unavailable');
  });
});
