import type { CandidateBrief, IssueReport, Poll, RaceBrief, RatingObservation, RollCallVote } from '../data/research-model';

export const escapeHtml = (value: string | number) => String(value)
  .replaceAll('&','&amp;')
  .replaceAll('<','&lt;')
  .replaceAll('>','&gt;')
  .replaceAll('"','&quot;')
  .replaceAll("'",'&#039;');

const partyClass = (party?: string) => party === 'D' ? 'poll-d' : party === 'R' ? 'poll-r' : 'poll-other';

export function pollMarkup(poll: Poll): string {
  const total = poll.results.reduce((sum,result) => sum + result.value,0);
  const visualDenominator = Math.max(100,total);
  const segments = poll.results.map(result => `<i class="${partyClass(result.party)}" style="width:${Math.max(0,Math.min(100,result.value / visualDenominator * 100))}%" title="${escapeHtml(result.label)} ${result.value}%"></i>`).join('');
  const showResidual = total < 99.99 && (poll.residualTreatment ?? 'unreported') === 'unreported';
  const residual = showResidual
    ? `<i class="poll-unreported" style="width:${Math.max(0,100-total)}%" title="内訳未掲載 ${Math.max(0,100-total).toFixed(1)}%"></i>`
    : '';
  const labels = poll.results.map(result => `<span><i class="${partyClass(result.party)}"></i><b>${escapeHtml(result.label)}</b> ${escapeHtml(result.value)}%</span>`).join('');
  const remainingLabel = showResidual ? `<span><i class="poll-unreported"></i><b>内訳未掲載</b> ${(100-total).toFixed(1)}%</span>` : '';
  const notes = poll.notes.length ? `<ul class="poll-notes">${poll.notes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul>` : '';
  const condition = poll.conditionLabel ? `<span class="poll-condition">${escapeHtml(poll.conditionLabel)}</span>` : '';
  const completeness = poll.completeness === 'partial' ? '<span class="poll-partial">部分公開</span>' : '';
  const questionLabel = poll.questionExact === true ? '設問原文' : '設問・条件';
  return `<article class="poll-card"><div class="poll-heading"><b>${escapeHtml(poll.pollster)}</b><span>${escapeHtml(poll.fieldStart)}〜${escapeHtml(poll.fieldEnd)}</span></div><div class="poll-flags">${condition}${completeness}</div><div class="poll-track" role="img" aria-label="${escapeHtml([poll.conditionLabel,...poll.results.map(result => `${result.label} ${result.value}%`)].filter(Boolean).join('、'))}">${segments}${residual}</div><div class="poll-labels">${labels}${remainingLabel}</div><dl class="poll-meta"><div><dt>対象・人数</dt><dd>${escapeHtml(poll.populationLabel)} ${poll.sampleSize.toLocaleString('ja-JP')}人</dd></div><div><dt>${questionLabel}</dt><dd>${escapeHtml(poll.question)}</dd></div><div><dt>方法</dt><dd>${escapeHtml(poll.method)}</dd></div><div><dt>スポンサー</dt><dd>${escapeHtml(poll.sponsor ?? '明記なし')}</dd></div><div><dt>精度表記</dt><dd>${escapeHtml(poll.precisionLabel ?? '公表ページで確認できず')}</dd></div></dl>${notes}</article>`;
}

export function pollsMarkup(polls: Poll[]): string {
  if (!polls.length) return '<p class="research-empty">比較可能な調査の原表を確認中です。</p>';
  const studies = new Map<string,Poll[]>();
  polls.forEach(poll => {
    const key = poll.studyId ?? poll.pollId;
    studies.set(key,[...(studies.get(key) ?? []),poll]);
  });
  const groups = [...studies.values()];
  const renderStudy = (items: Poll[]) => items.length === 1
    ? pollMarkup(items[0])
    : `<section class="poll-study"><h5>${escapeHtml(items[0].pollster)}・同一調査の${items.length}集計</h5>${items.map(pollMarkup).join('')}</section>`;
  return `<section class="research-polls"><h4>直近の確認済み調査</h4>${groups.slice(0,3).map(renderStudy).join('')}${groups.length > 3 ? `<details><summary>それ以前の${groups.length-3}調査</summary>${groups.slice(3).map(renderStudy).join('')}</details>` : ''}</section>`;
}

