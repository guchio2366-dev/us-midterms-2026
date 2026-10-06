import { readerSections } from '../data/reader-journey';

const readerHashes: string[] = readerSections.map(section=>`#${section.id}`);
const legacyHashes = ['#overview','#national-overview','#updates','#news','#policy-workbench','#scenario-manager','#powers','#simulator','#map-heading','#senate','#detail','#sources','#issues'];
const numberedReaderHashes = ['#reader-01','#reader-02','#reader-03','#reader-04','#reader-05','#reader-06'];
const navigableHashes = new Set([...numberedReaderHashes,...numberedReaderHashes.map(hash=>`${hash}-heading`),...legacyHashes]);
const readerAliases: Record<string,string> = {
  '#overview':'#reader-01', '#national-overview':'#reader-04', '#issues':'#reader-03',
  '#reader-02':'#reader-03', '#reader-05':'#reader-03',
  '#updates':'#reader-03', '#news':'#reader-03', '#policy-workbench':'#reader-03',
  '#powers':'#reader-04', '#simulator':'#reader-04', '#map-heading':'#reader-03', '#senate':'#reader-03', '#detail':'#reader-03',
  '#scenario-manager':'#reader-04', '#sources':'#reader-06',
};

function pageNavigationClearance() {
  const nav=document.querySelector<HTMLElement>('main > .jump-nav');
  const position=nav ? getComputedStyle(nav).position : '';
  // The fixed desktop navigation occupies the left edge rather than the top.
  if (nav && position==='fixed') return 16;
  return nav && position==='sticky' ? nav.getBoundingClientRect().height+8 : 8;
}

/** Open a reading destination without writing disclosure or scenario preferences. */
export function revealPageTarget(target:HTMLElement) {
  let opened=false;
  for (let ancestor:HTMLElement|null=target;ancestor;ancestor=ancestor.parentElement) {
    if (ancestor.tagName==='DETAILS' && !(ancestor as HTMLDetailsElement).open) {
      (ancestor as HTMLDetailsElement).open=true;
      opened=true;
    }
  }
  return opened;
}

/** Align a section heading beneath the actual page navigation, without adding CSS anchor padding twice. */
export function scrollPageHeadingIntoView(target:HTMLElement, behavior:ScrollBehavior) {
  const opened=revealPageTarget(target);
  // Existing callers may have focused the heading while its disclosure was closed.
  if (opened && target.hasAttribute('tabindex')) target.focus({preventScroll:true});
  const clearance=pageNavigationClearance();
  window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-clearance),behavior});
}

export function setActivePageNavigation(hash:string) {
  const links=[...document.querySelectorAll<HTMLAnchorElement>('main > .jump-nav a')];
  const readerMode=links.some(link=>readerHashes.includes(link.getAttribute('href')??''));
  const target=readerMode && hash ? document.getElementById(hash.slice(1)) : null;
  const readerSection=target?.closest<HTMLElement>('section[id^="reader-"]');
  const route=readerMode ? readerSection ? `#${readerSection.id}` : readerAliases[hash] ?? (readerHashes.includes(hash) ? hash : '#reader-01')
    : hash==='#national-overview' ? '#overview' : hash==='#news' ? '#updates' : hash==='#map-heading' ? '#simulator' : hash || '#overview';
  links.forEach(link=>{
    if(link.getAttribute('href')===route)link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
  // On a narrow screen the rail becomes a horizontal strip. Direct legacy links
  // and ordinary page reading must reveal the current item too, without moving
  // the page vertically or focusing a navigation link.
  const current=links.find(link=>link.getAttribute('href')===route);
  const nav=current?.parentElement;
  if(current && nav && getComputedStyle(nav).position==='sticky') {
    const item=current.getBoundingClientRect();
    const viewport=nav.getBoundingClientRect();
    if(item.left<viewport.left) nav.scrollLeft+=item.left-viewport.left;
    else if(item.right>viewport.right) nav.scrollLeft+=item.right-viewport.right;
  }
}

/** Disclosure preferences are written only by a user's summary activation. */
export function scrollStateDetailIntoView(options: ScrollIntoViewOptions) {
  const target = document.querySelector<HTMLElement>('#detail');
  if (!target) return;
  if (revealPageTarget(target)) target.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});
  const nav=document.querySelector<HTMLElement>('main > .jump-nav');
  let offset=nav && getComputedStyle(nav).position==='fixed' ? 16 : 80;
  document.querySelectorAll<HTMLElement>('main > .jump-nav, #scenario-sticky').forEach(header => {
    const style = getComputedStyle(header);
    if (style.position !== 'sticky' && style.position !== 'fixed') return;
    if (style.position==='fixed' && header.matches('main > .jump-nav')) return;
    // This header is confined to the optional editor, below the visible map detail.
    if (header.id === 'scenario-sticky' && target.closest('.reader-map-workspace')) return;
    const top = Number.parseFloat(style.top);
    const rect=header.getBoundingClientRect();
    if (rect.height <= 0 || (header.id === 'scenario-sticky' && rect.top > Math.max(0,top))) return;
    if (Number.isFinite(top)) offset = Math.max(offset,top + rect.height + 12);
  });
  target.style.scrollMarginTop = `${offset}px`;
  target.scrollIntoView(options);
}

