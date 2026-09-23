import type { Poll, PollResult } from '../data/research-model';
import { researchSources } from '../data/research-sources';
import { getPublishedPolls } from '../research-logic';
import { escapeHtml as esc } from './research';

/** One study can have several populations or voting rounds; keep them together. */
export function briefingPollStudies(items: Poll[], electionId: string): Poll[][] {
  const studies = new Map<string, Poll[]>();
  for (const poll of getPublishedPolls(items,electionId)) {
    const key = poll.studyId ?? poll.pollId;
    studies.set(key,[...(studies.get(key) ?? []),poll]);
  }
  return [...studies.values()];
}

const colorKey = (r: PollResult) => r.party === 'D' ? 'd' : r.party === 'R' ? 'r' : r.category === 'undecided' ? 'undecided' : 'other';
const stageLabels: Record<NonNullable<Poll['resultStage']>,string> = {
  base:'初回候補者選択', 'first-choice':'第1選択', 'leaner-follow-up':'未定者への追質問',
  elimination:'候補除外後', 'calculated-head-to-head':'仮想の一騎打ち',
  'cumulative-with-leaners':'未定者の回答を割当後', final:'最終順位選択ラウンド',
};

export function briefingPollMarkup(poll: Poll) {
  // Keep published values. The visual denominator only accommodates rounded totals over 100.
  const total = poll.results.reduce((sum,r)=>sum+r.value,0);
  const denominator = Math.max(100,total);
  const remainder = total < 99.99 && (poll.residualTreatment ?? 'unreported') === 'unreported' ? Number((100-total).toFixed(2)) : 0;
  const results = [...poll.results].sort((a,b)=>['d','r','undecided','other'].indexOf(colorKey(a))-['d','r','undecided','other'].indexOf(colorKey(b)));
  const condition = poll.conditionLabel ?? (poll.resultStage ? stageLabels[poll.resultStage] : '候補者選択');
  const sources = [...new Set(poll.sourceIds)].flatMap(id=>{
    const source = researchSources.find(s=>s.sourceId===id);
    return source ? [`<a href="${esc(source.url)}" target="_blank" rel="noreferrer">${esc(source.title)}</a>`] : [];
  }).join('／');
  return `<article class="briefing-poll" data-poll-id="${esc(poll.pollId)}">
    <div class="briefing-poll-heading"><b>${esc(poll.pollster)}${poll.sponsor ? ` <span>／${esc(poll.sponsor)}</span>` : ''}</b></div>
    <div class="briefing-poll-track" aria-hidden="true">${results.map(r=>`<i class="briefing-poll-${colorKey(r)}" style="width:${r.value/denominator*100}%"></i>`).join('')}${remainder ? `<i class="briefing-poll-unreported" style="width:${remainder/denominator*100}%"></i>` : ''}</div>
    <ul class="briefing-poll-labels">${results.map(r=>`<li><i class="briefing-poll-${colorKey(r)}" aria-hidden="true"></i>${esc(r.label)} <b>${r.value}%</b></li>`).join('')}${remainder ? `<li><i class="briefing-poll-unreported" aria-hidden="true"></i>内訳未掲載 <b>${remainder}%</b></li>` : ''}</ul>
    <p class="briefing-poll-meta"><time datetime="${esc(poll.fieldEnd)}">${esc(poll.fieldStart)}〜${esc(poll.fieldEnd)}</time><br>${esc(poll.populationLabel)} ${poll.sampleSize.toLocaleString('ja-JP')}人 · <b>${esc(condition)}</b>${poll.completeness === 'partial' ? ' · 部分公開' : ''}</p>
    <p class="briefing-poll-precision">${esc(poll.precisionLabel ?? '誤差の記載なし')}${poll.residualTreatment === 'rounding' || total > 100.01 ? ` · 公表値の合計${Number(total.toFixed(2))}%（丸め）` : ''}</p>
    <details class="briefing-poll-method"><summary>調査方法・設問・出典</summary><p>スポンサー：${esc(poll.sponsor ?? '明記なし')}</p><p>${esc(poll.method)}</p><p>${esc(poll.question)}</p>${poll.notes.map(n=>`<p>${esc(n)}</p>`).join('')}<p>${sources || '出典を確認中'}</p></details>
  </article>`;
}

export function briefingPollsMarkup(items: Poll[], electionId: string) {
  const studies = briefingPollStudies(items,electionId);
  const heading = '<h4>世論調査の支持率</h4>';
  if (!studies.length) return `<section class="briefing-polls" aria-label="世論調査の支持率">${heading}<p class="briefing-polls-note">棒グラフに掲載できる確認済みの調査結果は、まだ収録していません。</p></section>`;
  const studyMarkup = (study: Poll[]) => `<div class="briefing-poll-study">${briefingPollMarkup(study[0])}${study.length>1 ? `<details class="briefing-poll-variants"><summary>同じ調査の別集計（${study.length-1}件）</summary>${study.slice(1).map(briefingPollMarkup).join('')}</details>` : ''}</div>`;
  return `<section class="briefing-polls" aria-label="世論調査の支持率">${heading}<p class="briefing-polls-note">収録済みの調査を実施日の新しい順に表示。対象・方法・投票段階の違いも確認する。</p>
    <div class="briefing-polls-visible">${studies.slice(0,2).map(studyMarkup).join('')}</div>
    ${studies.length>2 ? `<details class="briefing-polls-older"><summary>それ以前の${studies.length-2}調査を見る</summary>${studies.slice(2).map(studyMarkup).join('')}</details>` : ''}</section>`;
}
