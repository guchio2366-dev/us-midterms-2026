import { describe, expect, it } from 'vitest';
import { observationData as data } from '../src/data/observation';
import run from '../docs/observation/runs/daily-20261021.json';

describe('October 21 official jobs data and event outcomes', () => {
  it('links the BLS result back to the scheduled release without claiming candidate effects', () => {
    const event = data.events.find(x => x.eventId === 'bls-state-jobs-2026-10-20')!;
    const update = data.updates.find(x => x.updateId === event.resultUpdateId)!;
    expect(event.status).toBe('completed');
    expect(update.eventId).toBe(event.eventId);
    expect(update.happened).toContain('2.6%');
    expect(update.happened).toContain('15万4,300人');
    expect(update.uncertainty).toContain('候補者支持');
    expect(update.uncertainty).toContain('政策の効果');
  });

  it('marks the Kansas rally complete and separates campaign claims from voter assessment', () => {
    const event = data.events.find(x => x.eventId === 'ks-trump-rally-2026-10-19')!;
    const update = data.updates.find(x => x.updateId === event.resultUpdateId)!;
    expect(event.status).toBe('completed');
    expect(update.eventId).toBe(event.eventId);
    expect(update.meaning).toContain('共和党側');
    expect(update.meaning).toContain('民主党側');
    expect(update.uncertainty).toContain('州全体');
    expect(update.uncertainty).toContain('効果も未確認');
  });

  it('keeps the October 21 live-page limitation while accepting the later verified result', () => {
    const event = data.events.find(x => x.eventId === 'nc-trump-rally-2026-10-20')!;
    expect(event.status).toBe('completed');
    expect(event.resultUpdateId).toBe('obs-update-nc-trump-rally-2026-10-20');
    expect(data.sources.find(x => x.sourceId === 'obs-ap-nc-rally-live-20261020')!.checkStatus).toBe('partial');
    expect(data.sources.find(x => x.sourceId === 'obs-witn-nc-rally-live-20261020')!.lastSuccessAt).toBeNull();
    expect(data.sources.find(x => x.sourceId === 'obs-reuters-nc-rally-result-20261021')!.checkStatus).toBe('checked');
  });

  it('preserves analysis dates and the allocation baseline on a verification-only day', () => {
    expect(data.races.map(r => r.updatedAt)).toEqual([
      '2026-10-18', '2026-10-22', '2026-10-23', '2026-10-22', '2026-10-24', '2026-10-24',
    ]);
    expect(run.outcome).toBe('partial');
    expect(run.preserved).toContain('D43/R44/unallocated13');
    expect(run.eventChecks.find(x => x.eventId === 'nc-trump-rally-2026-10-20')!.status).toBe('in_progress_partial');
  });
});
