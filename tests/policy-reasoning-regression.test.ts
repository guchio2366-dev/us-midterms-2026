import { describe, expect, it } from 'vitest';
import { elections, seats } from '../src/data/data';
import { houseDistricts } from '../src/data/house';
import { policyPrototype } from '../src/data/policy-prototype';
import { createLegacySenateBaseline } from '../src/scenario/baseline';
import { createScenarioState, normalizeScenario, type ScenarioState } from '../src/scenario/model';
import {
  applyReasonedChoice, normalizeScenarioReasoning, reasonChoiceIsCurrent,
  REASONING_LIMITS, setCommonAssumption, type RaceReasoning,
} from '../src/scenario/reasoning';
import { decodeScenario, encodeScenario } from '../src/scenario/storage';

const baseline=createLegacySenateBaseline(seats);
const nc=elections.find(e=>e.seatId==='NC-2')!;
const me=elections.find(e=>e.seatId==='ME-2')!;
const healthId='assume-medical-access-concern';
const bareReason:Omit<RaceReasoning,'choiceAtAssessment'>={assessment:'conditional',assumptionIds:[],factors:[],evidenceIds:[]};
const fresh=()=>createScenarioState(baseline);
const normalize=(raw:unknown)=>normalizeScenario(raw,seats,elections,houseDistricts,baseline,baseline);
const decode=(payload:string)=>decodeScenario(payload,seats,elections,houseDistricts,baseline,baseline);
// Independent serialization exercises the import boundary without outbound sanitization.
const independentPayload=(raw:unknown)=>btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(raw)))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const payloadText=(payload:string)=>new TextDecoder().decode(Uint8Array.from(atob(payload.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0)));
const chooseDublin=()=>applyReasonedChoice(fresh(),nc,{kind:'candidate',electionId:nc.electionId,candidateId:'cand-nc-michael-dublin'},bareReason,elections);
const healthChoice=()=>{
  const state=setCommonAssumption(fresh(),{assumptionId:healthId,assessment:'adopt',evidenceIds:['ev-elsayed-priorities']},elections);
  return applyReasonedChoice(state,me,{kind:'candidate',electionId:me.electionId,candidateId:'cand-me-susan-m-collins'},{...bareReason,assumptionIds:[healthId]},elections);
};

