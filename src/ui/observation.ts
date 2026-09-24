import type { Candidate } from '../data/model';
import type { ObservationUpdate, RaceObservation } from '../data/observation-model';
import { observationData } from '../data/observation';
import { monitoringStatus, publishedUpdates } from '../observation-logic';
import { escapeHtml as esc } from './research';

export const observationAnchor = (electionId:string,section:string) => `obs-${electionId}-${section}`;
const refsById = new Map(observationData.evidenceRefs.map(e=>[e.evidenceId,e]));
const sourceById = new Map(observationData.sources.map(s=>[s.sourceId,s]));
const safeUrl = (url:string) => /^https:\/\//.test(url) ? esc(url) : '#';

function evidenceMarkup(ids:string[]) {
  const refs=ids.map(id=>refsById.get(id)).filter(e=>!!e);
  if (!refs.length) return '';
  return `<details class="observation-evidence"><summary>根拠を確認</summary><ul>${refs.map(ref=>{
    const s=sourceById.get(ref.sourceId);
    return s ? `<li><a href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a><small>${esc(s.publisher)}／${s.publishedAt ? `公表 ${esc(s.publishedAt)}` : '公表日未記載'}／内容確認 ${esc(ref.checkedAt)}</small><p>${esc(ref.locator)}</p></li>` : '';
  }).join('')}</ul></details>`;
}

export function observationLeadMarkup(race:RaceObservation) {
  const link=(section:string,label:string)=>`<button type="button" data-observation-jump="${esc(observationAnchor(race.electionId,section))}">${label}</button>`;
  return `<div class="observation-lead"><nav class="observation-shortcuts" aria-label="州の判断材料内を移動"><button type="button" data-observation-feed="recent" data-observation-race="${esc(race.electionId)}">関連ニュース</button>${link('comparison','候補者比較')}${link('choice','当選者を選ぶ')}</nav><h4>${esc(race.headline)}</h4><p>${esc(race.lead)}</p><p class="observation-uncertainty"><b>まだ分からないこと</b>${esc(race.uncertainty)}</p><small>分析更新 <time datetime="${esc(race.updatedAt)}">${esc(race.updatedAt)}</time> · 解説は閲覧時の公開版</small>${evidenceMarkup(race.evidenceIds)}</div>`;
}

const candidateNameKey=(value:string|null)=>(value ?? '').toLowerCase().replace(/\b(jr|sr|ii|iii|iv)\b\.?/g,'').split(/[^a-z]+/).filter(token=>token.length>1).join('-');
const comparisonCandidatesFor=(race:RaceObservation,candidates:Candidate[])=>[...new Set(race.comparison.flatMap(row=>row.cells.map(cell=>cell.candidateId)))].map(id=>candidates.find(candidate=>candidate.candidateId===id)).filter((candidate):candidate is Candidate=>Boolean(candidate));

export function observationCandidateIntroMarkup(race:RaceObservation,candidates:Candidate[],incumbent:string|null) {
  const comparisonCandidates=comparisonCandidatesFor(race,candidates);
  if (!comparisonCandidates.length) return '';
  return `<section class="observation-candidate-intro" aria-label="主要候補"><span>主要候補</span><div>${comparisonCandidates.map(candidate=>`<article><i class="party-dot party-${esc(candidate.party)}" aria-hidden="true"></i><p><b>${esc(candidate.name)}</b><small>${esc(candidate.partyLabel)}${candidateNameKey(candidate.name)===candidateNameKey(incumbent) ? '・現職' : ''}</small></p></article>`).join('')}</div></section>`;
}

