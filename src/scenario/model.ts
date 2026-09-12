import type { Candidate, Caucus, Election, HouseDistrict, Seat } from '../data/model';
import type { HouseAssumptions, HouseOutcome } from '../logic';
import { baselineCaucus } from '../logic';

export const SCENARIO_SCHEMA_VERSION = 1 as const;
export const SCENARIO_BASELINE_VERSION = 'research03-2026-09-12';

export type SenateChoice =
  | {kind:'candidate'; electionId:string; candidateId:string}
  | {kind:'caucus'; electionId:string; caucus:Caucus};

export interface ScenarioTarget {
  targetId: string;
  caucus: 'Democratic'|'Republican';
}

export interface ScenarioState {
  schemaVersion: typeof SCENARIO_SCHEMA_VERSION;
  baselineVersion: string;
  senate: Record<string,SenateChoice>;
  house: Record<string,HouseOutcome>;
  target: ScenarioTarget|null;
  unlockedSeatIds: string[];
  updatedAt: string;
}

export interface SavedScenario {
  id: string;
  name: string;
  savedAt: string;
  state: ScenarioState;
}

export interface ScenarioViewState {
  selectedStateFips: string|null;
  selectedHouseDistrictId: string|null;
  compareStateFips: string[];
  mapMode: 'current'|'rating';
}

export interface ScenarioLoadResult {
  state: ScenarioState;
  notices: string[];
  staleBaseline: boolean;
}

const caucuses = new Set<Caucus>(['Democratic','Republican','none','unconfirmed','vacant']);
const houseOutcomes = new Set<HouseOutcome>(['Democratic','Republican','unconfirmed']);

const now = () => new Date().toISOString();

export function createScenarioState(): ScenarioState {
  return {
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    baselineVersion: SCENARIO_BASELINE_VERSION,
    senate: {},
    house: {},
    target: null,
    unlockedSeatIds: [],
    updatedAt: now(),
  };
}

export function cloneScenario(state: ScenarioState): ScenarioState {
  return JSON.parse(JSON.stringify(state)) as ScenarioState;
}

export function touchScenario(state: ScenarioState): ScenarioState {
  return {...state,updatedAt:now()};
}

export function candidateForChoice(choice: SenateChoice, election: Election): Candidate|null {
  if (choice.kind !== 'candidate' || choice.electionId !== election.electionId) return null;
  return election.candidates.find(candidate => candidate.candidateId === choice.candidateId) ?? null;
}

export function caucusForChoice(choice: SenateChoice, election: Election): Caucus|null {
  if (choice.electionId !== election.electionId) return null;
  return choice.kind === 'candidate'
    ? candidateForChoice(choice,election)?.caucusIntent ?? null
    : choice.caucus;
}

export function senateAssumptionsFromScenario(state: ScenarioState, elections: Election[]): Record<string,Caucus> {
  const bySeat = new Map(elections.map(election => [election.seatId,election]));
  const assumptions: Record<string,Caucus> = {};
  for (const [seatId,choice] of Object.entries(state.senate)) {
    const election = bySeat.get(seatId);
    if (!election) continue;
    const caucus = caucusForChoice(choice,election);
    if (caucus) assumptions[seatId] = caucus;
  }
  return assumptions;
}

export function houseAssumptionsFromScenario(state: ScenarioState): HouseAssumptions {
  return {...state.house};
}

export function scenarioChoiceLabel(choice: SenateChoice, election: Election): string {
  if (choice.kind === 'caucus') return '会派のみ指定';
  const candidate = candidateForChoice(choice,election);
  return candidate?.name ?? '候補者を再選択';
}

function isRecord(value: unknown): value is Record<string,unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeScenario(
  raw: unknown,
  seats: Seat[],
  elections: Election[],
  houseDistricts: HouseDistrict[],
): ScenarioLoadResult {
  const clean = createScenarioState();
  const notices: string[] = [];
  if (!isRecord(raw) || raw.schemaVersion !== SCENARIO_SCHEMA_VERSION) {
    return {state:clean,notices:['保存形式を読み取れなかったため、初期状態で開きました。'],staleBaseline:false};
  }
  const staleBaseline = raw.baselineVersion !== SCENARIO_BASELINE_VERSION;
  if (staleBaseline) notices.push('保存時と現在で基準データの版が異なります。有効な選択だけを現在の版へ移しました。');

  const electionBySeat = new Map(elections.map(election => [election.seatId,election]));
  const validSeatIds = new Set(seats.map(seat => seat.seatId));
  if (isRecord(raw.senate)) {
    for (const [seatId,value] of Object.entries(raw.senate)) {
      if (!validSeatIds.has(seatId) || !isRecord(value)) {
        notices.push(`${seatId}の上院仮定は対象議席を確認できず、復元しませんでした。`);
        continue;
      }
      const election = electionBySeat.get(seatId);
      if (!election || value.electionId !== election.electionId) {
        notices.push(`${seatId}の選挙データが更新されたため、再選択が必要です。`);
        continue;
      }
      if (value.kind === 'candidate' && typeof value.candidateId === 'string') {
        if (election.candidates.some(candidate => candidate.candidateId === value.candidateId)) {
          clean.senate[seatId] = {kind:'candidate',electionId:election.electionId,candidateId:value.candidateId};
        } else notices.push(`${seatId}で保存した候補者を現在の名簿で確認できず、再選択が必要です。`);
      } else if (value.kind === 'caucus' && typeof value.caucus === 'string' && caucuses.has(value.caucus as Caucus)) {
        clean.senate[seatId] = {kind:'caucus',electionId:election.electionId,caucus:value.caucus as Caucus};
      } else notices.push(`${seatId}の上院仮定は値を確認できず、復元しませんでした。`);
    }
  }

  const validDistrictIds = new Set(houseDistricts.map(district => district.districtId));
  if (isRecord(raw.house)) {
    for (const [districtId,value] of Object.entries(raw.house)) {
      if (validDistrictIds.has(districtId) && typeof value === 'string' && houseOutcomes.has(value as HouseOutcome)) clean.house[districtId] = value as HouseOutcome;
      else notices.push(`${districtId}の下院仮定は現在の選挙区で確認できず、復元しませんでした。`);
    }
  }

  if (isRecord(raw.target) && typeof raw.target.targetId === 'string' && (raw.target.caucus === 'Democratic' || raw.target.caucus === 'Republican')) {
    clean.target = {targetId:raw.target.targetId,caucus:raw.target.caucus};
  }
  const electionSeatIds = new Set(elections.map(election => election.seatId));
  if (Array.isArray(raw.unlockedSeatIds)) clean.unlockedSeatIds = [...new Set(raw.unlockedSeatIds.filter((value): value is string => typeof value === 'string' && electionSeatIds.has(value)))];
  clean.updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : now();
  return {state:clean,notices,staleBaseline};
}

export function scenarioBaselineCaucus(seat: Seat): Caucus {
  return baselineCaucus(seat);
}
