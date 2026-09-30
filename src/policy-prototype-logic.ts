import type { Election, PowerRule, Seat, Source } from './data/model';
import type { EvidenceRef, ResearchNewsItem, RollCallVote } from './data/research-model';
import type { ObservationUpdate } from './data/observation-model';
import type { CandidatePolicyRecord, PolicyPrototypeData, PolicyRef } from './data/policy-prototype-model';
import { countScenarioSenate, candidateForChoice, scenarioOutcomeForSeat, type ScenarioState } from './scenario/model';
import { compareScenarioReasoning, reasonChoiceIsCurrent } from './scenario/reasoning';

export const policyKey=(ref:PolicyRef)=>`${ref.policyId}@${ref.versionId}`;
const validDate=(date:string)=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date;
export interface PolicyDependencies {
  elections:Election[];sources:Source[];evidence:EvidenceRef[];
  news:ResearchNewsItem[];updates:ObservationUpdate[];rollCalls:RollCallVote[];
  issueIds:string[];powerRules:PowerRule[];
}

/** Check references and guard the two main inference mistakes at the data boundary. */
export function validatePolicyPrototype(data:PolicyPrototypeData,deps:PolicyDependencies):string[] {
  const errors:string[]=[];
  const sourceIds=new Set(deps.sources.map(s=>s.sourceId));
  const evidence=new Map([...deps.evidence,...data.additionalEvidence].map(e=>[e.evidenceId,e]));
  const electionById=new Map(deps.elections.map(e=>[e.electionId,e]));
  const policies=new Set(data.policies.map(policyKey));
  const issues=new Set(deps.issueIds),powers=new Set(deps.powerRules.map(p=>p.powerId));
  const ids=new Set<string>();
  const unique=(id:string)=>{if(ids.has(id))errors.push(`${id}: duplicate ID`);ids.add(id);};
  const refs=(id:string,sources:string[],evidenceIds:string[])=>{
    for(const sid of sources)if(!sourceIds.has(sid))errors.push(`${id}: unknown source ${sid}`);
    for(const eid of evidenceIds){
      const entry=evidence.get(eid);
      if(!entry)errors.push(`${id}: unknown evidence ${eid}`);
      else if(sources.length&&!sources.includes(entry.sourceId))errors.push(`${id}: evidence/source mismatch`);
    }
  };
  const policyRef=(id:string,r:PolicyRef)=>{if(!policies.has(policyKey(r)))errors.push(`${id}: unknown policy version`);};
  const candidate=(id:string,electionId:string,candidateId:string)=>{if(!electionById.get(electionId)?.candidates.some(c=>c.candidateId===candidateId))errors.push(`${id}: candidate/election mismatch`);};
  for(const e of data.additionalEvidence){unique(e.evidenceId);refs(e.evidenceId,[e.sourceId],[]);if(!validDate(e.checkedAt))errors.push(`${e.evidenceId}: invalid checked date`);}
  for(const p of data.policies){unique(policyKey(p));refs(policyKey(p),p.sourceIds,p.evidenceIds);for(const id of p.issueIds)if(!issues.has(id))errors.push(`${p.policyId}: unknown issue`);for(const route of p.routes)if(!powers.has(route))errors.push(`${p.policyId}: unknown institutional route`);}
  const recordPairs=new Set<string>();
  for(const r of data.candidateRecords){
    unique(r.recordId);candidate(r.recordId,r.electionId,r.candidateId);policyRef(r.recordId,r);
    const pair=`${r.candidateId}:${policyKey(r)}`;if(recordPairs.has(pair))errors.push(`${r.recordId}: duplicate candidate-policy version`);recordPairs.add(pair);
    refs(r.recordId,[],r.stanceEvidenceIds);
    if(!['support','conditional','oppose','unknown'].includes(r.stance)||!['historical','campaign-as-of','unknown'].includes(r.stancePeriod))errors.push(`${r.recordId}: invalid stance classification`);
    if(r.stance!=='unknown'&&(r.stancePeriod==='unknown'||r.stanceAsOf===null))errors.push(`${r.recordId}: confirmed stance lacks time scope`);
    if(!validDate(r.checkedAt)||r.stanceAsOf!==null&&!validDate(r.stanceAsOf))errors.push(`${r.recordId}: invalid date`);
    if(r.stance!=='unknown'&&(!r.stanceEvidenceIds.length||!r.actions.some(a=>a.scope==='exact-policy'&&a.evidenceIds.some(id=>r.stanceEvidenceIds.includes(id)))))errors.push(`${r.recordId}: stance lacks exact-policy evidence; whole-measure/topic evidence cannot substitute`);
    if(r.stance==='unknown'&&r.stanceEvidenceIds.length)errors.push(`${r.recordId}: unknown stance has supporting evidence assertion`);
    if(r.stance==='conditional'&&!r.conditions.length)errors.push(`${r.recordId}: conditional stance lacks conditions`);
    if(r.explicitlyPrioritized===true&&!r.actions.some(a=>a.kind==='stated-priority'&&a.scope==='exact-policy'))errors.push(`${r.recordId}: priority inferred from broader topic`);
    for(const a of r.actions){
      unique(a.actionId);refs(a.actionId,a.sourceIds,a.evidenceIds);
      if(!a.evidenceIds.length||!a.sourceIds.length||!a.locator.trim())errors.push(`${a.actionId}: action lacks source locator`);
      if(!validDate(a.checkedAt)||a.actionDate!==null&&(!validDate(a.actionDate)||a.actionDate>a.checkedAt))errors.push(`${a.actionId}: invalid action/check date`);
      if(a.actionDate===null&&a.datePrecision!=='unknown'||a.actionDate!==null&&a.datePrecision!=='day')errors.push(`${a.actionId}: date precision mismatch`);
      if(a.kind==='vote'&&a.vote===null||a.kind!=='vote'&&a.vote!==null)errors.push(`${a.actionId}: invalid vote action`);
      if(a.scope==='whole-measure'&&!a.targetPolicyRef)errors.push(`${a.actionId}: broader vote needs its own measure reference`);
      if(a.targetPolicyRef)policyRef(a.actionId,a.targetPolicyRef);
    }
  }
  const feedIds={news:new Set(deps.news.map(n=>n.newsId)),'observation-update':new Set(deps.updates.map(u=>u.updateId)),'roll-call':new Set(deps.rollCalls.map(r=>r.rollCallId)),'candidate-platform':new Set(deps.elections.flatMap(e=>e.candidates.map(c=>c.candidateId)))};
  for(const l of data.contextLinks){
    unique(l.linkId);refs(l.linkId,l.sourceIds,l.evidenceIds);for(const p of l.policyRefs)policyRef(l.linkId,p);
    if(!validDate(l.checkedAt)||l.eventDate!==null&&!validDate(l.eventDate)||l.publishedAt!==null&&!validDate(l.publishedAt))errors.push(`${l.linkId}: invalid date`);
    for(const ref of l.feedRefs)if(!feedIds[ref.kind].has(ref.id))errors.push(`${l.linkId}: missing feed reference`);
    for(const link of l.electionLinks)for(const cid of link.candidateIds)candidate(l.linkId,link.electionId,cid);
    for(const id of l.issueIds)if(!issues.has(id))errors.push(`${l.linkId}: unknown issue`);
  }
  const contextIds=new Set(data.contextLinks.map(l=>l.linkId));
  for(const a of data.assumptions){unique(a.assumptionId);refs(a.assumptionId,[],a.evidenceIds);for(const p of a.policyRefs)policyRef(a.assumptionId,p);for(const id of a.contextLinkIds)if(!contextIds.has(id))errors.push(`${a.assumptionId}: unknown context`);for(const id of a.electionIds)if(!electionById.has(id))errors.push(`${a.assumptionId}: unknown election`);}
  for(const f of data.factors){unique(f.factorId);refs(f.factorId,[],f.evidenceIds);for(const cid of f.candidateIds)candidate(f.factorId,f.electionId,cid);}
  return errors;
}

