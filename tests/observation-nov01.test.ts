import { describe, expect, it } from 'vitest';
import { observationData as data } from '../src/data/observation';
import run from '../docs/observation/runs/daily-20261101.json';

describe('November 1 final-week polling, event change, and Alaska follow-up', () => {
  it('records all three Data for Progress polls as one limited comparison', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-dfp-me-mi-tx-polls-2026-10-30')!;
    expect(update.happened).toContain('Jackson氏50%・共和党現職Susan Collins氏45%');
    expect(update.happened).toContain('El-Sayed氏50%・共和党Mike Rogers氏46%');
    expect(update.happened).toContain('Talarico氏49%・共和党Ken Paxton氏45%');
    expect(update.meaning).toContain('誤差±4ポイント');
    expect(update.uncertainty).toContain('単一波');
    expect(update.uncertainty).toContain('勝率・確定結果・政策効果として扱わない');
  });

  it('reconciles the failed Michigan unity appearance with the original event', () => {
    const event = data.events.find(x => x.eventId === 'mi-elsayed-stevens-clyburn-gotv-2026-11-01')!;
    const update = data.updates.find(x => x.updateId === event.resultUpdateId)!;
    expect(event.status).toBe('scheduled');
    expect(event.title).toContain('Stevens氏不参加');
    expect(event.dateHistory[0].reason).toContain('共同登壇予定は不成立');
    expect(update.eventId).toBe(event.eventId);
    expect(update.uncertainty).toContain('外部団体');
    expect(update.uncertainty).toContain('得票効果を示さない');
  });

  it('separates Alaska interviews, donor counterevidence, and legal findings', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-ak-probe-donors-response-2026-10-31')!;
    expect(update.happened).toContain('任意聴取');
    expect(update.happened).toContain('欺かれたとは感じない');
    expect(update.happened).toContain('関与を否定');
    expect(update.uncertainty).toContain('犯罪成立・起訴・有罪');
    expect(update.uncertainty).toContain('違法認定は未確認');
  });

  it('records partial checks and preserves the integrated allocation', () => {
    expect(run.outcome).toBe('partial');
    expect(run.eventChecks.find(x => x.eventId === 'mi-rogers-bus-tour-2026-10-31')?.status).toBe('result-unconfirmed');
    expect(run.pendingSourceIds).toContain('obs-rogers-bus-tour-20261030');
    expect(data.monitor.latestRun.note).toContain('D44/R44/未配分12');
  });
});
