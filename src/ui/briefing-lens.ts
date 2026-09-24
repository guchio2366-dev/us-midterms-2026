import { sources } from '../data/data';
import { briefingAxes, briefingLenses } from '../data/briefing-lenses';
import { escapeHtml as esc } from './research';

const sourceById = new Map(sources.map(source => [source.sourceId, source]));

export function briefingLensMarkup(electionId: string): string {
  const lens = briefingLenses.find(item => item.electionId === electionId);
  if (!lens) return '';
  return `<section class="briefing-lens" aria-label="勝敗を読む視点">
    <div class="briefing-lens-heading"><b>勝敗を読む視点</b><span>${esc(briefingAxes[lens.axis].label)}</span></div>
    <h5>${esc(lens.question)}</h5><p>${esc(lens.finding)}</p>
    <details><summary>根拠と、次に確かめること</summary>
      <p><b>根拠</b>${esc(lens.evidence)}</p>
      <p><b>次に確認するデータ</b>${esc(lens.nextData)}</p>
      <p class="briefing-lens-limit">${esc(lens.limitation)}</p>
      <ul class="briefing-lens-sources">${lens.sourceIds.map(id => {
        const source=sourceById.get(id);
        return source ? `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)}：${esc(source.title)}</a>${source.contentVerifiedAt ? `<small>資料確認 ${esc(source.contentVerifiedAt)}</small>` : ''}</li>` : '';
      }).join('')}</ul>
      <div class="briefing-common-guide"><b>全州に共通する3つの見方</b><dl>${Object.entries(briefingAxes).map(([key,axis])=>`<div${key===lens.axis ? ' class="is-current"' : ''}><dt>${esc(axis.label)}${key===lens.axis ? '〈この州の焦点〉' : ''}</dt><dd>${esc(axis.description)}</dd></div>`).join('')}</dl><p>この欄では、確認できた事実と読み取り、その限界を分けて解説します。調査は対象者・設問・時期をそろえて比べ、別の調査でも傾向が見えるかを確認します。</p></div>
    </details>
  </section>`;
}
