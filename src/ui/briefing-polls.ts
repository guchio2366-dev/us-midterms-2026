import type { Poll, PollResult } from '../data/research-model';
import { sources as allSources } from '../data/data';
import { briefingLenses } from '../data/briefing-lenses';
import { briefingLensEvidence } from '../data/briefing-lens-sources';
import { briefingEvidenceDisplay } from '../data/briefing-evidence';
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

const pollCondition = (poll: Poll) => poll.conditionLabel ?? (poll.resultStage ? stageLabels[poll.resultStage] : '候補者選択');
const pollPartyLabel = (result: PollResult) => result.party === 'D' ? '民主党' : result.party === 'R' ? '共和党' : result.party === 'I' ? '無所属' : '';

/** Use one recorded population/round from each study, never a calculated polling average. */
export function briefingHeadlinePollsMarkup(items: Poll[], electionId: string): string {
  const selected = briefingPollStudies(items,electionId).slice(0,2).map(study=>study[0]);
  if (!selected.length) return '<section class="briefing-headline-polls briefing-headline-empty" aria-label="収録済み調査の支持率"><h4>世論調査の支持率</h4><p>棒グラフに掲載できる確認済みの調査結果は、まだ収録していません。</p></section>';
  return `<section class="briefing-headline-polls" aria-label="収録済み調査の支持率"><h4>世論調査の支持率</h4><div class="briefing-headline-grid">${selected.map(poll=>{
    const sampleScope=directPollRows(items,electionId).find(row=>row.poll.pollId===poll.pollId)?.sampleScope;
    const total=poll.results.reduce((sum,result)=>sum+result.value,0);
    const denominator=Math.max(100,total);
    const remainder=total<99.99 && (poll.residualTreatment ?? 'unreported')==='unreported' ? Number((100-total).toFixed(2)) : 0;
    const results=[...poll.results].sort((a,b)=>['d','r','undecided','other'].indexOf(colorKey(a))-['d','r','undecided','other'].indexOf(colorKey(b)));
    return `<article class="briefing-poll-compact" data-summary-poll-id="${esc(poll.pollId)}"><b class="briefing-compact-pollster">${esc(poll.sponsor ?? poll.pollster)}</b>
      <div class="briefing-poll-track" aria-hidden="true">${results.map(result=>`<i class="briefing-poll-${colorKey(result)}" style="width:${result.value/denominator*100}%"></i>`).join('')}${remainder ? `<i class="briefing-poll-unreported" style="width:${remainder/denominator*100}%"></i>` : ''}</div>
      <ul class="briefing-poll-labels">${results.map(result=>`<li><i class="briefing-poll-${colorKey(result)}" aria-hidden="true"></i><span>${esc(result.label)}${pollPartyLabel(result) ? `（${pollPartyLabel(result)}）` : ''}</span> <b>${result.value}%</b></li>`).join('')}${remainder ? `<li><i class="briefing-poll-unreported" aria-hidden="true"></i><span>内訳未掲載</span> <b>${remainder}%</b></li>` : ''}</ul>
      <p class="briefing-compact-note"><time datetime="${esc(poll.fieldEnd)}">${esc(poll.fieldStart)}〜${esc(poll.fieldEnd)}</time><br>${sampleScope==='study' ? `調査全体 ${poll.sampleSize.toLocaleString('ja-JP')}人（${esc(poll.populationLabel)}。最終集計の人数ではない）` : `${esc(poll.populationLabel)} ${poll.sampleSize.toLocaleString('ja-JP')}人`} · ${esc(pollCondition(poll))}${poll.completeness==='partial' ? ' · 部分公開' : ''}</p>
      <p class="briefing-compact-note">${sampleScope==='study' ? '調査全体の公表値：' : ''}${esc(poll.precisionLabel ?? '誤差の記載なし')}${poll.residualTreatment==='rounding' || total>100.01 ? ` · 合計${Number(total.toFixed(2))}%（丸め）` : ''}</p>
    </article>`;
  }).join('')}</div><p class="briefing-headline-note">情勢評価・当選確率とは別の実測値。${selected.length>1 ? '各調査は日付・対象・質問が異なり、平均していません。' : ''}詳しい設問・別集計・出典は候補者説明の後にあります。</p></section>`;
}