export function observationDecisionMarkup(race:RaceObservation) {
  return `<div class="observation-decision-grid"><section class="observation-materials" aria-label="重要な判断材料"><h4>まず見る判断材料</h4>${race.materials.slice(0,2).map(m=>`<article id="${esc(observationAnchor(race.electionId,m.materialId))}"><h5>${esc(m.title)}</h5><p>${esc(m.fact)}</p><p><b class="observation-kind">分析</b> ${esc(m.meaning)}</p><p class="observation-limit">${esc(m.limit)}</p>${evidenceMarkup(m.evidenceIds)}</article>`).join('')}</section><section class="observation-events-bridge"><h4>ニュース・今後の予定</h4><p>この州に関係する出来事と、次に確認する予定を全国情勢の一覧で追えます。</p><div class="observation-feed-actions"><button type="button" data-observation-feed="recent" data-observation-race="${esc(race.electionId)}">この州のニュースを見る</button><button type="button" data-observation-feed="upcoming" data-observation-race="${esc(race.electionId)}">この州の今後の予定を見る</button></div><div class="observation-watch"><h5>次に確認したい点</h5><p class="observation-limit">以下は公表日が決まった予定ではありません。</p>${race.watchItems.slice(0,2).map(w=>`<details><summary>${esc(w.title)}</summary><p>${esc(w.what)}</p><p>${esc(w.how)}</p></details>`).join('')}</div></section></div>`;
}

export function observationComparisonMarkup(race:RaceObservation,candidates:Candidate[],prefix='obs',readingOnly=false) {
  const labels={observed:'確認できたこと',claim:'本人・陣営の主張',interpretation:'分析',pending:'未確認'};
  const comparisonCandidates=comparisonCandidatesFor(race,candidates);
  const rowMarkup=(row:RaceObservation['comparison'][number])=>`<section class="observation-comparison-item"><h5>${esc(row.label)}</h5><div class="observation-comparison-row">${comparisonCandidates.map(candidate=>{
    const cell=row.cells.find(item=>item.candidateId===candidate.candidateId);
    return `<article aria-label="${esc(candidate.name)}・${esc(row.label)}">${cell ? `<span class="observation-kind">${labels[cell.kind]}</span><p>${esc(cell.text)}</p>${evidenceMarkup(cell.evidenceIds)}` : '<span class="observation-kind">未確認</span><p>この項目は確認できる資料を追加中。</p>'}</article>`;
  }).join('')}</div></section>`;
  const primary=race.comparison.slice(0,3);
  const supplementary=race.comparison.slice(3);
  return `<section id="${esc(`${prefix}-${race.electionId}-comparison`)}" tabindex="-1" class="observation-comparison"><h4>候補者を同じ項目で比較</h4><p>公約と実績、有権者の評価を分けて確認する。</p><div class="observation-candidate-head" aria-label="比較する候補者">${comparisonCandidates.map(candidate=>`<div><i class="party-dot party-${esc(candidate.party)}" aria-hidden="true"></i><b>${esc(candidate.name)}</b><small>${esc(candidate.partyLabel)}</small></div>`).join('')}</div>${primary.map(rowMarkup).join('')}${supplementary.length ? `<details class="observation-comparison-more"><summary>実績への評価・有権者の受け止め（${supplementary.length}項目）</summary>${supplementary.map(rowMarkup).join('')}</details>` : ''}<p class="observation-limit">${readingOnly ? '主要候補を比較しています。' : '選択欄から全候補を選べます。'}未確認は「支持なし」「問題なし」を意味しません。</p></section>`;
}

/** Reading stays inside the briefing; no scenario controls or duplicate detail anchors. */
export function observationBriefingParts(race:RaceObservation,candidates:Candidate[],incumbent:string|null) {
  const candidateIntro = observationCandidateIntroMarkup(race,candidates,incumbent);
  const lead = `<div class="briefing-week"><small>今週の焦点 · 分析更新 <time datetime="${esc(race.updatedAt)}">${esc(race.updatedAt)}</time></small><h4>${esc(race.headline)}</h4><p>${esc(race.featuredSummary)}</p></div>`;
  const details = `<details class="briefing-details"><summary>候補者の違い・発言の経緯を、この欄で読む</summary><div class="briefing-expanded">
      <h4>これまでの経緯</h4><p>${esc(race.lead)}</p>
      <p class="observation-uncertainty"><b>まだ分からないこと</b>${esc(race.uncertainty)}</p>${evidenceMarkup(race.evidenceIds)}
      <section class="observation-materials"><h4>判断材料を詳しく読む</h4>${race.materials.map(m=>`<article><h5>${esc(m.title)}</h5><p>${esc(m.fact)}</p><p><b>分析</b> ${esc(m.meaning)}</p><p class="observation-limit">${esc(m.limit)}</p>${evidenceMarkup(m.evidenceIds)}</article>`).join('')}</section>
      ${observationComparisonMarkup(race,candidates,'briefing',true)}
      <section class="briefing-watch"><h4>次に確認したい点</h4>${race.watchItems.map(w=>`<details><summary>${esc(w.title)}</summary><p>${esc(w.what)}</p><p>${esc(w.how)}</p></details>`).join('')}</section>
    </div></details>`;
  return {candidates:candidateIntro,lead,details};
}

