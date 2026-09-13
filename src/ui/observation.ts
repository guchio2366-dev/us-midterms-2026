import type { Candidate } from '../data/model';
import type { ObservationEvent, ObservationUpdate, RaceObservation } from '../data/observation-model';
import { observationData } from '../data/observation';
import { eventInstant, eventStatus, eventsForRace, monitoringStatus, publishedUpdates } from '../observation-logic';
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
  return `<div class="observation-lead"><nav class="observation-shortcuts" aria-label="州の判断材料内を移動">${link('updates','直近の更新')}${link('comparison','候補者比較')}${link('choice','当選者を選ぶ')}</nav><h4>${esc(race.headline)}</h4><p>${esc(race.lead)}</p><p class="observation-uncertainty"><b>まだ分からないこと</b>${esc(race.uncertainty)}</p><small>分析更新 <time datetime="${esc(race.updatedAt)}">${esc(race.updatedAt)}</time> · 解説は閲覧時の公開版</small>${evidenceMarkup(race.evidenceIds)}</div>`;
}

function eventMarkup(event:ObservationEvent,electionId:string,now:Date) {
  const r=event.relevance.find(x=>x.electionId===electionId)!;
  const instant=eventInstant(event);
  const zone:Record<string,string>={'America/New_York':'米東部時間','America/Chicago':'米中部時間','America/Denver':'米山岳部時間','America/Los_Angeles':'米太平洋時間','America/Anchorage':'アラスカ時間'};
  const time=event.time ? `${esc(event.time)} ${esc(zone[event.timezone]??event.timezone)}` : '現地日付・時刻未確認';
  const jst=instant ? `／日本時間 ${new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(instant)}` : '';
  const update=event.resultUpdateId && publishedUpdates(observationData,electionId).find(u=>u.updateId===event.resultUpdateId);
  return `<li id="${esc(observationAnchor(electionId,event.eventId))}" tabindex="-1" class="observation-event"><div class="observation-date">${event.date ? `<time datetime="${esc(event.date)}">${esc(event.date)}</time><small>${time}${esc(jst)}</small>` : '<b>日程未定</b>'}<span>${eventStatus(event,now)}</span></div><h5>${esc(event.title)}</h5><p>${esc(r.why)}</p><p><b>見る点：</b>${esc(r.watch)}</p>${event.dateHistory.length ? `<small>以前の日程：${event.dateHistory.map(h=>`${esc(h.date)}（${esc(h.reason)}）`).join('、')}</small>` : ''}${event.dateHistory.map(h=>evidenceMarkup(h.evidenceIds)).join('')}${update ? `<button type="button" data-observation-jump="${esc(observationAnchor(electionId,update.updateId))}">結果と判断材料の変化を読む</button>` : ''}${evidenceMarkup(event.evidenceIds)}</li>`;
}

export function observationDecisionMarkup(race:RaceObservation,now=new Date()) {
  const groups=eventsForRace(observationData,race.electionId,now);
  const list=(items:ObservationEvent[])=>`<ul class="observation-event-list">${items.map(e=>eventMarkup(e,race.electionId,now)).join('')}</ul>`;
  const extra=[...groups.later,...groups.undated];
  return `<div class="observation-decision-grid"><section class="observation-materials" aria-label="重要な判断材料"><h4>まず見る判断材料</h4>${race.materials.slice(0,2).map(m=>`<article id="${esc(observationAnchor(race.electionId,m.materialId))}"><h5>${esc(m.title)}</h5><p>${esc(m.fact)}</p><p><b class="observation-kind">分析</b> ${esc(m.meaning)}</p><p class="observation-limit">${esc(m.limit)}</p>${evidenceMarkup(m.evidenceIds)}</article>`).join('')}</section><section class="observation-events" data-observation-clock="${esc(race.electionId)}"><h4>今後の注目予定</h4>${groups.initial.length ? list(groups.initial) : '<p>今後30日以内で掲載できる日程はありません。</p>'}${extra.length ? `<details><summary>すべての予定・日程未定（ほか${extra.length}件）</summary>${list(extra)}</details>` : ''}${groups.pending.length ? `<div class="observation-pending"><h5>結果を確認する予定</h5>${list(groups.pending.slice(0,3))}${groups.pending.length>3 ? `<details><summary>ほか${groups.pending.length-3}件</summary>${list(groups.pending.slice(3))}</details>` : ''}</div>` : ''}${groups.history.length ? `<details><summary>実施・中止・延期の記録</summary>${list(groups.history)}</details>` : ''}<div class="observation-watch"><h5>次に確認したい点</h5><p class="observation-limit">以下は公表日が決まった予定ではありません。</p>${race.watchItems.slice(0,2).map(w=>`<details><summary>${esc(w.title)}</summary><p>${esc(w.what)}</p><p>${esc(w.how)}</p></details>`).join('')}</div></section></div>`;
}

