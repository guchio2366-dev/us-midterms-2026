import { describe, expect, it } from 'vitest';
import { observationData as data } from '../src/data/observation';
import run from '../docs/observation/runs/daily-20261025.json';

describe('October 25 polls, Obama rallies, and heating-oil comparison', () => {
  it('publishes three same-method poll top lines while preserving their limits', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-insider-mi-ia-oh-2026-10-23')!;
    expect(update.happened).toContain('El-Sayed氏47%');
    expect(update.happened).toContain('Hinson氏47%');
    expect(update.happened).toContain('Brown氏47%');
    expect(update.meaning).toContain('誤差±2.83ポイント');
    expect(update.uncertainty).toContain('詳細表・質問文は未掲載');
    expect(data.sources.find(x => x.sourceId === 'obs-insideradvantage-mi-ia-oh-20261023')!.checkStatus).toBe('partial');
  });

  it('links both completed Obama rallies to result updates', () => {
    const ohio = data.events.find(x => x.eventId === 'oh-obama-brown-rally-2026-10-24')!;
    const michigan = data.events.find(x => x.eventId === 'mi-obama-elsayed-rally-2026-10-24')!;
    expect(ohio.status).toBe('completed');
    expect(ohio.resultUpdateId).toBe('obs-update-oh-obama-rally-2026-10-24');
    expect(michigan.status).toBe('completed');
    expect(michigan.resultUpdateId).toBe('obs-update-mi-obama-rally-2026-10-24');
    expect(data.updates.find(x => x.updateId === ohio.resultUpdateId)!.eventId).toBe(ohio.eventId);
    expect(data.updates.find(x => x.updateId === michigan.resultUpdateId)!.eventId).toBe(michigan.eventId);
  });

  it('separates heating-oil prices, campaign responses, and voter evidence', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-heating-oil-ak-me-nh-2026-10-24')!;
    expect(update.electionIds).toEqual(['2026-AK-2-regular', '2026-ME-2-regular', '2026-NH-2-regular']);
    expect(update.happened).toContain('Sununu氏陣営は回答しなかった');
    expect(update.uncertainty).toContain('代表調査ではなく');
    expect(update.uncertainty).toContain('政策不在とは断定しない');
  });

  it('records a partial run without changing the allocation baseline', () => {
    expect(data.revision).toBe('observation-2026-10-30-inside-cnn-debate-rally-changes');
    expect(data.monitor.latestRun.runId).toBe('daily-20261030');
    expect(run.outcome).toBe('partial');
    expect(run.pendingSourceIds).toEqual(expect.arrayContaining([
      'obs-roster-nh',
      'obs-insideradvantage-mi-ia-oh-20261023',
    ]));
    expect(run.note).toContain('D44/R44/未配分12');
    expect(data.sources).toHaveLength(303);
    expect(data.evidenceRefs).toHaveLength(289);
    expect(data.updates).toHaveLength(158);
  });
});
