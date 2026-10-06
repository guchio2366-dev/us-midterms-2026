import { readerIntroduction, readerSections } from '../data/reader-journey';
import { escapeHtml as esc } from './research';
import { readerCompositionSourcesMarkup, readerMajorityContextMarkup, readerMechanismContextMarkup } from './reader-context';

export function readerNavigationMarkup() {
  return `<p class="reader-nav-title">読む順序</p>${readerSections.map(section=>{
    const parts=section.id==='reader-01' ? ['中間選挙の','仕組み'] : section.id==='reader-03' ? ['各州の情勢と','候補者'] : [section.title];
    return `<a href="#${section.id}"><span class="reader-nav-number">${section.number}</span><span>${parts.map(part=>`<span class="reader-nav-phrase">${esc(part)}</span>`).join('')}<small class="reader-current-label">現在地</small></span></a>`;
  }).join('')}`;
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
  overview.insertAdjacentHTML('beforeend',readerMechanismContextMarkup());

  // Current composition belongs next to the majority conditions, before state details.
  const composition=document.createElement('article');
  composition.className='reader-current-composition';
  composition.innerHTML='<h3>現在の議席と今回の改選範囲</h3>';
  const seatTable=institution.querySelector('.opening-seats');
  const seatFootnote=institution.querySelector('.opening-footnote');
  if(seatTable) composition.append(seatTable);
  if(seatFootnote) composition.append(seatFootnote);
  composition.insertAdjacentHTML('beforeend',readerCompositionSourcesMarkup());
  sections[1].append(composition);

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
  sections[1].append(national);
  sections[1].insertAdjacentHTML('beforeend',readerMajorityContextMarkup());
  const optional=document.createElement('details');
  optional.className='reader-optional-simulation';
  optional.id='reader-simulation-disclosure';
  optional.innerHTML='<summary><b>自分の見立てを議席数で確かめる</b><span>地図・当選者の仮定・保存・共有を開く</span></summary>';
  optional.append(simulator);
  sections[1].append(optional);
  const view=new URL(location.href);
  if(view.searchParams.has('s') || view.searchParams.has('race')) optional.open=true;

  // Older numbered links keep their subject. These are optional contextual details,
  // not additional reading stages, and moving nodes retains event listeners/state.
  const issues=document.createElement('details');
  issues.id='reader-02';
  issues.className='reader-context-disclosure reader-issues';
  issues.innerHTML='<summary id="reader-02-heading"><b>争点から州・候補者の違いを読む</b><span>医療・関税の事例と8つの論点</span></summary><div class="reader-context-content">'+issuesMarkup+'</div>';
  const policyDetails=document.createElement('details');
  policyDetails.id='reader-05';
  policyDetails.className='reader-context-disclosure';
  policyDetails.innerHTML='<summary id="reader-05-heading"><b>候補者の政策と採決記録を詳しく比較する</b><span>政策ごとの賛否・条件・当落の理由</span></summary>';
  policyDetails.append(policy);
  sections[2].append(issues,policyDetails);
  const powerDetails=document.createElement('details');
  powerDetails.className='reader-context-disclosure';
  powerDetails.innerHTML='<summary><b>多数派でできることと、採決の条件</b><span>両院の権限・大統領との関係</span></summary>';
  powerDetails.append(powers);
  sections[1].insertBefore(powerDetails,optional);
  sections[3].insertAdjacentHTML('beforeend',outlookMarkup);
  const sourceDisclosure=document.createElement('details');
  sourceDisclosure.className='reader-source-disclosure';
  sourceDisclosure.innerHTML='<summary>全体の出典と更新情報を読む</summary>';
  sourceDisclosure.append(sources);
  sections[3].append(sourceDisclosure);

  const nextMessages=[
    '現在の議席から、各党が多数派になるための条件を確認します。',
    '多数派への条件を踏まえ、注目州で何が争われているかを読みます。',
    '州ごとの材料を踏まえ、現在の見通しと次の確認点をまとめます。',
  ];
  sections.slice(0,-1).forEach((section,index)=>{
    const next=readerSections[index+1];
    const bridge=document.createElement('div');
    bridge.className='reader-next';
    bridge.innerHTML=`<p>${esc(nextMessages[index])}</p><a href="#${next.id}">次へ：${next.number} ${esc(next.title)} →</a>`;
    section.append(bridge);
  });
}
