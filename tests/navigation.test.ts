import { afterEach, describe, expect, it, vi } from 'vitest';
import { scrollStateDetailIntoView } from '../src/ui/navigation';

afterEach(() => vi.unstubAllGlobals());
describe('state detail scrolling', () => {
  it('clears the actual sticky header height and ignores static headers', () => {
    const target = { style: { scrollMarginTop: '' }, scrollIntoView: vi.fn() };
    const headers = [{position:'sticky',top:'62px',height:89.84},{position:'static',top:'0px',height:500}];
    vi.stubGlobal('document',{querySelector:()=>target,querySelectorAll:()=>headers.map(h=>({...h,getBoundingClientRect:()=>({height:h.height})}))});
    vi.stubGlobal('getComputedStyle',(header:unknown)=>header);
    scrollStateDetailIntoView({behavior:'instant',block:'start'});
    expect(Number.parseFloat(target.style.scrollMarginTop)).toBeCloseTo(163.84);
    expect(target.scrollIntoView).toHaveBeenCalledWith({behavior:'instant',block:'start'});
  });
  it('allows navigation when no state detail exists', () => {
    vi.stubGlobal('document',{querySelector:()=>null});
    expect(()=>scrollStateDetailIntoView({block:'start'})).not.toThrow();
  });
});
