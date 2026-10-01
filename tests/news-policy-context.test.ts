import { describe, expect, it } from 'vitest';
import { elections, seats, sources, states } from '../src/data/data';
import { observationData } from '../src/data/observation';
import { newsItems } from '../src/data/news';
import { evidenceRefs } from '../src/data/research-sources';
import { policyPrototype } from '../src/data/policy-prototype';
import type { ResearchNewsItem } from '../src/data/research-model';
import type { ObservationUpdate } from '../src/data/observation-model';
import { resolvePolicyReadingContext, type PolicyReadingContextInput } from '../src/news-policy-context';

const nc='2026-NC-2-regular',me='2026-ME-2-regular',mi='2026-MI-2-regular';
const input=(source:PolicyReadingContextInput['source']):PolicyReadingContextInput=>({
  source,data:policyPrototype,elections,seats,states,
  sources:[...sources,...observationData.sources],evidence:[...evidenceRefs,...observationData.evidenceRefs],selectedElectionId:me,
});
const unmappedNews=():ResearchNewsItem=>({
  ...structuredClone(newsItems[0]),newsId:'unmapped-reading-material',headline:'Medicaidへの賛成が広がるという見出し',
  relatedElectionIds:[nc],sourceIds:[],evidenceIds:[],issueIds:[],status:'published',
});
const unmappedUpdate=():ObservationUpdate=>({
  updateId:'unmapped-update',status:'published',electionIds:[nc],eventId:null,newsId:null,
  eventDate:'2026-09-28',updatedAt:'2026-10-01',title:'関税と医療についての更新',
  happened:'記録された出来事',meaning:'記録された読み方',uncertainty:'同じ政策版は未確認',evidenceIds:[],
});
function freeze<T>(value:T):T {
  if(value&&typeof value==='object'){
    Object.freeze(value);
    for(const child of Object.values(value))freeze(child);
  }
  return value;
}

