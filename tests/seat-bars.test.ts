import { describe,expect,it } from 'vitest';
import { prepareSeatBar,seatBarMarkup,seatBarTargetPosition } from '../src/ui/seat-bars';

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
});
