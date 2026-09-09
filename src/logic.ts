import type { Caucus, Election, EventItem, HouseDistrict, IssueCategory, PowerRule, Profile, Seat, Source, State, StateContext, VerificationStatus, VicePresident } from './data/model';

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
    if (!isDate(election.primaryDate)) errors.push(`${election.electionId}: invalid primary date`);
    if (election.termStartStatus === 'scheduled' && (!isDate(election.termStart) || election.termStart! >= election.termEnd)) errors.push(`${election.electionId}: invalid scheduled term`);
    if (election.termStartStatus === 'pending-inauguration' && (election.type !== 'special' || election.termStart !== null || !election.termStartRule?.trim())) errors.push(`${election.electionId}: pending inauguration needs a rule and no invented date`);
    if (!election.candidates.length || election.candidateResearchStatus === 'not-started') errors.push(`${election.electionId}: candidates not researched`);
    for (const candidate of election.candidates) {
      if (!candidate.name.trim() || !candidate.partyLabel.trim() || !candidate.sourceIds.length) errors.push(`${election.electionId}: incomplete candidate`);
      if (candidate.status !== 'confirmed') errors.push(`${election.electionId}: unconfirmed candidate`);
      if (candidate.party === 'D' && candidate.caucusIntent !== 'Democratic') errors.push(`${election.electionId}: Democratic candidate caucus mismatch`);
      if (candidate.party === 'R' && candidate.caucusIntent !== 'Republican') errors.push(`${election.electionId}: Republican candidate caucus mismatch`);
    }
    if (election.contestStatus === 'general-ballot' && (election.candidateResearchStatus !== 'complete' || election.candidates.some(candidate => candidate.ballotStage === 'primary-ballot'))) errors.push(`${election.electionId}: inconsistent general ballot`);
    if (election.contestStatus !== 'general-ballot' && election.candidateResearchStatus !== 'partial') errors.push(`${election.electionId}: pending primary must remain partial`);
    if (election.rating.category === 'unavailable' || !election.rating.organization || !isDate(election.rating.ratedAt) || !isDate(election.rating.retrievedAt)) errors.push(`${election.electionId}: rating not verified`);
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

export type HouseOutcome = 'Democratic'|'Republican'|'unconfirmed';
export type HouseAssumptions = Record<string,HouseOutcome>;
export type HouseCounts = Record<HouseOutcome,number>;

export function houseRatingOutcome(district: HouseDistrict): HouseOutcome {
  if (district.rating.endsWith('D')) return 'Democratic';
  if (district.rating.endsWith('R')) return 'Republican';
  return 'unconfirmed';
}

export function simulatedHouseCounts(districts: HouseDistrict[], assumptions: HouseAssumptions): HouseCounts {
  return districts.reduce<HouseCounts>((counts,district) => {
    counts[assumptions[district.districtId] ?? houseRatingOutcome(district)] += 1;
    return counts;
  },{Democratic:0,Republican:0,unconfirmed:0});
}

export function houseMajorityText(counts: HouseCounts): string {
  if (counts.Democratic >= 218) return '民主党が下院多数派を確保する仮定';
  if (counts.Republican >= 218) return '共和党が下院多数派を確保する仮定';
  if (counts.unconfirmed) return `未確定${counts.unconfirmed}議席の配分で多数派が決まります`;
  return '218議席に達する党がなく、欠員・第三党を含む運営協議が必要です';
}

export function validateHouseData(districts: HouseDistrict[], states: State[] = [], sources: Source[] = []): string[] {
  const errors: string[] = [];
  if (districts.length !== 435) errors.push(`house districts=${districts.length}`);
  if (new Set(districts.map(district => district.districtId)).size !== districts.length) errors.push('duplicate house district_id');
  for (const district of districts) {
    if (!/^\d{2}$/.test(district.stateFips)) errors.push(`${district.districtId}: invalid state FIPS`);
    if (states.length && !states.some(state => state.fips === district.stateFips)) errors.push(`${district.districtId}: unknown state`);
    if (district.rating === 'unavailable') errors.push(`${district.districtId}: missing rating`);
    if (!district.sourceIds.length) errors.push(`${district.districtId}: missing sources`);
    if (sources.length) for (const sourceId of district.sourceIds) if (!sources.some(source => source.sourceId === sourceId)) errors.push(`${district.districtId}: unknown source ${sourceId}`);
  }
  const total = Object.values(simulatedHouseCounts(districts,{})).reduce((sum,value) => sum + value,0);
  if (total !== 435) errors.push(`house forecast total=${total}`);
  return errors;
}

export function validateEditorialData(
  states: State[], profiles: Profile[], events: EventItem[], contexts: StateContext[],
  powers: PowerRule[], issues: IssueCategory[], sources: Source[],
): string[] {
  const errors: string[] = [];
  const stateIds = new Set(states.map(state => state.fips));
  const sourceIds = new Set(sources.map(source => source.sourceId));
  const eventIds = new Set(events.map(event => event.eventId));
  const powerIds = new Set(powers.map(power => power.powerId));
  if (profiles.length !== 50) errors.push(`profiles=${profiles.length}`);
  if (contexts.length !== 50) errors.push(`contexts=${contexts.length}`);
  if (new Set(profiles.map(profile => profile.stateFips)).size !== profiles.length) errors.push('duplicate profile state');
  if (new Set(contexts.map(context => context.stateFips)).size !== contexts.length) errors.push('duplicate context state');
  if (eventIds.size !== events.length) errors.push('duplicate event_id');
  if (powers.length !== 8 || powerIds.size !== powers.length) errors.push('power taxonomy must contain 8 unique rules');
  if (issues.length !== 8 || new Set(issues.map(issue => issue.issueId)).size !== issues.length) errors.push('issue taxonomy must contain 8 unique primary categories');
  for (const state of states) {
    const profile = profiles.find(item => item.stateFips === state.fips);
    const context = contexts.find(item => item.stateFips === state.fips);
    if (!profile || profile.contentStatus !== '確認済み') errors.push(`${state.abbr}: incomplete profile`);
    if (!context) errors.push(`${state.abbr}: missing context`);
    if (profile && (profile.eventIds.length < 2 || profile.eventIds.length > 4)) errors.push(`${state.abbr}: events=${profile.eventIds.length}`);
    if (profile) {
      for (const eventId of profile.eventIds) if (!eventIds.has(eventId)) errors.push(`${state.abbr}: unknown event ${eventId}`);
      for (const sourceId of [profile.politicalBase,profile.industryAndIssues,profile.historicalTrajectory,profile.electionMeaning].flatMap(item => item.sourceIds)) if (!sourceIds.has(sourceId)) errors.push(`${state.abbr}: unknown source ${sourceId}`);
    }
  }
  for (const event of events) {
    if (!event.stateFips.length || event.stateFips.some(id => !stateIds.has(id))) errors.push(`${event.eventId}: unknown state`);
    for (const sourceId of event.sourceIds) if (!sourceIds.has(sourceId)) errors.push(`${event.eventId}: unknown source ${sourceId}`);
  }
  for (const issue of issues) {
    if (!issue.indicatorLabels.length || !issue.relatedPowerIds.length) errors.push(`${issue.issueId}: missing analytical links`);
    for (const powerId of issue.relatedPowerIds) if (!powerIds.has(powerId)) errors.push(`${issue.issueId}: unknown power ${powerId}`);
    for (const sourceId of issue.sourceIds) if (!sourceIds.has(sourceId)) errors.push(`${issue.issueId}: unknown source ${sourceId}`);
  }
  return errors;
}
