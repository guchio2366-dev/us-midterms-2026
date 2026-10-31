import { describe, expect, it } from 'vitest';
import { observationData as data } from '../src/data/observation';

describe('October 28 final polls, rally results, and ratings', () => {
  it('keeps support, winner expectations, methods, and effects separate', () => {
    const maine = data.updates.find(x => x.updateId === 'obs-update-me-marist-reuters-2026-10-27')!;
    const michigan = data.updates.find(x => x.updateId === 'obs-update-mi-wdiv-poll-2026-10-27')!;
    const texas = data.updates.find(x => x.updateId === 'obs-update-tx-univision-poll-2026-10-27')!;
    expect(maine.happened).toContain('Jackson氏49%・Collins氏47%');
    expect(maine.happened).toContain('Collins氏58%・Jackson氏40%');
    expect(maine.uncertainty).toContain('誤差±6.6ポイント');
    expect(michigan.uncertainty).toContain('誤差±4.0ポイント');
    expect(texas.happened).toContain('登録有権者1,000人');
    expect(texas.uncertainty).toContain('集会の効果も示さない');
  });

  it('cross-references both Texas rally results and records the resolved follow-up', () => {
    for (const id of ['tx-trump-corpus-rally-2026-10-27', 'tx-trump-lubbock-rally-2026-10-27']) {
      const event = data.events.find(x => x.eventId === id)!;
      expect(event.status).toBe('completed');
      expect(data.updates.find(x => x.updateId === event.resultUpdateId)!.eventId).toBe(id);
    }
    expect(data.sources.find(x => x.sourceId === 'obs-kcbd-tx-lubbock-rally-20261027')!.checkStatus).toBe('checked');
    expect(data.monitor.latestRun.pendingSourceIds).not.toContain('obs-kcbd-tx-lubbock-rally-20261027');
  });

  it('keeps confirmed future schedules and cross-references the completed Ohio event', () => {
    expect(data.events.find(x => x.eventId === 'nh-wmur-granite-state-debate-2026-10-28')?.status).toBe('completed');
    expect(data.events.find(x => x.eventId === 'ks-trump-salina-rally-2026-10-31')?.status).toBe('scheduled');
    const ohio = data.events.find(x => x.eventId === 'oh-trump-chillicothe-rally-2026-10-28')!;
    expect(ohio.status).toBe('completed');
    expect(ohio.resultUpdateId).toBe('obs-update-oh-chillicothe-rally-result-2026-10-28');
    expect(data.updates.find(x => x.updateId === ohio.resultUpdateId)?.eventId).toBe(ohio.eventId);
  });

  it('records Sabato changes without changing the integrated allocation', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-ratings-sabato-2026-10-27')!;
    expect(update.happened).toContain('North CarolinaをLean DからLikely D');
    expect(update.happened).toContain('South CarolinaをLikely RからLean R');
    expect(update.meaning).toContain('D43・R44・未配分13を維持');
  });

  it('advances analysis only for races with new verified evidence', () => {
    const dates = Object.fromEntries(data.races.map(race => [race.electionId, race.updatedAt]));
    expect(dates['2026-ME-2-regular']).toBe('2026-10-28');
    expect(dates['2026-MI-2-regular']).toBe('2026-10-31');
    expect(dates['2026-TX-2-regular']).toBe('2026-10-29');
    expect(dates['2026-AK-2-regular']).toBe('2026-10-31');
    expect(dates['2026-OH-3-special']).toBe('2026-10-29');
    expect(dates['2026-NH-2-regular']).toBe('2026-10-31');
  });
});
