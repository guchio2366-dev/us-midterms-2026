import {describe,expect,it} from 'vitest';
import {elections,seats,sources,states,profiles} from '../src/data/data';
import {ratingSnapshotObservations,RATING_METHOD_VERSION,RATING_SNAPSHOT_AS_OF,RATING_SNAPSHOT_ID} from '../src/data/rating-snapshot';
import {aggregateRatingConsensus,ratingConsensusCounts} from '../src/rating-consensus';
import {createRatingSenateBaseline} from '../src/scenario/baseline';
import {createScenarioState,countScenarioSenate} from '../src/scenario/model';
import {briefingElections} from '../src/ui/briefing';
import {briefingEvidenceMarkup} from '../src/ui/briefing-polls';
import {briefingLensMarkup} from '../src/ui/briefing-lens';
import {candidateRosterNotes} from '../src/candidate-roster';
import {tenStateNews,tenStateRaceBriefs,tenStateCandidateBriefs,tenStateSources} from '../src/data/ten-state-research';
import {polls} from '../src/data/research';
import {buildRecentFeed,filterFeed} from '../src/news-feed';
import {newsItems} from '../src/data/news';
import {observationData} from '../src/data/observation';

describe('ten-state baseline and sourced additions',()=>{
  it('allocates D9/R14 of 35 contested seats on top of the unchanged D34/R31 held seats',()=>{
    const consensus=aggregateRatingConsensus(elections.map(e=>e.seatId),ratingSnapshotObservations);
    expect(ratingConsensusCounts(consensus)).toEqual({D:9,R:14,lean:6,tossup:2,split:4,missing:0});
    const baseline=createRatingSenateBaseline({seats,elections,consensus,snapshotId:RATING_SNAPSHOT_ID,asOf:RATING_SNAPSHOT_AS_OF,methodVersion:RATING_METHOD_VERSION,seatDataVersion:'test'});
    expect(countScenarioSenate(createScenarioState(baseline),seats,elections)).toEqual({Democratic:43,Republican:45,none:0,unconfirmed:0,vacant:0,unassigned:12});
    const neutral=Object.entries(baseline.outcomes).filter(([,value])=>value==='unassigned').map(([id])=>id).sort();
    expect(briefingElections(elections,seats,states,consensus).map(e=>e.seatId).sort()).toEqual(neutral);
  });
  it('preserves all four existing candidate identities and excludes unverified third-candidate ballot claims',()=>{
    const ga=elections.find(e=>e.seatId==='GA-2')!,ks=elections.find(e=>e.seatId==='KS-2')!;
    expect(ga.candidates.map(c=>c.candidateId)).toEqual(['cand-ga-mike-collins','cand-ga-jon-ossoff']);
    expect(ks.candidates.map(c=>c.candidateId)).toEqual(['cand-ks-adam-hamilton','cand-ks-roger-marshall']);
    expect(ga.candidateResearchStatus).toBe('partial');expect(ks.candidateResearchStatus).toBe('partial');
    expect(candidateRosterNotes['GA-2']).toContain('DISQUALIFIED');
    expect(candidateRosterNotes['KS-2']).toContain('David Graham');
    expect(tenStateCandidateBriefs).toHaveLength(4);
    expect(profiles.find(p=>p.stateFips==='20')!.electionMeaning.text).toContain('州の全名簿');
  });
  it.each(['2026-GA-2-regular','2026-KS-2-regular'])('offers sourced hypotheses and honest poll coverage for %s',electionId=>{
    const brief=tenStateRaceBriefs.find(b=>b.electionId===electionId)!;
    expect(brief.completeness).toBe('partial');expect(brief.analysis.every(a=>a.evidenceKind==='hypothesis')).toBe(true);
    expect(polls.filter(p=>p.electionId===electionId)).toEqual([]);
    expect(briefingEvidenceMarkup(polls,electionId)).toContain('本選世論調査の原票は今回未収録');
    expect(briefingLensMarkup(electionId)).not.toContain('data-poll-id=');
    const feed=filterFeed(buildRecentFeed(newsItems,observationData),electionId);
    expect(feed.some(item=>item.sourceKind==='news')).toBe(true);
    expect(feed.every(item=>item.relatedElectionIds.includes(electionId))).toBe(true);
  });
  it('separates publication dates, confirmation dates and actual procedural progress',()=>{
    const health=tenStateNews.find(n=>n.relatedElectionIds.includes('2026-KS-2-regular'))!;
    expect(health).toMatchObject({eventDate:'2026-09-23',publishedAt:'2026-09-23',updatedAt:'2026-09-30',policyStage:'proposal'});
    expect(health.summary).toContain('可決・成立');
    expect(tenStateNews.find(n=>n.relatedElectionIds.includes('2026-GA-2-regular'))!.summary).toContain('無作為');
    expect(tenStateSources.find(s=>s.sourceId==='ten-ks-hamilton-platform')).toMatchObject({publishedAt:null,contentVerifiedAt:'2026-09-30'});
    expect(sources.find(s=>s.sourceId==='sabato-senate-2026')!.contentVerifiedAt).toBe('2026-10-07');
    expect(sources.find(s=>s.sourceId==='inside-senate-ratings-2026')!.updatedAt).toBe('2026-10-01');
    expect(sources.find(s=>s.sourceId==='inside-senate-ratings-2026')!.contentVerifiedAt).toBe('2026-10-02');
  });
});
