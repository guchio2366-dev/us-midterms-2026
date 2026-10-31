import { describe, expect, it } from 'vitest';
import { observationData as data } from '../src/data/observation';

describe('October 27 Alaska litigation, New Hampshire poll, tariffs, and final-week rallies', () => {
  it('separates the Alaska candidate registration record from the unresolved federal lawsuit', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-ak-sullivan-registration-lawsuit-2026-10-26')!;
    expect(update.happened).toContain('Daniel J. Sullivan Jr.');
    expect(update.happened).toContain('Lisa Murkowski');
    expect(update.uncertainty).toContain('裁判官の判断は未了');
    expect(update.evidenceIds).toContain('ev-obs-reuters-ak-dismissal-motion-20261026');
  });

  it('records the complete New Hampshire poll choices and method limits', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-nh-rasmussen-2026-10-26')!;
    expect(update.happened).toContain('50%');
    expect(update.happened).toContain('44%');
    expect(update.happened).toContain('Edmond Laplante氏4%');
    expect(update.uncertainty).toContain('支持移動');
    expect(data.races.find(x => x.electionId === '2026-NH-2-regular')!.updatedAt).toBe('2026-10-31');
  });

  it('keeps tariff implementation and effects separate', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-me-tariff-exemptions-2026-10-23')!;
    expect(update.happened).toContain('10月30日発効予定');
    expect(update.uncertainty).toContain('実測効果は未確認');
    expect(data.races.find(x => x.electionId === '2026-ME-2-regular')!.updatedAt).toBe('2026-10-28');
  });

  it('adds only confirmed presidential campaign schedules without assuming candidate attendance', () => {
    for (const id of ['tx-trump-corpus-rally-2026-10-27','tx-trump-lubbock-rally-2026-10-27']) {
      const event = data.events.find(x => x.eventId === id)!;
      expect(event.status).toBe('completed');
      expect(event.resultUpdateId).not.toBeNull();
      expect(data.updates.find(x => x.updateId === event.resultUpdateId)!.eventId).toBe(id);
    }
    const ohio = data.events.find(x => x.eventId === 'oh-trump-chillicothe-rally-2026-10-28')!;
    expect(ohio.status).toBe('completed');
    expect(ohio.resultUpdateId).toBe('obs-update-oh-chillicothe-rally-result-2026-10-28');
  });
});
