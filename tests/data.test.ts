import { describe,expect,it } from 'vitest';
import { elections,seats,sources,states,vicePresident } from '../src/data/data';
import { verifiedRoster } from '../src/data/verified-roster';
import type { Election, Seat, VicePresident } from '../src/data/model';
import { currentCaucusCounts,majorityText,simulatedCounts,uniqueElectionSeatIds,validateData } from '../src/logic';

const total = (counts: ReturnType<typeof currentCaucusCounts>) => Object.values(counts).reduce((sum,value) => sum + value,0);

describe('2026 Senate data integrity',() => {
  it('has 50 states, 100 sourced seats, 33 regular and 2 special elections',() => {
    expect(validateData(states,seats,elections,sources,vicePresident)).toEqual([]);
    expect(elections.filter(election => election.type === 'regular')).toHaveLength(33);
    expect(elections.filter(election => election.type === 'special').map(election => election.seatId).sort()).toEqual(['FL-3','OH-3']);
    expect(uniqueElectionSeatIds(elections)).toHaveLength(35);
  });

  it('matches explicit party and caucus control totals without deriving caucus from party',() => {
    expect(seats.filter(seat => seat.party === 'R')).toHaveLength(53);
    expect(seats.filter(seat => seat.party === 'D')).toHaveLength(45);
    expect(seats.filter(seat => seat.party === 'I')).toHaveLength(2);
    expect(seats.filter(seat => seat.senateClass === 2 && seat.party === 'R')).toHaveLength(20);
    expect(seats.filter(seat => seat.senateClass === 2 && seat.party === 'D')).toHaveLength(13);
    expect(currentCaucusCounts(seats)).toEqual({Democratic:47,Republican:53,none:0,unconfirmed:0,vacant:0});
    const independent: Seat = {...seats[0],seatId:'XX-1',party:'I',caucus:'none'};
    expect(currentCaucusCounts([independent])).toEqual({Democratic:0,Republican:0,none:1,unconfirmed:0,vacant:0});
  });

  it('has 35 target and 65 non-election seats with requested baseline split',() => {
    const target = new Set(uniqueElectionSeatIds(elections));
    const targetSeats = seats.filter(seat => target.has(seat.seatId));
    const nonElection = seats.filter(seat => !target.has(seat.seatId));
    expect(targetSeats).toHaveLength(35);
    expect(targetSeats.filter(seat => seat.party === 'R')).toHaveLength(22);
    expect(targetSeats.filter(seat => seat.party === 'D')).toHaveLength(13);
    expect(nonElection).toHaveLength(65);
    expect(currentCaucusCounts(nonElection)).toEqual({Democratic:34,Republican:31,none:0,unconfirmed:0,vacant:0});
  });

  it.each(['AL-2','FL-3','OH-3'] as const)('applies a flip for %s and keeps the total at 100',(seatId) => {
    const seat = seats.find(item => item.seatId === seatId)!;
    const before = simulatedCounts(seats,elections,{});
    const target = seat.caucus === 'Republican' ? 'Democratic' : 'Republican';
    const after = simulatedCounts(seats,elections,{[seatId]:target});
    expect(after[target] - before[target]).toBe(1);
    expect(after[seat.caucus] - before[seat.caucus]).toBe(-1);
    expect(total(after)).toBe(100);
  });

  it('keeps every category in the denominator when all target seats are unresolved',() => {
    const assumptions = Object.fromEntries(uniqueElectionSeatIds(elections).map(seatId => [seatId,'unconfirmed'] as const));
    const counts = simulatedCounts(seats,elections,assumptions);
    expect(counts.unconfirmed).toBe(35);
    expect(counts.Democratic).toBe(34);
    expect(counts.Republican).toBe(31);
    expect(total(counts)).toBe(100);
  });

  it('keeps nonaligned, unconfirmed and vacant seats as separate categories',() => {
    const samples: Seat[] = [
      {...seats[0],seatId:'XX-1',party:'I',caucus:'none'},
      {...seats[0],seatId:'XX-2',party:'unknown',caucus:'unconfirmed'},
      {...seats[0],seatId:'XX-3',party:'vacant',caucus:'vacant',vacant:true,incumbent:null},
    ];
    expect(currentCaucusCounts(samples)).toEqual({Democratic:0,Republican:0,none:1,unconfirmed:1,vacant:1});
  });

  it('does not count an unreviewed affiliation as a verified party baseline',() => {
    const unreviewed: Seat = {...seats[0],verificationStatus:'primary-source-recheck-required',verifiedAt:null};
    expect(currentCaucusCounts([unreviewed]).unconfirmed).toBe(1);
    expect(simulatedCounts([unreviewed],elections,{}).unconfirmed).toBe(1);
    expect(simulatedCounts([unreviewed],elections,{[unreviewed.seatId]:'Democratic'}).Democratic).toBe(1);
  });

  it('an empty assumption object restores the explicit hold baseline',() => {
    const changed = simulatedCounts(seats,elections,{'FL-3':'Democratic','OH-3':'unconfirmed'});
    expect(changed).not.toEqual(currentCaucusCounts(seats));
    expect(simulatedCounts(seats,elections,{})).toEqual(currentCaucusCounts(seats));
  });

  it('rejects competing election records for the same seat and target Congress',() => {
    const duplicate: Election = {...elections[0],electionId:'duplicate'};
    expect(() => uniqueElectionSeatIds([...elections,duplicate])).toThrow(/Conflicting elections/);
    expect(validateData(states,seats,[...elections,duplicate],sources)).toContain(`Conflicting elections for ${duplicate.seatId} at 2027-01-03`);
  });
});

