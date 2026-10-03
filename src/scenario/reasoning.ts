import type { Election } from '../data/model';
import { policyPrototype } from '../data/policy-prototype';
import type { ScenarioState, SenateChoice } from './model';

export const REASONING_VERSION=1 as const;
export const REASONING_LIMITS={bytes:16_384,common:8,races:12,factors:8,evidence:12,privateNote:800} as const;
export type AssumptionAssessment='adopt'|'reject'|'hold';
export type FactorRole='counterweight'|'candidate-case'|'background'|'uncertain';
export interface CommonAssumptionChoice { assumptionId:string;assessment:AssumptionAssessment;evidenceIds:string[] }
export interface RaceReasoning {
  assessment:'conditional'|'hold';
  choiceAtAssessment:SenateChoice|null;
  assumptionIds:string[];
  commonAtAssessment?:CommonAssumptionChoice[];
  factors:{factorId:string;role:FactorRole}[];
  evidenceIds:string[];
  privateNote?:string;
}
export interface ScenarioReasoning {
  version:typeof REASONING_VERSION;
  commonAssumptions:CommonAssumptionChoice[];
  races:Record<string,RaceReasoning>;
  privateNote?:string;
}
export const emptyReasoning=():ScenarioReasoning=>({version:REASONING_VERSION,commonAssumptions:[],races:{}});
const isRecord=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
const assumptions=new Map(policyPrototype.assumptions.map(a=>[a.assumptionId,a]));
const factors=new Map(policyPrototype.factors.map(f=>[f.factorId,f]));
const focus=new Set(policyPrototype.focusElectionIds);
const prototypeCandidates=(electionId:string)=>new Set([
  ...policyPrototype.factors.filter(f=>f.electionId===electionId).flatMap(f=>f.candidateIds),
  ...policyPrototype.candidateRecords.filter(r=>r.electionId===electionId).map(r=>r.candidateId),
]);
const allowedCaucuses=new Set(['Democratic','Republican','none','unconfirmed','vacant']);
const assessments=new Set(['adopt','reject','hold']);
const roles=new Set(['counterweight','candidate-case','background','uncertain']);
const idArray=(raw:unknown,allowed:Set<string>,limit:number):string[]|null=>{
  if(!Array.isArray(raw)||raw.length>limit||raw.some(id=>typeof id!=='string'||!allowed.has(id)))return null;
  return [...new Set(raw as string[])].sort();
};
function cleanChoice(raw:unknown,electionId:string,elections?:Election[]):SenateChoice|null|undefined {
  if(raw===null)return null;
  if(!isRecord(raw)||raw.electionId!==electionId)return undefined;
  if(raw.kind==='unassigned')return {kind:'unassigned',electionId};
  if(raw.kind==='caucus'&&typeof raw.caucus==='string'&&allowedCaucuses.has(raw.caucus))return {kind:'caucus',electionId,caucus:raw.caucus as Extract<SenateChoice,{kind:'caucus'}>['caucus']};
  const roster=elections?.find(e=>e.electionId===electionId)?.candidates;
  const candidateIds=roster?new Set(roster.map(c=>c.candidateId)):prototypeCandidates(electionId);
  if(raw.kind==='candidate'&&typeof raw.candidateId==='string'&&candidateIds.has(raw.candidateId))return {kind:'candidate',electionId,candidateId:raw.candidateId};
  return undefined;
}
function note(raw:unknown,notices:string[]):string|undefined {
  if(raw===undefined)return undefined;
  if(typeof raw!=='string'||raw.length>REASONING_LIMITS.privateNote){notices.push('個人メモの形式または長さを確認できず、メモは復元しませんでした。');return undefined;}
  return raw;
}

