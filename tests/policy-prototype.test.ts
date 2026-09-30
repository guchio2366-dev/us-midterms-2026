import { describe, expect, it } from 'vitest';
import { elections,seats,sources } from '../src/data/data';
import { powerRules,issueCategories } from '../src/data/civics';
import { evidenceRefs } from '../src/data/research-sources';
import { newsItems } from '../src/data/news';
import { rollCalls } from '../src/data/research';
import { observationData } from '../src/data/observation';
import { policyPrototype,policyRefs } from '../src/data/policy-prototype';
import { candidatePolicyKnowledge,comparePolicyScenarios,describePolicyScenario,linkedPolicyContexts,validatePolicyPrototype } from '../src/policy-prototype-logic';
import { createPolicyExampleScenarios } from '../src/scenario/policy-examples';
import { createLegacySenateBaseline,createRatingSenateBaseline } from '../src/scenario/baseline';
import { aggregateRatingConsensus } from '../src/rating-consensus';
import { RATING_METHOD_VERSION,RATING_SNAPSHOT_AS_OF,RATING_SNAPSHOT_ID,ratingSnapshotObservations } from '../src/data/rating-snapshot';
import { countScenarioSenate,createScenarioState,normalizeScenario,type ScenarioState } from '../src/scenario/model';
import { applyReasonedChoice,compareScenarioReasoning,emptyReasoning,normalizeScenarioReasoning,publicScenarioReasoning,reasonChoiceIsCurrent,REASONING_LIMITS,setCommonAssumption } from '../src/scenario/reasoning';
import { createSavedScenario,decodeScenario,encodeScenario,loadDraft,loadSavedScenarios,persistSavedScenarios,saveDraft } from '../src/scenario/storage';
import { houseDistricts } from '../src/data/house';

const deps={elections,sources:[...sources,...observationData.sources],evidence:[...evidenceRefs,...observationData.evidenceRefs],news:newsItems,updates:observationData.updates,rollCalls,issueIds:issueCategories.map(i=>i.issueId),powerRules};
const baseline=createRatingSenateBaseline({seats,elections,consensus:aggregateRatingConsensus(elections.map(e=>e.seatId),ratingSnapshotObservations),snapshotId:RATING_SNAPSHOT_ID,asOf:RATING_SNAPSHOT_AS_OF,methodVersion:RATING_METHOD_VERSION,seatDataVersion:'test'});
const legacy=createLegacySenateBaseline(seats);
const examples=()=>createPolicyExampleScenarios(baseline,elections);
const normalize=(raw:unknown)=>normalizeScenario(raw,seats,elections,houseDistricts,baseline,legacy);
const decode=(payload:string)=>decodeScenario(payload,seats,elections,houseDistricts,baseline,legacy);
const oldEncode=(raw:unknown)=>btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(raw)))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const payloadText=(payload:string)=>new TextDecoder().decode(Uint8Array.from(atob(payload.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0)));
class MemoryStorage implements Storage {
  private values=new Map<string,string>();
  get length(){return this.values.size;}
  clear(){this.values.clear();}
  getItem(key:string){return this.values.get(key)??null;}
  key(index:number){return [...this.values.keys()][index]??null;}
  removeItem(key:string){this.values.delete(key);}
  setItem(key:string,value:string){this.values.set(key,value);}
}