/** Explicit bindings add issue/policy links to existing updates without editing history. */
export function linkedPolicyContexts(data:PolicyPrototypeData,filter:{themeId?:string;electionId?:string;feedKind?:string;feedId?:string}={}) {
  return data.contextLinks.filter(l=>(!filter.themeId||l.themeId===filter.themeId)&&(!filter.electionId||l.electionLinks.some(e=>e.electionId===filter.electionId))&&(!filter.feedId||l.feedRefs.some(ref=>ref.id===filter.feedId&&(!filter.feedKind||ref.kind===filter.feedKind))));
}
export function candidatePolicyKnowledge(data:PolicyPrototypeData,candidateId:string,ref:PolicyRef):{status:'recorded';record:CandidatePolicyRecord}|{status:'unresearched';stance:'unknown';explicitlyPrioritized:null} {
  const record=data.candidateRecords.find(r=>r.candidateId===candidateId&&policyKey(r)===policyKey(ref));
  return record?{status:'recorded',record}:{status:'unresearched',stance:'unknown',explicitlyPrioritized:null};
}

/** Seat totals reuse the existing engine. These candidate records are NOT 100 votes. */
export function describePolicyScenario(data:PolicyPrototypeData,ref:PolicyRef,state:ScenarioState,seats:Seat[],elections:Election[],powerRules:PowerRule[]) {
  const policy=data.policies.find(p=>policyKey(p)===policyKey(ref));
  if(!policy)throw new Error('未登録の政策版です。');
  const electedBySeat=new Map(elections.map(e=>[e.seatId,e]));
  const candidateRows:{seatId:string;electionId:string;candidateId:string;knowledge:ReturnType<typeof candidatePolicyKnowledge>;reasonCurrent:boolean|null}[]=[];
  const coverage={totalSeats:seats.length,selectedCandidateSeats:[] as string[],caucusOnlySeats:[] as string[],heldOrBaselineSeatsWithoutCandidateAssessment:[] as string[],unassignedSeats:[] as string[]};
  for(const seat of seats){
    const election=electedBySeat.get(seat.seatId),choice=state.senate[seat.seatId];
    if(!election||!choice){
      if(scenarioOutcomeForSeat(state,seat.seatId,election)==='unassigned')coverage.unassignedSeats.push(seat.seatId);
      else coverage.heldOrBaselineSeatsWithoutCandidateAssessment.push(seat.seatId);
      continue;
    }
    if(choice.kind==='unassigned'){coverage.unassignedSeats.push(seat.seatId);continue;}
    if(choice.kind==='caucus'){coverage.caucusOnlySeats.push(seat.seatId);continue;}
    const candidate=candidateForChoice(choice,election);if(!candidate){coverage.heldOrBaselineSeatsWithoutCandidateAssessment.push(seat.seatId);continue;}
    coverage.selectedCandidateSeats.push(seat.seatId);
    candidateRows.push({seatId:seat.seatId,electionId:election.electionId,candidateId:candidate.candidateId,knowledge:candidatePolicyKnowledge(data,candidate.candidateId,ref),reasonCurrent:reasonChoiceIsCurrent(state,election)});
  }
  return {
    policy,seatCounts:countScenarioSenate(state,seats,elections),candidateRows,coverage,
    researchCoverage:{focusElectionIds:[...data.focusElectionIds],candidateIdsWithRecords:[...new Set(data.candidateRecords.filter(r=>policyKey(r)===policyKey(ref)).map(r=>r.candidateId))],unresearchedSelectedCandidateIds:candidateRows.filter(r=>r.knowledge.status==='unresearched').map(r=>r.candidateId)},
    institutionalRoutes:policy.routes.map(route=>{const rule=powerRules.find(p=>p.powerId===route);return {route,status:'unassessed' as const,house:rule?.house??'未確認',senate:rule?.senate??'未確認',threshold:rule?.threshold??'未確認',presidentialConstraint:rule?.presidentialConstraint??'未確認',sourceIds:rule?.sourceIds??[],conditions:route==='oversight'?['各院の委員会規則、議題設定、招致・文書要求等を確認する。','調査行動は法案成立や行政措置の変更を意味しない。']:['両院の同一文面・別々の可決条件を確認する。','大統領の署名・拒否権と拒否権再可決は別条件。',...(route==='ordinary-law'?['上院の討論終結と最終可決を別々に確認する。']:['予算決議・財政調整の適格性・バードルールを別途確認する。'])]};}),
    limitations:['収録候補の姿勢は全100議員の賛成数でも将来の採決予定でもない。','当選者・会派の仮定と政策票は別。未確認を反対・無関心に置き換えない。','当選確率・成立確率・支持率変動を生成しない。'],
  };
}

export function comparePolicyScenarios(left:ScenarioState,right:ScenarioState,seats:Seat[],elections:Election[]) {
  return {leftSeatCounts:countScenarioSenate(left,seats,elections),rightSeatCounts:countScenarioSenate(right,seats,elections),choiceChanges:elections.flatMap(e=>{const a=left.senate[e.seatId]??null,b=right.senate[e.seatId]??null;return JSON.stringify(a)===JSON.stringify(b)?[]:[{seatId:e.seatId,electionId:e.electionId,left:a,right:b}];}),reasoning:compareScenarioReasoning(left,right)};
}