export function bindDisclosurePreference(details: HTMLDetailsElement, key: string, hint?: HTMLElement|null) {
  try { details.open = localStorage.getItem(key) !== 'closed'; } catch { details.open = true; }
  const summary = details.querySelector<HTMLElement>(':scope > summary')!;
  const updateHint = () => { if (hint) hint.textContent = details.open ? '概説を閉じる' : '概説を開く'; };
  updateHint();
  details.addEventListener('toggle',updateHint);
  summary.addEventListener('click',event => {
    if ((event.target as HTMLElement).closest('a,button')) return;
    event.preventDefault();
    details.open = !details.open;
    summary.focus({preventScroll:true});
    updateHint();
    try { localStorage.setItem(key,details.open ? 'open' : 'closed'); } catch { /* Opening still works without storage. */ }
  });
}

export function setupPageNavigation(openIssues: (fromHistory?: boolean) => void, closePanel: () => void, layoutReady?:Promise<unknown>) {
  let lastHash=location.hash;
  let scrollTimer:number|null=null;
  setActivePageNavigation(location.hash);
  function visit(hash: string, fromHistory=false, behavior?:ScrollBehavior, stillAllowed?:()=>boolean) {
    const issueTarget=hash==='#issues' ? document.getElementById('issues') : null;
    if (hash === '#issues' && !issueTarget?.closest('main')) { lastHash=hash; setActivePageNavigation(hash); openIssues(fromHistory); return; }
    const id = hash === '#senate' ? 'map-heading' : hash.slice(1);
    if (!navigableHashes.has(hash)) {
      if(lastHash==='#issues') closePanel();
      lastHash=hash;
      return;
    }
    lastHash=hash;
    setActivePageNavigation(hash);
    closePanel();
    const target = document.getElementById(id);
    if (!target) return;
    revealPageTarget(target);
    const disclosure = id === 'overview' ? document.querySelector<HTMLDetailsElement>('#intro-disclosure')
      : id === 'powers' ? document.querySelector<HTMLDetailsElement>('#power-disclosure') : null;
    if (disclosure) disclosure.open = true;
    requestAnimationFrame(() => {
      if(stillAllowed && !stillAllowed()) return;
      const focus = disclosure?.querySelector<HTMLElement>(':scope > summary') ?? (/^H[1-6]$/.test(target.tagName) ? target : target.querySelector<HTMLElement>('h2') ?? target);
      if (focus.tagName !== 'SUMMARY') focus.tabIndex = -1;
      focus.focus({preventScroll:true});
      scrollPageHeadingIntoView(focus,behavior ?? (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'));
    });
  }
  document.addEventListener('click',event => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href')!;
    if (!navigableHashes.has(hash)) return;
    event.preventDefault();
    if (location.hash !== hash) {
      const url = new URL(location.href);
      url.hash = hash;
      history.pushState(null,'',url);
    }
    visit(hash);
  });
  window.addEventListener('popstate',() => { if(location.hash!==lastHash) visit(location.hash,true); });
  window.addEventListener('hashchange',() => { if(location.hash!==lastHash) visit(location.hash,true); });
  const updateReadingPosition=()=>{
    const sections=[...document.querySelectorAll<HTMLElement>('main > section[id^="reader-"]')];
    if (!sections.length) return;
    const threshold=pageNavigationClearance()+Math.min(120,window.innerHeight/4);
    let active=sections[0];
    sections.forEach(section=>{ if(section.getBoundingClientRect().top<=threshold) active=section; });
    setActivePageNavigation(`#${active.id}`);
  };
  // Wait for smooth scrolling to stop so intermediate sections do not replace the
  // requested location. Reading-position updates never change the URL or storage.
  const afterScroll=()=>{
    if (scrollTimer!==null) window.clearTimeout(scrollTimer);
    scrollTimer=window.setTimeout(()=>{scrollTimer=null;updateReadingPosition();},120);
  };
  window.addEventListener('scroll',afterScroll,{passive:true});
  window.addEventListener('resize',afterScroll);
  if (!location.hash) updateReadingPosition();
  visit(location.hash,true);
  if(layoutReady) {
    const initialUrl=location.href;
    const initialHash=location.hash;
    const query=new URL(initialUrl).searchParams;
    // Race and article links have a dedicated startup router with its own target.
    if(!navigableHashes.has(initialHash) || query.has('race') || query.has('newsItem')) return;
    let interacted=false;
    const cancel=()=>{interacted=true;};
    const events=['pointerdown','keydown','wheel','touchstart'] as const;
    events.forEach(event=>window.addEventListener(event,cancel,{capture:true,passive:true}));
    const cleanup=()=>events.forEach(event=>window.removeEventListener(event,cancel,true));
    const stillAllowed=()=>!interacted && location.href===initialUrl;
    // Fonts, map geometry and native reload restoration can all move the first target.
    // Correct that one initial position only; never pull an active reader back.
    void layoutReady.then(()=>{
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(stillAllowed()) visit(initialHash,true,'auto',stillAllowed);
        requestAnimationFrame(cleanup);
      }));
    },cleanup);
  }
}
