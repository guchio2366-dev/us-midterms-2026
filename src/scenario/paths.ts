import type { Election, Rating, Seat } from '../data/model';
import type { ScenarioState } from './model';
import { cloneScenario, scenarioOutcomeForSeat } from './model';
import { baselineCaucus } from '../logic';

export interface PathRace {
  seatId: string;
  electionId: string;
  stateFips: string;
  rating: Rating;
  isFlip: boolean;
}
export interface SenatePath {
  pathId: string;
  inputKey: string;
  races: PathRace[];
  addedSeatIds: string[];
  targetContestedSeats: number;
  difficulty: Record<string,number>;
}
export interface SenatePathInput {
  seats: Seat[];
  elections: Election[];
  scenario: ScenarioState;
  caucus: 'Democratic'|'Republican';
  threshold: number|null;
  limit?: number;
  ratings?: ReadonlyMap<string,Rating>;
  ratingVersion?: string;
}
export interface SenatePathResult {
  status: 'reached'|'already-reached'|'locked-impossible'|'election-impossible'|'no-senate-condition';
  fixedSeats: number;
  currentScenarioSeats: number;
  targetSeats: number|null;
  shortage: number;
  requiredContestedSeats: number;
  paths: SenatePath[];
  heldSeatIds: string[];
  candidateSeatIds: string[];
  lockedSeatIds: string[];
  commonToDisplayedSeatIds: string[];
  requiredUnderConstraintsSeatIds: string[];
  preferredSharedSeatIds: string[];
  boundarySeatIds: string[];
  boundaryNeeded: number;
  combinationCount: number;
  unratedSeatIds: string[];
}

function preferenceRank(rating: Rating, caucus: SenatePathInput['caucus']): number {
  const own = caucus === 'Democratic' ? 'D' : 'R';
  if (rating === 'unavailable') return 7; // Unrated comes last for evidence availability, not likelihood.
  if (rating === 'Toss Up') return 3;
  const strength = rating.startsWith('Solid') ? 0 : rating.startsWith('Likely') ? 1 : 2;
  return rating.endsWith(own) ? strength : 6-strength;
}
const signature = (ids: string[]) => [...ids].sort().join('|');
const ratingFor = (input: SenatePathInput,e: Election) => input.ratings?.get(e.seatId) ?? e.rating.category;

export function isPathLocked(scenario: ScenarioState, seatId: string): boolean {
  return Boolean(scenario.senate[seatId]) && !scenario.unlockedSeatIds.includes(seatId);
}
export function setPathLock(scenario: ScenarioState, election: Election, locked: boolean): void {
  if (locked) {
    if (!scenario.senate[election.seatId]) {
      const outcome = scenarioOutcomeForSeat(scenario,election.seatId,election);
      scenario.senate[election.seatId] = outcome === 'unassigned'
        ? {kind:'unassigned',electionId:election.electionId}
        : {kind:'caucus',electionId:election.electionId,caucus:outcome};
    }
    scenario.unlockedSeatIds = scenario.unlockedSeatIds.filter(id => id !== election.seatId);
  } else scenario.unlockedSeatIds = [...new Set([...scenario.unlockedSeatIds,election.seatId])];
}

/** Exact semantic input; dates of UI actions and object property ordering do not invalidate an otherwise identical preview. */
export function senatePathInputKey(input: SenatePathInput): string {
  const bySeat = new Map(input.elections.map(e => [e.seatId,e]));
  return JSON.stringify([input.caucus,input.threshold,input.scenario.senateBaseline.snapshotId,input.ratingVersion ?? '',
    [...input.seats].sort((a,b) => a.seatId.localeCompare(b.seatId)).map(seat => {
      const e = bySeat.get(seat.seatId), choice = input.scenario.senate[seat.seatId];
      return [seat.seatId,e?.electionId ?? null,scenarioOutcomeForSeat(input.scenario,seat.seatId,e),
        choice?.kind ?? null,choice?.kind === 'candidate' ? choice.candidateId : null,
        isPathLocked(input.scenario,seat.seatId),e ? ratingFor(input,e) : null];
    })]);
}
function shortHash(value: string): string {
  let hash=2166136261;
  for (let i=0;i<value.length;i++) hash=Math.imul(hash ^ value.charCodeAt(i),16777619);
  return (hash>>>0).toString(36);
}

