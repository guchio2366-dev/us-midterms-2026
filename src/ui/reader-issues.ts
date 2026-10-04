import { issueCategories } from '../data/civics';
import { elections, sources, states } from '../data/data';
import type { Election, IssueCategory, Source, State } from '../data/model';
import { newsItems } from '../data/news';
import { policyPrototype } from '../data/policy-prototype';
import { issueReports } from '../data/research';
import type { EvidenceRef, IssueCaseStudy, IssueReport, ResearchNewsItem } from '../data/research-model';
import { evidenceRefs } from '../data/research-sources';
import { escapeHtml as esc } from './research';

/** The landing cards re-use published explanations; they do not infer voting effects. */
export interface ReaderIssuesOptions {
  categories: IssueCategory[];
  reports: IssueReport[];
  news: ResearchNewsItem[];
  sources: Source[];
  evidence: EvidenceRef[];
  states: State[];
  elections: Election[];
}

const defaultOptions: ReaderIssuesOptions = {
  categories: issueCategories, reports: issueReports, news: newsItems,
  sources, evidence: evidenceRefs, states, elections,
};
const featured = [
  { issueId: 'health-family', title: '医療費と医療へのアクセス', caseId: 'case-ia-health' },
  { issueId: 'trade-industry', title: '関税と地域の産業・雇用', caseId: 'case-ia-trade' },
] as const;
const safeSourceUrl = (url: string) => /^https?:\/\//i.test(url);

function evidenceMarkup(ids: string[], data: ReaderIssuesOptions): string {
  const items = [...new Set(ids)].flatMap(id => {
    const evidence = data.evidence.find(item => item.evidenceId === id);
    const source = evidence && data.sources.find(item => item.sourceId === evidence.sourceId);
    return evidence && source && evidence.checkedAt && source.contentVerifiedAt && safeSourceUrl(source.url)
      ? [{ evidence, source }] : [];
  });
  if (!items.length) return '<p class="reader-issue-meta">この箇所の確認済み出典は未収録です。</p>';
  return `<details class="reader-issue-evidence"><summary>この事例の出典と資料日</summary><ul>${items.map(({ evidence, source }) =>
    `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)}：${esc(source.title)}</a><p>${esc(evidence.locator)}</p><small>資料公表 ${esc(source.publishedAt ?? '日付不明')}${source.updatedAt ? `・資料更新 ${esc(source.updatedAt)}` : ''}・内容確認 ${esc(evidence.checkedAt)}</small></li>`,
  ).join('')}</ul></details>`;
}

function caseMarkup(item: IssueCaseStudy, data: ReaderIssuesOptions, primary = false): string {
  const candidateNames = item.electionIds.flatMap(id => {
    const election = data.elections.find(entry => entry.electionId === id);
    return election?.candidates.filter(candidate => candidate.status === 'confirmed' && candidate.ballotStage === 'general-ballot' && (candidate.party === 'D' || candidate.party === 'R'))
      .map(candidate => `${candidate.party === 'D' ? '民主党' : '共和党'} ${candidate.name}`) ?? [];
  });
  const stateButtons = [...new Set(item.electionIds)].flatMap(electionId => {
    const election = data.elections.find(entry => entry.electionId === electionId);
    const state = election && data.states.find(entry => election.seatId.startsWith(`${entry.abbr}-`));
    return state ? [`<button type="button" data-reader-state="${esc(electionId)}">${esc(state.nameJa)}の情勢と候補者へ</button>`] : [];
  }).join('');
  return `<section class="reader-issue-example${primary ? ' primary' : ''}"><h4>${esc(item.title)}</h4>${candidateNames.length ? `<p class="reader-issue-meta">事例の主要候補：${esc([...new Set(candidateNames)].join('／'))}</p>` : ''}<p>${esc(item.body)}</p>${evidenceMarkup(item.evidenceIds, data)}<div class="reader-issue-actions">${stateButtons}</div></section>`;
}

