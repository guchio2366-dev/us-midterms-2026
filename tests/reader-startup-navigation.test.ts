import { afterEach, describe, expect, it, vi } from 'vitest';
import { setupPageNavigation } from '../src/ui/navigation';

function startup(query='') {
  const location={href:`https://example.test/${query}#reader-02`,hash:'#reader-02'};
  const listeners=new Map<string,()=>void>();
  const frames:(()=>void)[]=[];
  const heading={tagName:'H2',tabIndex:0,focus:vi.fn(),hasAttribute:()=>false,getBoundingClientRect:()=>({top:400,height:50}),parentElement:null};
  const target={tagName:'DETAILS',open:false,parentElement:null,querySelector:()=>heading,closest:()=>({id:'reader-03'}),getBoundingClientRect:()=>({top:400,height:50})};
  const scrollTo=vi.fn();
  const closePanel=vi.fn();
  const removeEventListener=vi.fn((type:string)=>listeners.delete(type));
  vi.stubGlobal('location',location);
  vi.stubGlobal('document',{getElementById:(id:string)=>id==='reader-02'?target:null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:vi.fn()});
  vi.stubGlobal('window',{scrollY:100,innerHeight:800,scrollTo,addEventListener:(type:string,handler:()=>void)=>listeners.set(type,handler),removeEventListener});
  vi.stubGlobal('requestAnimationFrame',(handler:()=>void)=>{frames.push(handler);return frames.length;});
  vi.stubGlobal('matchMedia',()=>({matches:false}));
  const flush=()=>{while(frames.length)frames.shift()!();};
  let resolve!:()=>void;
  let reject!:(reason?:unknown)=>void;
  const ready=new Promise<void>((yes,no)=>{resolve=yes;reject=no;});
  setupPageNavigation(vi.fn(),closePanel,ready);
  flush();
  scrollTo.mockClear();heading.focus.mockClear();
  return {location,listeners,heading,target,scrollTo,closePanel,removeEventListener,flush,resolve,reject};
}

afterEach(()=>vi.unstubAllGlobals());

describe('initial navigation after layout readiness',()=>{
  it('realigns the unchanged initial hash automatically after loading without a history write',async()=>{
    const page=startup();page.resolve();await Promise.resolve();page.flush();
    expect(page.scrollTo).toHaveBeenCalledOnce();
    expect(page.scrollTo).toHaveBeenCalledWith({top:492,behavior:'auto'});
    expect(page.heading.focus).toHaveBeenCalledWith({preventScroll:true});
    expect(page.target.open).toBe(true);
    expect(page.location.hash).toBe('#reader-02');
    expect(page.removeEventListener).toHaveBeenCalledTimes(4);
  });
  it.each(['pointerdown','keydown','wheel','touchstart'])('does not override %s interaction while loading',async type=>{
    const page=startup();page.listeners.get(type)!();page.resolve();await Promise.resolve();page.flush();
    expect(page.scrollTo).not.toHaveBeenCalled();expect(page.heading.focus).not.toHaveBeenCalled();
  });
  it('does not override a changed URL even when the hash is unchanged',async()=>{
    const page=startup();page.location.href='https://example.test/?new=route#reader-02';page.resolve();await Promise.resolve();page.flush();
    expect(page.scrollTo).not.toHaveBeenCalled();
  });
  it.each(['?race=2026-OH-3-special','?newsItem=news:example'])('leaves %s to its dedicated router',async query=>{
    const page=startup(query);page.resolve();await Promise.resolve();page.flush();
    expect(page.scrollTo).not.toHaveBeenCalled();
    expect(page.listeners.has('pointerdown')).toBe(false);
  });
  it('cleans up without moving the page when readiness rejects',async()=>{
    const page=startup();page.reject(new Error('map failed'));await Promise.resolve();page.flush();
    expect(page.scrollTo).not.toHaveBeenCalled();expect(page.removeEventListener).toHaveBeenCalledTimes(4);
  });
});
