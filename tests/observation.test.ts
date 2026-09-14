import { describe, expect, it } from 'vitest';
import { observationData as data, observationFor } from '../src/data/observation';
import type { ObservationEvent } from '../src/data/observation-model';
import { elections, sources } from '../src/data/data';
import { newsItems } from '../src/data/news';
import { evidenceRefs } from '../src/data/research-sources';
import { eventInstant, eventStatus, eventsForRace, monitoringStatus, publishedUpdates } from '../src/observation-logic';
import { observationLeadMarkup, observationComparisonMarkup, observationDecisionMarkup } from '../src/ui/observation';

const now=new Date('2026-09-13T10:00:00Z');
const event=(overrides:Partial<ObservationEvent>={}):ObservationEvent=>{
  const {publicationStatus='published',...rest}=overrides;
  return {
    eventId:'fixture-common',title:'Test event',date:'2026-10-02',time:'08:30',timezone:'America/New_York',status:'scheduled',dateHistory:[],checkedAt:'2026-09-13',evidenceIds:[],
    relevance:['2026-ME-2-regular','2026-AK-2-regular'].map(electionId=>({electionId,why:'背景',watch:'確認点',materialIds:[]})),resultUpdateId:null,...rest,publicationStatus,
  };
};

describe('接戦州の編集データ',()=>{
  it('connects every initial focus race, candidate, and source without orphaned references',()=>{
    const initial=['2026-AK-2-regular','2026-ME-2-regular','2026-MI-2-regular','2026-OH-3-special','2026-TX-2-regular','2026-NH-2-regular'];
    for(const id of initial) expect(observationFor(id),id).toBeDefined();
    const sourceIds=new Set(sources.map(s=>s.sourceId));
    const evidenceIds=new Set(evidenceRefs.map(e=>e.evidenceId));
    expect(sourceIds.size).toBe(sources.length);
    expect(evidenceIds.size).toBe(evidenceRefs.length);
    const refs=(ids:string[])=>ids.forEach(id=>expect(evidenceIds.has(id),id).toBe(true));
    for(const r of data.races){
      const election=elections.find(e=>e.electionId===r.electionId);
      expect(election).toBeDefined();
      expect(r.materials.length).toBeGreaterThan(0);expect(r.materials.length).toBeLessThanOrEqual(2);
      refs(r.evidenceIds);
      r.materials.forEach(m=>{expect(m.fact&&m.meaning&&m.limit).toBeTruthy();expect(m.evidenceIds.length).toBeGreaterThan(0);refs(m.evidenceIds);});
      const comparisonIds=r.comparison[0].cells.map(c=>c.candidateId);
      for(const row of r.comparison){
        expect(row.cells.map(c=>c.candidateId)).toEqual(comparisonIds);
        for(const cell of row.cells){
          expect(election!.candidates.some(c=>c.candidateId===cell.candidateId),cell.candidateId).toBe(true);
          expect(['observed','claim','interpretation','pending']).toContain(cell.kind);
          if(cell.kind!=='pending') expect(cell.evidenceIds.length).toBeGreaterThan(0);
          refs(cell.evidenceIds);
        }
      }
    }
    for(const e of data.evidenceRefs){expect(sourceIds.has(e.sourceId)).toBe(true);expect(e.locator).toBeTruthy();}
    for(const e of data.events){
      expect(['draft','reviewed','published','withdrawn']).toContain(e.publicationStatus);
      refs(e.evidenceIds); expect(e.evidenceIds.length).toBeGreaterThan(0);
      if(e.time) expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(()=>new Intl.DateTimeFormat('ja',{timeZone:e.timezone})).not.toThrow();
      for(const r of e.relevance){
        expect(elections.some(x=>x.electionId===r.electionId)).toBe(true);
        r.materialIds.forEach(id=>expect(data.races.find(x=>x.electionId===r.electionId)?.materials.some(m=>m.materialId===id),id).toBe(true));
      }
      e.dateHistory.forEach(h=>refs(h.evidenceIds));
      if(e.status==='completed') expect(e.resultUpdateId).toBeTruthy();
      if(e.resultUpdateId) expect(data.updates.find(u=>u.updateId===e.resultUpdateId)?.eventId).toBe(e.eventId);
    }
    for(const u of data.updates){
      refs(u.evidenceIds);
      u.electionIds.forEach(id=>expect(elections.some(e=>e.electionId===id)).toBe(true));
      if(u.newsId) expect(newsItems.some(n=>n.newsId===u.newsId)).toBe(true);
      if(u.eventId) expect(data.events.some(e=>e.eventId===u.eventId)).toBe(true);
    }
  });

  it('records partial checks honestly and retains valid source dates',()=>{
    const run=data.monitor.latestRun;
    for(const s of data.sources){
      expect(s.url).toMatch(/^https:\/\//);
      if(s.checkStatus==='checked'){expect(s.contentVerifiedAt).toBeTruthy();expect(s.lastSuccessAt).toBeTruthy();}
      for(const d of [s.publishedAt,s.contentVerifiedAt,s.lastSuccessAt]) if(d) expect(Number.isFinite(Date.parse(d)),s.sourceId).toBe(true);
    }
    for(const id of [...run.checkedSourceIds,...run.pendingSourceIds]) expect(data.sources.some(s=>s.sourceId===id)).toBe(true);
    expect(run.checkedSourceIds.some(id=>run.pendingSourceIds.includes(id))).toBe(false);
    if(run.pendingSourceIds.length) expect(['partial','failed','reviewing']).toContain(run.outcome);
    expect(new Set(data.events.map(e=>e.eventId)).size).toBe(data.events.length);
    expect(new Set(data.updates.map(e=>e.updateId)).size).toBe(data.updates.length);
  });
});

describe('予定の日時と状態',()=>{
  it('keeps Eastern summer and winter times separate from Japanese dates',()=>{
    expect(eventInstant(event({date:'2026-10-02',time:'08:30'}))?.toISOString()).toBe('2026-10-02T12:30:00.000Z');
    expect(eventInstant(event({date:'2026-12-04',time:'08:30'}))?.toISOString()).toBe('2026-12-04T13:30:00.000Z');
    expect(eventInstant(event({date:'2026-10-02',time:null}))).toBeNull();
  });
  it('does not mark a date-only event passed at Japanese midnight',()=>{
    const e=event({date:'2026-10-06',time:null});
    expect(eventStatus(e,new Date('2026-10-07T02:00:00Z'))).toBe('日程確定');
    expect(eventStatus(e,new Date('2026-10-07T04:00:00Z'))).toBe('予定日経過・結果確認待ち');
    expect(e.status).toBe('scheduled');
  });
  it('requires confirmation for completion and distinguishes unknown, postponed and cancelled',()=>{
    expect(eventStatus(event({date:null,time:null}),now)).toBe('発表済み・日程未定');
    expect(eventStatus(event({status:'postponed'}),now)).toBe('延期・新日程待ち');
    expect(eventStatus(event({status:'cancelled'}),now)).toBe('中止');
    expect(eventStatus(event({status:'completed'}),now)).toBe('実施確認');
    expect(eventStatus(event({date:'2026-09-01'}),now)).toBe('予定日経過・結果確認待ち');
  });
  it('centralizes common events and limits initial events to the next 30 days',()=>{
    const fixture=structuredClone(data);
    fixture.events=[event(),...['06','08','13','15'].map(day=>event({eventId:`me-debate-2026-10-${day}`,date:`2026-10-${day}`,time:null,relevance:[{electionId:'2026-ME-2-regular',why:'背景',watch:'確認点',materialIds:[]}]}))];
    const me=eventsForRace(fixture,'2026-ME-2-regular',now);
    expect(me.initial.map(e=>e.date)).toEqual(['2026-10-02','2026-10-06','2026-10-08']);
    expect(me.later.some(e=>e.date==='2026-10-15')).toBe(true);
    const ak=eventsForRace(fixture,'2026-AK-2-regular',now);
    expect(ak.initial[0]).toBe(me.initial[0]);
    const after=eventsForRace(fixture,'2026-ME-2-regular',new Date('2026-10-07T12:00:00Z'));
    expect(after.pending.some(e=>e.eventId==='me-debate-2026-10-06')).toBe(true);
    expect(after.initial.every(e=>eventStatus(e,new Date('2026-10-07T12:00:00Z'))==='日程確定')).toBe(true);
  });
});

describe('公開・確認状態',()=>{
  it('shows overdue and failure independently and never converts failure to no change',()=>{
    const d=structuredClone(data);
    d.monitor.state='scheduled';d.monitor.lastCompletedAt=now.toISOString();d.monitor.latestRun.outcome='unchanged';
    expect(monitoringStatus(d,now)).toEqual(['確認した範囲で重要な変更なし']);
    d.monitor.latestRun.outcome='partial';
    expect(monitoringStatus(d,now)).toEqual(['一部の情報源を未確認']);
    d.monitor.latestRun.outcome='failed';
    expect(monitoringStatus(d,new Date(now.getTime()+37*3600000))).toEqual(['今回の確認に失敗','確認が遅れています']);
    expect(d.monitor.lastCompletedAt).toBe(now.toISOString());
  });
  it('does not expose drafts, reviewed-only or withdrawn updates',()=>{
    const d=structuredClone(data);
    const sample=d.updates[0];
    d.updates=[{...sample,status:'draft'},{...sample,status:'reviewed'},{...sample,status:'withdrawn'},{...sample,updateId:'public',status:'published'}];
    expect(publishedUpdates(d).map(x=>x.updateId)).toEqual(['public']);
  });
  it('escapes research content and keeps all candidate IDs tied to the roster',()=>{
    const r=structuredClone(data.races[0]);
    r.headline='<img src=x onerror=alert(1)>';
    expect(observationLeadMarkup(r)).not.toContain('<img');
    expect(observationLeadMarkup(r)).toContain('&lt;img');
    const e=elections.find(e=>e.electionId===r.electionId)!;
    const html=observationComparisonMarkup(r,e.candidates);
    expect(html).toContain('未確認');
    expect(html).toContain(e.candidates.find(c=>c.candidateId===r.comparison[0].cells[0].candidateId)!.name);
    const me=observationFor('2026-ME-2-regular')!;
    expect(observationDecisionMarkup(me)).toContain('次に確かめたい点');
    expect(observationDecisionMarkup(me)).not.toContain('ニュース・今後の予定');
    expect(observationDecisionMarkup(me)).not.toContain('2026-10-06');
  });
});
