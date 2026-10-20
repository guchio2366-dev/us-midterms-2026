import { describe, expect, it } from 'vitest';
import { observationData as data } from '../src/data/observation';
import { eventStatus } from '../src/observation-logic';
import run from '../docs/observation/runs/daily-20261020.json';

describe('October 20 poll evidence and pending results', () => {
  it('keeps the Texas third candidate and undecided voters without manufacturing a trend', () => {
    const u = data.updates.find(x => x.updateId === 'obs-update-tx-hobby-2026-10-19')!;
    expect(u.happened).toContain('48%'); expect(u.happened).toContain('46%');
    expect(u.happened).toContain('2,000'); expect(u.happened).toContain('未定3%');
    expect(u.uncertainty).toContain('±2.19'); expect(u.meaning).toContain('支持の移動');
    expect(u.eventDate).toBe('2026-10-19'); expect(u.eventId).toBeNull();
  });
  it('preserves contradictory Ohio polling and separates Alaska first preferences from unresolved transfers', () => {
    const oh = data.updates.find(x => x.updateId === 'obs-update-oh-rasmussen-2026-10-14')!;
    expect(oh.happened).toContain('901'); expect(oh.meaning).toContain('先頭候補が異なる');
    expect(oh.evidenceIds).toContain('ev-obs-yougov-oh-20261007');
    const ak = data.updates.find(x => x.updateId === 'obs-update-ak-rasmussen-2026-10-15')!;
    expect(ak.happened).toContain('775'); expect(ak.happened).toContain('第一希望');
    expect(ak.happened).toContain('Daniel J. Sullivan Jr.');
    expect(ak.uncertainty).toContain('最終再配分値は採用しない');
    expect(ak.uncertainty).toContain('合計99%');
  });
  it('does not certify the Kansas rally merely because the scheduled time passed', () => {
    const e = data.events.find(x => x.eventId === 'ks-trump-rally-2026-10-19')!;
    expect(e.status).toBe('scheduled'); expect(e.resultUpdateId).toBeNull();
    expect(eventStatus(e, new Date(run.completedAt))).toBe('予定日経過・結果確認待ち');
    expect(run.discoveryChecks.some(x => x.status === 'unavailable')).toBe(true);
  });
  it('advances only changed race analyses and retains partial-check dates', () => {
    for (const state of ['AK', 'OH', 'TX']) expect(data.races.find(r => r.electionId.includes(`-${state}-`))!.updatedAt).toBe('2026-10-20');
    for (const [state, date] of [['ME', '2026-10-18'], ['MI', '2026-10-19'], ['NH', '2026-10-19']]) expect(data.races.find(r => r.electionId.includes(`-${state}-`))!.updatedAt).toBe(date);
    expect(run.outcome).toBe('partial'); expect(run.notCheckedSourceIds.length).toBeGreaterThan(0);
    expect(data.sources.find(s => s.sourceId === 'obs-cbs-tx-20261018-pending')!.lastSuccessAt).toBeNull();
  });
});
