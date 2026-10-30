import { describe, expect, it } from 'vitest';
import { observationData as data } from '../src/data/observation';
import run from '../docs/observation/runs/daily-20261022.json';

describe('October 22 polls, early voting, and event outcomes', () => {
  it('keeps Alaska first preferences, simulated transfers, and exhausted-ballot assumptions separate', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-ak-dataforprogress-2026-10-20')!;
    expect(update.happened).toContain('第1順位');
    expect(update.happened).toContain('47%');
    expect(update.happened).toContain('44%');
    expect(update.uncertainty).toContain('消尽票');
    expect(update.uncertainty).toContain('勝敗予測とは扱わない');
    expect(data.races.find(x => x.electionId === '2026-AK-2-regular')!.updatedAt).toBe('2026-10-29');
  });

  it('separates Texas outside spending, candidate fundraising, and voter effects', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-tx-spending-2026-10-21')!;
    expect(update.happened).toContain('5億ドル超');
    expect(update.happened).toContain('2.39億ドル');
    expect(update.meaning).toContain('1.58億ドル');
    expect(update.meaning).toContain('6,400万ドル');
    expect(update.uncertainty).toContain('同じ指標ではない');
    expect(update.uncertainty).toContain('金額から勝敗を予測しない');
    expect(data.races.find(x => x.electionId === '2026-TX-2-regular')!.updatedAt).toBe('2026-10-29');
  });

  it('keeps Michigan poll estimates, winner expectations, and presidential approval separate', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-mi-marist-2026-10-21')!;
    expect(update.happened).toContain('50%');
    expect(update.happened).toContain('48%');
    expect(update.meaning).toContain('勝者予想');
    expect(update.uncertainty).toContain('±4.3');
    expect(update.uncertainty).toContain('別設問');
    const race = data.races.find(x => x.electionId === '2026-MI-2-regular')!;
    expect(race.updatedAt).toBe('2026-10-29');
    expect(race.comparison.find(x => x.key === 'voters')!.cells.every(x => x.evidenceIds.includes('ev-obs-wdiv-mi-20261027'))).toBe(true);
  });

  it('publishes the corrected Georgia poll without changing the rating allocation', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-ga-ajc-2026-10-21')!;
    expect(update.happened).toContain('48%');
    expect(update.happened).toContain('40%');
    expect(update.happened).toContain('未定12%');
    expect(update.uncertainty).toContain('単一調査');
    expect(data.monitor.latestRun.note).toContain('D44/R44/未配分12');
  });

  it('does not turn early-vote volume into candidate support', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-early-vote-2026-10-21')!;
    expect(update.happened).toContain('74%増');
    expect(update.happened).toContain('2倍超');
    expect(update.uncertainty).toContain('投票先を示さず');
    expect(update.uncertainty).toContain('勝敗の予測には使わない');
  });

  it('links the verified North Carolina rally result back to the original event', () => {
    const event = data.events.find(x => x.eventId === 'nc-trump-rally-2026-10-20')!;
    const update = data.updates.find(x => x.updateId === event.resultUpdateId)!;
    expect(event.status).toBe('completed');
    expect(update.eventId).toBe(event.eventId);
    expect(update.happened).toContain('5,000ドル');
    expect(update.uncertainty).toContain('正式連絡');
    expect(update.uncertainty).toContain('効果は未確認');
  });

  it('records live or future items as pending instead of no-change confirmations', () => {
    expect(run.outcome).toBe('partial');
    for (const id of ['obs-gop-sc-rally-20261021','obs-wxyz-mi-debate-20261021','obs-nexstar-ks-debate-20261021']) {
      expect(run.pendingSourceIds).toContain(id);
    }
    for (const id of ['sc-trump-rally-2026-10-21','mi-debate-2026-10-21','ks-debate-2026-10-21']) expect(data.events.find(x => x.eventId === id)!.status).toBe('completed');
  });
});