/** At most five examples. One-swap neighbors prevent duplicate examples without enumerating n-choose-k. */
export function diverseSubsets(ids: string[], count: number, limit: number): string[][] {
  const pool=[...new Set(ids)].sort();
  if (count < 0 || count > pool.length) return [];
  const selected:string[][]=[], seen=new Set<string>(), usage=new Map(pool.map(id=>[id,0]));
  const score=(set:string[])=>set.reduce((sum,id)=>sum+usage.get(id)!,0);
  while (selected.length<limit) {
    let next=[...pool].sort((a,b)=>usage.get(a)!-usage.get(b)! || a.localeCompare(b)).slice(0,count).sort();
    if (seen.has(signature(next))) {
      const alternatives=new Map<string,string[]>();
      for (const prior of selected) for (const removed of prior) for (const added of pool) {
        if (prior.includes(added)) continue;
        const candidate=[...prior.filter(id=>id!==removed),added].sort();
        const key=signature(candidate);
        if (!seen.has(key)) alternatives.set(key,candidate);
      }
      const replacement=[...alternatives.values()].sort((a,b)=>score(a)-score(b)||signature(a).localeCompare(signature(b)))[0];
      if (!replacement) break;
      next=replacement;
    }
    selected.push(next); seen.add(signature(next));
    next.forEach(id=>usage.set(id,usage.get(id)!+1));
  }
  return selected;
}
function combinations(n:number,k:number):number {
  let value=1;
  for (let i=1;i<=Math.min(k,n-k);i++) value=value*(n-i+1)/i;
  return Math.round(value);
}

export function createSenatePath(input: SenatePathInput, addedSeatIds: string[]): SenatePath {
  const bySeat=new Map(input.seats.map(s=>[s.seatId,s]));
  const byElection=new Map(input.elections.map(e=>[e.seatId,e]));
  const added=[...new Set(addedSeatIds)].sort();
  const held=input.elections.filter(e=>scenarioOutcomeForSeat(input.scenario,e.seatId,e)===input.caucus);
  const fixed=input.seats.filter(s=>!byElection.has(s.seatId)&&scenarioOutcomeForSeat(input.scenario,s.seatId)===input.caucus).length;
  if (input.threshold === null || added.length !== Math.max(0,input.threshold-fixed-held.length)) throw new Error('Wrong additional seat count');
  for (const id of added) {
    const e=byElection.get(id);
    if (!e || !bySeat.has(id) || isPathLocked(input.scenario,id) || scenarioOutcomeForSeat(input.scenario,id,e)===input.caucus) throw new Error('Seat is not an eligible alternative');
  }
  const race=(e:Election):PathRace=>({seatId:e.seatId,electionId:e.electionId,stateFips:bySeat.get(e.seatId)!.stateFips,rating:ratingFor(input,e),isFlip:baselineCaucus(bySeat.get(e.seatId)!)!==input.caucus});
  const addedRaces=added.map(id=>race(byElection.get(id)!));
  const difficulty=addedRaces.reduce<Record<string,number>>((counts,r)=>{counts[r.rating]=(counts[r.rating]??0)+1;return counts;},{});
  const inputKey=senatePathInputKey(input);
  return {pathId:`path-${shortHash(inputKey)}-${added.join('-')}`,inputKey,races:[...held.map(race),...addedRaces],addedSeatIds:added,targetContestedSeats:Math.max(0,input.threshold-fixed),difficulty};
}

