import type { Caucus, Election, Seat, Source, State, VerificationStatus, VicePresident } from './data/model';

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

export function validateData(states: State[], seats: Seat[], elections: Election[], sources: Source[] = [], vicePresident?: VicePresident): string[] {
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
  for (const seat of seats) {
    const state = states.find(state => state.fips === seat.stateFips);
    if (!state || seat.seatId !== `${state.abbr}-${seat.senateClass}` || !state.classes.includes(seat.senateClass)) errors.push(`${seat.seatId}: state/Class mismatch`);
    if (seat.vacant && (seat.incumbent !== null || seat.party !== 'vacant' || seat.caucus !== 'vacant')) errors.push(`${seat.seatId}: inconsistent vacancy`);
    if (seat.verificationStatus === 'confirmed' && !seat.vacant && (!seat.incumbent?.trim() || ['vacant','unknown'].includes(seat.party) || ['vacant','unconfirmed'].includes(seat.caucus))) errors.push(`${seat.seatId}: confirmed seat has missing membership`);
    if (seat.verificationStatus === 'confirmed' && (!isDate(seat.termStart) || !isDate(seat.termEnd) || seat.termStart! >= seat.termEnd!)) errors.push(`${seat.seatId}: invalid seat term`);
  }
  for (const election of elections) {
    if (!isDate(election.date) || !isDate(election.termEnd)) errors.push(`${election.electionId}: invalid election date/term`);
    if (election.termStartStatus === 'scheduled' && (!isDate(election.termStart) || election.termStart! >= election.termEnd)) errors.push(`${election.electionId}: invalid scheduled term`);
    if (election.termStartStatus === 'pending-inauguration' && (election.type !== 'special' || election.termStart !== null || !election.termStartRule?.trim())) errors.push(`${election.electionId}: pending inauguration needs a rule and no invented date`);
  }
  if (sources.length) {
    const byId = new Map(sources.map(source => [source.sourceId,source]));
    if (byId.size !== sources.length) errors.push('duplicate source_id');
    for (const source of sources) {
      if (source.contentVerifiedAt && (!isDate(source.contentVerifiedAt) || !isDate(source.retrievedAt) || source.retrievedAt! > source.contentVerifiedAt)) errors.push(`${source.sourceId}: invalid retrieval/verification dates`);
    }
    const checkEvidence = (id: string, record: {verificationStatus:VerificationStatus;verifiedAt:string|null;sourceIds:string[];attributeSourceIds:Partial<Record<string,string[]>>}, fields: string[]) => {
      for (const sourceId of [...record.sourceIds,...Object.values(record.attributeSourceIds).flatMap(ids => ids ?? [])]) {
        if (!byId.has(sourceId)) errors.push(`${id}: unknown source ${sourceId}`);
      }
      if (record.verificationStatus !== 'confirmed') return;
      if (!isDate(record.verifiedAt)) errors.push(`${id}: confirmed record needs verification date`);
      for (const field of fields) {
        const ids = record.attributeSourceIds[field] ?? [];
        if (!ids.length) errors.push(`${id}.${field}: confirmed field needs evidence`);
        for (const sourceId of ids) {
          if (!record.sourceIds.includes(sourceId)) errors.push(`${id}.${field}: evidence missing from sourceIds`);
          const source = byId.get(sourceId);
          if (!source || !isDate(source.retrievedAt) || !isDate(source.contentVerifiedAt) || source.contentVerifiedAt! > (record.verifiedAt ?? '')) errors.push(`${id}.${field}: source not verified by record date`);
        }
      }
    };
    for (const seat of seats) checkEvidence(seat.seatId,seat,['incumbent','party','caucus','vacant','senateClass','termStart','termEnd']);
    for (const election of elections) {
      checkEvidence(election.electionId,election,['seatId','type','date','termStart','termEnd']);
      for (const id of [...election.rating.sourceIds,...election.candidates.flatMap(candidate => candidate.sourceIds)]) if (!byId.has(id)) errors.push(`${election.electionId}: unknown source ${id}`);
    }
    if (vicePresident) checkEvidence('vice-president',vicePresident,['name','party']);
  } else if (seats.some(seat => seat.verificationStatus === 'confirmed') || elections.some(election => election.verificationStatus === 'confirmed') || vicePresident?.verificationStatus === 'confirmed') {
    errors.push('confirmed records require a source registry');
  }
  return errors;
}

function isDate(value: string|null): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}

export function baselineCaucus(seat: Seat): Caucus {
  if (seat.verificationStatus !== 'confirmed' || !seat.verifiedAt) return 'unconfirmed';
  return seat.vacant ? 'vacant' : seat.caucus;
}

export function currentCaucusCounts(seats: Seat[]): CaucusCounts {
  return seats.reduce((counts,seat) => {
    const category = baselineCaucus(seat);
    counts[category] += 1;
    return counts;
  },emptyCounts());
}

export function simulatedCounts(seats: Seat[], elections: Election[], assumptions: Assumptions): CaucusCounts {
  const electionSeats = new Set(uniqueElectionSeatIds(elections));
  return seats.reduce((counts,seat) => {
    const current = baselineCaucus(seat);
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
