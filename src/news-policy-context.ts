import type { Election, Seat, Source, State } from './data/model';
import type { ObservationEvent, ObservationUpdate } from './data/observation-model';
import type { EvidenceRef, ResearchNewsItem } from './data/research-model';
import type { PolicyPrototypeData, PolicyRef, PolicyThemeId } from './data/policy-prototype-model';

/** Reading state only. Never attach this object to a scenario or its share payload. */
interface PolicyReadingDetails {
  title:string;
  summary:string;
  fact:string|null;
  limit:string|null;
  url:string|null;
  eventDate:string|null;
  /** News publication on this site; original source dates are separate. */
  publishedAt:string|null;
  sourcePublicationDates:string[];
  checkedAt:string|null;
  updatedAt:string|null;
  electionIds:string[];
  selectedElectionId:string|null;
  issueIds:string[];
  sourceIds:string[];
  evidenceIds:string[];
  contextLinkIds:string[];
  themeId:PolicyThemeId|null;
  policyRef:PolicyRef|null;
}
export type PolicyReadingContext = PolicyReadingDetails & (
  | {kind:'news';feedKey:`news:${string}`}
  | {kind:'update';feedKey:`update:${string}`}
  | {kind:'event';feedKey:`event:${string}`}
  | {kind:'state';feedKey:null}
);
export type PolicyReadingSource =
  | {kind:'news';item:ResearchNewsItem}
  | {kind:'update';item:ObservationUpdate}
  | {kind:'event';item:ObservationEvent}
  | {kind:'state';electionId:string;title?:string;summary?:string;fact?:string;limit?:string;sourceIds?:string[];evidenceIds?:string[]};
export interface PolicyReadingContextInput {
  source:PolicyReadingSource;
  selectedElectionId?:string|null;
  selectedStateFips?:string|null;
  data:PolicyPrototypeData;
  elections:Election[];
  seats?:Seat[];
  states?:State[];
  sources?:Source[];
  evidence?:EvidenceRef[];
}
const unique=(ids:string[])=>[...new Set(ids)];
const refKey=(ref:PolicyRef)=>`${ref.policyId}@${ref.versionId}`;
const latest=(dates:(string|null|undefined)[])=>dates.filter((date):date is string=>!!date).sort().at(-1)??null;
function publicUrl(raw:string|undefined):string|null {
  if(!raw)return null;
  try {const url=new URL(raw);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}
}