export function previewSenatePath(input:SenatePathInput,path:SenatePath):ScenarioState {
  if (path.inputKey!==senatePathInputKey(input)) throw new Error('Path preview is stale');
  const verified=createSenatePath(input,path.addedSeatIds);
  const next=cloneScenario(input.scenario);
  for (const id of verified.addedSeatIds) {
    const e=input.elections.find(e=>e.seatId===id)!;
    next.senate[id]={kind:'caucus',electionId:e.electionId,caucus:input.caucus};
    next.unlockedSeatIds=next.unlockedSeatIds.filter(value=>value!==id);
  }
  return next;
}

export function generateSenatePaths(input: SenatePathInput): SenatePathResult {
  const {seats,scenario,caucus,threshold}=input;
  const elections=[...new Map(input.elections.map(e=>[e.seatId,e])).values()];
  const byElection=new Map(elections.map(e=>[e.seatId,e]));
  const fixedSeats=seats.filter(s=>!byElection.has(s.seatId)&&scenarioOutcomeForSeat(scenario,s.seatId)===caucus).length;
  const held=elections.filter(e=>scenarioOutcomeForSeat(scenario,e.seatId,e)===caucus);
  const candidates=elections.filter(e=>scenarioOutcomeForSeat(scenario,e.seatId,e)!==caucus&&!isPathLocked(scenario,e.seatId));
  const currentScenarioSeats=fixedSeats+held.length;
  const result:SenatePathResult={status:'reached',fixedSeats,currentScenarioSeats,targetSeats:threshold,
    shortage:threshold===null?0:Math.max(0,threshold-currentScenarioSeats),
    requiredContestedSeats:threshold===null?0:Math.max(0,threshold-fixedSeats),paths:[],
    heldSeatIds:held.map(e=>e.seatId),candidateSeatIds:candidates.map(e=>e.seatId),
    lockedSeatIds:elections.filter(e=>isPathLocked(scenario,e.seatId)).map(e=>e.seatId),
    commonToDisplayedSeatIds:[],requiredUnderConstraintsSeatIds:[],preferredSharedSeatIds:[],boundarySeatIds:[],boundaryNeeded:0,combinationCount:0,
    unratedSeatIds:candidates.filter(e=>ratingFor(input,e)==='unavailable').map(e=>e.seatId)};
  if (threshold===null) return {...result,status:'no-senate-condition'};
  if (!result.shortage) return {...result,status:'already-reached'};
  if (candidates.length<result.shortage) return {...result,status:fixedSeats+elections.length<threshold?'election-impossible':'locked-impossible'};
  const ordered=[...candidates].sort((a,b)=>preferenceRank(ratingFor(input,a),caucus)-preferenceRank(ratingFor(input,b),caucus)||a.electionId.localeCompare(b.electionId));
  const boundaryRank=preferenceRank(ratingFor(input,ordered[result.shortage-1]),caucus);
  result.preferredSharedSeatIds=ordered.filter(e=>preferenceRank(ratingFor(input,e),caucus)<boundaryRank).map(e=>e.seatId);
  result.boundarySeatIds=ordered.filter(e=>preferenceRank(ratingFor(input,e),caucus)===boundaryRank).map(e=>e.seatId);
  result.boundaryNeeded=result.shortage-result.preferredSharedSeatIds.length;
  result.combinationCount=combinations(result.boundarySeatIds.length,result.boundaryNeeded);
  result.paths=diverseSubsets(result.boundarySeatIds,result.boundaryNeeded,Math.max(1,Math.min(5,input.limit??3)))
    .map(subset=>createSenatePath(input,[...result.preferredSharedSeatIds,...subset]));
  result.commonToDisplayedSeatIds=result.paths[0].addedSeatIds.filter(id=>result.paths.every(path=>path.addedSeatIds.includes(id)));
  result.requiredUnderConstraintsSeatIds=candidates.length-1<result.shortage?candidates.map(e=>e.seatId):[];
  return result;
}
