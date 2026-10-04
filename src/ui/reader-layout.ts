import { readerIntroduction, readerSections } from '../data/reader-journey';
import { escapeHtml as esc } from './research';

export function readerNavigationMarkup() {
  return `<p class="reader-nav-title">読む順序</p>${readerSections.map(section=>`<a href="#${section.id}"><span class="reader-nav-number">${section.number}</span><span>${esc(section.title)}<small class="reader-current-label">現在地</small></span></a>`).join('')}`;
}

/** Open only the UI disclosures needed for an explicit destination. No scenario is written. */
export function openReaderDestination(target: Element|null) {
  for(let parent=target?.parentElement;parent;parent=parent.parentElement) {
    if(parent instanceof HTMLDetailsElement) parent.open=true;
  }
}

function sectionMarkup(index:number) {
  const section=readerSections[index];
  return `<header class="reader-section-heading"><span class="reader-section-number" aria-hidden="true">${section.number}</span><div><h2 id="${section.id}-heading">${esc(section.title)}</h2><p>${esc(section.introduction)}</p></div></header>`;
}

/** Move the existing interactive nodes, rather than replacing their state or event bindings. */
export function applyReaderLayout(issuesMarkup:string,outlookMarkup:string) {
  const main=document.querySelector<HTMLElement>('main');
  const nav=main?.querySelector<HTMLElement>(':scope > .jump-nav');
  const overview=document.getElementById('overview');
  const institution=overview?.querySelector<HTMLElement>('.intro-overview-card');
  const national=document.getElementById('national-overview');
  const updates=document.getElementById('updates');
  const simulator=document.getElementById('simulator');
  const policy=document.getElementById('policy-workbench-host');
  const powers=document.getElementById('powers');
  const sources=document.getElementById('sources');
  if(!main || !nav || !overview || !institution || !national || !updates || !simulator || !policy || !powers || !sources) return;

  document.body.classList.add('reader-experience');
  nav.classList.add('reader-navigation');
  nav.setAttribute('aria-label','読む順序と現在地');
  nav.innerHTML=readerNavigationMarkup();

  const hero=document.createElement('section');
  hero.className='reader-opening';
  hero.setAttribute('aria-labelledby','reader-opening-heading');
  hero.innerHTML=`<h2 id="reader-opening-heading">このサイトについて</h2><p class="reader-opening-copy">${esc(readerIntroduction)}</p><a class="reader-start" href="#reader-01">01 中間選挙の仕組みから読む →</a>`;
  nav.after(hero);

  const sections=readerSections.map((item,index)=>{
    const section=document.createElement('section');
    section.id=item.id;
    section.className='reader-section';
    section.dataset.readerSection=item.id;
    section.setAttribute('aria-labelledby',`${item.id}-heading`);
    section.innerHTML=sectionMarkup(index);
    main.append(section);
    return section;
  });

  // The updated introduction replaces the old purpose/issue introductions, retaining factual details.
  overview.replaceChildren(institution);
  overview.classList.add('reader-institution');
  const institutionHeading=institution.querySelector<HTMLElement>('#overview-heading');
  if(institutionHeading) institutionHeading.textContent='今回選び直す議席';
  sections[0].append(overview);

  const issues=document.createElement('div');
  issues.className='reader-issues';
  issues.innerHTML=issuesMarkup;
  sections[1].append(issues);

  updates.querySelector('.approved-updates-intro')?.remove();
  updates.querySelector('.section-heading')?.remove();
  updates.setAttribute('aria-labelledby','reader-03-heading');
  sections[2].append(updates);

  const allocationCopy=national.querySelector('.approved-senate-intro');
  if(allocationCopy) {
    const explanation=document.createElement('details');
    explanation.className='reader-allocation-explanation';
    explanation.innerHTML='<summary>非改選議席と暫定配分の読み方</summary>';
    explanation.append(allocationCopy);
    national.querySelector('.consensus-method')?.before(explanation);
  }
  sections[3].append(national);
  const optional=document.createElement('details');
  optional.className='reader-optional-simulation';
  optional.id='reader-simulation-disclosure';
  optional.innerHTML='<summary><b>自分の見立てを議席数で確かめる</b><span>地図・当選者の仮定・保存・共有を開く</span></summary>';
  optional.append(simulator);
  sections[3].append(optional);
  const view=new URL(location.href);
  if(view.searchParams.has('s') || view.searchParams.has('race')) optional.open=true;

  sections[4].append(policy,powers);
  sections[5].insertAdjacentHTML('beforeend',outlookMarkup);
  const sourceDisclosure=document.createElement('details');
  sourceDisclosure.className='reader-source-disclosure';
  sourceDisclosure.innerHTML='<summary>全体の出典と更新情報を読む</summary>';
  sourceDisclosure.append(sources);
  sections[5].append(sourceDisclosure);

  const nextMessages=[
    '次は、候補者や政党を選ぶ争点を確認します。',
    '同じ争点が、州の事情や候補者によってどう受け止められるかを見ていきます。',
    '各州の当落を、上院全体の議席配分と合わせて考えます。',
    '議席配分に加え、候補者の立場と採決手続から政策の実現条件を確認します。',
    '現在の見通しと、次に確認すべき材料をまとめます。',
  ];
  sections.slice(0,-1).forEach((section,index)=>{
    const next=readerSections[index+1];
    const bridge=document.createElement('div');
    bridge.className='reader-next';
    bridge.innerHTML=`<p>${esc(nextMessages[index])}</p><a href="#${next.id}">次へ：${next.number} ${esc(next.title)} →</a>`;
    section.append(bridge);
  });
}
