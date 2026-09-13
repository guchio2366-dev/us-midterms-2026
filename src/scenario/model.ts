import type { Candidate, Caucus, Election, HouseDistrict, Seat } from '../data/model';
import type { HouseAssumptions, HouseOutcome } from '../logic';

export const SCENARIO_SCHEMA_VERSION = 2 as const;
export const SCENARIO_BASELINE_VERSION = 'research03-2026-09-12';
export type SenateOutcome = Caucus|'unassigned';
export type SenateOutcomeCounts = Record<SenateOutcome,number>;

export interface SenateBaselineSnapshot {
  kind: 'rating-consensus'|'legacy-holdings';
  snapshotId: string;
  asOf: string;
  methodVersion: string|null;
  seatDataVersion: string;
  outcomes: Record<string,SenateOutcome>;
}

export type SenateChoice =
  | {kind:'candidate'; electionId:string; candidateId:string}
  | {kind:'caucus'; electionId:string; caucus:Caucus}
  | {kind:'unassigned'; electionId:string};

export interface ScenarioTarget { targetId:string; caucus:'Democratic'|'Republican' }
export interface ScenarioState {
  schemaVersion: typeof SCENARIO_SCHEMA_VERSION;
  baselineVersion: string;
  senateBaseline: SenateBaselineSnapshot;
  senate: Record<string,SenateChoice>;
  house: Record<string,HouseOutcome>;
  target: ScenarioTarget|null;
  unlockedSeatIds: string[];
  updatedAt: string;
}
export interface SavedScenario { id:string; name:string; savedAt:string; state:ScenarioState }
export interface ScenarioViewState { selectedStateFips:string|null; selectedHouseDistrictId:string|null; compareStateFips:string[]; mapMode:'current'|'rating' }
export interface ScenarioLoadResult { state:ScenarioState; notices:string[]; staleBaseline:boolean }

const caucuses = new Set<Caucus>(['Democratic','Republican','none','unconfirmed','vacant']);
const senateOutcomes = new Set<SenateOutcome>([...caucuses,'unassigned']);
const houseOutcomes = new Set<HouseOutcome>(['Democratic','Republican','unconfirmed']);
const now = () => new Date().toISOString();

export function cloneSenateBaseline(baseline: SenateBaselineSnapshot): SenateBaselineSnapshot {
  return {...baseline,outcomes:{...baseline.outcomes}};
}
export function createScenarioState(senateBaseline: SenateBaselineSnapshot): ScenarioState {
  return {schemaVersion:SCENARIO_SCHEMA_VERSION,baselineVersion:SCENARIO_BASELINE_VERSION,senateBaseline:cloneSenateBaseline(senateBaseline),senate:{},house:{},target:null,unlockedSeatIds:[],updatedAt:now()};
}
export function cloneScenario(state: ScenarioState): ScenarioState { return JSON.parse(JSON.stringify(state)) as ScenarioState; }
export function touchScenario(state: ScenarioState): ScenarioState { return {...state,updatedAt:now()}; }

export function candidateForChoice(choice: SenateChoice, election: Election): Candidate|null {
  if (choice.kind !== 'candidate' || choice.electionId !== election.electionId) return null;
  return election.candidates.find(candidate => candidate.candidateId === choice.candidateId) ?? null;
}
export function outcomeForChoice(choice: SenateChoice, election: Election): SenateOutcome|null {
  if (choice.electionId !== election.electionId) return null;
  if (choice.kind === 'unassigned') return 'unassigned';
  return choice.kind === 'candidate' ? candidateForChoice(choice,election)?.caucusIntent ?? null : choice.caucus;
}
export function scenarioOutcomeForSeat(state: ScenarioState, seatId: string, election?: Election): SenateOutcome {
  const choice = state.senate[seatId];
  if (choice && election) return outcomeForChoice(choice,election) ?? state.senateBaseline.outcomes[seatId] ?? 'unassigned';
  return state.senateBaseline.outcomes[seatId] ?? 'unassigned';
}
export function countScenarioSenate(state: ScenarioState, seats: Seat[], elections: Election[]): SenateOutcomeCounts {
  const electionBySeat = new Map(elections.map(election => [election.seatId,election]));
  return seats.reduce<SenateOutcomeCounts>((counts,seat) => {
    counts[scenarioOutcomeForSeat(state,seat.seatId,electionBySeat.get(seat.seatId))] += 1;
    return counts;
  },{Democratic:0,Republican:0,none:0,unconfirmed:0,vacant:0,unassigned:0});
}
export function houseAssumptionsFromScenario(state: ScenarioState): HouseAssumptions { return {...state.house}; }
export function scenarioChoiceLabel(choice: SenateChoice, election: Election): string {
  if (choice.kind === 'unassigned') return '未配分';
  if (choice.kind === 'caucus') return '会派のみ指定';
  return candidateForChoice(choice,election)?.name ?? '候補者を再選択';
}

