import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readerSections } from '../src/data/reader-journey';
import { revealPageTarget, scrollPageHeadingIntoView, scrollStateDetailIntoView, setActivePageNavigation, setupPageNavigation } from '../src/ui/navigation';

/** The navigation uses browser geometry, focus and history, but no scenario data. */
class ReadingNode {
  children:ReadingNode[]=[];
  attributes=new Map<string,string>();
  open=false;
  tabIndex=-1;
  top=0;
  height=60;
  style={scrollMarginTop:''};
  css={position:'static',top:'0px'};
  focus=vi.fn();
  scrollIntoView=vi.fn();
  constructor(public tagName:string,public id='',public parentElement:ReadingNode|null=null) {
    parentElement?.children.push(this);
  }
  getAttribute(name:string) {return this.attributes.get(name)??null;}
  setAttribute(name:string,value:string) {this.attributes.set(name,value);}
  removeAttribute(name:string) {this.attributes.delete(name);}
  hasAttribute(name:string) {return this.attributes.has(name);}
  getBoundingClientRect() {return {top:this.top,height:this.height};}
  matches(selector:string) {return selector==='main > .jump-nav' && this.tagName==='NAV' && this.parentElement?.tagName==='MAIN';}
  closest(selector:string):ReadingNode|null {
    for(let node:ReadingNode|null=this;node;node=node.parentElement) {
      if(selector==='main' && node.tagName==='MAIN')return node;
      if(selector==='section[id^="reader-"]' && node.tagName==='SECTION' && /^reader-0[1-6]$/.test(node.id))return node;
      if(selector==='a[href^="#"]' && node.tagName==='A' && node.getAttribute('href')?.startsWith('#'))return node;
    }
    return null;
  }
  querySelector(selector:string):ReadingNode|null {
    if(selector===':scope > summary')return this.children.find(node=>node.tagName==='SUMMARY')??null;
    for(const child of this.children) {
      if(selector==='h2' && child.tagName==='H2')return child;
      const nested=child.querySelector(selector);
      if(nested)return nested;
    }
    return null;
  }
}

function browser(hash='',position='fixed',reducedMotion=false) {
  const nodes=new Map<string,ReadingNode>();
  const add=(tag:string,id:string,parent:ReadingNode|null)=>{
    const node=new ReadingNode(tag,id,parent);if(id)nodes.set(id,node);return node;
  };
  const main=add('MAIN','',null);
  const nav=add('NAV','',main);nav.css.position=position;nav.height=position==='fixed'?720:64;
  const sections=readerSections.map((item,index)=>{
    const section=add('SECTION',item.id,main);section.top=index*1000;section.height=1000;
    const heading=add('H2',`${section.id}-heading`,section);heading.top=section.top;
    return section;
  });
  const links=sections.map(section=>{const link=add('A','',nav);link.setAttribute('href',`#${section.id}`);return link;});
  const domListeners=new Map<string,(event:any)=>void>();
  const windowListeners=new Map<string,()=>void>();
  const location={href:`https://example.test/us-midterms-2026/?s=independent-old-fixture&newsRace=2026-OH-3-special${hash}`,hash};
  const pushState=vi.fn((_state:unknown,_title:string,url:URL)=>{location.href=url.toString();location.hash=url.hash;});
  const storage={getItem:vi.fn(),setItem:vi.fn(),removeItem:vi.fn()};
  const scrollTo=vi.fn();
  const document={
    getElementById:(id:string)=>nodes.get(id)??null,
    querySelector:(selector:string)=>selector==='main > .jump-nav'?nav:selector.startsWith('#')?nodes.get(selector.slice(1))??null:null,
    querySelectorAll:(selector:string)=>selector==='main > .jump-nav a'?links:selector==='main > section[id^="reader-"]'?sections:selector==='main > .jump-nav, #scenario-sticky'?[nav,...(nodes.has('scenario-sticky')?[nodes.get('scenario-sticky')!]:[])]:[],
    addEventListener:(event:string,handler:(event:any)=>void)=>domListeners.set(event,handler),
  };
  const window={scrollY:200,innerHeight:757,scrollTo,location,
    setTimeout:(handler:()=>void,delay:number)=>setTimeout(handler,delay),clearTimeout:(timer:ReturnType<typeof setTimeout>)=>clearTimeout(timer),
    addEventListener:(event:string,handler:()=>void)=>windowListeners.set(event,handler),
  };
  vi.stubGlobal('document',document);vi.stubGlobal('window',window);vi.stubGlobal('location',location);
  vi.stubGlobal('history',{pushState});vi.stubGlobal('localStorage',storage);
  vi.stubGlobal('getComputedStyle',(node:ReadingNode)=>node.css);
  vi.stubGlobal('matchMedia',()=>({matches:reducedMotion}));
  vi.stubGlobal('requestAnimationFrame',(handler:()=>void)=>{handler();return 1;});
  return {add,nodes,main,nav,sections,links,location,pushState,storage,scrollTo,window,domListeners,windowListeners};
}