export function observationBriefingMarkup(race:RaceObservation,candidates:Candidate[],incumbent:string|null) {
  const parts = observationBriefingParts(race,candidates,incumbent);
  return parts.candidates + parts.lead + parts.details;
}

export function observationUpdateMarkup(update:ObservationUpdate,electionId:string) {
  return `<button type="button" id="${esc(observationAnchor(electionId,update.updateId))}" class="observation-update-link" data-observation-feed-item="update:${esc(update.updateId)}"><small>出来事 ${esc(update.eventDate)}／解説更新 ${esc(update.updatedAt)}</small><strong>${esc(update.title)}</strong><span>${esc(update.meaning)}</span></button>`;
}

export function observationUpdatesMarkup(race:RaceObservation) {
  const updates=publishedUpdates(observationData,race.electionId);
  const render=(items:ObservationUpdate[])=>items.map(u=>observationUpdateMarkup(u,race.electionId)).join('');
  return `<section id="${esc(observationAnchor(race.electionId,'updates'))}" tabindex="-1" class="observation-updates"><h4>この州に関係するニュース</h4>${updates.length ? render(updates.slice(0,3)) : `<p>${esc(race.updatedAt)}に判断材料を掲載。新しい出来事を確認したらニュース一覧へ追加します。</p>`}${updates.length>3 ? `<details><summary>過去の分析更新（${updates.length-3}件）</summary>${render(updates.slice(3))}</details>` : ''}<button type="button" class="observation-all-news" data-observation-feed="recent" data-observation-race="${esc(race.electionId)}">この州のニュースをすべて見る</button></section>`;
}

export function monitoringMarkup(now=new Date()) {
  const m=observationData.monitor, run=m.latestRun;
  const checked=m.lastCompletedAt ? new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(m.lastCompletedAt))+' 日本時間' : '完了記録なし';
  return `<div class="observation-monitor"><p><b data-observation-status>${monitoringStatus(observationData,now).join('／')}</b></p><small>最終確認 ${esc(checked)}</small><details><summary>確認範囲と更新予定</summary><p>${m.state==='scheduled' ? '毎日9:00（日本時間）に確認を開始。月曜は候補者比較も見直します。' : '定期確認は接続準備中です。'} 公開は内容確認と検証が済み次第行います。</p><p>${esc(run.note)}</p><small>今回の原文照合 ${run.checkedSourceIds.length}件／未確認 ${run.pendingSourceIds.length}件。分析更新日は各州に表示。</small><ul>${observationData.sources.map(s=>`<li><a href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a><small>${s.checkStatus==='checked' ? `内容確認 ${esc(s.contentVerifiedAt ?? '')}` : s.checkStatus==='unavailable' ? '取得できず・前回の確認内容を維持' : '今回の確認は未完了'}</small></li>`).join('')}</ul></details></div>`;
}

/** Jump within the existing scroller, opening ancestors without rerendering. */
export function jumpToObservation(id:string) {
  const target=document.getElementById(id);
  if (!target) return false;
  let parent=target.parentElement;
  while (parent) { if (parent instanceof HTMLDetailsElement) parent.open=true; parent=parent.parentElement; }
  target.scrollIntoView({block:'start',behavior:'instant'});
  target.focus({preventScroll:true});
  // View references are independent of the saved scenario parameter `s`.
  const prefix='obs-';
  const race=observationData.races.find(r=>id.startsWith(`${prefix}${r.electionId}-`));
  if (race) {
    const url=new URL(window.location.href);
    url.searchParams.set('race',race.electionId);
    url.searchParams.set('observation',id.slice(`${prefix}${race.electionId}-`.length));
    window.history.replaceState(null,'',url);
  }
  return true;
}

export function bindObservationJumps(root:ParentNode) {
  root.querySelectorAll<HTMLButtonElement>('[data-observation-jump]').forEach(button=>button.addEventListener('click',()=>jumpToObservation(button.dataset.observationJump!)));
}