/** Bounded allow-list parsing. Unknown properties never become shared text. */
export function normalizeScenarioReasoning(raw:unknown,elections?:Election[]):{reasoning?:ScenarioReasoning;notices:string[]} {
  const notices:string[]=[];
  if(raw===undefined)return {notices};
  try {
    if(new TextEncoder().encode(JSON.stringify(raw)).length>REASONING_LIMITS.bytes)throw new Error('size');
  }catch{return {notices:['理由データが大きすぎるか読み取れないため、当落仮定だけを復元しました。']};}
  if(!isRecord(raw)||raw.version!==REASONING_VERSION||!Array.isArray(raw.commonAssumptions)||raw.commonAssumptions.length>REASONING_LIMITS.common||!isRecord(raw.races)||Object.keys(raw.races).length>REASONING_LIMITS.races)return {notices:['未対応または上限超過の理由形式のため、当落仮定だけを復元しました。']};
  const clean=emptyReasoning();
  clean.privateNote=note(raw.privateNote,notices);
  for(const value of raw.commonAssumptions){
    if(!isRecord(value)||typeof value.assumptionId!=='string'||!assumptions.has(value.assumptionId)||typeof value.assessment!=='string'||!assessments.has(value.assessment)){notices.push('共通前提のIDまたは判断値を確認できず、復元しませんでした。');continue;}
    const a=assumptions.get(value.assumptionId)!;
    const evidence=idArray(value.evidenceIds,new Set(a.evidenceIds),REASONING_LIMITS.evidence);
    if(!evidence||clean.commonAssumptions.some(c=>c.assumptionId===value.assumptionId)){notices.push('共通前提の根拠または重複を確認できず、復元しませんでした。');continue;}
    clean.commonAssumptions.push({assumptionId:value.assumptionId,assessment:value.assessment as AssumptionAssessment,evidenceIds:evidence});
  }
  clean.commonAssumptions.sort((a,b)=>a.assumptionId.localeCompare(b.assumptionId));
  const commonIds=new Set(clean.commonAssumptions.map(c=>c.assumptionId));
  for(const [electionId,value]of Object.entries(raw.races)){
    if(!focus.has(electionId)||!isRecord(value)||typeof value.assessment!=='string'||!['conditional','hold'].includes(value.assessment)||!Array.isArray(value.factors)||value.factors.length>REASONING_LIMITS.factors){notices.push('州ごとの理由の対象または形式を確認できず、復元しませんでした。');continue;}
    const choice=cleanChoice(value.choiceAtAssessment,electionId,elections);
    const assumptionIds=idArray(value.assumptionIds,commonIds,REASONING_LIMITS.common);
    let commonAtAssessment:CommonAssumptionChoice[]|undefined;
    if(value.commonAtAssessment!==undefined){
      if(!Array.isArray(value.commonAtAssessment)||value.commonAtAssessment.length>REASONING_LIMITS.common||!assumptionIds){
        notices.push('記録時の共通前提の形式を確認できず、理由を復元しませんでした。');continue;
      }
      commonAtAssessment=[];
      let snapshotValid=true;
      for(const saved of value.commonAtAssessment){
        if(!isRecord(saved)||typeof saved.assumptionId!=='string'||!assumptionIds.includes(saved.assumptionId)||typeof saved.assessment!=='string'||!assessments.has(saved.assessment)||commonAtAssessment.some(c=>c.assumptionId===saved.assumptionId)){snapshotValid=false;break;}
        const evidence=idArray(saved.evidenceIds,new Set(assumptions.get(saved.assumptionId)!.evidenceIds),REASONING_LIMITS.evidence);
        if(!evidence){snapshotValid=false;break;}
        commonAtAssessment.push({assumptionId:saved.assumptionId,assessment:saved.assessment as AssumptionAssessment,evidenceIds:evidence});
      }
      if(!snapshotValid||commonAtAssessment.length!==assumptionIds.length){notices.push('記録時の共通前提の整合性を確認できず、理由を復元しませんでした。');continue;}
      commonAtAssessment.sort((a,b)=>a.assumptionId.localeCompare(b.assumptionId));
    }
    const factorRefs:RaceReasoning['factors']=[];
    let valid=true;
    for(const item of value.factors){
      if(!isRecord(item)||typeof item.factorId!=='string'||factors.get(item.factorId)?.electionId!==electionId||typeof item.role!=='string'||!roles.has(item.role)||factorRefs.some(f=>f.factorId===item.factorId)){valid=false;break;}
      factorRefs.push({factorId:item.factorId,role:item.role as FactorRole});
    }
    const allowedEvidence=new Set([
      ...(assumptionIds??[]).flatMap(id=>assumptions.get(id)!.evidenceIds),
      ...factorRefs.flatMap(f=>factors.get(f.factorId)!.evidenceIds),
      ...policyPrototype.candidateRecords.filter(r=>r.electionId===electionId).flatMap(r=>[...r.stanceEvidenceIds,...r.actions.flatMap(a=>a.evidenceIds)]),
      ...policyPrototype.contextLinks.filter(l=>l.electionLinks.some(e=>e.electionId===electionId)).flatMap(l=>l.evidenceIds),
    ]);
    const evidenceIds=idArray(value.evidenceIds,allowedEvidence,REASONING_LIMITS.evidence);
    if(choice===undefined||!assumptionIds||!evidenceIds||!valid||assumptionIds.some(id=>!assumptions.get(id)!.electionIds.includes(electionId))||(value.assessment==='hold'&&choice!==null&&choice.kind!=='unassigned')||(value.assessment==='conditional'&&(choice===null||choice.kind==='unassigned'))){notices.push('州ごとの候補・前提・根拠・判断保留の整合性を確認できず、理由を復元しませんでした。');continue;}
    clean.races[electionId]={assessment:value.assessment as RaceReasoning['assessment'],choiceAtAssessment:choice,assumptionIds,commonAtAssessment,factors:factorRefs.sort((a,b)=>a.factorId.localeCompare(b.factorId)),evidenceIds,privateNote:note(value.privateNote,notices)};
  }
  return {reasoning:clean,notices};
}

