/** Disclosure preferences are written only by a user's summary activation. */
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

export function setupPageNavigation(openIssues: () => void, closePanel: () => void) {
  function visit(hash: string) {
    if (hash === '#issues') { openIssues(); return; }
    closePanel();
    const id = hash.slice(1);
    if (!['overview','national-overview','news','powers','simulator','map-heading','sources'].includes(id)) return;
    const target = document.getElementById(id);
    if (!target) return;
    const disclosure = id === 'overview' ? document.querySelector<HTMLDetailsElement>('#intro-disclosure')
      : id === 'powers' ? document.querySelector<HTMLDetailsElement>('#power-disclosure') : null;
    if (disclosure) disclosure.open = true;
    requestAnimationFrame(() => {
      const focus = disclosure?.querySelector<HTMLElement>(':scope > summary') ?? target.querySelector<HTMLElement>('h2') ?? target;
      if (focus.tagName !== 'SUMMARY') focus.tabIndex = -1;
      focus.focus({preventScroll:true});
      target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    });
  }
  document.addEventListener('click',event => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href')!;
    if (!['#overview','#national-overview','#news','#powers','#simulator','#map-heading','#sources','#issues'].includes(hash)) return;
    event.preventDefault();
    if (location.hash !== hash) {
      const url = new URL(location.href);
      url.hash = hash;
      history.pushState(null,'',url);
    }
    visit(hash);
  });
  window.addEventListener('popstate',() => visit(location.hash));
  window.addEventListener('hashchange',() => visit(location.hash));
  visit(location.hash);
}