export function briefingPollMarkup(poll: Poll, options: { sampleScope?: 'study' } = {}) {
  // Keep published values. The visual denominator only accommodates rounded totals over 100.
  const total = poll.results.reduce((sum,r)=>sum+r.value,0);
  const denominator = Math.max(100,total);
  const remainder = total < 99.99 && (poll.residualTreatment ?? 'unreported') === 'unreported' ? Number((100-total).toFixed(2)) : 0;
  const results = [...poll.results].sort((a,b)=>['d','r','undecided','other'].indexOf(colorKey(a))-['d','r','undecided','other'].indexOf(colorKey(b)));
  const condition = pollCondition(poll);
  const sources = [...new Set(poll.sourceIds)].flatMap(id=>{
    const source = allSources.find(s=>s.sourceId===id);
    return source ? [`<a href="${esc(source.url)}" target="_blank" rel="noreferrer">${esc(source.title)}</a>`] : [];
  }).join('／');
  return `<article class="briefing-poll" data-poll-id="${esc(poll.pollId)}">
    <div class="briefing-poll-heading"><b>${esc(poll.pollster)}${poll.sponsor ? ` <span>／${esc(poll.sponsor)}</span>` : ''}</b></div>
    <div class="briefing-poll-track" aria-hidden="true">${results.map(r=>`<i class="briefing-poll-${colorKey(r)}" style="width:${r.value/denominator*100}%"></i>`).join('')}${remainder ? `<i class="briefing-poll-unreported" style="width:${remainder/denominator*100}%"></i>` : ''}</div>
    <ul class="briefing-poll-labels">${results.map(r=>`<li><i class="briefing-poll-${colorKey(r)}" aria-hidden="true"></i>${esc(r.label)} <b>${r.value}%</b></li>`).join('')}${remainder ? `<li><i class="briefing-poll-unreported" aria-hidden="true"></i>内訳未掲載 <b>${remainder}%</b></li>` : ''}</ul>
    <p class="briefing-poll-meta"><time datetime="${esc(poll.fieldEnd)}">${esc(poll.fieldStart)}〜${esc(poll.fieldEnd)}</time><br>${options.sampleScope === 'study' ? `調査全体 ${poll.sampleSize.toLocaleString('ja-JP')}人（${esc(poll.populationLabel)}。最終集計の人数ではない）` : `${esc(poll.populationLabel)} ${poll.sampleSize.toLocaleString('ja-JP')}人`} · <b>${esc(condition)}</b>${poll.completeness === 'partial' ? ' · 部分公開' : ''}</p>
    <p class="briefing-poll-precision">${options.sampleScope === 'study' ? '調査全体の公表値：' : ''}${esc(poll.precisionLabel ?? '誤差の記載なし')}${poll.residualTreatment === 'rounding' || total > 100.01 ? ` · 公表値の合計${Number(total.toFixed(2))}%（丸め）` : ''}</p>
    <details class="briefing-poll-method"><summary>調査方法・設問・出典</summary><p>スポンサー：${esc(poll.sponsor ?? '明記なし')}</p><p>${esc(poll.method)}</p><p>${esc(poll.question)}</p>${poll.notes.map(n=>`<p>${esc(n)}</p>`).join('')}<p>${sources || '出典を確認中'}</p></details>
  </article>`;
}

/** Only a published record for the same election can serve as direct evidence. */
function directPollRows(items: Poll[], electionId: string) {
  const available = new Map(getPublishedPolls(items, electionId).map(poll => [poll.pollId, poll]));
  return (briefingEvidenceDisplay(electionId)?.pollRows ?? []).flatMap(row => {
    const poll = available.get(row.pollId);
    return poll ? [{ ...row, poll }] : [];
  });
}

