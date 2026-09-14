// @vitest-environment jsdom
import {beforeAll,afterAll,describe,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {DRAFT_STORAGE_KEY,SAVED_STORAGE_KEY} from '../src/scenario/storage';
const query=<T extends Element=HTMLElement>(selector:string)=>{
  const element=document.querySelector<T>(selector);
  if(!element)throw new Error(`Missing UI: ${selector}`);
  return element;
};
const click=(selector:string)=>query<HTMLButtonElement>(selector).click();
const change=(selector:string,value:string)=>{
  const element=query<HTMLSelectElement>(selector);element.value=value;
  element.dispatchEvent(new Event('change',{bubbles:true}));
};
const contents=(selector:string)=>query(selector).textContent??'';
const clipboard=vi.fn().mockResolvedValue(undefined);
beforeAll(async()=>{
  vi.useFakeTimers();
  document.body.innerHTML='<div id="app"></div>';
  localStorage.clear();
  vi.stubGlobal('matchMedia',vi.fn().mockImplementation(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})));
  vi.stubGlobal('fetch',vi.fn(async(url:string)=>({ok:true,json:async()=>JSON.parse(readFileSync(`public/data/${url.split('/').at(-1)}`,'utf8'))})));
  HTMLElement.prototype.scrollIntoView=vi.fn();
  window.scrollTo=vi.fn();
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:clipboard}});
  await import('../src/main');
  await vi.advanceTimersByTimeAsync(20);
},15000);
afterAll(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
describe('decision UI integration (DOM only, not layout)',()=>{
  it('shows fixed-inclusive totals and distinct unresolved labels',()=>{
    expect(contents('.national-totals')).toContain('民主党会派側 46');
    expect(contents('.national-totals')).toContain('共和党会派側 48');
    expect(contents('.comparison-values')).toContain('評価分裂 4');
    expect(document.querySelectorAll('#map path[data-state-fips]').length).toBe(50);
    expect(query('#map path[data-state-fips="48"]').getAttribute('fill')).toBe('url(#rating-split)');
  });
  it('previews, swaps, cancels, applies and undoes through actual controls',async()=>{
    click('[data-target-toggle]');
    expect(contents('#target-sim-panel')).toContain('現在の仮定は48議席');
    const original=contents('#sim-result');
    const stored=localStorage.getItem(DRAFT_STORAGE_KEY);
    click('[data-preview-path]');
    expect(contents('.path-preview')).toContain('共和党会派 51');
    expect(contents('#sim-result')).toBe(original);
    const swap=query<HTMLSelectElement>('[data-path-swap]');
    const replacement=[...swap.options].find(option=>Boolean(option.value))!;
    change('[data-path-swap]',replacement.value);
    expect(contents('.path-preview')).toContain('共和党会派 51');
    click('[data-cancel-path]');
    expect(document.querySelector('.path-preview')).toBeNull();
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBe(stored);
    click('[data-preview-path]');click('[data-confirm-path]');
    expect(contents('#sim-result')).toMatch(/51/);
    await vi.advanceTimersByTimeAsync(300);
    expect(JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)!).senate).toBeTruthy();
    click('[data-undo-scenario]');
    expect(contents('#sim-result')).toBe(original);
  });
  it('invalidates a preview when a fixed assumption changes',()=>{
    click('[data-preview-path]');
    const lock=query<HTMLInputElement>('[data-path-lock="TX-2"]');
    lock.checked=true;lock.dispatchEvent(new Event('change',{bubbles:true}));
    expect(document.querySelector('.path-preview')).toBeNull();
    expect(query<HTMLInputElement>('[data-path-lock="TX-2"]').checked).toBe(true);
    click('[data-undo-scenario]');
  });
  it('reads the current NH explanation and unifies state news',()=>{
    change('#state-search','33');
    expect(contents('#detail')).toContain('John E. Sununu');
    expect(contents('#detail')).toContain('Chris Pappas');
    expect(contents('#detail')).toContain('減税・規制削減');
    expect(document.querySelectorAll('#detail .state-related-news')).toHaveLength(1);
    expect(contents('#detail')).not.toContain('この州に関係するニュース');
    click('#detail [data-observation-feed-item]');
    expect(contents('#overlay-content')).toContain('選挙を見るうえでの意味');
    expect(contents('#overlay-content')).toContain('まだ分からないこと');
    query<HTMLButtonElement>('#overlay-close').click();
  });
  it('saves two scenarios, compares them and shares only the applied state',async()=>{
    change('[data-senate-choice="TX-2"]','candidate:cand-tx-james-talarico');
    query<HTMLInputElement>('#scenario-name').value='DOM検証・候補者案';click('[data-save-scenario]');
    click('#reset');
    query<HTMLInputElement>('#scenario-name').value='DOM検証・初期配分';click('[data-save-scenario]');
    const checks=[...document.querySelectorAll<HTMLInputElement>('[data-compare-scenario]')];
    for(const check of checks){
      const current=query<HTMLInputElement>(`[data-compare-scenario="${check.dataset.compareScenario}"]`);
      current.checked=true;current.dispatchEvent(new Event('change',{bubbles:true}));
    }
    expect(contents('.saved-comparison')).toContain('候補者案');
    expect(contents('.saved-comparison')).toContain('初期配分');
    expect(JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY)!)).toHaveLength(2);
    click('[data-share-scenario]');await vi.advanceTimersByTimeAsync(1);
    expect(clipboard).toHaveBeenCalled();
    const shared=new URL(clipboard.mock.calls.at(-1)![0]);
    expect(shared.searchParams.get('s')).toBeTruthy();
  });
});
