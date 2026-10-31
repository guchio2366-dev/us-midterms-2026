import { describe, expect, it } from 'vitest';
import { observationData as data } from '../src/data/observation';
import { RATING_SNAPSHOT_AS_OF, ratingSnapshotObservations } from '../src/data/rating-snapshot';

describe('October 31 ratings, investigations, polls and event reconciliation', () => {
  it('records the Sabato changes without changing the integrated allocation', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-ratings-sabato-2026-10-30')!;
    expect(update.happened).toContain('MinnesotaをLean DからLikely D');
    expect(update.happened).toContain('LouisianaをSafe RからLikely R');
    expect(update.meaning).toContain('D44・R44・未配分12は変わらない');
    expect(RATING_SNAPSHOT_AS_OF).toBe('2026-10-30');
    expect(ratingSnapshotObservations.find(x => x.organizationId === 'sabato' && x.seatId === 'MN-2')?.ratingRaw).toBe('Likely D');
    expect(ratingSnapshotObservations.find(x => x.organizationId === 'sabato' && x.seatId === 'LA-2')?.ratingRaw).toBe('Likely R');
  });

  it('separates the Alaska criminal investigation from a legal finding', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-ak-doj-criminal-probe-2026-10-30')!;
    expect(update.happened).toContain('刑事捜査');
    expect(update.meaning).toContain('関与を否定');
    expect(update.uncertainty).toContain('具体的な違反法令');
    expect(update.uncertainty).toContain('起訴');
    expect(update.uncertainty).toContain('違法認定');
  });

  it('keeps the UMass and MSU poll methods and limits with their toplines', () => {
    const nh = data.updates.find(x => x.updateId === 'obs-update-nh-uml-poll-2026-10-28')!;
    const mi = data.updates.find(x => x.updateId === 'obs-update-mi-msu-poll-2026-10-26')!;
    expect(nh.happened).toContain('投票予定者600人');
    expect(nh.uncertainty).toContain('±5ポイント');
    expect(mi.happened).toContain('48.0%');
    expect(mi.uncertainty).toContain('部分標本数とその誤差を示していない');
  });

  it('preserves canceled rally history and links the reinstated schedules to results', () => {
    const ia = data.events.find(x => x.eventId === 'ia-trump-dubuque-rally-2026-11-01')!;
    const ks = data.events.find(x => x.eventId === 'ks-trump-salina-rally-2026-10-31')!;
    expect([ia.status, ia.date, ia.time]).toEqual(['scheduled', '2026-11-01', '15:00']);
    expect([ks.status, ks.date, ks.time]).toEqual(['scheduled', '2026-11-01', '19:00']);
    for (const event of [ia, ks]) {
      expect(event.dateHistory).toHaveLength(1);
      expect(data.updates.find(x => x.updateId === event.resultUpdateId)?.eventId).toBe(event.eventId);
    }
  });

  it('adds only confirmed Michigan campaign schedules and keeps unknown time null', () => {
    const unity = data.events.find(x => x.eventId === 'mi-elsayed-stevens-clyburn-gotv-2026-11-01')!;
    const bus = data.events.find(x => x.eventId === 'mi-rogers-bus-tour-2026-10-31')!;
    expect(unity.status).toBe('scheduled');
    expect(unity.time).toBeNull();
    expect(bus.time).toBe('09:00');
  });

  it('keeps the Texas Quantus item partial and unpublished without an original report', () => {
    const source = data.sources.find(x => x.sourceId === 'obs-quantus-tx-20261030')!;
    expect(source.checkStatus).toBe('partial');
    expect(data.evidenceRefs.some(x => x.sourceId === source.sourceId)).toBe(false);
    expect(data.monitor.latestRun.pendingSourceIds).toContain(source.sourceId);
  });
});