describe('transient policy reading context',()=>{
  it('carries an explicitly related North Carolina state without guessing a policy from its title',()=>{
    const context=resolvePolicyReadingContext(input({kind:'news',item:unmappedNews()}))!;
    expect(context.kind).toBe('news');
    expect(context.feedKey).toBe('news:unmapped-reading-material');
    expect(context.selectedElectionId).toBe(nc);
    expect(context.electionIds).toEqual([nc]);
    expect(context.themeId).toBeNull();
    expect(context.policyRef).toBeNull();
    expect(context.checkedAt).toBeNull();
  });
  it('resolves Georgia’s single explicit policy link and preserves the separate reader dates',()=>{
    const item=newsItems.find(item=>item.newsId==='news-ga-ossoff-health-20260918')!;
    const context=resolvePolicyReadingContext(input({kind:'news',item}))!;
    const link=policyPrototype.contextLinks.find(link=>link.feedRefs.some(ref=>ref.kind==='news'&&ref.id===item.newsId))!;
    expect(context.selectedElectionId).toBe('2026-GA-2-regular');
    expect(context.themeId).toBe('healthcare');
    expect(context.policyRef).toEqual(link.policyRefs[0]);
    expect(context.eventDate).toBe('2026-09-18');
    expect(context.publishedAt).toBe('2026-09-18');
    expect(context.checkedAt).toBe('2026-09-30');
    expect(context.sourceIds).toContain(item.sourceIds[0]);
    expect(context.contextLinkIds).toContain(link.linkId);
  });
  it('keeps a policy unselected when one linked material describes several distinct designs',()=>{
    const item=newsItems.find(item=>item.newsId==='news-ks-marshall-health-20260923')!;
    const context=resolvePolicyReadingContext(input({kind:'news',item}))!;
    expect(context.selectedElectionId).toBe('2026-KS-2-regular');
    expect(context.themeId).toBe('healthcare');
    expect(context.policyRef).toBeNull();
  });
  it('uses a shared source for related context without asserting the exact linked policy version',()=>{
    const link=policyPrototype.contextLinks.find(link=>link.linkId==='context-ga-care-denials')!;
    const item=unmappedNews();item.sourceIds=[...link.sourceIds];item.relatedElectionIds=['2026-GA-2-regular'];
    const context=resolvePolicyReadingContext(input({kind:'news',item}))!;
    expect(context.themeId).toBe('healthcare');
    expect(context.contextLinkIds).toContain(link.linkId);
    expect(context.policyRef).toBeNull();
  });
  it('keeps multiple original publication dates separate from site and checked dates',()=>{
    const item=unmappedNews();item.sourceIds=['source-one','source-two'];
    const opts=input({kind:'news',item});
    opts.sources=['2026-09-24','2026-09-30'].map((publishedAt,index)=>({sourceId:index===0?'source-one':'source-two',title:'Original material',publisher:'Publisher',url:'https://example.com/',publishedAt,referencePeriod:'',retrievedAt:'2026-10-01',contentVerifiedAt:'2026-10-01'}));
    const context=resolvePolicyReadingContext(opts)!;
    expect(context.sourcePublicationDates).toEqual(['2026-09-24','2026-09-30']);
    expect(context.publishedAt).toBe(item.publishedAt);
    expect(context.checkedAt).toBe('2026-10-01');
  });
  it('maps a published observation update through its exact feed reference',()=>{
    const item=observationData.updates.find(item=>item.updateId==='obs-update-mi-polls-tariffs-2026-09-17')!;
    const context=resolvePolicyReadingContext(input({kind:'update',item}))!;
    expect(context.feedKey).toBe(`update:${item.updateId}`);
    expect(context.themeId).toBe('tariffs');
    expect(context.policyRef).toBeNull();
    expect(context.fact).toBe(item.happened);
    expect(context.limit).toBe(item.uncertainty);
    expect(context.publishedAt).toBeNull();
  });
  it('does not treat the editorial update date as a source check or publication date',()=>{
    const context=resolvePolicyReadingContext(input({kind:'update',item:unmappedUpdate()}))!;
    expect(context.updatedAt).toBe('2026-10-01');
    expect(context.eventDate).toBe('2026-09-28');
    expect(context.checkedAt).toBeNull();
    expect(context.publishedAt).toBeNull();
    expect(context.themeId).toBeNull();
    expect(context.policyRef).toBeNull();
  });
  it('uses issue references only for a theme and never converts poll topic labels into policy or stance',()=>{
    const item=unmappedNews();
    item.kind='election';item.issueIds=['health-family'];
    let context=resolvePolicyReadingContext(input({kind:'news',item}))!;
    expect(context.themeId).toBe('healthcare');
    expect(context.policyRef).toBeNull();
    expect(context).not.toHaveProperty('stance');
    item.issueIds=['health-family','trade-industry'];
    context=resolvePolicyReadingContext(input({kind:'news',item}))!;
    expect(context.themeId).toBeNull();
    expect(context.policyRef).toBeNull();
  });
  it('preserves the active related state for multi-state material and validates election IDs',()=>{
    const item=unmappedNews();item.relatedElectionIds=[mi,me,'missing-election',mi];
    const context=resolvePolicyReadingContext(input({kind:'news',item}))!;
    expect(context.electionIds).toEqual([mi,me]);
    expect(context.selectedElectionId).toBe(me);
    const byState=resolvePolicyReadingContext({...input({kind:'news',item}),selectedElectionId:null,selectedStateFips:'23'})!;
    expect(byState.selectedElectionId).toBe(me);
  });
  it('preserves the selected state for national material without inventing a related election',()=>{
    const item=unmappedNews();item.relatedElectionIds=[];
    const context=resolvePolicyReadingContext({...input({kind:'news',item}),selectedElectionId:nc})!;
    expect(context.selectedElectionId).toBe(nc);
    expect(context.electionIds).toEqual([]);
    expect(context.policyRef).toBeNull();
  });
  it('rejects unpublished records and an unknown state entry',()=>{
    const item=unmappedNews();item.status='draft';
    expect(resolvePolicyReadingContext(input({kind:'news',item}))).toBeNull();
    const update=unmappedUpdate();update.status='reviewed';
    expect(resolvePolicyReadingContext(input({kind:'update',item:update}))).toBeNull();
    const event=structuredClone(observationData.events[0]);event.publicationStatus='withdrawn';
    expect(resolvePolicyReadingContext(input({kind:'event',item:event}))).toBeNull();
    expect(resolvePolicyReadingContext(input({kind:'state',electionId:'missing-election'}))).toBeNull();
  });
  it('resolves a state entry with its reader name and requires a policy selection',()=>{
    const context=resolvePolicyReadingContext(input({kind:'state',electionId:nc}))!;
    expect(context.kind).toBe('state');
    expect(context.title).toContain(states.find(state=>state.abbr==='NC')!.nameJa);
    expect(context.feedKey).toBeNull();
    expect(context.selectedElectionId).toBe(nc);
    expect(context.themeId).toBeNull();
    expect(context.policyRef).toBeNull();
  });
  it('carries explicit state lens facts and sources while leaving theme and policy unselected',()=>{
    const link=policyPrototype.contextLinks.find(link=>link.linkId==='context-ga-care-denials')!;
    const context=resolvePolicyReadingContext(input({kind:'state',electionId:nc,fact:'既存資料の事実',limit:'未確認の影響',sourceIds:link.sourceIds,evidenceIds:link.evidenceIds}))!;
    expect(context.fact).toBe('既存資料の事実');
    expect(context.limit).toBe('未確認の影響');
    expect(context.sourceIds).toEqual(link.sourceIds);
    expect(context.themeId).toBeNull();
    expect(context.policyRef).toBeNull();
    expect(context.checkedAt).toBe('2026-09-30');
  });
  it('rejects explicitly related states outside the supported workbench instead of silently falling back',()=>{
    const nonFocus=elections.find(election=>!policyPrototype.focusElectionIds.includes(election.electionId))!;
    expect(resolvePolicyReadingContext(input({kind:'state',electionId:nonFocus.electionId}))).toBeNull();
    const item=unmappedNews();item.relatedElectionIds=[nonFocus.electionId];
    expect(resolvePolicyReadingContext(input({kind:'news',item}))).toBeNull();
  });
  it('copies references from frozen inputs without changing their source records',()=>{
    const source={kind:'news' as const,item:structuredClone(newsItems.find(item=>item.newsId==='news-ga-ossoff-health-20260918')!)};
    const opts=freeze(structuredClone(input(source)));
    const before=JSON.stringify(opts);
    const context=resolvePolicyReadingContext(opts)!;
    context.electionIds.push('local-view-only');
    context.policyRef!.versionId='local-view-only';
    expect(JSON.stringify(opts)).toBe(before);
  });
  it('omits executable source URLs without guessing a replacement',()=>{
    const item=unmappedNews();item.sourceIds=['reading-source'];
    const opts=input({kind:'news',item});
    opts.sources=[{sourceId:'reading-source',title:'Source',publisher:'Publisher',url:'javascript:alert(1)',publishedAt:null,referencePeriod:'',retrievedAt:null,contentVerifiedAt:null}];
    expect(resolvePolicyReadingContext(opts)!.url).toBeNull();
  });
});
