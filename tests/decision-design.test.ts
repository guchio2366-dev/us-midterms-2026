import {describe,it,expect} from 'vitest';
import {elections,seats} from '../src/data/data';
import {ratingSnapshotObservations} from '../src/data/rating-snapshot';
import {aggregateRatingConsensus,consensusDisplayRating,consensusLabel} from '../src/rating-consensus';
import {nationalSummary,nationalTarget} from '../src/ui/national-summary';
import {createRatingSenateBaseline} from '../src/scenario/baseline';
import {createScenarioState,countScenarioSenate} from '../src/scenario/model';
import {createSenatePath,generateSenatePaths,diverseSubsets,previewSenatePath,setPathLock,type SenatePathInput} from '../src/scenario/paths';
import {newsItems} from '../src/data/news';
import {observationData} from '../src/data/observation';
import {buildRecentFeed} from '../src/news-feed';
const consensus=aggregateRatingConsensus(elections.map(e=>e.seatId),ratingSnapshotObservations);
const summary=nationalSummary(seats,elections,consensus);
const ratings=new Map(consensus.map(r=>[r.seatId,consensusDisplayRating(r)]));
function input():SenatePathInput {
  return {seats,elections,ratings,caucus:'Republican',threshold:51,scenario:createScenarioState(createRatingSenateBaseline({seats,elections,consensus,snapshotId:'test',asOf:'2026-09-13',methodVersion:'test',seatDataVersion:'test'}))};
}
describe('decision design invariants',()=>{
  it('counts fixed plus contested and explains three thresholds',()=>{
    expect(summary).toMatchObject({Democratic:46,Republican:48,unassigned:6,total:100});
    expect(summary.segments.reduce((n,s)=>n+s.count,0)).toBe(100);
    expect(nationalTarget(summary,'Democratic',51)).toEqual({additional:5,requiredContested:17,beyondUnassigned:0});
    expect(nationalTarget(summary,'Republican',51).additional).toBe(3);
    expect(nationalTarget(summary,'Republican',50).additional).toBe(2);
    expect(nationalTarget(summary,'Democratic',60).beyondUnassigned).toBe(8);
  });
  it('keeps missing, split and tied ratings distinct without changing the unresolved total',()=>{
    const changed=consensus.map(r=>r.category==='tossup'?{...r,category:'missing' as const}:r);
    const next=nationalSummary(seats,elections,changed);
    expect(next.unassigned).toBe(summary.unassigned);
    expect(next.counts.missing).toBe(2);
    expect(consensusLabel(consensus.find(r=>r.category==='split'))).toBe('評価分裂');
    expect(consensusLabel(changed.find(r=>r.category==='missing'))).toBe('評価資料不足');
  });
  it('rejects ambiguous duplicate source inputs instead of choosing by input order',()=>{
    expect(()=>aggregateRatingConsensus(elections.map(e=>e.seatId),[...ratingSnapshotObservations,ratingSnapshotObservations[0]])).toThrow('Duplicate rating');
    expect(()=>nationalSummary(seats,[...elections,elections[0]],consensus)).toThrow('Conflicting elections');
    expect(summary.contested).toBe(35);
    expect(elections.filter(e=>e.type==='special')).toHaveLength(2);
  });
  it('gives varied subsets without calling their intersection necessary',()=>{
    const sets=diverseSubsets(['a','b','c','d','e'],3,3);
    expect(new Set(sets.flat()).size).toBe(5);
    expect(new Set(sets.map(s=>s.join(','))).size).toBe(3);
    expect(sets.every(s=>s.length===3)).toBe(true);
    const result=generateSenatePaths(input());
    expect(result.requiredUnderConstraintsSeatIds).toEqual([]);
    expect(result.boundarySeatIds).toHaveLength(6);
    expect(result.combinationCount).toBe(20);
  });
  it('uses all eligible seats to establish necessity and respects individual locks',()=>{
    const x=input();
    const permitted=['MI-2','NH-2','TX-2'];
    for(const e of elections)if(x.scenario.senateBaseline.outcomes[e.seatId]!=='Republican'&&!permitted.includes(e.seatId))setPathLock(x.scenario,e,true);
    let result=generateSenatePaths(x);
    expect(result.requiredUnderConstraintsSeatIds.sort()).toEqual(permitted.sort());
    expect(result.paths).toHaveLength(1);
    const e=elections.find(e=>e.seatId==='TX-2')!;
    setPathLock(x.scenario,e,true);
    expect(generateSenatePaths(x).status).toBe('locked-impossible');
    setPathLock(x.scenario,e,false);
    expect(generateSenatePaths(x).status).toBe('reached');
  });
  it('previews and exchanges without mutating input, and rejects stale assumptions',()=>{
    const x=input();
    const original=structuredClone(x.scenario);
    const result=generateSenatePaths(x), path=result.paths[0];
    const other=result.candidateSeatIds.find(id=>!path.addedSeatIds.includes(id))!;
    const exchanged=createSenatePath(x,[...path.addedSeatIds.slice(1),other]);
    expect(countScenarioSenate(previewSenatePath(x,exchanged),seats,elections).Republican).toBe(51);
    expect(x.scenario).toEqual(original);
    x.caucus='Democratic';
    expect(()=>previewSenatePath(x,path)).toThrow('stale');
  });
  it('preserves a chosen candidate when locking or applying a different seat',()=>{
    const x=input(),e=elections.find(e=>e.candidates.some(c=>c.caucusIntent==='Republican'))!;
    const candidate=e.candidates.find(c=>c.caucusIntent==='Republican')!;
    x.scenario.senate[e.seatId]={kind:'candidate',electionId:e.electionId,candidateId:candidate.candidateId};
    setPathLock(x.scenario,e,true);
    const saved=structuredClone(x.scenario.senate[e.seatId]);
    const result=generateSenatePaths(x);
    expect(previewSenatePath(x,result.paths[0]).senate[e.seatId]).toEqual(saved);
  });
  it('includes unrated seats when they are needed and does not call them impossible',()=>{
    const x=input();x.ratings=new Map(elections.map(e=>[e.seatId,'unavailable' as const]));
    const result=generateSenatePaths(x);
    expect(result.status).toBe('reached');
    expect(result.paths.every(p=>p.races.every(r=>r.rating==='unavailable'))).toBe(true);
    expect(result.unratedSeatIds.length).toBeGreaterThan(0);
  });
  it('labels editorial analysis with publication date rather than the source event date',()=>{
    const item=buildRecentFeed(newsItems,observationData).find(i=>i.key==='update:obs-update-ssrs-2026-09-09')!;
    expect(item.editorialType).toBe('analysis');expect(item.dateLabel).toMatch(/^掲載 /);
    expect(item.sortDate).toBe('2026-09-13');
  });
});
