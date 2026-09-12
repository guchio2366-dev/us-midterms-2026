import type { Caucus, Election, Rating, Seat } from '../data/model';
import type { ScenarioState } from './model';
import { caucusForChoice } from './model';
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
  races: PathRace[];
  addedSeatIds: string[];
  targetContestedSeats: number;
  difficulty: Record<string,number>;
}

export interface SenatePathResult {
  status: 'reached'|'already-reached'|'locked-impossible'|'election-impossible'|'no-senate-condition';
  fixedSeats: number;
  currentScenarioSeats: number;
  targetSeats: number|null;
  shortage: number;
  requiredContestedSeats: number;
  paths: SenatePath[];
}

const targetParty = (caucus: 'Democratic'|'Republican') => caucus === 'Democratic' ? 'D' : 'R';

function preferenceRank(rating: Rating, caucus: 'Democratic'|'Republican'): number {
  const party = targetParty(caucus);
  const ranks: Record<Rating,number> = party === 'D'
    ? {'Solid D':0,'Likely D':1,'Lean D':2,'Toss Up':3,'Lean R':4,'Likely R':5,'Solid R':6,unavailable:7}
    : {'Solid R':0,'Likely R':1,'Lean R':2,'Toss Up':3,'Lean D':4,'Likely D':5,'Solid D':6,unavailable:7};
  return ranks[rating];
}

function rotate<T>(items: T[], offset: number): T[] {
  if (!items.length) return [];
  const normalized = offset % items.length;
  return [...items.slice(normalized),...items.slice(0,normalized)];
}

function scenarioCaucusForSeat(state: ScenarioState, election: Election, seat: Seat): Caucus {
  const choice = state.senate[seat.seatId];
  return choice ? caucusForChoice(choice,election) ?? baselineCaucus(seat) : baselineCaucus(seat);
}

export function generateSenatePaths(input: {
  seats: Seat[];
  elections: Election[];
  scenario: ScenarioState;
  caucus: 'Democratic'|'Republican';
  threshold: number|null;
  limit?: number;
}): SenatePathResult {
  const {seats,elections,scenario,caucus,threshold} = input;
  const limit = Math.max(1,Math.min(5,input.limit ?? 3));
  const electionSeatIds = new Set(elections.map(election => election.seatId));
  const seatById = new Map(seats.map(seat => [seat.seatId,seat]));
  const electionBySeat = new Map(elections.map(election => [election.seatId,election]));
  const fixedSeats = seats.filter(seat => !electionSeatIds.has(seat.seatId) && baselineCaucus(seat) === caucus).length;
  const currentScenarioSeats = seats.reduce((count,seat) => {
    const election = electionBySeat.get(seat.seatId);
    return count + ((election ? scenarioCaucusForSeat(scenario,election,seat) : baselineCaucus(seat)) === caucus ? 1 : 0);
  },0);
  if (threshold === null) return {status:'no-senate-condition',fixedSeats,currentScenarioSeats,targetSeats:null,shortage:0,requiredContestedSeats:0,paths:[]};
  const shortage = Math.max(0,threshold - currentScenarioSeats);
  const requiredContestedSeats = Math.max(0,threshold - fixedSeats);
  if (shortage === 0) return {status:'already-reached',fixedSeats,currentScenarioSeats,targetSeats:threshold,shortage,requiredContestedSeats,paths:[]};

  const unlocked = new Set(scenario.unlockedSeatIds);
  const held: Election[] = [];
  const candidates: Election[] = [];
  for (const election of elections) {
    const seat = seatById.get(election.seatId)!;
    const current = scenarioCaucusForSeat(scenario,election,seat);
    const explicitlyLocked = Boolean(scenario.senate[election.seatId]) && !unlocked.has(election.seatId);
    if (current === caucus) held.push(election);
    else if (!explicitlyLocked) candidates.push(election);
  }
  const needed = requiredContestedSeats - held.length;
  if (needed <= 0) return {status:'already-reached',fixedSeats,currentScenarioSeats,targetSeats:threshold,shortage:0,requiredContestedSeats,paths:[]};
  if (candidates.length < needed) {
    const status = fixedSeats + elections.length < threshold ? 'election-impossible' : 'locked-impossible';
    return {status,fixedSeats,currentScenarioSeats,targetSeats:threshold,shortage,requiredContestedSeats,paths:[]};
  }

  const ordered = [...candidates].sort((left,right) =>
    preferenceRank(left.rating.category,caucus) - preferenceRank(right.rating.category,caucus)
    || left.rating.category.localeCompare(right.rating.category)
    || left.electionId.localeCompare(right.electionId));
  const boundaryRank = preferenceRank(ordered[needed - 1].rating.category,caucus);
  const guaranteed = ordered.filter(election => preferenceRank(election.rating.category,caucus) < boundaryRank);
  const boundary = ordered.filter(election => preferenceRank(election.rating.category,caucus) === boundaryRank);
  const boundaryNeeded = needed - guaranteed.length;
  const paths: SenatePath[] = [];
  const signatures = new Set<string>();
  for (let offset = 0; offset < Math.max(limit,boundary.length); offset += 1) {
    const selected = [...guaranteed,...rotate(boundary,offset).slice(0,boundaryNeeded)];
    if (selected.length !== needed) continue;
    const signature = selected.map(election => election.seatId).sort().join('|');
    if (signatures.has(signature)) continue;
    signatures.add(signature);
    const added = selected.map(election => ({
      seatId:election.seatId,
      electionId:election.electionId,
      stateFips:seatById.get(election.seatId)!.stateFips,
      rating:election.rating.category,
      isFlip:baselineCaucus(seatById.get(election.seatId)!) !== caucus,
    }));
    const races = [...held.map(election => ({
      seatId:election.seatId,electionId:election.electionId,stateFips:seatById.get(election.seatId)!.stateFips,
      rating:election.rating.category,isFlip:baselineCaucus(seatById.get(election.seatId)!) !== caucus,
    })),...added];
    const difficulty = added.reduce<Record<string,number>>((counts,race) => {
      counts[race.rating] = (counts[race.rating] ?? 0) + 1;
      return counts;
    },{});
    paths.push({pathId:`path-${paths.length + 1}`,races,addedSeatIds:added.map(race => race.seatId),targetContestedSeats:requiredContestedSeats,difficulty});
    if (paths.length >= limit) break;
  }
  return {status:'reached',fixedSeats,currentScenarioSeats,targetSeats:threshold,shortage,requiredContestedSeats,paths};
}