describe('primary-source verification',() => {
  it('contains 100 identified current members and the two replacements found during review',() => {
    expect(verifiedRoster).toHaveLength(100);
    expect(new Set(verifiedRoster.map(member => member.bioguideId)).size).toBe(100);
    expect(new Set(verifiedRoster.map(member => member.seatId))).toEqual(new Set(seats.map(seat => seat.seatId)));
    expect(seats.find(seat => seat.seatId === 'OK-2')?.incumbent).toBe('Alan Armstrong');
    expect(seats.find(seat => seat.seatId === 'SC-2')?.incumbent).toBe('Darline Graham');
    expect(seats.some(seat => ['Markwayne Mullin','Lindsey Graham'].includes(seat.incumbent ?? ''))).toBe(false);
    expect(seats.every(seat => seat.verificationStatus === 'confirmed' && seat.verifiedAt === '2026-09-09')).toBe(true);
  });

  it('uses the caucus directory, including for both independent senators',() => {
    for (const seatId of ['ME-1','VT-1']) {
      const seat = seats.find(item => item.seatId === seatId)!;
      expect(seat.party).toBe('I');
      expect(seat.caucus).toBe('Democratic');
      expect(seat.attributeSourceIds.caucus).toEqual(['democratic-caucus']);
    }
  });

  it('keeps seat-cycle terms separate from the future inauguration date of special-election winners',() => {
    expect([1,2,3].map(value => seats.filter(seat => seat.senateClass === value).length)).toEqual([33,33,34]);
    const terms = {1:['2025-01-03','2031-01-03'],2:['2021-01-03','2027-01-03'],3:['2023-01-03','2029-01-03']};
    for (const seat of seats) expect([seat.termStart,seat.termEnd]).toEqual(terms[seat.senateClass]);
    for (const election of elections) {
      if (election.type === 'regular') {
        expect([election.termStart,election.termEnd]).toEqual(['2027-01-03','2033-01-03']);
        expect(election.termStartStatus).toBe('scheduled');
      } else {
        expect(election.termStart).toBeNull();
        expect(election.termStartStatus).toBe('pending-inauguration');
        expect(election.termStartRule).toBeTruthy();
        expect(election.termEnd).toBe('2029-01-03');
        expect(election.verificationStatus).toBe('confirmed');
      }
    }
  });

  it('rejects confirmed records with missing field evidence, dates or unchecked sources',() => {
    const noCaucusEvidence: Seat = {...seats[0],attributeSourceIds:{...seats[0].attributeSourceIds,caucus:[]}};
    expect(validateData(states,[noCaucusEvidence,...seats.slice(1)],elections,sources)).toContain(`${seats[0].seatId}.caucus: confirmed field needs evidence`);
    expect(validateData(states,[{...seats[0],verifiedAt:null},...seats.slice(1)],elections,sources)).toContain(`${seats[0].seatId}: confirmed record needs verification date`);
    const unchecked = sources.map(source => source.sourceId === 'senate-members' ? {...source,contentVerifiedAt:null} : source);
    expect(validateData(states,seats,elections,unchecked)).toContain(`${seats[0].seatId}.incumbent: source not verified by record date`);
    expect(validateData(states,seats,elections,[])).toContain('confirmed records require a source registry');
  });

  it('checks election and vice-president evidence rather than only seats',() => {
    const missingTerm = {...elections[0],attributeSourceIds:{...elections[0].attributeSourceIds,termEnd:[]}};
    expect(validateData(states,seats,[missingTerm,...elections.slice(1)],sources)).toContain(`${missingTerm.electionId}.termEnd: confirmed field needs evidence`);
    const badVicePresident = {...vicePresident,attributeSourceIds:{...vicePresident.attributeSourceIds,party:['missing']}};
    expect(validateData(states,seats,elections,sources,badVicePresident)).toContain('vice-president: unknown source missing');
    const special = elections.find(election => election.type === 'special')!;
    expect(validateData(states,seats,elections.map(election => election === special ? {...special,termStart:'2027-01-03'} : election),sources)).toContain(`${special.electionId}: pending inauguration needs a rule and no invented date`);
  });

  it('does not promote unfinished candidate, rating or statistical research when the baseline is confirmed',() => {
    expect(elections.every(election => election.candidateResearchStatus === 'not-started' && election.candidates.length === 0 && election.rating.category === 'unavailable')).toBe(true);
    for (const sourceId of ['census-profile','bls-qcew','bea-state']) {
      const source = sources.find(item => item.sourceId === sourceId)!;
      expect(source.retrievedAt).toBeNull();
      expect(source.contentVerifiedAt).toBeNull();
    }
    const xml = sources.find(source => source.sourceId === 'senate-members-xml')!;
    expect(xml.updatedAt).toBe('2026-08-03T09:54-05:00');
    expect(xml.retrievedAt).toBe('2026-09-09');
  });
});

