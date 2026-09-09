import { describe,expect,it } from 'vitest';
import { elections,seats,states } from '../src/data/data';
import { currentCaucusCounts,simulatedCounts,validateData } from '../src/logic';
describe('election data integrity',()=>{
 it('has 50 states, 100 unique seats and 33 regular elections',()=>expect(validateData(states,seats,elections)).toEqual([]));
 it('current caucus totals add to 100',()=>expect(Object.values(currentCaucusCounts(seats)).reduce((a,b)=>a+b,0)).toBe(100));
 it('one flip subtracts one caucus and adds one to the other',()=>{const e=elections[0],seat=seats.find(s=>s.seatId===e.seatId)!;const before=simulatedCounts(seats,elections,{});const target=seat.caucus==='Republican'?'Democratic':'Republican';const after=simulatedCounts(seats,elections,{[seat.seatId]:target});expect(after[target]-before[target]).toBe(1);expect(after[seat.caucus]-before[seat.caucus]).toBe(-1)});
});
