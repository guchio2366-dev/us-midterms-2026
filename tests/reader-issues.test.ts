import { describe, expect, it } from 'vitest';
import { issueCategories } from '../src/data/civics';
import { elections, sources, states } from '../src/data/data';
import { newsItems } from '../src/data/news';
import { issueReports } from '../src/data/research';
import { evidenceRefs } from '../src/data/research-sources';
import { renderReaderIssues, type ReaderIssuesOptions } from '../src/ui/reader-issues';

const fixture = (): ReaderIssuesOptions => structuredClone({
  categories: issueCategories, reports: issueReports, news: newsItems,
  sources, evidence: evidenceRefs, states, elections,
});

describe('reader issue cards', () => {
  it('connects both primary topics to existing explanations and actual candidate cases without changing data', () => {
    const data = fixture();
    const original = JSON.stringify(data);
    const html = renderReaderIssues(data);
    expect(html.match(/data-reader-issue-card=/g)).toHaveLength(2);
    for (const [issueId, caseId] of [['health-family', 'case-ia-health'], ['trade-industry', 'case-ia-trade']]) {
      const report = data.reports.find(item => item.issueId === issueId)!;
      const example = report.caseStudies.find(item => item.caseId === caseId)!;
      expect(html).toContain(report.summary);
      expect(html).toContain(report.readingGuide);
      expect(html).toContain(example.body);
      expect(html).toContain(`data-reader-issue="${issueId}"`);
    }
    expect(html).toContain('共和党 Ashley Hinson');
    expect(html).toContain('民主党 Josh Turek');
    expect(html).toContain('data-reader-state="2026-IA-2-regular"');
    expect(html).toContain('8つの論点全体から探す');
    expect(html).toContain('医療費への不満があっても、現職が変更を止めた点を評価する人も、新制度への転換を求める人もありうる。');
    expect(html).toContain('政権との交渉力と異論を唱える姿勢のどちらを評価するかは分かれ得る。');
    expect(html).toContain('解釈・仮説');
    expect(html).not.toMatch(/<select|<input|data-policy-action|data-scenario/);
    expect(JSON.stringify(data)).toBe(original);
  });

  it('only links published news with checked sources and evidence, and separates event and publication dates', () => {
    const data = fixture();
    const news = data.news.find(item => item.status === 'published' && item.issueIds.includes('health-family'))!;
    data.news = [
      { ...structuredClone(news), newsId: 'checked-news', headline: '確認済みの出来事', eventDate: '2026-10-01', publishedAt: '2026-10-02' },
      { ...structuredClone(news), newsId: 'publication-only', headline: '発生日不明の記事', eventDate: null, publishedAt: '2026-10-03' },
      { ...structuredClone(news), newsId: 'draft-news', headline: '非公開ニュース', status: 'draft', eventDate: '2026-10-04' },
      { ...structuredClone(news), newsId: 'unchecked-news', headline: '未確認ニュース', sourceIds: ['missing-source'], eventDate: '2026-10-04' },
      { ...structuredClone(news), newsId: 'no-evidence', headline: '根拠未収録ニュース', evidenceIds: [], eventDate: '2026-10-04' },
    ];
    const html = renderReaderIssues(data);
    expect(html).toContain('data-reader-feed="news:checked-news"');
    expect(html).toContain('出来事 2026-10-01');
    expect(html).toContain('data-reader-feed="news:publication-only"');
    expect(html).toContain('記事公表 2026-10-03');
    expect(html).not.toContain('非公開ニュース');
    expect(html).not.toContain('未確認ニュース');
    expect(html).not.toContain('根拠未収録ニュース');
  });

  it('keeps source dates separate from checking dates and never turns a historical vote into enactment', () => {
    const html = renderReaderIssues();
    for (const issueId of ['health-family', 'trade-industry']) {
      expect(html).toContain(`論点説明の更新 ${issueReports.find(item => item.issueId === issueId)!.updatedAt}`);
    }
    expect(html).toContain('資料公表');
    expect(html).toContain('内容確認');
    expect(html).toContain('多数派の一議席と、特定政策の一票は同じではない');
    expect(html).not.toContain('関税撤廃が成立');
    expect(html).not.toContain('下院採決51対48');
  });

  it('does not fill absent, withdrawn or unverified material and escapes visible and attribute text', () => {
    const data = fixture();
    const health = data.reports.find(item => item.issueId === 'health-family')!;
    health.caseStudies = [];
    health.readingGuide = '<img src=x onerror="steal()">';
    const trade = data.reports.find(item => item.issueId === 'trade-industry')!;
    for (const example of trade.caseStudies) example.evidenceIds = ['missing-evidence'];
    data.news = [];
    const html = renderReaderIssues(data);
    expect(html).toContain('確認済みの州・候補者事例は未収録');
    expect(html).toContain('この箇所の確認済み出典は未収録');
    expect(html).toContain('この論点に結び付けた確認済みニュースは未収録');
    expect(html).toContain('&lt;img src=x onerror=&quot;steal()&quot;&gt;');
    expect(html).not.toContain('<img src=x');
    health.status = 'withdrawn';
    expect(renderReaderIssues(data)).not.toContain('data-reader-issue-card="health-family"');
    expect(renderReaderIssues(data)).not.toContain('data-reader-issue="health-family"');
  });

  it('rejects unsafe or unverified evidence links while keeping the explanation', () => {
    const data = fixture();
    const cases = data.reports.flatMap(item => item.caseStudies);
    const ids = new Set(cases.flatMap(item => item.evidenceIds));
    const sourceIds = new Set(data.evidence.filter(item => ids.has(item.evidenceId)).map(item => item.sourceId));
    for (const source of data.sources.filter(item => sourceIds.has(item.sourceId))) source.url = 'javascript:alert(1)';
    const html = renderReaderIssues(data);
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('この箇所の確認済み出典は未収録');
    expect(html).toContain('Hinsonは薬価・保険料と透明性');
  });
});