describe('majority guide',() => {
  const republicanVicePresident: VicePresident = {...vicePresident,party:'R',verificationStatus:'confirmed'};
  const unknownVicePresident: VicePresident = {...vicePresident,party:'unknown',verificationStatus:'confirmed'};
  it.each([
    [{Democratic:51,Republican:49,none:0,unconfirmed:0,vacant:0},'民主党会派'],
    [{Democratic:50,Republican:50,none:0,unconfirmed:0,vacant:0},'共和党会派'],
    [{Democratic:51,Republican:48,none:0,unconfirmed:1,vacant:0},'民主党会派'],
    [{Democratic:49,Republican:50,none:0,unconfirmed:1,vacant:0},'共和党会派'],
    [{Democratic:49,Republican:49,none:0,unconfirmed:2,vacant:0},'2議席次第'],
  ] as const)('evaluates %o without discarding unresolved seats',(counts,expected) => {
    expect(majorityText({...counts},republicanVicePresident)).toContain(expected);
  });
  it('does not call a 50-50 Senate for an unconfirmed vice president',() => {
    expect(majorityText({Democratic:50,Republican:50,none:0,unconfirmed:0,vacant:0},unknownVicePresident)).toContain('未確認');
    expect(majorityText({Democratic:50,Republican:50,none:0,unconfirmed:0,vacant:0},{...vicePresident,verificationStatus:'primary-source-recheck-required',verifiedAt:null})).toContain('未確認');
  });
  it('uses the verified current vice president for the explicitly stated continuation assumption',() => {
    expect(vicePresident).toMatchObject({name:'JD Vance',party:'R',verificationStatus:'confirmed',verifiedAt:'2026-09-09'});
    expect(majorityText({Democratic:50,Republican:50,none:0,unconfirmed:0,vacant:0},vicePresident)).toContain('共和党会派');
  });
});
