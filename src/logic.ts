import type { Caucus, Election, Seat, State } from './data/model';
export type Assumptions=Record<string,Caucus>;
export function validateData(states:State[],seats:Seat[],elections:Election[]){
 const errors:string[]=[];
 if(states.length!==50) errors.push(`states=${states.length}`);
 if(seats.length!==100) errors.push(`seats=${seats.length}`);
 const ids=new Set(seats.map(s=>s.seatId)); if(ids.size!==seats.length) errors.push('duplicate seat_id');
 for(const st of states){const ss=seats.filter(s=>s.stateFips===st.fips);if(ss.length!==2)errors.push(`${st.abbr}: seats=${ss.length}`);if(new Set(ss.map(s=>s.senateClass)).size!==2)errors.push(`${st.abbr}: duplicate class`)}
 if(elections.filter(e=>e.type==='regular'&&e.year===2026).length!==33)errors.push('regular 2026 != 33');
 return errors;
}
export function currentCaucusCounts(seats:Seat[]){return seats.reduce((a,s)=>{a[s.caucus]=(a[s.caucus]||0)+1;return a},{Democratic:0,Republican:0,unconfirmed:0} as Record<Caucus,number>)}
export function simulatedCounts(seats:Seat[],elections:Election[],assumptions:Assumptions){
 const electionSeats=new Set(elections.map(e=>e.seatId));
 return seats.reduce((a,s)=>{const caucus=electionSeats.has(s.seatId)?(assumptions[s.seatId]||s.caucus):s.caucus;a[caucus]++;return a},{Democratic:0,Republican:0,unconfirmed:0} as Record<Caucus,number>);
}
export function majorityText(c:Record<Caucus,number>){if(c.unconfirmed)return '未確定の会派があるため判定できません';if(c.Democratic>=51)return '民主党会派が51議席以上';if(c.Republican>=51)return '共和党会派が51議席以上';return '50対50：副大統領の決裁票により運営多数派が決まります';}