export function observationComparisonMarkup(race:RaceObservation,candidates:Candidate[]) {
  const labels={observed:'確認できたこと',claim:'本人・陣営の主張',interpretation:'分析',pending:'未確認'};
  return `<section id="${esc(observationAnchor(race.electionId,'comparison'))}" tabindex="-1" class="observation-comparison"><h4>候補者を詳しく比較する</h4><p>同じ項目で読み比べる。公約と実績、有権者の評価を分けて確認する。</p>${race.comparison.map(row=>`<details><summary>${esc(row.label)}</summary><div class="observation-comparison-row">${row.cells.map(cell=>{
    const candidate=candidates.find(c=>c.candidateId===cell.candidateId);
    if (!candidate) return '';
    return `<article><h5><i class="party-dot ${esc(candidate.party)}" aria-hidden="true"></i>${esc(candidate.name)}<small>${esc(candidate.partyLabel)}</small></h5><span class="observation-kind">${labels[cell.kind]}</span><p>${esc(cell.text)}</p>${evidenceMarkup(cell.evidenceIds)}</article>`;
  }).join('')}</div></details>`).join('')}<p class="observation-limit">選択欄から全候補を選べます。未確認は「支持なし」「問題なし」を意味しません。</p></section>`;
}

export function observationUpdateMarkup(update:ObservationUpdate,electionId:string) {
  const event=update.eventId && observationData.events.find(e=>e.eventId===update.eventId && e.relevance.some(r=>r.electionId===electionId));
  return `<article id="${esc(observationAnchor(electionId,update.updateId))}" tabindex="-1" class="observation-update"><small>出来事 ${esc(update.eventDate)}／解説更新 ${esc(update.updatedAt)}</small><h5>${esc(update.title)}</h5><p>${esc(update.happened)}</p><p><b>判断材料の変化：</b>${esc(update.meaning)}</p><p class="observation-limit">${esc(update.uncertainty)}</p>${event ? `<button type="button" data-observation-jump="${esc(observationAnchor(electionId,event.eventId))}">元の予定を見る</button>` : ''}${update.newsId ? `<button type="button" data-related-news="${esc(update.newsId)}">関連ニュースを開く</button>` : ''}${evidenceMarkup(update.evidenceIds)}</article>`;
}

export function observationUpdatesMarkup(race:RaceObservation) {
  const updates=publishedUpdates(observationData,race.electionId);
  const render=(items:ObservationUpdate[])=>items.map(u=>observationUpdateMarkup(u,race.electionId)).join('');
  return `<section id="${esc(observationAnchor(race.electionId,'updates'))}" tabindex="-1" class="observation-updates"><h4>直近の更新</h4>${updates.length ? render(updates.slice(0,3)) : `<p>${esc(race.updatedAt)}に判断材料を掲載。新しい出来事を確認したら、何が変わったかを追記します。</p>`}${updates.length>3 ? `<details><summary>過去の更新（${updates.length-3}件）</summary>${render(updates.slice(3))}</details>` : ''}</section>`;
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