describe('reviewed policy data contracts',()=>{
  it('resolves every initial source, policy version, candidate and existing feed reference',()=>{
    expect(validatePolicyPrototype(policyPrototype,deps)).toEqual([]);
    expect(policyPrototype.themes.map(t=>t.themeId)).toEqual(['healthcare','tariffs']);
    expect(policyPrototype.policies).toHaveLength(31);
    expect(policyPrototype.candidateRecords).toHaveLength(42);
  });
  it('connects observation updates to issue and policy IDs without rewriting their history',()=>{
    const before=JSON.stringify(observationData);
    const links=linkedPolicyContexts(policyPrototype,{feedKind:'observation-update',feedId:'obs-update-mi-polls-tariffs-2026-09-17'});
    expect(links).toHaveLength(1);
    expect(links[0].issueIds).toContain('trade-industry');
    expect(links[0].electionLinks.map(l=>l.electionId)).toEqual(['2026-ME-2-regular','2026-MI-2-regular']);
    expect(JSON.stringify(observationData)).toBe(before);
    expect(linkedPolicyContexts(policyPrototype,{themeId:'healthcare'}).some(l=>l.scope==='national')).toBe(true);
  });
  it('distinguishes past package votes from individual Medicaid policy designs',()=>{
    const packageVote=candidatePolicyKnowledge(policyPrototype,'cand-oh-jon-husted',policyRefs.hr1);
    expect(packageVote.status==='recorded'&&packageVote.record.stance).toBe('support');
    const clause=candidatePolicyKnowledge(policyPrototype,'cand-oh-jon-husted',policyRefs.medicaidWork);
    expect(clause.status==='recorded'&&clause.record.stance).toBe('unknown');
    expect(clause.status==='recorded'&&clause.record.actions[0].targetPolicyRef).toEqual(policyRefs.hr1);
    const broken=structuredClone(policyPrototype),r=broken.candidateRecords.find(r=>r.recordId==='position-husted-medicaid-work')!;
    r.stance='support';r.stanceEvidenceIds=['ev-hr1-rollcall'];
    expect(validatePolicyPrototype(broken,deps)).toContain(`${r.recordId}: stance lacks exact-policy evidence; whole-measure/topic evidence cannot substitute`);
  });
  it('separates Medicare for All, Medicaid funding and conditional work requirements',()=>{
    const mfa=candidatePolicyKnowledge(policyPrototype,'cand-mi-abdul-el-sayed',policyRefs.medicareAll);
    expect(mfa.status==='recorded'&&mfa.record.stance).toBe('support');
    const medicaid=candidatePolicyKnowledge(policyPrototype,'cand-mi-abdul-el-sayed',policyRefs.medicaidFunding);
    expect(medicaid.status==='recorded'&&medicaid.record.stance).toBe('unknown');
    expect(medicaid.status==='recorded'&&medicaid.record.explicitlyPrioritized).toBeNull();
    const work=candidatePolicyKnowledge(policyPrototype,'cand-me-susan-m-collins',policyRefs.medicaidWork);
    expect(work.status==='recorded'&&work.record.stance).toBe('conditional');
    if(work.status==='recorded'){
      expect(work.record.conditions.join('')).toContain('就学');
      expect(work.record.actions[0]).toMatchObject({actionDate:'2025-07-01',checkedAt:'2026-09-30',kind:'statement'});
    }
  });
  it('returns unresearched rather than opposed or indifferent for a missing record',()=>{
    expect(candidatePolicyKnowledge(policyPrototype,'cand-mi-mike-rogers',policyRefs.medicaidFunding)).toEqual({status:'unresearched',stance:'unknown',explicitlyPrioritized:null});
    expect(candidatePolicyKnowledge(policyPrototype,'cand-me-troy-d-jackson',policyRefs.medicaidFunding).status).toBe('recorded');
  });
  it.each(['source','policy-version','candidate','future-action-date','conditional-without-condition'])('rejects corrupted %s evidence contracts',kind=>{
    const d=structuredClone(policyPrototype);
    if(kind==='source')d.candidateRecords[0].actions[0].sourceIds=['not-a-source'];
    if(kind==='policy-version')d.candidateRecords[0].versionId='unregistered';
    if(kind==='candidate')d.candidateRecords[0].candidateId='cand-mi-abdul-el-sayed';
    if(kind==='future-action-date')d.candidateRecords[0].actions[0].actionDate='2027-01-01';
    if(kind==='conditional-without-condition')d.candidateRecords.find(r=>r.stance==='conditional')!.conditions=[];
    expect(validatePolicyPrototype(d,deps).length).toBeGreaterThan(0);
  });
});