/** Resolves explicit references; titles, poll results and party never select a policy. */
export function resolvePolicyReadingContext(input:PolicyReadingContextInput):PolicyReadingContext|null {
  const {source,data,elections}=input;
  if(source.kind==='news'&&source.item.status!=='published')return null;
  if(source.kind==='update'&&source.item.status!=='published')return null;
  if(source.kind==='event'&&source.item.publicationStatus!=='published')return null;
  const validElections=new Set(elections.map(e=>e.electionId));
  if(source.kind==='state'&&(!validElections.has(source.electionId)||!data.focusElectionIds.includes(source.electionId)))return null;
  const evidence=new Map([...(input.evidence??[]),...data.additionalEvidence].map(entry=>[entry.evidenceId,entry]));
  const evidenceIds=unique(source.kind==='state'?source.evidenceIds??[]:source.item.evidenceIds);
  const sourceIds=unique([
    ...(source.kind==='news'?source.item.sourceIds:source.kind==='state'?source.sourceIds??[]:[]),
    ...evidenceIds.flatMap(id=>{const entry=evidence.get(id);return entry?[entry.sourceId]:[];}),
  ]);
  const directIds=source.kind==='news'?source.item.relatedElectionIds:source.kind==='update'?source.item.electionIds:source.kind==='event'?source.item.relevance.map(ref=>ref.electionId):[source.electionId];
  const electionIds=unique(directIds).filter(id=>validElections.has(id));
  const focusIds=electionIds.filter(id=>data.focusElectionIds.includes(id));
  if(directIds.length&&!focusIds.length)return null;
  const issueIds=source.kind==='news'?unique(source.item.issueIds):[];
  const matchesFeed=(link:PolicyPrototypeData['contextLinks'][number])=>link.feedRefs.some(ref=>source.kind==='news'?ref.kind==='news'&&ref.id===source.item.newsId:source.kind==='update'?ref.kind==='observation-update'&&ref.id===source.item.updateId:false);
  const links=source.kind==='state'?[]:data.contextLinks.filter(link=>
    matchesFeed(link)
    ||link.sourceIds.some(id=>sourceIds.includes(id))
    ||link.evidenceIds.some(id=>evidenceIds.includes(id))
  );
  const themes=unique([
    ...links.map(link=>link.themeId),
    ...data.themes.filter(theme=>theme.issueIds.some(id=>issueIds.includes(id))).map(theme=>theme.themeId),
  ]).filter(id=>data.themes.some(theme=>theme.themeId===id));
  const themeId=themes.length===1?themes[0] as PolicyThemeId:null;
  // Shared source pages may cover several designs or dates. Only an explicit feed link selects a version.
  const policyRefs=new Map(links.filter(matchesFeed).flatMap(link=>link.policyRefs).filter(ref=>data.policies.some(policy=>refKey(policy)===refKey(ref)&&policy.themeId===themeId)).map(ref=>[refKey(ref),ref]));
  const mappedPolicy=themeId&&policyRefs.size===1?[...policyRefs.values()][0]:null;
  const validSelected=input.selectedElectionId&&validElections.has(input.selectedElectionId)&&data.focusElectionIds.includes(input.selectedElectionId)?input.selectedElectionId:null;
  const sameState=focusIds.find(id=>{
    const election=elections.find(e=>e.electionId===id);
    return input.selectedStateFips&&input.seats?.some(seat=>seat.seatId===election?.seatId&&seat.stateFips===input.selectedStateFips);
  });
  const selectedElectionId=focusIds.length?(validSelected&&focusIds.includes(validSelected)?validSelected:sameState??focusIds[0]):validSelected;
  const materialSources=sourceIds.flatMap(id=>{const entry=input.sources?.find(item=>item.sourceId===id);return entry?[entry]:[];});
  const checkedAt=source.kind==='event'?source.item.checkedAt:latest([
    ...evidenceIds.map(id=>evidence.get(id)?.checkedAt),
    ...materialSources.map(item=>item.contentVerifiedAt),
  ]);
  const details:PolicyReadingDetails={
    title:'',summary:'',fact:null,limit:null,
    url:materialSources.map(item=>publicUrl(item.url)).find(url=>url!==null)??null,
    eventDate:null,publishedAt:null,sourcePublicationDates:unique(materialSources.flatMap(item=>item.publishedAt?[item.publishedAt]:[])),checkedAt,updatedAt:null,
    electionIds,selectedElectionId,issueIds,sourceIds,evidenceIds,
    contextLinkIds:links.map(link=>link.linkId),themeId,
    policyRef:mappedPolicy?{policyId:mappedPolicy.policyId,versionId:mappedPolicy.versionId}:null,
  };
  if(source.kind==='news') {
    const item=source.item;
    return {...details,kind:'news',feedKey:`news:${item.newsId}`,title:item.headline,summary:item.summary,fact:item.whatChanged||null,limit:item.possibleImpact||null,eventDate:item.eventDate,publishedAt:item.publishedAt,updatedAt:item.updatedAt};
  }
  if(source.kind==='update') {
    const item=source.item;
    return {...details,kind:'update',feedKey:`update:${item.updateId}`,title:item.title,summary:item.meaning,fact:item.happened,limit:item.uncertainty,eventDate:item.eventDate,updatedAt:item.updatedAt};
  }
  if(source.kind==='event') {
    const item=source.item;
    const related=item.relevance.filter(ref=>!selectedElectionId||ref.electionId===selectedElectionId);
    return {...details,kind:'event',feedKey:`event:${item.eventId}`,title:item.title,summary:unique(related.map(ref=>ref.why)).join(' / '),limit:unique(related.map(ref=>ref.watch)).join(' / ')||null,eventDate:item.date};
  }
  const election=elections.find(item=>item.electionId===source.electionId)!;
  const seat=input.seats?.find(item=>item.seatId===election.seatId);
  const state=input.states?.find(item=>item.fips===seat?.stateFips);
  const stateName=state?.nameJa??election.electionId.split('-')[1]??'選択した州';
  return {...details,kind:'state',feedKey:null,title:source.title??`${stateName}の判断材料`,summary:source.summary??'この州の候補者と材料を確認し、共通前提と選択の理由を考えます。',fact:source.fact??null,limit:source.limit??null};
}