beforeEach(()=>vi.useFakeTimers());
afterEach(()=>{vi.clearAllTimers();vi.useRealTimers();vi.unstubAllGlobals();});

describe('four-stage reading navigation',()=>{
  it.each([
    ['#overview',0],['#national-overview',1],['#issues',2],['#updates',2],['#news',2],
    ['#policy-workbench',2],['#powers',1],['#simulator',1],['#map-heading',1],['#scenario-manager',1],['#sources',3],
    ['#reader-02',2],['#reader-05',2],
  ] as const)('keeps the old %s location associated with its reading section', (hash,index)=>{
    const page=browser();setActivePageNavigation(hash);
    expect(page.links[index].getAttribute('aria-current')).toBe('location');
    expect(page.links.filter(link=>link.hasAttribute('aria-current'))).toHaveLength(1);
  });

  it('uses the actual destination section when a legacy node has moved',()=>{
    const page=browser();page.add('DIV','overview',page.sections[3]);setActivePageNavigation('#overview');
    expect(page.links[3].getAttribute('aria-current')).toBe('location');
    expect(page.links[0].hasAttribute('aria-current')).toBe(false);
  });

  it('opens all containing disclosures before focusing a legacy save destination without changing storage',()=>{
    const page=browser('#scenario-manager');
    const outer=page.add('DETAILS','optional-simulation',page.sections[1]);
    const inner=page.add('DETAILS','optional-save',outer);
    const target=page.add('SECTION','scenario-manager',inner);target.top=100;
    const heading=page.add('H2','save-heading',target);heading.top=100;
    setupPageNavigation(vi.fn(),vi.fn());
    expect(outer.open).toBe(true);expect(inner.open).toBe(true);
    expect(heading.focus).toHaveBeenCalledWith({preventScroll:true});
    expect(page.scrollTo).toHaveBeenCalledWith({top:284,behavior:'smooth'});
    expect(page.location.hash).toBe('#scenario-manager');
    expect(page.pushState).not.toHaveBeenCalled();
    expect(page.storage.getItem).not.toHaveBeenCalled();expect(page.storage.setItem).not.toHaveBeenCalled();
  });

  it('does not subtract the height of the fixed left sidebar from a heading',()=>{
    const page=browser();const heading=page.sections[3].querySelector('h2')!;heading.top=120;
    scrollPageHeadingIntoView(heading as unknown as HTMLElement,'auto');
    expect(page.scrollTo).toHaveBeenCalledWith({top:304,behavior:'auto'});
  });

  it('clears the horizontal sticky menu on a narrow screen and uses reduced motion',()=>{
    const page=browser('#reader-03','sticky',true);page.sections[2].querySelector('h2')!.top=120;
    setupPageNavigation(vi.fn(),vi.fn());
    expect(page.scrollTo).toHaveBeenCalledWith({top:248,behavior:'auto'});
  });

  it('preserves the scenario and article parameters when following a new section link',()=>{
    const page=browser();setupPageNavigation(vi.fn(),vi.fn());
    const preventDefault=vi.fn();page.domListeners.get('click')!({target:page.links[3],preventDefault});
    expect(preventDefault).toHaveBeenCalledOnce();expect(page.location.hash).toBe('#reader-06');
    const url=new URL(page.location.href);expect(url.searchParams.get('s')).toBe('independent-old-fixture');
    expect(url.searchParams.get('newsRace')).toBe('2026-OH-3-special');
    expect(page.storage.setItem).not.toHaveBeenCalled();
  });

  it('leaves modified clicks and unrelated anchors to the browser',()=>{
    const page=browser();setupPageNavigation(vi.fn(),vi.fn());const preventDefault=vi.fn();
    page.domListeners.get('click')!({target:page.links[3],ctrlKey:true,preventDefault});
    const external=page.add('A','',page.main);external.setAttribute('href','#an-article-footnote');
    page.domListeners.get('click')!({target:external,preventDefault});
    expect(preventDefault).not.toHaveBeenCalled();expect(page.pushState).not.toHaveBeenCalled();
  });

  it('restores the section on back/forward without creating another history entry',()=>{
    const page=browser('#reader-01');setupPageNavigation(vi.fn(),vi.fn());
    page.location.hash='#reader-06';page.location.href=page.location.href.replace('#reader-01','#reader-06');
    page.windowListeners.get('popstate')!();
    expect(page.links[3].getAttribute('aria-current')).toBe('location');
    expect(page.sections[3].querySelector('h2')!.focus).toHaveBeenCalledOnce();
    page.windowListeners.get('hashchange')!();
    expect(page.sections[3].querySelector('h2')!.focus).toHaveBeenCalledOnce();
    expect(page.pushState).not.toHaveBeenCalled();expect(page.storage.setItem).not.toHaveBeenCalled();
  });

  it('follows the section being read after smooth scrolling stops without rewriting URL or storage',()=>{
    const page=browser('#reader-04');setupPageNavigation(vi.fn(),vi.fn());
    page.sections.forEach((section,index)=>{section.top=(index-2)*1000+20;});
    page.windowListeners.get('scroll')!();vi.advanceTimersByTime(90);
    expect(page.links[1].getAttribute('aria-current')).toBe('location');
    page.windowListeners.get('scroll')!();vi.advanceTimersByTime(120);
    expect(page.links[2].getAttribute('aria-current')).toBe('location');
    expect(page.location.hash).toBe('#reader-04');expect(page.pushState).not.toHaveBeenCalled();
    expect(page.storage.setItem).not.toHaveBeenCalled();
  });

  it('keeps the old issues hash inline when its content is in the reading document',()=>{
    const page=browser('#issues');page.add('SECTION','issues',page.sections[2]);const openIssues=vi.fn();
    setupPageNavigation(openIssues,vi.fn());expect(openIssues).not.toHaveBeenCalled();
    expect(page.links[2].getAttribute('aria-current')).toBe('location');
  });

  it('retains the legacy issues overlay when its node is not in main',()=>{
    const page=browser('#issues');page.add('SECTION','issues',null);const openIssues=vi.fn();
    setupPageNavigation(openIssues,vi.fn());expect(openIssues).toHaveBeenCalledWith(true);
    expect(page.links[2].getAttribute('aria-current')).toBe('location');
  });

  it('opens a state destination and ignores the left sidebar while clearing an actual sticky seat header',()=>{
    const page=browser();const details=page.add('DETAILS','optional-map',page.sections[1]);
    const target=page.add('ASIDE','detail',details);const heading=page.add('H2','state-detail-heading',target);
    const sticky=page.add('DIV','scenario-sticky',page.sections[1]);sticky.css={position:'sticky',top:'16px'};sticky.height=70;
    scrollStateDetailIntoView({block:'start',behavior:'auto'});
    expect(details.open).toBe(true);expect(heading.focus).toHaveBeenCalledWith({preventScroll:true});
    expect(target.style.scrollMarginTop).toBe('98px');
    expect(target.scrollIntoView).toHaveBeenCalledWith({block:'start',behavior:'auto'});
  });

  it('revealing nested reading content never changes its remembered disclosure preference',()=>{
    const page=browser();const outer=page.add('DETAILS','outer',page.sections[3]);const inner=page.add('DETAILS','inner',outer);
    const target=page.add('H2','target',inner);expect(revealPageTarget(target as unknown as HTMLElement)).toBe(true);
    expect(revealPageTarget(target as unknown as HTMLElement)).toBe(false);
    expect(page.storage.getItem).not.toHaveBeenCalled();expect(page.storage.setItem).not.toHaveBeenCalled();
  });

  it('also opens a disclosure when the disclosure itself is the reading destination',()=>{
    const page=browser();const target=page.add('DETAILS','optional-reading',page.sections[3]);
    expect(revealPageTarget(target as unknown as HTMLElement)).toBe(true);expect(target.open).toBe(true);
    expect(page.storage.setItem).not.toHaveBeenCalled();
  });
});