export function briefingEvidenceMarkup(items: Poll[], electionId: string): string {
  const display = briefingEvidenceDisplay(electionId);
  const lens = briefingLenses.find(item => item.electionId === electionId);
  if (!display || !lens) return '';
  const rows = directPollRows(items, electionId);
  const table = display.table;
  const sourceMarkup = lens.sourceIds.flatMap(id => {
    const source = allSources.find(item => item.sourceId === id);
    if (!source) return [];
    const evidence = briefingLensEvidence.filter(ref => lens.evidenceIds.includes(ref.evidenceId) && ref.sourceId === id);
    return [`<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)}：${esc(source.title)}</a>${evidence.map(ref => `<small>${esc(ref.locator)}／根拠確認 ${esc(ref.checkedAt)}</small>`).join('')}</li>`];
  }).join('');
  return `<section class="briefing-evidence" aria-label="この結論の根拠">
    <h4>この結論の根拠</h4>
    <p class="briefing-evidence-meta"><b>${esc(display.sourceLabel)}</b> · ${esc(display.periodLabel)}<br>${esc(display.populationLabel)}</p>
    ${rows.length ? `<div class="briefing-evidence-polls">${rows.map(row => `<div class="briefing-evidence-poll"><p class="briefing-evidence-label">${esc(row.label)}</p>${briefingPollMarkup(row.poll, { sampleScope: row.sampleScope })}</div>`).join('')}</div>` : ''}
    ${table ? `<div class="briefing-evidence-table-wrap"><table class="briefing-evidence-table"><caption>${esc(table.caption)}</caption><thead><tr>${table.columns.map(column => `<th scope="col">${esc(column)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row => `<tr><th scope="row">${esc(row[0])}</th>${row.slice(1).map(value => `<td>${esc(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}
    ${display.pollRows && rows.length < display.pollRows.length ? '<p class="briefing-evidence-unavailable">この結論に対応する集計は、現在表示できる調査データにありません。出典と解説を確認してください。</p>' : ''}
    <p class="briefing-evidence-note">${esc(display.note)}</p>
    <details class="briefing-evidence-sources"><summary>この根拠の出典・確認箇所</summary><ul>${sourceMarkup}</ul></details>
  </section>`;
}

export function briefingComparisonPollsMarkup(items: Poll[], electionId: string): string {
  const shown = new Set(directPollRows(items, electionId).map(row => row.poll.pollId));
  const studies = briefingPollStudies(items, electionId).map(study => study.filter(poll => !shown.has(poll.pollId))).filter(study => study.length);
  if (!studies.length) return '';
  const studyMarkup = (study: Poll[]) => `<div class="briefing-poll-study">${briefingPollMarkup(study[0])}${study.length > 1 ? `<details class="briefing-poll-variants"><summary>同じ調査の別集計（${study.length - 1}件）</summary>${study.slice(1).map(poll => briefingPollMarkup(poll)).join('')}</details>` : ''}</div>`;
  return `<section class="briefing-comparison-polls" aria-label="ほかの調査と比較">
    <h4>ほかの調査と比較</h4><p class="briefing-polls-note">結論の直接の根拠とは分けて、収録済みの調査・別集計を実施日の新しい順に表示。</p>
    ${studyMarkup(studies[0])}
    ${studies.length > 1 ? `<details class="briefing-polls-older"><summary>残りの調査・別集計を見る（${studies.length - 1}組）</summary>${studies.slice(1).map(studyMarkup).join('')}</details>` : ''}
  </section>`;
}

export function briefingPollsMarkup(items: Poll[], electionId: string) {
  const studies = briefingPollStudies(items,electionId);
  const heading = '<h4>世論調査の支持率</h4>';
  if (!studies.length) return `<section class="briefing-polls" aria-label="世論調査の支持率">${heading}<p class="briefing-polls-note">棒グラフに掲載できる確認済みの調査結果は、まだ収録していません。</p></section>`;
  const studyMarkup = (study: Poll[]) => `<div class="briefing-poll-study">${briefingPollMarkup(study[0])}${study.length>1 ? `<details class="briefing-poll-variants"><summary>同じ調査の別集計（${study.length-1}件）</summary>${study.slice(1).map(poll => briefingPollMarkup(poll)).join('')}</details>` : ''}</div>`;
  return `<section class="briefing-polls" aria-label="世論調査の支持率">${heading}<p class="briefing-polls-note">収録済みの調査を実施日の新しい順に表示。対象・方法・投票段階の違いも確認する。</p>
    <div class="briefing-polls-visible">${studies.slice(0,2).map(studyMarkup).join('')}</div>
    ${studies.length>2 ? `<details class="briefing-polls-older"><summary>それ以前の${studies.length-2}調査を見る</summary>${studies.slice(2).map(studyMarkup).join('')}</details>` : ''}</section>`;
}