/** Positive whitelist: private notes and arbitrary fields are never URL data. */
export function publicScenarioReasoning(raw:unknown,elections?:Election[]):ScenarioReasoning|undefined {
  const clean=normalizeScenarioReasoning(raw,elections).reasoning;
  if(!clean)return undefined;
  return {version:clean.version,commonAssumptions:clean.commonAssumptions.map(c=>({assumptionId:c.assumptionId,assessment:c.assessment,evidenceIds:[...c.evidenceIds]})),races:Object.fromEntries(Object.entries(clean.races).map(([id,r])=>[id,{assessment:r.assessment,choiceAtAssessment:r.choiceAtAssessment,assumptionIds:[...r.assumptionIds],...(r.commonAtAssessment?{commonAtAssessment:r.commonAtAssessment.map(c=>({assumptionId:c.assumptionId,assessment:c.assessment,evidenceIds:[...c.evidenceIds]}))}:{}),factors:r.factors.map(f=>({...f})),evidenceIds:[...r.evidenceIds]}]))};
}

export function setCommonAssumption(state:ScenarioState,choice:CommonAssumptionChoice,elections?:Election[]):ScenarioState {
  const reasoning=structuredClone(state.reasoning??emptyReasoning());
  reasoning.commonAssumptions=reasoning.commonAssumptions.filter(c=>c.assumptionId!==choice.assumptionId);
  reasoning.commonAssumptions.push({...choice,evidenceIds:[...choice.evidenceIds]});
  const result=normalizeScenarioReasoning(reasoning,elections);
  if(!result.reasoning||result.notices.length)throw new Error('共通前提または根拠IDが無効です。');
  return {...state,reasoning:result.reasoning};
}
export function applyReasonedChoice(state:ScenarioState,election:Election,choice:SenateChoice,reason:Omit<RaceReasoning,'choiceAtAssessment'>,elections:Election[]=[election]):ScenarioState {
  if(choice.electionId!==election.electionId||cleanChoice(choice,election.electionId,[election])===undefined)throw new Error('候補者または選挙IDが無効です。');
  const reasoning=structuredClone(state.reasoning??emptyReasoning());
  reasoning.races[election.electionId]={...structuredClone(reason),choiceAtAssessment:choice,commonAtAssessment:reason.assumptionIds.flatMap(id=>{
    const current=reasoning.commonAssumptions.find(c=>c.assumptionId===id);
    return current?[structuredClone(current)]:[];
  })};
  const result=normalizeScenarioReasoning(reasoning,elections);
  if(!result.reasoning||result.notices.length)throw new Error('州ごとの理由または根拠IDが無効です。');
  return {...state,senate:{...state.senate,[election.seatId]:{...choice}},unlockedSeatIds:state.unlockedSeatIds.filter(id=>id!==election.seatId),reasoning:result.reasoning};
}
export function reasonChoiceIsCurrent(state:ScenarioState,election:Election):boolean|null {
  const reason=state.reasoning?.races[election.electionId];
  if(!reason)return null;
  const actual=state.senate[election.seatId]??null,snapshot=reason.choiceAtAssessment;
  const sameChoice=actual===null||snapshot===null?actual===snapshot:
    actual.kind===snapshot.kind&&actual.electionId===snapshot.electionId&&
    (actual.kind==='candidate'?snapshot.kind==='candidate'&&actual.candidateId===snapshot.candidateId:
      actual.kind==='caucus'?snapshot.kind==='caucus'&&actual.caucus===snapshot.caucus:true);
  if(!sameChoice)return false;
  if(!reason.assumptionIds.length)return true;
  if(!reason.commonAtAssessment)return null;
  return reason.assumptionIds.every(id=>{
    const current=state.reasoning!.commonAssumptions.find(c=>c.assumptionId===id);
    const recorded=reason.commonAtAssessment!.find(c=>c.assumptionId===id);
    return Boolean(current&&recorded&&current.assessment===recorded.assessment&&
      JSON.stringify([...current.evidenceIds].sort())===JSON.stringify([...recorded.evidenceIds].sort()));
  });
}
export function compareScenarioReasoning(left:ScenarioState,right:ScenarioState) {
  const l=left.reasoning??emptyReasoning(),r=right.reasoning??emptyReasoning();
  const commonIds=[...new Set([...l.commonAssumptions,...r.commonAssumptions].map(c=>c.assumptionId))].sort();
  const electionIds=[...new Set([...Object.keys(l.races),...Object.keys(r.races)])].sort();
  return {
    commonChanges:commonIds.flatMap(assumptionId=>{const a=l.commonAssumptions.find(c=>c.assumptionId===assumptionId)??null,b=r.commonAssumptions.find(c=>c.assumptionId===assumptionId)??null;return JSON.stringify(a)===JSON.stringify(b)?[]:[{assumptionId,left:a,right:b}];}),
    raceChanges:electionIds.flatMap(electionId=>{const a=l.races[electionId]??null,b=r.races[electionId]??null;const publicA=a?{...a,privateNote:undefined}:null,publicB=b?{...b,privateNote:undefined}:null;const privateNoteChanged=a?.privateNote!==b?.privateNote;return JSON.stringify(publicA)===JSON.stringify(publicB)&&!privateNoteChanged?[]:[{electionId,left:publicA,right:publicB,privateNoteChanged}];}),
    privateNoteChanged:l.privateNote!==r.privateNote,
  };
}
