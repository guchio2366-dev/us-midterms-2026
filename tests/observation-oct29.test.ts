import { describe, expect, it } from 'vitest';
import { observationData as data } from '../src/data/observation';

describe('October 29 final-week evidence and event reconciliation', () => {
  it('attributes the Alaska recruitment report and preserves the denials and legal uncertainty', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-ak-spoiler-report-2026-10-28')!;
    expect(update.happened).toContain('Peltola陣営関係者');
    expect(update.happened).toContain('関与を否定');
    expect(update.uncertainty).toContain('違法認定');
    expect(update.uncertainty).toContain('連邦訴訟の却下判断も未了');
  });

  it('records the final Ohio and Michigan polls with method limits', () => {
    const ohio = data.updates.find(x => x.updateId === 'obs-update-oh-suffolk-poll-2026-10-28')!;
    const michigan = data.updates.find(x => x.updateId === 'obs-update-mi-mitchell-poll-2026-10-28')!;
    expect(ohio.happened).toContain('46.6%');
    expect(ohio.happened).toContain('43.8%');
    expect(ohio.uncertainty).toContain('±4.4ポイント');
    expect(michigan.happened).toContain('投票予定者636人');
    expect(michigan.uncertainty).toContain('±3.9ポイント');
    expect(michigan.uncertainty).toContain('勝敗確定');
  });

  it('links completed and canceled event results to their original rows', () => {
    const ohio = data.events.find(x => x.eventId === 'oh-trump-chillicothe-rally-2026-10-28')!;
    const nh = data.events.find(x => x.eventId === 'nh-nhpr-senate-forum-2026-10-29')!;
    expect(ohio.status).toBe('completed');
    expect(nh.status).toBe('canceled');
    for (const event of [ohio, nh]) {
      expect(data.updates.find(x => x.updateId === event.resultUpdateId)?.eventId).toBe(event.eventId);
    }
  });

  it('resolves the Lubbock partial check without converting campaign claims into effects', () => {
    const source = data.sources.find(x => x.sourceId === 'obs-kcbd-tx-lubbock-rally-20261027')!;
    const update = data.updates.find(x => x.updateId === 'obs-update-tx-lubbock-rally-result-2026-10-27')!;
    expect(source.checkStatus).toBe('checked');
    expect(update.happened).toContain('Paxton氏も登壇');
    expect(update.uncertainty).toContain('政策の実測効果');
    expect(data.monitor.latestRun.pendingSourceIds).not.toContain(source.sourceId);
  });

  it('adds only confirmed presidential schedules and preserves the integrated baseline', () => {
    expect(data.events.find(x => x.eventId === 'sc-trump-rockhill-rally-2026-10-29')?.status).toBe('completed');
    expect(data.events.find(x => x.eventId === 'ia-trump-dubuque-rally-2026-11-01')?.status).toBe('canceled');
    expect(data.monitor.latestRun.note).toContain('D44/R44/未配分12');
    expect(data.revision).toBe('observation-2026-10-30-inside-cnn-debate-rally-changes');
  });
});
