import { afterEach, describe, expect, it, vi } from 'vitest';
import { scrollStateDetailIntoView,scrollPageHeadingIntoView,setActivePageNavigation } from '../src/ui/navigation';

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

describe('page navigation final position',()=>{
  it('aligns the heading after the actual sticky nav and bypasses duplicate anchor padding',()=>{
    const scrollTo=vi.fn();
    vi.stubGlobal('window',{scrollY:700,scrollTo});
    vi.stubGlobal('document',{querySelector:()=>({position:'sticky',getBoundingClientRect:()=>({height:45})})});
    vi.stubGlobal('getComputedStyle',(nav:unknown)=>nav);
    scrollPageHeadingIntoView({getBoundingClientRect:()=>({top:120})} as HTMLElement,'smooth');
    expect(scrollTo).toHaveBeenCalledWith({top:767,behavior:'smooth'});
  });
  it('keeps navigation inside the document when the heading is near the top',()=>{
    const scrollTo=vi.fn();vi.stubGlobal('window',{scrollY:0,scrollTo});vi.stubGlobal('document',{querySelector:()=>null});
    scrollPageHeadingIntoView({getBoundingClientRect:()=>({top:0})} as HTMLElement,'auto');
    expect(scrollTo).toHaveBeenCalledWith({top:0,behavior:'auto'});
  });
  it('marks the selected route and maps embedded news to the updates menu',()=>{
    const links=['#overview','#updates','#simulator'].map(href=>({getAttribute:()=>href,setAttribute:vi.fn(),removeAttribute:vi.fn()}));
    vi.stubGlobal('document',{querySelectorAll:()=>links});
    setActivePageNavigation('#news');
    expect(links[1].setAttribute).toHaveBeenCalledWith('aria-current','location');
    expect(links[0].removeAttribute).toHaveBeenCalledWith('aria-current');
    setActivePageNavigation('#map-heading');
    expect(links[2].setAttribute).toHaveBeenCalledWith('aria-current','location');
  });
});
