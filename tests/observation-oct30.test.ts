import { describe, expect, it } from 'vitest';
import { observationData as data } from '../src/data/observation';
import { RATING_SNAPSHOT_AS_OF, ratingSnapshotObservations } from '../src/data/rating-snapshot';

describe('October 30 ratings, polling and event reconciliation', () => {
  it('records the October 29 Inside Elections changes and new integrated allocation', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-ratings-inside-2026-10-29')!;
    expect(update.happened).toContain('GeorgiaをLikely D');
    expect(update.meaning).toContain('D44・R44・未配分12');
    expect(RATING_SNAPSHOT_AS_OF).toBe('2026-10-30');
    expect(ratingSnapshotObservations.find(x => x.organizationId === 'inside' && x.seatId === 'GA-2')?.ratingRaw).toBe('Likely D');
  });

  it('keeps poll results, samples and uncertainty together', () => {
    const source = data.sources.find(x => x.sourceId === 'obs-ssrs-cnn-four-state-20261029')!;
    const update = data.updates.find(x => x.updateId === 'obs-update-cnn-ssrs-four-state-2026-10-29')!;
    expect(source.method).toContain('MI768・TX923・ME783・KS838');
    expect(update.happened).toContain('El-Sayed氏49%・Rogers氏42%');
    expect(update.happened).toContain('Talarico氏49%・Paxton氏43%');
    expect(update.uncertainty).toContain('単一調査で勝敗は確定しない');
  });

  it('links the completed New Hampshire debate to its result', () => {
    const event = data.events.find(x => x.eventId === 'nh-wmur-granite-state-debate-2026-10-28')!;
    expect(event.status).toBe('completed');
    const update = data.updates.find(x => x.updateId === event.resultUpdateId)!;
    expect(update.eventId).toBe(event.eventId);
    expect(update.happened).toContain('LIHEAP');
    expect(update.uncertainty).toContain('政策効果');
  });

  it('preserves the cancellations and records the later Kansas and Iowa reinstatements', () => {
    const sc = data.events.find(x => x.eventId === 'sc-trump-rockhill-rally-2026-10-29')!;
    const ks = data.events.find(x => x.eventId === 'ks-trump-salina-rally-2026-10-31')!;
    const ia = data.events.find(x => x.eventId === 'ia-trump-dubuque-rally-2026-11-01')!;
    expect([sc.status, ks.status, ia.status]).toEqual(['completed', 'scheduled', 'scheduled']);
    expect(ks.dateHistory[0]?.date).toBe('2026-10-31');
    expect(ia.dateHistory[0]?.date).toBe('2026-11-01');
    for (const event of [sc, ks, ia]) {
      expect(data.updates.find(x => x.updateId === event.resultUpdateId)?.eventId).toBe(event.eventId);
    }
  });

  it('separates Alaska investigations from a legal finding', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-ak-spoiler-report-2026-10-28')!;
    expect(update.happened).toContain('州捜査');
    expect(update.uncertainty).toContain('違法認定');
    expect(update.uncertainty).toContain('勝敗や得票効果へ結び付けない');
  });

  it('keeps partial and pending source checks explicit', () => {
    const whiteHouse = data.sources.find(x => x.sourceId === 'obs-white-house')!;
    expect(whiteHouse.checkStatus).toBe('partial');
    expect(data.monitor.latestRun.pendingSourceIds).toContain('obs-white-house');
    expect(data.monitor.latestRun.outcome).toBe('partial');
  });
});
