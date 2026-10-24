import { describe,expect,it } from 'vitest';
import { observationData as data } from '../src/data/observation';
import { eventInstant } from '../src/observation-logic';
import run from '../docs/observation/runs/daily-20261019.json';

describe('October 19 evidence and partial weekly audit',()=>{
  it('links the retrospective forum without fabricating a time or direct debate',()=>{
    const e=data.events.find(e=>e.eventId==='nh-aarp-forum-2026-10-14')!;
    const u=data.updates.find(u=>u.updateId===e.resultUpdateId)!;
    expect(e.status).toBe('completed');expect(e.time).toBeNull();
    expect(u.eventId).toBe(e.eventId);expect(u.uncertainty).toContain('同席せず');
    expect(e.relevance[0].why).toContain('遡って');
  });
  it('separates the poll from policy effects and withholds the unverified Texas poll',()=>{
    const u=data.updates.find(u=>u.updateId==='obs-update-mi-rasmussen-2026-10-14')!;
    expect(u.happened).toContain('798');expect(u.happened).toContain('46%対44%');
    expect(u.uncertainty).toContain('±3');expect(u.uncertainty).toContain('全クロス集計は未取得');
    expect(data.updates.some(u=>u.evidenceIds.includes('ev-obs-cbs-tx-20261018-pending'))).toBe(false);
    expect(data.sources.find(s=>s.sourceId==='obs-cbs-tx-20261018-pending')!.lastSuccessAt).toBeNull();
  });
  it('uses confirmed remarks times and keeps future events scheduled',()=>{
    const mi=data.events.find(e=>e.eventId==='mi-trump-rally-2026-10-25')!;
    const sc=data.events.find(e=>e.eventId==='sc-trump-rally-2026-10-21')!;
    expect(eventInstant(mi)?.toISOString()).toBe('2026-10-25T19:00:00.000Z');
    expect(eventInstant(sc)?.toISOString()).toBe('2026-10-21T23:00:00.000Z');
    expect(mi.status).toBe('scheduled');expect(mi.resultUpdateId).toBeNull();
    expect(sc.status).toBe('completed');expect(sc.resultUpdateId).toBe('obs-update-sc-trump-rally-2026-10-21');
    expect(mi.relevance[0].why).toContain('McMorran Place Arena');
  });
  it('records every original comparison cell without pretending all sources were rechecked',()=>{
    expect(run.comparisonAudit).toHaveLength(60);
    expect(new Set(run.comparisonAudit.map(a=>[a.electionId,a.candidateId,a.field].join('/'))).size).toBe(60);
    expect(run.outcome).toBe('partial');expect(run.additionalStateAudit).toHaveLength(7);
    expect(run.comparisonAudit.some(a=>a.pendingSourceIds.length>0)).toBe(true);
    expect(run.preserved).toContain('AK/OH analysis dates; ME/TX analysis dates retained for historical-date qualification only');
  });
});