function newsMarkup(issueId: string, data: ReaderIssuesOptions): string {
  const news = data.news.filter(item => item.status === 'published' && item.issueIds.includes(issueId)
    && item.sourceIds.length > 0 && item.sourceIds.every(id => data.sources.some(source => source.sourceId === id && source.contentVerifiedAt))
    && item.evidenceIds.length > 0 && item.evidenceIds.every(id => data.evidence.some(evidence => evidence.evidenceId === id && evidence.checkedAt)))
    .sort((left, right) => (right.eventDate ?? right.publishedAt).localeCompare(left.eventDate ?? left.publishedAt)
      || right.updatedAt.localeCompare(left.updatedAt) || left.newsId.localeCompare(right.newsId))
    .slice(0, 2);
  if (!news.length) return '<p class="reader-issue-meta">この論点に結び付けた確認済みニュースは未収録です。</p>';
  return `<details class="reader-issue-news"><summary>関連する選挙・政策ニュース</summary><ul>${news.map(item =>
    `<li><small>${item.eventDate ? `出来事 ${esc(item.eventDate)}` : `記事公表 ${esc(item.publishedAt)}`}</small><button type="button" data-reader-feed="news:${esc(item.newsId)}">${esc(item.headline)}</button><p>${esc(item.summary)}</p></li>`,
  ).join('')}</ul></details>`;
}

function cardMarkup(config: typeof featured[number], data: ReaderIssuesOptions): string {
  const category = data.categories.find(item => item.issueId === config.issueId);
  const report = data.reports.find(item => item.issueId === config.issueId && item.status === 'published');
  if (!category || !report) return '';
  const primary = report.caseStudies.find(item => item.caseId === config.caseId) ?? report.caseStudies[0];
  const otherCases = report.caseStudies.filter(item => item !== primary);
  const medicalConnection = report.sections.find(item => item.heading === '医療への不安と現職評価を分ける')?.body.match(/^[^。]*。[^。]*。/)?.[0];
  const connection = config.issueId === 'trade-industry'
    ? policyPrototype.assumptions.find(item => item.assumptionId === 'assume-tariff-cost-concern')?.description
    : medicalConnection;
  return `<article class="reader-issue-card" data-reader-issue-card="${esc(config.issueId)}"><header><p class="reader-issue-scope">全米共通の政策／州・候補者の事例</p><h3>${esc(config.title)}</h3><p class="reader-issue-summary">${esc(report.summary)}</p></header><div class="reader-issue-connection"><h4>投票行動との接点</h4><p>${esc(connection ?? report.readingGuide)}</p><small>解釈・仮説</small></div>${primary ? caseMarkup(primary, data, true) : '<p class="reader-issue-meta">確認済みの州・候補者事例は未収録です。</p>'}<p class="reader-issue-next"><b>次に確認する指標</b> ${esc(category.indicatorLabels.join('・'))}</p><div class="reader-issue-actions"><button type="button" data-reader-issue="${esc(config.issueId)}">${esc(category.label)}の解説と根拠を読む</button></div><details class="reader-issue-detail"><summary>対象となる課題と${otherCases.length ? 'ほかの事例' : '読み方'}</summary><p>${esc(category.voterQuestion)}</p><p>${esc(report.readingGuide)}</p><small>論点説明の更新 ${esc(report.updatedAt)}</small>${otherCases.map(item => caseMarkup(item, data)).join('')}</details>${newsMarkup(config.issueId, data)}</article>`;
}

/** Optional assumptions and winner choices belong after this explanatory reading section. */
export function renderReaderIssues(data: ReaderIssuesOptions = defaultOptions): string {
  const cards = featured.map(item => cardMarkup(item, data)).join('');
  const allIssues = data.categories.filter(category => data.reports.some(report => report.issueId === category.issueId && report.status === 'published'));
  return `<div class="reader-issue-grid">${cards}</div><details class="reader-other-issues"><summary>${allIssues.length}つの論点全体から探す</summary><ul>${allIssues.map(category => `<li><button type="button" data-reader-issue="${esc(category.issueId)}">${esc(category.label)}</button><span>${esc(category.scope)}</span></li>`).join('')}</ul></details>`;
}
