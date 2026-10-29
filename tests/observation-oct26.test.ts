import { describe, expect, it } from 'vitest';
import { observationData as data } from '../src/data/observation';

describe('October 26 rally, Alaska schedule, Texas poll, and Monday audit', () => {
  it('links the completed Michigan presidential rally to a sourced result', () => {
    const event = data.events.find(x => x.eventId === 'mi-trump-rally-2026-10-25')!;
    const update = data.updates.find(x => x.updateId === event.resultUpdateId)!;
    expect(event.status).toBe('completed');
    expect(update.eventId).toBe(event.eventId);
    expect(update.uncertainty).toContain('州全体');
    expect(update.meaning).toContain('裏付けなし');
  });

  it('records Peltola postponements without inventing replacement dates', () => {
    for (const id of ['ak-peltola-fairbanks-2026-10-25', 'ak-peltola-bethel-2026-10-26']) {
      const event = data.events.find(x => x.eventId === id)!;
      expect(event.status).toBe('postponed');
      expect(event.date).toBeNull();
      expect(event.time).toBeNull();
      expect(event.dateHistory).toHaveLength(1);
    }
    expect(data.events.find(x => x.eventId === 'ak-peltola-fairbanks-2026-10-25')!.resultUpdateId).toBe('obs-update-ak-peltola-crash-2026-10-25');
  });

  it('keeps the Texas poll tied and separate from prior poll methods', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-tx-rasmussen-2026-10-23')!;
    expect(update.happened).toContain('45%');
    expect(update.happened).toContain('Ted Brown氏5%');
    expect(update.uncertainty).toContain('支持移動とは断定しない');
    expect(data.races.find(x => x.electionId === '2026-TX-2-regular')!.updatedAt).toBe('2026-10-29');
  });

  it('records all sixty focus-race comparison cells for the Monday review', () => {
    expect(data.races).toHaveLength(6);
    expect(data.races.flatMap(r => r.comparison.flatMap(row => row.cells))).toHaveLength(60);
    expect(data.monitor.latestRun.outcome).toBe('partial');
    expect(data.monitor.latestRun.pendingSourceIds.length).toBeGreaterThan(0);
  });
});
