import { describe,expect,it } from 'vitest';
import { elections,seats,sources,states,vicePresident } from '../src/data/data';
import type { Election, Seat, VicePresident } from '../src/data/model';
import { currentCaucusCounts,majorityText,simulatedCounts,uniqueElectionSeatIds,validateData } from '../src/logic';

const total = (counts: ReturnType<typeof currentCaucusCounts>) => Object.values(counts).reduce((sum,value) => sum + value,0);

describe('2026 Senate data integrity',() => {
  it('has 50 states, 100 sourced seats, 33 regular and 2 special elections',() => {
    expect(validateData(states,seats,elections,sources)).toEqual([]);
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
    expect(majorityText({Democratic:50,Republican:50,none:0,unconfirmed:0,vacant:0},vicePresident)).toContain('未確認');
  });
});