describe('conditional combinations and policy scope',()=>{
  it('keeps a common medical concern while allowing different Maine choices',()=>{
    const [a,b]=examples();
    expect(a.state.reasoning?.commonAssumptions).toEqual(b.state.reasoning?.commonAssumptions);
    expect(a.state.senate['ME-2']).toMatchObject({candidateId:'cand-me-susan-m-collins'});
    expect(b.state.senate['ME-2']).toMatchObject({candidateId:'cand-me-troy-d-jackson'});
    expect(a.state.senate['MI-2']).toMatchObject({candidateId:'cand-mi-abdul-el-sayed'});
    expect(a.state.senate['OH-3']).toMatchObject({kind:'unassigned'});
    const comparison=comparePolicyScenarios(a.state,b.state,seats,elections);
    expect(comparison.reasoning.commonChanges).toEqual([]);
    expect(comparison.choiceChanges.map(c=>c.seatId)).toEqual(['ME-2']);
    expect(comparison.reasoning.raceChanges[0].left?.factors[0].role).toBe('counterweight');
    expect(comparison.rightSeatCounts.Democratic-comparison.leftSeatCounts.Democratic).toBe(1);
  });
  it('supports tariff combinations across three states without probabilities',()=>{
    const a=examples()[2].state,b=examples()[3].state;
    expect(comparePolicyScenarios(a,b,seats,elections).choiceChanges).toHaveLength(3);
    expect(a.reasoning?.commonAssumptions).toEqual(b.reasoning?.commonAssumptions);
    expect(JSON.stringify(comparePolicyScenarios(a,b,seats,elections))).not.toContain('probability');
  });
  it('changing only a common assessment does not change election outcomes automatically',()=>{
    const a=examples()[0].state,b=setCommonAssumption(a,{assumptionId:'assume-medical-access-concern',assessment:'hold',evidenceIds:[]});
    expect(b.senate).toEqual(a.senate);
    expect(countScenarioSenate(b,seats,elections)).toEqual(countScenarioSenate(a,seats,elections));
    expect(compareScenarioReasoning(a,b).commonChanges).toHaveLength(1);
  });
  it('reports researched, unresearched, baseline and unassigned coverage separately',()=>{
    const state=examples()[0].state;
    const report=describePolicyScenario(policyPrototype,policyRefs.medicaidFunding,state,seats,elections,powerRules);
    expect(report.coverage.totalSeats).toBe(100);
    expect(report.coverage.selectedCandidateSeats).toEqual(expect.arrayContaining(['ME-2','MI-2']));
    expect(report.coverage.unassignedSeats).toContain('OH-3');
    expect(report.coverage.heldOrBaselineSeatsWithoutCandidateAssessment.length).toBeGreaterThan(80);
    expect(report).not.toHaveProperty('supportVoteCount');
    expect(report).not.toHaveProperty('passageProbability');
    expect(report.candidateRows.find(r=>r.candidateId==='cand-mi-abdul-el-sayed')?.knowledge.status).toBe('recorded');
    expect(report.institutionalRoutes.every(r=>r.status==='unassessed')).toBe(true);
    const ordinary=report.institutionalRoutes.find(r=>r.route==='ordinary-law')!;
    expect(ordinary.conditions.join('')).toContain('討論終結');
    expect(ordinary.conditions.join('')).toContain('大統領');
    expect(report.institutionalRoutes.find(r=>r.route==='oversight')?.conditions.join('')).not.toContain('両院の同一文面');
  });
  it('marks stale reasons when a user later changes only the elected candidate',()=>{
    const state=structuredClone(examples()[0].state),me=elections.find(e=>e.seatId==='ME-2')!;
    expect(reasonChoiceIsCurrent(state,me)).toBe(true);
    state.senate['ME-2']={kind:'candidate',electionId:me.electionId,candidateId:'cand-me-troy-d-jackson'};
    expect(reasonChoiceIsCurrent(state,me)).toBe(false);
  });
  it('rejects an unregistered policy version rather than using the nearest policy',()=>{
    expect(()=>describePolicyScenario(policyPrototype,{...policyRefs.medicaidFunding,versionId:'future-new-bill'},examples()[0].state,seats,elections,powerRules)).toThrow();
  });
});

