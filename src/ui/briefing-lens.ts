import { sources } from '../data/data';
import { briefingLensEvidence } from '../data/briefing-lens-sources';
import { briefingAxes, briefingLenses } from '../data/briefing-lenses';
import { escapeHtml as esc } from './research';

const sourceById = new Map(sources.map(source => [source.sourceId, source]));

export function briefingLensMarkup(electionId: string): string {
  const lens = briefingLenses.find(item => item.electionId === electionId);
  if (!lens) return '';
  return `<section class="briefing-lens" aria-label="勝敗を読む視点">
    <div class="briefing-lens-heading"><b>勝敗を読む視点</b><span>${esc(briefingAxes[lens.axis].label)}</span></div>
    <h4>${esc(lens.finding)}</h4><p>${esc(lens.evidence)}</p>
    <details><summary>詳しい読み方・出典</summary>
      <p><b>${esc(lens.question)}</b>${esc(lens.detail)}</p>
      <p><b>次に確認するデータ</b>${esc(lens.nextData)}</p>
      <p class="briefing-lens-limit">${esc(lens.limitation)}</p>
      <div class="briefing-common-guide"><b>全州に共通する3つの見方</b><dl>${Object.entries(briefingAxes).map(([key,axis])=>`<div${key===lens.axis ? ' class="is-current"' : ''}><dt>${esc(axis.label)}${key===lens.axis ? '〈この州の焦点〉' : ''}</dt><dd>${esc(axis.description)}</dd></div>`).join('')}</dl><p>この欄では、確認できた事実と読み取り、その限界を分けて解説します。調査は対象者・設問・時期をそろえて比べ、別の調査でも傾向が見えるかを確認します。</p></div>
      <ul class="briefing-lens-sources">${lens.sourceIds.map(id => {
        const source=sourceById.get(id);
        const evidence=briefingLensEvidence.filter(ref=>lens.evidenceIds.includes(ref.evidenceId) && ref.sourceId===id);
        return source ? `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)}：${esc(source.title)}</a>${evidence.map(ref=>`<small>${esc(ref.locator)}／根拠確認 ${esc(ref.checkedAt)}</small>`).join('')}</li>` : '';
      }).join('')}</ul>
    </details>
  </section>`;
}
