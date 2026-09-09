import type { Caucus, Election, Seat, Source, State, VicePresident } from './data/model';

export type Assumptions = Record<string,Caucus>;
export type CaucusCounts = Record<Caucus,number>;

export const emptyCounts = (): CaucusCounts => ({Democratic:0,Republican:0,none:0,unconfirmed:0,vacant:0});

export function uniqueElectionSeatIds(elections: Election[]): string[] {
  const seen = new Map<string,Election>();
  for (const election of elections) {
    const previous = seen.get(election.seatId);
    if (previous && previous.congressAsOf === election.congressAsOf) {
      throw new Error(`Conflicting elections for ${election.seatId} at ${election.congressAsOf}`);
    }
    seen.set(election.seatId,election);
  }
  return [...seen.keys()];
}

export function validateData(states: State[], seats: Seat[], elections: Election[], sources: Source[] = []): string[] {
  const errors: string[] = [];
  if (states.length !== 50) errors.push(`states=${states.length}`);
  if (seats.length !== 100) errors.push(`seats=${seats.length}`);
  const ids = new Set(seats.map(seat => seat.seatId));
  if (ids.size !== seats.length) errors.push('duplicate seat_id');
  for (const state of states) {
    const stateSeats = seats.filter(seat => seat.stateFips === state.fips);
    if (stateSeats.length !== 2) errors.push(`${state.abbr}: seats=${stateSeats.length}`);
    if (new Set(stateSeats.map(seat => seat.senateClass)).size !== 2) errors.push(`${state.abbr}: duplicate class`);
  }
  for (const election of elections) if (!ids.has(election.seatId)) errors.push(`${election.electionId}: unknown seat`);
  try { uniqueElectionSeatIds(elections); } catch (error) { errors.push((error as Error).message); }
  if (elections.filter(election => election.type === 'regular' && election.year === 2026).length !== 33) errors.push('regular 2026 != 33');
  if (elections.filter(election => election.type === 'special' && election.year === 2026).length !== 2) errors.push('special 2026 != 2');
  if (sources.length) {
    const sourceIds = new Set(sources.map(source => source.sourceId));
    for (const seat of seats) for (const id of seat.sourceIds) if (!sourceIds.has(id)) errors.push(`${seat.seatId}: unknown source ${id}`);
    for (const election of elections) for (const id of [...election.sourceIds,...election.rating.sourceIds]) if (!sourceIds.has(id)) errors.push(`${election.electionId}: unknown source ${id}`);
  }
  return errors;
}

export function currentCaucusCounts(seats: Seat[]): CaucusCounts {
  return seats.reduce((counts,seat) => {
    const category = seat.vacant ? 'vacant' : seat.caucus;
    counts[category] += 1;
    return counts;
  },emptyCounts());
}

export function simulatedCounts(seats: Seat[], elections: Election[], assumptions: Assumptions): CaucusCounts {
  const electionSeats = new Set(uniqueElectionSeatIds(elections));
  return seats.reduce((counts,seat) => {
    const current = seat.vacant ? 'vacant' : seat.caucus;
    const category = electionSeats.has(seat.seatId) ? (assumptions[seat.seatId] ?? current) : current;
    counts[category] += 1;
    return counts;
  },emptyCounts());
}

export function majorityText(counts: CaucusCounts, vicePresident: VicePresident|null): string {
  if (counts.Democratic >= 51) return '民主党会派が仮定上、必要議席を確保（51議席以上）';
  if (counts.Republican >= 51) return '共和党会派が仮定上、必要議席を確保（51議席以上）';
  const confirmedVicePresident = vicePresident?.verificationStatus === 'confirmed' ? vicePresident : null;
  if (counts.Democratic >= 50 && confirmedVicePresident?.party === 'D') return '民主党会派が仮定上、50議席と民主党副大統領の決裁票を確保';
  if (counts.Republican >= 50 && confirmedVicePresident?.party === 'R') return '共和党会派が仮定上、50議席と共和党副大統領の決裁票を確保';
  const unresolved = counts.unconfirmed + counts.none + counts.vacant;
  if (unresolved > 0) return `未確定・非所属・空席の${unresolved}議席次第`;
  if (counts.Democratic === 50 && counts.Republican === 50 && (!confirmedVicePresident || confirmedVicePresident.party === 'unknown')) return '50対50：副大統領の前提が未確認のため判定できません';
  return 'いずれの会派も単純多数の目安を確保していません';
}