describe('reason persistence, compatibility and privacy',()=>{
  it.each([1,2])('reads independent old schema v%s URL and saved data without adding reasons',version=>{
    const original=createScenarioState(version===1?legacy:baseline);
    original.senate['OH-3']={kind:'candidate',electionId:'2026-OH-3-special',candidateId:'cand-oh-sherrod-brown'};
    const raw={...original,schemaVersion:version};
    const loaded=decode(oldEncode(raw));
    expect(loaded.state.senate['OH-3']).toEqual(original.senate['OH-3']);
    expect(countScenarioSenate(loaded.state,seats,elections)).toEqual(countScenarioSenate(original,seats,elections));
    expect(loaded.state.reasoning).toBeUndefined();
    expect(normalize(raw).state.senate).toEqual(original.senate);
  });
  it('persists public roots, reasons and private notes locally but never exports notes',()=>{
    const state=structuredClone(examples()[0].state),secret='PRIVATE_SECRET_私の個人的なメモ';
    state.reasoning!.privateNote=secret;
    state.reasoning!.races['2026-ME-2-regular'].privateNote=secret;
    const storage=new MemoryStorage();
    expect(saveDraft(storage,state).ok).toBe(true);
    const draft=loadDraft(storage,seats,elections,houseDistricts,baseline,legacy)!;
    expect(draft.state.reasoning?.privateNote).toBe(secret);
    const saved=createSavedScenario('医療案',state);
    expect(persistSavedScenarios(storage,[saved]).ok).toBe(true);
    expect(loadSavedScenarios(storage,seats,elections,houseDistricts,baseline,legacy).items[0].state.reasoning?.races['2026-ME-2-regular'].privateNote).toBe(secret);
    const payload=encodeScenario(state,elections),text=payloadText(payload),shared=decode(payload);
    expect(text).not.toContain(secret);
    expect(text).not.toContain('privateNote');
    expect(shared.state.reasoning).toEqual(publicScenarioReasoning(state.reasoning,elections));
    expect(shared.state.senate).toEqual(state.senate);
    expect(shared.state.reasoning?.commonAssumptions[0].evidenceIds).toContain('ev-elsayed-priorities');
    expect(state.reasoning!.privateNote).toBe(secret);
  });
  it('reports private-note differences locally without copying their contents into comparisons',()=>{
    const a=structuredClone(examples()[0].state),b=structuredClone(a);
    b.reasoning!.privateNote='PRIVATE_ONLY';b.reasoning!.races['2026-ME-2-regular'].privateNote='PRIVATE_RACE';
    const diff=compareScenarioReasoning(a,b);
    expect(diff.privateNoteChanged).toBe(true);
    expect(diff.raceChanges[0].privateNoteChanged).toBe(true);
    expect(JSON.stringify(diff)).not.toContain('PRIVATE_');
  });
  it('does not accept injected private text from a shared URL',()=>{
    const raw=structuredClone(examples()[0].state);raw.reasoning!.privateNote='DO_NOT_IMPORT';
    expect(decode(oldEncode(raw)).state.reasoning?.privateNote).toBeUndefined();
  });
  it('shares only whitelisted public fields even if extra fields contain private text',()=>{
    const raw=structuredClone(examples()[0].state) as ScenarioState&{reasoning:Record<string,unknown>};
    raw.reasoning['unexpectedMemo']='DO_NOT_LEAK';
    expect(payloadText(encodeScenario(raw,elections))).not.toContain('DO_NOT_LEAK');
  });
});