function isRecord(value: unknown): value is Record<string,unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function normalizeBaseline(raw: unknown, seats: Seat[]): SenateBaselineSnapshot|null {
  if (!isRecord(raw) || (raw.kind !== 'rating-consensus' && raw.kind !== 'legacy-holdings') || typeof raw.snapshotId !== 'string' || typeof raw.asOf !== 'string' || !(typeof raw.methodVersion === 'string' || raw.methodVersion === null) || typeof raw.seatDataVersion !== 'string' || !isRecord(raw.outcomes)) return null;
  const outcomes: Record<string,SenateOutcome> = {};
  for (const seat of seats) {
    const outcome = raw.outcomes[seat.seatId];
    if (typeof outcome !== 'string' || !senateOutcomes.has(outcome as SenateOutcome)) return null;
    outcomes[seat.seatId] = outcome as SenateOutcome;
  }
  if (Object.keys(raw.outcomes).length !== seats.length) return null;
  return {kind:raw.kind,snapshotId:raw.snapshotId,asOf:raw.asOf,methodVersion:raw.methodVersion,seatDataVersion:raw.seatDataVersion,outcomes};
}

function copyScenarioFields(raw: Record<string,unknown>, clean: ScenarioState, seats: Seat[], elections: Election[], houseDistricts: HouseDistrict[], notices: string[]) {
  const electionBySeat = new Map(elections.map(election => [election.seatId,election]));
  const validSeatIds = new Set(seats.map(seat => seat.seatId));
  if (isRecord(raw.senate)) for (const [seatId,value] of Object.entries(raw.senate)) {
    if (!validSeatIds.has(seatId) || !isRecord(value)) { notices.push(`${seatId}の上院仮定は対象議席を確認できず、復元しませんでした。`); continue; }
    const election = electionBySeat.get(seatId);
    if (!election || value.electionId !== election.electionId) { notices.push(`${seatId}の選挙データが更新されたため、再選択が必要です。`); continue; }
    if (value.kind === 'candidate' && typeof value.candidateId === 'string') {
      if (election.candidates.some(candidate => candidate.candidateId === value.candidateId)) clean.senate[seatId] = {kind:'candidate',electionId:election.electionId,candidateId:value.candidateId};
      else notices.push(`${seatId}で保存した候補者を現在の名簿で確認できず、再選択が必要です。`);
    } else if (value.kind === 'caucus' && typeof value.caucus === 'string' && caucuses.has(value.caucus as Caucus)) clean.senate[seatId] = {kind:'caucus',electionId:election.electionId,caucus:value.caucus as Caucus};
    else if (value.kind === 'unassigned') clean.senate[seatId] = {kind:'unassigned',electionId:election.electionId};
    else notices.push(`${seatId}の上院仮定は値を確認できず、復元しませんでした。`);
  }
  const validDistrictIds = new Set(houseDistricts.map(district => district.districtId));
  if (isRecord(raw.house)) for (const [districtId,value] of Object.entries(raw.house)) {
    if (validDistrictIds.has(districtId) && typeof value === 'string' && houseOutcomes.has(value as HouseOutcome)) clean.house[districtId] = value as HouseOutcome;
    else notices.push(`${districtId}の下院仮定は現在の選挙区で確認できず、復元しませんでした。`);
  }
  if (isRecord(raw.target) && typeof raw.target.targetId === 'string' && (raw.target.caucus === 'Democratic' || raw.target.caucus === 'Republican')) clean.target = {targetId:raw.target.targetId,caucus:raw.target.caucus};
  const electionSeatIds = new Set(elections.map(election => election.seatId));
  if (Array.isArray(raw.unlockedSeatIds)) clean.unlockedSeatIds = [...new Set(raw.unlockedSeatIds.filter((value): value is string => typeof value === 'string' && electionSeatIds.has(value)))];
  clean.updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : now();
}

export function normalizeScenario(raw: unknown, seats: Seat[], elections: Election[], houseDistricts: HouseDistrict[], currentBaseline: SenateBaselineSnapshot, legacyBaseline: SenateBaselineSnapshot): ScenarioLoadResult {
  const fresh = () => createScenarioState(currentBaseline);
  const notices: string[] = [];
  if (!isRecord(raw)) return {state:fresh(),notices:['保存形式を読み取れなかったため、最新の暫定配分で開きました。'],staleBaseline:false};
  if (raw.schemaVersion === 1) {
    const clean = createScenarioState(legacyBaseline);
    if (raw.baselineVersion !== SCENARIO_BASELINE_VERSION) notices.push('保存時の基準版を確認できないため、既知の旧基準で復元しました。内容を確認してください。');
    copyScenarioFields(raw,clean,seats,elections,houseDistricts,notices);
    notices.unshift('以前の現保有会派を基準にした保存案を復元しました。暫定配分へは自動変更していません。');
    return {state:clean,notices,staleBaseline:true};
  }
  if (raw.schemaVersion !== SCENARIO_SCHEMA_VERSION) return {state:fresh(),notices:['未対応の保存形式のため、最新の暫定配分で開きました。元の保存内容は削除していません。'],staleBaseline:false};
  const baseline = normalizeBaseline(raw.senateBaseline,seats);
  if (!baseline) return {state:fresh(),notices:['保存した上院基準を確認できなかったため、最新の暫定配分で開きました。元の保存内容は削除していません。'],staleBaseline:false};
  const clean = createScenarioState(baseline);
  clean.baselineVersion = typeof raw.baselineVersion === 'string' ? raw.baselineVersion : SCENARIO_BASELINE_VERSION;
  copyScenarioFields(raw,clean,seats,elections,houseDistricts,notices);
  const staleBaseline = baseline.snapshotId !== currentBaseline.snapshotId;
  if (staleBaseline) notices.unshift(`保存案は${baseline.asOf}の上院基準を維持しています。`);
  return {state:clean,notices,staleBaseline};
}