describe('policy reasoning compatibility regressions',()=>{
  it('keeps a valid unresearched roster candidate when editing another state and the common premise',()=>{
    const selected=chooseDublin();
    const reason=structuredClone(selected.reasoning!.races[nc.electionId]);
    let next=applyReasonedChoice(selected,me,{kind:'candidate',electionId:me.electionId,candidateId:'cand-me-susan-m-collins'},bareReason,elections);
    next=setCommonAssumption(next,{assumptionId:healthId,assessment:'hold',evidenceIds:[]},elections);
    expect(next.senate[nc.seatId]).toEqual(selected.senate[nc.seatId]);
    expect(next.reasoning!.races[nc.electionId]).toEqual(reason);
    expect(reasonChoiceIsCurrent(next,nc)).toBe(true);
    const shared=decode(encodeScenario(next,elections));
    expect(shared.notices).toEqual([]);
    expect(shared.state.senate).toEqual(next.senate);
    expect(shared.state.reasoning!.races[nc.electionId]).toEqual(reason);
  });

  it.each(['assessment','evidence'] as const)('marks a reason stale when its recorded common %s changes',change=>{
    const state=healthChoice(),before=structuredClone(state.senate);
    expect(reasonChoiceIsCurrent(state,me)).toBe(true);
    const next=setCommonAssumption(state,{
      assumptionId:healthId,
      assessment:change==='assessment'?'reject':'adopt',
      evidenceIds:change==='evidence'?['ev-jackson-priorities']:['ev-elsayed-priorities'],
    },elections);
    expect(next.senate).toEqual(before);
    expect(reasonChoiceIsCurrent(next,me)).toBe(false);
    expect(reasonChoiceIsCurrent(decode(encodeScenario(next,elections)).state,me)).toBe(false);
    // Re-recording the same choice confirms the newly selected premise.
    const confirmed=applyReasonedChoice(next,me,next.senate[me.seatId],{...bareReason,assumptionIds:[healthId]},elections);
    expect(reasonChoiceIsCurrent(confirmed,me)).toBe(true);
    expect(reasonChoiceIsCurrent(state,me)).toBe(true);
  });

  it('treats old linked reasons without a premise snapshot as unverified without inventing one',()=>{
    const old=healthChoice();
    delete old.reasoning!.races[me.electionId].commonAtAssessment;
    const local=normalize(old);
    expect(local.notices).toEqual([]);
    expect(local.state.senate).toEqual(old.senate);
    expect(local.state.reasoning!.races[me.electionId].commonAtAssessment).toBeUndefined();
    expect(reasonChoiceIsCurrent(local.state,me)).toBeNull();
    const shared=decode(independentPayload(old)).state;
    expect(shared.reasoning!.races[me.electionId].commonAtAssessment).toBeUndefined();
    expect(reasonChoiceIsCurrent(shared,me)).toBeNull();
    shared.senate[me.seatId]={kind:'candidate',electionId:me.electionId,candidateId:'cand-me-troy-d-jackson'};
    expect(reasonChoiceIsCurrent(shared,me)).toBe(false);
  });

  it('drops a malformed assessment while preserving valid choices and other reasons',()=>{
    const state=applyReasonedChoice(chooseDublin(),me,{kind:'candidate',electionId:me.electionId,candidateId:'cand-me-susan-m-collins'},bareReason,elections);
    const malformed=structuredClone(state);
    (malformed.reasoning!.races[me.electionId] as unknown as Record<string,unknown>).assessment={toString:null,valueOf:null};
    expect(()=>normalizeScenarioReasoning(malformed.reasoning,elections)).not.toThrow();
    for(const loaded of [normalize(malformed),decode(independentPayload(malformed))]){
      expect(loaded.state.senate).toEqual(state.senate);
      expect(loaded.state.senateBaseline).toEqual(state.senateBaseline);
      expect(loaded.state.reasoning!.races[me.electionId]).toBeUndefined();
      expect(loaded.state.reasoning!.races[nc.electionId]).toEqual(state.reasoning!.races[nc.electionId]);
      expect(loaded.notices.length).toBeGreaterThan(0);
    }
  });

  it('shares validated premise snapshots while omitting nested private notes and unknown fields',()=>{
    const state=healthChoice();
    const expected=structuredClone(state.reasoning!.races[me.electionId].commonAtAssessment);
    const snapshot=state.reasoning!.races[me.electionId].commonAtAssessment![0] as unknown as Record<string,unknown>;
    snapshot.privateNote='PRIVATE SNAPSHOT NOTE';
    snapshot.extraField='PRIVATE SNAPSHOT EXTRA';
    const payload=encodeScenario(state,elections);
    expect(payloadText(payload)).not.toContain('PRIVATE SNAPSHOT');
    expect(decode(payload).state.reasoning!.races[me.electionId].commonAtAssessment).toEqual(expected);
    const imported=decode(independentPayload(state)).state;
    expect(imported.reasoning!.races[me.electionId].commonAtAssessment).toEqual(expected);
    expect(JSON.stringify(imported)).not.toContain('PRIVATE SNAPSHOT');
    expect(snapshot.privateNote).toBe('PRIVATE SNAPSHOT NOTE');
  });

  it('accepts reasons for all twelve focus elections and preserves them through sharing',()=>{
    expect(policyPrototype.focusElectionIds).toHaveLength(12);
    expect(REASONING_LIMITS.races).toBe(12);
    let state=fresh();
    for(const electionId of policyPrototype.focusElectionIds){
      const election=elections.find(e=>e.electionId===electionId)!;
      state=applyReasonedChoice(state,election,{kind:'unassigned',electionId},{assessment:'hold',assumptionIds:[],factors:[],evidenceIds:[]},elections);
    }
    const local=normalize(state),shared=decode(encodeScenario(state,elections));
    for(const loaded of [local,shared]){
      expect(loaded.notices).toEqual([]);
      expect(Object.keys(loaded.state.reasoning!.races).sort()).toEqual([...policyPrototype.focusElectionIds].sort());
      expect(loaded.state.senate).toEqual(state.senate);
    }
  });

  it('rejects thirteen race reasons without replacing the saved baseline or choices',()=>{
    const state=fresh();
    state.reasoning={version:1,commonAssumptions:[],races:{}};
    for(const election of elections.filter(e=>policyPrototype.focusElectionIds.includes(e.electionId))){
      const choice={kind:'unassigned' as const,electionId:election.electionId};
      state.senate[election.seatId]=choice;
      state.reasoning.races[election.electionId]={assessment:'hold',choiceAtAssessment:choice,assumptionIds:[],commonAtAssessment:[],factors:[],evidenceIds:[]};
    }
    const extra=elections.find(e=>!policyPrototype.focusElectionIds.includes(e.electionId))!;
    state.reasoning.races[extra.electionId]={assessment:'hold',choiceAtAssessment:null,assumptionIds:[],factors:[],evidenceIds:[]};
    expect(Object.keys(state.reasoning.races)).toHaveLength(13);
    for(const loaded of [normalize(state),decode(independentPayload(state))]){
      expect(loaded.state.senate).toEqual(state.senate);
      expect(loaded.state.senateBaseline).toEqual(state.senateBaseline);
      expect(loaded.state.reasoning).toBeUndefined();
      expect(loaded.notices.length).toBeGreaterThan(0);
    }
  });
});

// A manual workbench choice follows the existing simulator's lock behavior.
it.each(['candidate','unassigned'] as const)('locks a manual %s choice after a path unlock',kind=>{
  const state=createScenarioState(baseline);
  state.unlockedSeatIds=['ME-2','MI-2'];
  const election=elections.find(e=>e.seatId==='ME-2')!;
  const choice=kind==='candidate'?{kind,electionId:election.electionId,candidateId:'cand-me-susan-m-collins'}:{kind,electionId:election.electionId};
  const next=applyReasonedChoice(state,election,choice,{assessment:kind==='candidate'?'conditional':'hold',assumptionIds:[],factors:[],evidenceIds:[]},elections);
  expect(next.unlockedSeatIds).toEqual(['MI-2']);
  expect(state.unlockedSeatIds).toEqual(['ME-2','MI-2']);
  expect(next.senate[election.seatId]).toEqual(choice);
});