export function ratingsMarkup(items: RatingObservation[]): string {
  if (!items.length) return '';
  const grouped = new Map<string,RatingObservation[]>();
  items.forEach(item => grouped.set(item.organization,[...(grouped.get(item.organization) ?? []),item]));
  const cards = [...grouped.entries()].map(([organization,observations]) => {
    const chronological = [...observations].sort((left,right) => left.ratedAt.localeCompare(right.ratedAt));
    const latest = chronological.at(-1)!;
    const history = chronological.length > 1 ? `<small class="rating-history">${chronological.map(item => `${escapeHtml(item.ratedAt)} ${escapeHtml(item.ratingRaw)}`).join(' → ')}</small>` : `<small>評価日 ${escapeHtml(latest.ratedAt)}・${escapeHtml(latest.ratingRaw)}</small>`;
    return `<article><b>${escapeHtml(latest.category)}</b><span>${escapeHtml(organization)}</span>${history}</article>`;
  }).join('');
  return `<section class="rating-comparisons"><h4>他機関の比較・同一機関内の推移</h4><div>${cards}</div><p>機関間の違いは比較として表示し、異なる機関の値を一つの評価推移にはつなぎません。</p></section>`;
}

export function raceBriefMarkup(brief: RaceBrief): string {
  const sections = brief.analysis.map(section => `<section class="research-section ${section.evidenceKind}"><h4>${escapeHtml(section.heading)}</h4><p>${escapeHtml(section.body)}</p></section>`).join('');
  return `<div class="race-research"><div class="research-status"><span>${brief.completeness === 'substantial' ? '重点調査' : '部分公開'}</span><time>更新 ${escapeHtml(brief.updatedAt)}</time></div><h4>${escapeHtml(brief.headline)}</h4><p class="race-summary-copy">${escapeHtml(brief.summary)}</p><div class="race-balance"><b>均衡度</b><p>${escapeHtml(brief.balance)}</p></div><div class="race-key-issues"><b>主な論点</b><ul>${brief.keyIssues.map(issue => `<li>${escapeHtml(issue)}</li>`).join('')}</ul></div>${sections}<details class="research-method"><summary>支持変化・投票参加・更新条件</summary><dl><div><dt>支持先の変化</dt><dd>${escapeHtml(brief.supportChange)}</dd></div><div><dt>投票参加</dt><dd>${escapeHtml(brief.turnout)}</dd></div><div><dt>次に説明を更新する条件</dt><dd><ul>${brief.updateConditions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></dd></div></dl></details></div>`;
}

const compactList = (label: string, values: string[]) => values.length ? `<div><dt>${escapeHtml(label)}</dt><dd><ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul></dd></div>` : '';

export function candidateBriefMarkup(brief: CandidateBrief): string {
  return `<div class="candidate-research"><p>${escapeHtml(brief.summary)}</p><dl>${compactList('現在の立場',brief.currentPositions)}${compactList('過去の採決・実績',brief.record)}${compactList('支持基盤・資金',brief.supportAndFinance)}${compactList('相手との主な違い',brief.differences)}${compactList('注視する政策',brief.policyPositions)}${compactList('明確に反対する政策',brief.opposedPolicies)}</dl><small>更新 ${escapeHtml(brief.updatedAt)}</small></div>`;
}

export function issueReportMarkup(report: IssueReport): string {
  const sections = report.sections.map(section => `<section class="issue-report-section ${section.evidenceKind}"><h4>${escapeHtml(section.heading)}</h4><p>${escapeHtml(section.body)}</p></section>`).join('');
  const cases = report.caseStudies.length ? `<section class="issue-cases"><h4>州・選挙の事例</h4>${report.caseStudies.map(item => `<article><b>${escapeHtml(item.title)}</b><p>${escapeHtml(item.body)}</p>${item.stateFips.map(fips => `<button type="button" data-research-state="${escapeHtml(fips)}">州詳細を開く</button>`).join('')}</article>`).join('')}</section>` : '';
  return `<div class="issue-report-body"><div class="research-status"><span>${report.completeness === 'substantial' ? '重点調査' : '部分公開'}</span><time>更新 ${escapeHtml(report.updatedAt)}</time></div><p class="issue-report-summary">${escapeHtml(report.summary)}</p><p class="issue-reading-guide">${escapeHtml(report.readingGuide)}</p>${sections}${cases}</div>`;
}

export function rollCallMarkup(item: RollCallVote): string {
  const total = item.yea + item.nay + item.notVoting;
  const share = (value:number) => total ? value / total * 100 : 0;
  return `<article class="roll-call"><p class="kicker">HISTORICAL ROLL CALL</p><h4>${escapeHtml(item.measure)}・上院採決 ${escapeHtml(item.voteDate)}</h4><p>${escapeHtml(item.summary)}</p><div class="roll-call-track" role="img" aria-label="賛成${item.yea}、反対${item.nay}、投票なし${item.notVoting}"><i class="yea" style="width:${share(item.yea)}%"></i><i class="nay" style="width:${share(item.nay)}%"></i><i class="not-voting" style="width:${share(item.notVoting)}%"></i></div><div class="roll-call-labels"><b>賛成 ${item.yea}</b><b>反対 ${item.nay}</b><b>投票なし ${item.notVoting}</b></div><ul>${item.notableVotes.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul></article>`;
}
