import { describe, expect, it } from 'vitest';
import { observationData as data } from '../src/data/observation';
import { eventInstant } from '../src/observation-logic';
import run from '../docs/observation/runs/daily-20261024.json';

describe('October 24 Alaska lawsuit, New Hampshire poll, and Michigan schedule', () => {
  it('separates the Alaska complaint from a court order and actual ranked-choice tabulation', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-ak-doj-lawsuit-2026-10-22')!;
    expect(update.happened).toContain('全て現職へ移す仮定');
    expect(update.uncertainty).toContain('裁判所の認定ではない');
    expect(update.uncertainty).toContain('差止命令も出ておらず');
    expect(update.uncertainty).toContain('各投票用紙に記された次順位');
    expect(update.evidenceIds).toContain('ev-obs-roster-ak-20261024');
    expect(data.races.find(x => x.electionId === '2026-AK-2-regular')!.updatedAt).toBe('2026-10-26');
  });

  it('keeps New Hampshire ballot preference, favorability, and presidential approval separate', () => {
    const update = data.updates.find(x => x.updateId === 'obs-update-nh-saint-anselm-2026-10-22')!;
    expect(update.happened).toContain('1,672');
    expect(update.happened).toContain('50%');
    expect(update.happened).toContain('43%');
    expect(update.meaning).toContain('好感度');
    expect(update.meaning).toContain('38%');
    expect(update.uncertainty).toContain('別設問');
    expect(data.races.find(x => x.electionId === '2026-NH-2-regular')!.updatedAt).toBe('2026-10-24');
  });

  it('records the confirmed Michigan venue and completed result', () => {
    const event = data.events.find(x => x.eventId === 'mi-trump-rally-2026-10-25')!;
    expect(event.status).toBe('completed');
    expect(event.resultUpdateId).toBe('obs-update-mi-trump-rally-2026-10-25');
    expect(event.title).toContain('Port Huron');
    expect(event.relevance[0].why).toContain('McMorran Place Arena');
    expect(event.relevance[0].why).toContain('Rogers氏も登壇');
    expect(eventInstant(event)?.toISOString()).toBe('2026-10-25T19:00:00.000Z');
  });

  it('records successful and partial checks without changing the allocation baseline', () => {
    expect(run.outcome).toBe('partial');
    expect(run.checkedSourceIds).toContain('obs-courtlistener-ak-certification-complaint-20261022');
    expect(run.pendingSourceIds).toEqual(expect.arrayContaining(['obs-sabato', 'obs-inside', 'obs-white-house']));
    expect(run.note).toContain('D43/R44/未配分13');
    expect(run.runId).toBe('daily-20261024');
    expect(data.monitor.latestRun.runId.localeCompare(run.runId)).toBeGreaterThan(0);
  });
});
