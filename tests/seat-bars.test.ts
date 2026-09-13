import { describe,expect,it } from 'vitest';
import { prepareSeatBar,seatBarMarkup,seatBarTargetPosition } from '../src/ui/seat-bars';
import { senateBreakdown,senateCompositionSegments,senateMajorityPath } from '../src/ui/senate-bars';
import { elections,seats } from '../src/data/data';
import { currentCaucusCounts,simulatedCounts } from '../src/logic';

describe('seat bar visualization',() => {
  it('scales segment widths against the supplied chamber total',() => {
    const segments = prepareSeatBar([
      {count:214,label:'民主党 214',className:'target-d'},
      {count:221,label:'その他 221',className:'target-other'},
    ],435);
    expect(segments[0].percent).toBeCloseTo(49.1954,4);
    expect(segments[1].percent).toBeCloseTo(50.8046,4);
  });

  it('places targets from either edge',() => {
    expect(seatBarTargetPosition({value:51,from:'left',label:'51'},100)).toBe(51);
    expect(seatBarTargetPosition({value:51,from:'right',label:'51'},100)).toBe(49);
    expect(seatBarTargetPosition({value:218,from:'left',label:'218'},435)).toBeCloseTo(50.1149,4);
  });

  it('rejects totals that would produce a misleading bar',() => {
    expect(() => prepareSeatBar([{count:34,label:'34',className:'fixed-d'}],100)).toThrow(/expected 100/);
    expect(() => prepareSeatBar([{count:-1,label:'-1',className:'fixed-d'}],-1)).toThrow();
    expect(() => prepareSeatBar([{count:-1,label:'bad',className:''},{count:101,label:'bad',className:''}],100)).toThrow();
    expect(() => seatBarTargetPosition({value:101,from:'right',label:'bad'},100)).toThrow();
  });

  it('keeps small values in the legend instead of widening their segments',() => {
    const markup = seatBarMarkup([
      {count:1,label:'無所属 1',className:'target-other'},
      {count:434,label:'その他 434',className:'target-r'},
    ],435,'下院構成');
    expect(markup).toContain('width:0.229885');
    expect(markup).toContain('無所属 1');
    expect(markup).toContain('class="seat-segment target-other tiny"');
  });

  it('counts election seats once and keeps the baseline independent of assumptions',() => {
    expect(() => senateBreakdown(seats,[...elections,elections[0]])).toThrow(/Conflicting elections/);
    const data = senateBreakdown(seats,elections);
    expect(data.contested).toBe(35);
    const before = senateCompositionSegments(data).filter(segment => segment.count);
    expect(before.map(segment => segment.count)).toEqual([34,13,22,31]);
    const seat = seats.find(item => item.caucus === 'Republican' && elections.some(election => election.seatId === item.seatId))!;
    expect(simulatedCounts(seats,elections,{[seat.seatId]:'Democratic'}).Democratic).toBe(currentCaucusCounts(seats).Democratic+1);
    expect(senateCompositionSegments(data).filter(segment => segment.count)).toEqual(before);
  });

  it('keeps required Republican seats next to fixed Republican seats',() => {
    const data = senateBreakdown(seats,elections);
    for (const [party,expected] of [['Democratic',[34,17,18,31]],['Republican',[34,15,20,31]]] as const) {
      const path = senateMajorityPath(data,party);
      expect(path.status).toBe('ready');
      if (path.status !== 'ready') throw new Error('Expected a valid path');
      expect(path.segments.filter(segment => segment.count).map(segment => segment.count)).toEqual(expected);
    }
    expect(senateMajorityPath(data,'Republican',67)).toEqual({status:'unavailable',reason:'今回の選挙だけでは届かない。'});
    expect(senateMajorityPath({...data,fixed:{...data.fixed,unconfirmed:1}},'Democratic').status).toBe('unavailable');
  });

  it('preserves unconfirmed, unaffiliated, and vacant seats in both periods',() => {
    const changed = structuredClone(seats);
    const fixed = changed.filter(seat => !elections.some(election => election.seatId === seat.seatId));
    const contested = changed.filter(seat => elections.some(election => election.seatId === seat.seatId));
    for (const group of [fixed,contested]) {
      group[0].verificationStatus = 'primary-source-recheck-required';
      group[1].caucus = 'none';
      group[2].vacant = true;
    }
    const data = senateBreakdown(changed,elections);
    const segments = senateCompositionSegments(data);
    expect(prepareSeatBar(segments,data.total).reduce((sum,item) => sum+item.count,0)).toBe(100);
    for (const label of ['非改選・会派未確認 1','非改選・会派非所属 1','非改選・空席 1','今回改選・会派未確認 1','今回改選・会派非所属 1','今回改選・空席 1']) {
      expect(segments.some(segment => segment.label === label)).toBe(true);
    }
  });
});
