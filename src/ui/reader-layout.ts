import { readerSections } from '../data/reader-journey';
import { escapeHtml as esc } from './research';
import { featuredAllocationSummary } from './overview';
import { readerMajorityContextMarkup, readerMechanismContextMarkup } from './reader-context';

export function readerNavigationMarkup() {
  return `<p class="reader-nav-title">読む順序</p>${readerSections.map(section=>{
    const parts=section.id==='reader-01' ? ['中間選挙の','仕組み'] : section.id==='reader-04' ? ['上院の情勢と','51議席への配分'] : section.id==='reader-03' ? ['注目州の情勢と','候補者'] : [section.title];
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
  return `<header class="reader-section-heading"><span class="reader-section-number" aria-hidden="true">${section.number}</span><div><h2 id="${section.id}-heading">${esc(section.id==='reader-03' ? `注目${featuredAllocationSummary().stateCount}州の情勢と候補者` : section.title)}</h2><p>${esc(section.introduction)}</p></div></header>`;
}

/** Move the existing interactive nodes, rather than replacing their state or event bindings. */
export function applyReaderLayout(issuesMarkup:string,outlookMarkup:string) {
  const main=document.querySelector<HTMLElement>('main');
  const nav=main?.querySelector<HTMLElement>(':scope > .jump-nav');
  const overview=document.getElementById('overview');
  const purpose=overview?.querySelector<HTMLElement>('.intro-purpose-card');
  const institution=overview?.querySelector<HTMLElement>('.intro-overview-card');
  const issueIntroduction=overview?.querySelector<HTMLElement>('.intro-issues-card');
  const national=document.getElementById('national-overview');
  const updates=document.getElementById('updates');
  const simulator=document.getElementById('simulator');
  const workspace=document.querySelector<HTMLElement>('.workspace');
  const senate=document.getElementById('senate');
  const policy=document.getElementById('policy-workbench-host');
  const powers=document.getElementById('powers');
  const sources=document.getElementById('sources');
  if(!main || !nav || !overview || !purpose || !institution || !national || !updates || !simulator || !workspace || !policy || !powers || !sources) return;

  document.body.classList.add('reader-experience');
  nav.classList.add('reader-navigation');
  nav.setAttribute('aria-label','読む順序と現在地');
  nav.innerHTML=readerNavigationMarkup();

  const hero=document.createElement('section');
  hero.className='reader-opening';
  hero.setAttribute('aria-labelledby','site-purpose-heading');
  // Keep the approved purpose and every goal explanation as their original nodes.
  hero.append(purpose);
  hero.insertAdjacentHTML('beforeend','<a class="reader-start" href="#reader-01">01 中間選挙の仕組みから読む →</a>');
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

  // The approved purpose is already in the opening; the complete institution text stays here.
  overview.replaceChildren(institution);
  overview.classList.add('reader-institution');
  sections[0].append(overview);
  overview.insertAdjacentHTML('beforeend',readerMechanismContextMarkup());

  // The national map is a primary reading interaction, not a simulation disclosure.
  // Reuse its controls, paths and detail node so every existing event remains bound.
  workspace.classList.add('reader-map-workspace');
  workspace.setAttribute('aria-label','全国50州の上院選挙地図と選択州の説明');
  const mapColumn=workspace.querySelector<HTMLElement>('.map-column');
  if(senate) workspace.prepend(senate);
  const mapHeading=mapColumn?.querySelector('.map-head');
  const mapSection=document.createElement('section');
  mapSection.className='reader-national-map';
  mapSection.setAttribute('aria-labelledby','map-heading');
  if(mapHeading) mapSection.append(mapHeading);
  // Keep the interactive map sticky; long guidance remains directly below the map.
  const mapGuide=mapColumn?.querySelector('.map-reading-guide');
  const mapContext=document.createElement('div');
  mapContext.className='reader-map-context';
  if(mapGuide) mapContext.append(mapGuide);
  mapSection.append(workspace,mapContext);

  updates.querySelector('.section-heading')?.remove();
  updates.setAttribute('aria-labelledby','reader-03-heading');
  const mapLink=document.createElement('div');
  mapLink.className='reader-full-map-link';
  mapLink.innerHTML='<a href="#map-heading">全国50州の上院選挙地図を見る →</a>';
  updates.prepend(mapLink);
  const featuredIntro=document.createElement('p');
  featuredIntro.className='reader-featured-allocation';
  featuredIntro.textContent=featuredAllocationSummary().description;
  updates.prepend(featuredIntro);
  sections[2].append(updates,mapSection);

  // All allocation prerequisites remain visible, before optional source/method detail.
  sections[1].append(national);
  sections[1].insertAdjacentHTML('beforeend',readerMajorityContextMarkup());
  const optional=document.createElement('details');
  optional.className='reader-optional-simulation';
  optional.id='reader-simulation-disclosure';
  optional.innerHTML='<summary><b>自分の見立てを議席数で確かめる</b><span>当選者の仮定・保存・比較・共有を開く</span></summary>';
  optional.append(simulator);
  sections[1].append(optional);
  const view=new URL(location.href);
  if(view.searchParams.has('s')) optional.open=true;

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
  if(issueIntroduction) {
    issueIntroduction.insertAdjacentHTML('afterbegin','<p class="reader-issues-bridge">ここまで見た州の情勢や候補者への支持は、どの論点・出来事で変わり得るでしょうか。全国に共通する論点と、州ごとの違いをつなげて読みます。</p>');
    sections[2].append(issueIntroduction);
  }
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
