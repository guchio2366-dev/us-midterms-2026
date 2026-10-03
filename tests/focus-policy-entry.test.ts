import { describe, expect, it } from 'vitest';
import { elections, seats, sources, states } from '../src/data/data';
import type { Election } from '../src/data/model';
import { houseDistricts } from '../src/data/house';
import { powerRules } from '../src/data/civics';
import { policyPrototype } from '../src/data/policy-prototype';
import { evidenceRefs } from '../src/data/research-sources';
import { observationData } from '../src/data/observation';
import { RATING_METHOD_VERSION, RATING_SNAPSHOT_AS_OF, RATING_SNAPSHOT_ID, ratingSnapshotObservations } from '../src/data/rating-snapshot';
import { aggregateRatingConsensus } from '../src/rating-consensus';
import { resolvePolicyReadingContext } from '../src/news-policy-context';
import { candidatePolicyKnowledge, describePolicyScenario } from '../src/policy-prototype-logic';
import { parsePolicyIntent, renderPolicyWorkbench } from '../src/ui/policy-workbench';
import { createLegacySenateBaseline, createRatingSenateBaseline } from '../src/scenario/baseline';
import { createScenarioState, normalizeScenario, type ScenarioState, type SenateChoice } from '../src/scenario/model';
import { applyReasonedChoice, normalizeScenarioReasoning, reasonChoiceIsCurrent, REASONING_LIMITS, setCommonAssumption, type RaceReasoning } from '../src/scenario/reasoning';
import { decodeScenario, encodeScenario, loadDraft, loadSavedScenarios, persistSavedScenarios, saveDraft } from '../src/scenario/storage';

function electionForState(abbr:string):Election {
  const state=states.find(state=>state.abbr===abbr);
  const stateSeatIds=new Set(seats.filter(seat=>seat.stateFips===state?.fips).map(seat=>seat.seatId));
  const election=elections.find(election=>stateSeatIds.has(election.seatId));
  if(!election)throw new Error(`No current election for ${abbr}`);
  return election;
}
const previousFocus=['AK','GA','IA','KS','ME','MI','NH','NC','TX','OH'].map(electionForState);
const addedFocus=['MN','NE'].map(electionForState);
const expectedFocus=[...previousFocus,...addedFocus];
const currentBaseline=createRatingSenateBaseline({
  seats,elections,consensus:aggregateRatingConsensus(elections.map(election=>election.seatId),ratingSnapshotObservations),
  snapshotId:RATING_SNAPSHOT_ID,asOf:RATING_SNAPSHOT_AS_OF,methodVersion:RATING_METHOD_VERSION,seatDataVersion:'focus-entry-test',
});
const legacyBaseline=createLegacySenateBaseline(seats);
const fresh=()=>createScenarioState(currentBaseline);
const bareReason:Omit<RaceReasoning,'choiceAtAssessment'>={assessment:'conditional',assumptionIds:[],factors:[],evidenceIds:[]};
const candidateChoice=(election:Election):SenateChoice=>({
  kind:'candidate',electionId:election.electionId,candidateId:election.candidates.find(candidate=>candidate.ballotStage!=='primary-ballot')!.candidateId,
});
const normalize=(raw:unknown)=>normalizeScenario(raw,seats,elections,houseDistricts,currentBaseline,legacyBaseline);
const decode=(payload:string)=>decodeScenario(payload,seats,elections,houseDistricts,currentBaseline,legacyBaseline);
// Exercise incoming validation independently of the outgoing public allow-list.
const independentPayload=(raw:unknown)=>btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(raw)))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const fields=(values:Record<string,string>)=>new URLSearchParams(values);
class MemoryStorage implements Storage {
  private values=new Map<string,string>();
  get length(){return this.values.size;}
  clear(){this.values.clear();}
  getItem(key:string){return this.values.get(key)??null;}
  key(index:number){return [...this.values.keys()][index]??null;}
  removeItem(key:string){this.values.delete(key);}
  setItem(key:string,value:string){this.values.set(key,value);}
}
function twelveReasons():ScenarioState {
  return expectedFocus.reduce((state,election)=>applyReasonedChoice(state,election,candidateChoice(election),bareReason,elections),fresh());
}