describe('bounded reason inputs',()=>{
  it('rejects known evidence unrelated to the race, selected assumptions and factors',()=>{
    const raw=structuredClone(examples()[0].state);
    raw.reasoning!.races['2026-ME-2-regular'].evidenceIds=['ev-hinson-trade'];
    const result=normalize(raw);
    expect(result.state.reasoning?.races['2026-ME-2-regular']).toBeUndefined();
    expect(result.state.senate).toEqual(raw.senate);
    expect(result.notices.length).toBeGreaterThan(0);
  });
  it('requires an assigned outcome for conditional reasons',()=>{
    const raw=structuredClone(examples()[0].state);
    raw.reasoning!.races['2026-ME-2-regular'].choiceAtAssessment=null;
    expect(normalize(raw).state.reasoning?.races['2026-ME-2-regular']).toBeUndefined();
  });
  it('checks choice identity independently of object property order',()=>{
    const state=structuredClone(examples()[0].state),me=elections.find(e=>e.seatId==='ME-2')!;
    state.senate[me.seatId]={candidateId:'cand-me-susan-m-collins',electionId:me.electionId,kind:'candidate'};
    expect(reasonChoiceIsCurrent(state,me)).toBe(true);
  });
  it.each(['assumption','evidence','factor-from-other-state','candidate','assessment','duplicate-factor'])('drops invalid %s reasons while preserving the elected seat',kind=>{
    const raw=structuredClone(examples()[0].state),r=raw.reasoning!.races['2026-ME-2-regular'];
    if(kind==='assumption')r.assumptionIds=['not-an-assumption'];
    if(kind==='evidence')r.evidenceIds=['private-or-unknown-evidence'];
    if(kind==='factor-from-other-state')r.factors=[{factorId:'factor-mi-elsayed-medicare-all',role:'candidate-case'}];
    if(kind==='candidate')r.choiceAtAssessment={kind:'candidate',electionId:'2026-ME-2-regular',candidateId:'private-or-unknown-candidate'};
    if(kind==='assessment')(r as unknown as Record<string,unknown>).assessment='certain-winner';
    if(kind==='duplicate-factor')r.factors.push({...r.factors[0]});
    const result=normalize(raw);
    expect(result.state.senate).toEqual(raw.senate);
    expect(result.state.reasoning?.races['2026-ME-2-regular']).toBeUndefined();
    expect(result.notices.length).toBeGreaterThan(0);
  });
  it('rejects contradictory hold decisions and wrong election identities',()=>{
    const state=examples()[0].state,me=elections.find(e=>e.seatId==='ME-2')!;
    expect(()=>applyReasonedChoice(state,me,{kind:'candidate',electionId:me.electionId,candidateId:'cand-me-susan-m-collins'},{assessment:'hold',assumptionIds:[],factors:[],evidenceIds:[]})).toThrow();
    expect(()=>applyReasonedChoice(state,me,{kind:'unassigned',electionId:'2026-MI-2-regular'},{assessment:'hold',assumptionIds:[],factors:[],evidenceIds:[]})).toThrow();
  });
  it.each(['byte-limit','common-limit','note-limit','version','prototype-key','cycle'])('handles %s without mutating outcomes or throwing',kind=>{
    const reasoning:Record<string,unknown>=structuredClone(examples()[0].state.reasoning!) as unknown as Record<string,unknown>;
    if(kind==='byte-limit')reasoning.privateNote='x'.repeat(REASONING_LIMITS.bytes+1);
    if(kind==='common-limit')reasoning.commonAssumptions=Array.from({length:9},()=>({assumptionId:'assume-medical-access-concern',assessment:'hold',evidenceIds:[]}));
    if(kind==='note-limit')reasoning.privateNote='x'.repeat(REASONING_LIMITS.privateNote+1);
    if(kind==='version')reasoning.version=99;
    if(kind==='prototype-key')reasoning.races=JSON.parse('{"__proto__":{"assessment":"hold"}}');
    if(kind==='cycle')reasoning.self=reasoning;
    expect(()=>normalizeScenarioReasoning(reasoning,elections)).not.toThrow();
    expect(normalizeScenarioReasoning(reasoning,elections).notices.length).toBeGreaterThan(0);
    expect(({} as Record<string,unknown>).assessment).toBeUndefined();
  });
  it('refuses oversized outbound URLs and oversized inbound payloads',()=>{
    const state=createScenarioState(baseline);state.target={targetId:'x'.repeat(12_000),caucus:'Democratic'};
    expect(()=>encodeScenario(state)).toThrow(RangeError);
    expect(decode('x'.repeat(12_001)).notices.length).toBeGreaterThan(0);
  });
  it('handles missing, unsupported and unavailable local storage without deleting it',()=>{
    expect(normalize(undefined).state.reasoning).toBeUndefined();
    const blocked={getItem(){throw new Error('denied');},setItem(){throw new Error('denied');}} as unknown as Storage;
    expect(saveDraft(blocked,examples()[0].state).ok).toBe(false);
    expect(loadDraft(blocked,seats,elections,houseDistricts,baseline,legacy)?.notices.length).toBeGreaterThan(0);
    expect(normalizeScenarioReasoning({...emptyReasoning(),version:9}).reasoning).toBeUndefined();
  });
});