describe('twelve-state policy entry boundary',()=>{
  it('aligns all twelve unassigned state entries with resolver, selection parser and reason normalization',()=>{
    expect(policyPrototype.focusElectionIds.slice().sort()).toEqual(expectedFocus.map(election=>election.electionId).sort());
    expect(REASONING_LIMITS.races).toBe(12);
    expect(elections.filter(election=>currentBaseline.outcomes[election.seatId]==='unassigned').map(election=>election.electionId).sort()).toEqual([...policyPrototype.focusElectionIds].sort());
    let state=fresh();
    for(const election of expectedFocus){
      const before=JSON.stringify(state);
      const reading=resolvePolicyReadingContext({source:{kind:'state',electionId:election.electionId},selectedElectionId:previousFocus[0].electionId,data:policyPrototype,elections,seats,states});
      expect(reading?.selectedElectionId).toBe(election.electionId);
      expect(reading?.policyRef).toBeNull();
      expect(reading?.themeId).toBeNull();
      const context={data:policyPrototype,elections,state};
      expect(parsePolicyIntent('choose-election',fields({value:election.electionId}),context)).toEqual({type:'choose-election',electionId:election.electionId});
      const choice=candidateChoice(election);
      if(choice.kind!=='candidate')throw new Error('Expected roster candidate');
      const intent=parsePolicyIntent('apply-reasoned-choice',fields({electionId:election.electionId,candidateId:choice.candidateId}),context);
      expect(intent?.type).toBe('apply-reasoned-choice');
      expect(JSON.stringify(state)).toBe(before);
      if(intent?.type!=='apply-reasoned-choice')throw new Error('Expected accepted reasoned choice');
      state=applyReasonedChoice(state,election,intent.choice,intent.reason,elections);
      expect(state.senate[election.seatId]).toEqual(choice);
      expect(reasonChoiceIsCurrent(state,election)).toBe(true);
    }
    const normalized=normalizeScenarioReasoning(state.reasoning,elections);
    expect(normalized.notices).toEqual([]);
    expect(Object.keys(normalized.reasoning!.races).sort()).toEqual(expectedFocus.map(election=>election.electionId).sort());
  });

  it('allows every current MN/NE roster candidate without inventing policy records or positions',()=>{
    for(const election of addedFocus){
      expect(policyPrototype.candidateRecords.filter(record=>record.electionId===election.electionId)).toEqual([]);
      expect(policyPrototype.factors.filter(factor=>factor.electionId===election.electionId)).toEqual([]);
      expect(policyPrototype.assumptions.some(assumption=>assumption.electionIds.includes(election.electionId))).toBe(false);
      const candidates=election.candidates.filter(candidate=>candidate.ballotStage!=='primary-ballot');
      expect(candidates.length).toBeGreaterThan(0);
      for(const candidate of candidates){
        const intent=parsePolicyIntent('apply-reasoned-choice',fields({electionId:election.electionId,candidateId:candidate.candidateId}),{data:policyPrototype,elections,state:fresh()});
        if(intent?.type!=='apply-reasoned-choice')throw new Error('Roster candidate must be selectable');
        const state=applyReasonedChoice(fresh(),election,intent.choice,intent.reason,elections);
        expect(normalize(state).state.senate[election.seatId]).toEqual(intent.choice);
        for(const policy of policyPrototype.policies){
          expect(candidatePolicyKnowledge(policyPrototype,candidate.candidateId,policy)).toEqual({status:'unresearched',stance:'unknown',explicitlyPrioritized:null});
        }
        const report=describePolicyScenario(policyPrototype,policyPrototype.policies[0],state,seats,elections,powerRules);
        expect(report.candidateRows).toHaveLength(1);
        expect(report.researchCoverage.unresearchedSelectedCandidateIds).toEqual([candidate.candidateId]);
        expect(report.coverage.totalSeats).toBe(100);
      }
    }
  });

  it('shows MN/NE as selected states with unresearched candidate-policy coverage',()=>{
    for(const election of addedFocus){
      const state=applyReasonedChoice(fresh(),election,candidateChoice(election),bareReason,elections);
      const markup=renderPolicyWorkbench({data:policyPrototype,state,seats,elections,states,powerRules,sources:[...sources,...observationData.sources],evidence:[...evidenceRefs,...observationData.evidenceRefs],electionId:election.electionId,themeId:'healthcare',policyRef:policyPrototype.policies[0]});
      expect(markup).toContain(`<option value="${election.electionId}" selected>`);
      expect(markup).toContain('支持 0 · 条件付き 0 · 反対 0 · 未確認 1');
      expect(markup).toContain('この政策版は未調査');
      expect(markup).toContain('候補者未評価 99 / 100議席');
      expect(markup).toContain('理由に使う候補者別の政策材料は未収録');
      expect(markup).toContain('この州の候補者別の政策材料は未収録です。共通の政策と制度条件を確認できます。');
    }
  });

  it('rejects foreign candidates and legacy premises or evidence borrowed into MN/NE',()=>{
    const assumption=policyPrototype.assumptions.find(assumption=>assumption.evidenceIds.length)!;
    const state=setCommonAssumption(fresh(),{assumptionId:assumption.assumptionId,assessment:'adopt',evidenceIds:[]},elections);
    for(const [index,election] of addedFocus.entries()){
      const candidate=candidateChoice(election);
      if(candidate.kind!=='candidate')throw new Error('Expected roster candidate');
      const foreign=candidateChoice(addedFocus[1-index]);
      if(foreign.kind!=='candidate')throw new Error('Expected foreign roster candidate');
      const context={data:policyPrototype,elections,state};
      expect(parsePolicyIntent('apply-reasoned-choice',fields({electionId:election.electionId,candidateId:foreign.candidateId}),context)).toBeNull();
      expect(parsePolicyIntent('apply-reasoned-choice',fields({electionId:election.electionId,candidateId:candidate.candidateId,assumptionId:assumption.assumptionId}),context)).toBeNull();
      expect(parsePolicyIntent('apply-reasoned-choice',fields({electionId:election.electionId,candidateId:candidate.candidateId,evidenceId:assumption.evidenceIds[0]}),context)).toBeNull();
      expect(()=>applyReasonedChoice(state,election,candidate,{...bareReason,assumptionIds:[assumption.assumptionId]},elections)).toThrow();
    }
  });

  it('round-trips twelve reasons through draft, named save and public URL while keeping notes local',()=>{
    const state=twelveReasons(),storage=new MemoryStorage();
    state.reasoning!.privateNote='LOCAL SCENARIO NOTE';
    state.reasoning!.races[addedFocus[0].electionId].privateNote='LOCAL MN NOTE';
    const before=JSON.stringify(state);
    expect(saveDraft(storage,state).ok).toBe(true);
    expect(persistSavedScenarios(storage,[{id:'twelve-reasons',name:'12州の案',savedAt:'2026-10-03T00:00:00Z',state}]).ok).toBe(true);
    const draft=loadDraft(storage,seats,elections,houseDistricts,currentBaseline,legacyBaseline)!;
    const saved=loadSavedScenarios(storage,seats,elections,houseDistricts,currentBaseline,legacyBaseline);
    const shared=decode(encodeScenario(state,elections));
    for(const loaded of [draft,shared]){
      expect(loaded.notices).toEqual([]);
      expect(loaded.state.senate).toEqual(state.senate);
      expect(loaded.state.senateBaseline).toEqual(state.senateBaseline);
      expect(Object.keys(loaded.state.reasoning!.races)).toHaveLength(12);
    }
    expect(saved.notices).toEqual([]);
    expect(saved.items[0].state.reasoning).toEqual(draft.state.reasoning);
    expect(draft.state.reasoning!.privateNote).toBe('LOCAL SCENARIO NOTE');
    expect(draft.state.reasoning!.races[addedFocus[0].electionId].privateNote).toBe('LOCAL MN NOTE');
    expect(shared.state.reasoning!.privateNote).toBeUndefined();
    expect(shared.state.reasoning!.races[addedFocus[0].electionId].privateNote).toBeUndefined();
    expect(JSON.stringify(shared.state)).not.toContain('LOCAL');
    expect(JSON.stringify(state)).toBe(before);
  });

  it('rejects thirteen incoming reasons without discarding valid choices or the full saved baseline',()=>{
    const state=twelveReasons();
    const outside=elections.find(election=>!policyPrototype.focusElectionIds.includes(election.electionId))!;
    state.reasoning!.races[outside.electionId]={assessment:'hold',choiceAtAssessment:null,assumptionIds:[],factors:[],evidenceIds:[]};
    expect(Object.keys(state.reasoning!.races)).toHaveLength(13);
    for(const loaded of [normalize(state),decode(independentPayload(state))]){
      expect(loaded.state.reasoning).toBeUndefined();
      expect(loaded.notices.length).toBeGreaterThan(0);
      expect(loaded.state.senate).toEqual(state.senate);
      expect(loaded.state.senateBaseline).toEqual(state.senateBaseline);
      expect(Object.keys(loaded.state.senateBaseline.outcomes)).toHaveLength(100);
    }
  });

  it('drops an out-of-scope reason within the count limit and keeps the other eleven',()=>{
    const state=twelveReasons();
    const outside=elections.find(election=>!policyPrototype.focusElectionIds.includes(election.electionId))!;
    delete state.reasoning!.races[addedFocus[0].electionId];
    state.reasoning!.races[outside.electionId]={assessment:'hold',choiceAtAssessment:null,assumptionIds:[],factors:[],evidenceIds:[]};
    expect(parsePolicyIntent('choose-election',fields({value:outside.electionId}),{data:policyPrototype,elections,state})).toBeNull();
    expect(resolvePolicyReadingContext({source:{kind:'state',electionId:outside.electionId},data:policyPrototype,elections,seats,states})).toBeNull();
    for(const loaded of [normalize(state),decode(independentPayload(state))]){
      expect(loaded.state.reasoning!.races[outside.electionId]).toBeUndefined();
      expect(Object.keys(loaded.state.reasoning!.races)).toHaveLength(11);
      expect(loaded.state.senate).toEqual(state.senate);
      expect(loaded.state.senateBaseline).toEqual(state.senateBaseline);
      expect(loaded.notices.length).toBeGreaterThan(0);
    }
  });

  it.each(['recorded','missing'] as const)('preserves an old ten-state %s premise snapshot and all 100 outcomes when adding MN/NE',snapshot=>{
    const oldBaseline={...structuredClone(currentBaseline),snapshotId:'senate-ratings-2026-09-24',asOf:'2026-09-24',methodVersion:'direction-majority-v1'};
    oldBaseline.outcomes[addedFocus[0].seatId]='Democratic';
    oldBaseline.outcomes[addedFocus[1].seatId]='Republican';
    let state=createScenarioState(oldBaseline);
    for(const election of previousFocus)state=applyReasonedChoice(state,election,candidateChoice(election),bareReason,elections);
    const assumption=policyPrototype.assumptions.find(assumption=>previousFocus.some(election=>assumption.electionIds.includes(election.electionId)))!;
    const linked=previousFocus.find(election=>assumption.electionIds.includes(election.electionId))!;
    state=setCommonAssumption(state,{assumptionId:assumption.assumptionId,assessment:'adopt',evidenceIds:assumption.evidenceIds.slice(0,1)},elections);
    state=applyReasonedChoice(state,linked,state.senate[linked.seatId],{...bareReason,assumptionIds:[assumption.assumptionId]},elections);
    if(snapshot==='missing')delete state.reasoning!.races[linked.electionId].commonAtAssessment;
    const oldReasons=structuredClone(state.reasoning!.races);
    for(const election of addedFocus)state=applyReasonedChoice(state,election,candidateChoice(election),bareReason,elections);
    for(const loaded of [normalize(state),decode(independentPayload(state))]){
      expect(loaded.staleBaseline).toBe(true);
      expect(loaded.state.senateBaseline).toEqual(oldBaseline);
      expect(Object.keys(loaded.state.senateBaseline.outcomes)).toHaveLength(100);
      expect(loaded.state.senate).toEqual(state.senate);
      for(const election of previousFocus)expect(loaded.state.reasoning!.races[election.electionId]).toEqual(oldReasons[election.electionId]);
      expect(reasonChoiceIsCurrent(loaded.state,linked)).toBe(snapshot==='recorded'?true:null);
      expect(loaded.notices.join(' ')).toContain('自動更新していません');
    }
  });
});
