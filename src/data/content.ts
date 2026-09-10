import { issueCategories } from './civics';
import { events, states } from './data';

/**
 * Editorial content is kept separate from the verified election model.
 * Research can replace this file without changing the map or simulation UI.
 */
export type NewsKind = 'policy' | 'speech' | 'protest' | 'election' | 'economy' | 'data-update';

export interface NewsPoint {
  latitude: number;
  longitude: number;
  label: string;
}

export interface NewsLocation {
  mapMode: 'none' | 'region' | 'points';
  precision: 'national' | 'state' | 'city';
  stateFips?: string[];
  points?: NewsPoint[];
  label?: string;
}

export interface NewsItem {
  newsId: string;
  kind: NewsKind;
  headline: string;
  eventDate: string;
  publishedAt: string;
  summary: string;
  possibleImpact: string;
  issueIds: string[];
  sourceIds: string[];
  location: NewsLocation;
  status: 'published' | 'draft';
}

export interface GuideSection {
  title: string;
  body: string;
}

export interface IssueReportStatus {
  status: 'preparing' | 'available';
  note: string;
  sourceIds: string[];
}

const yearStart = (period: string) => period.match(/\d{4}/)?.[0] ?? '2026';
const eventDate = (period: string) => {
  const day = period.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (day) return day;
  const month = period.match(/^(\d{4})-(\d{2})/)?.[0];
  if (month) return `${month}-01`;
  return `${yearStart(period)}-12-31`;
};

const classify = (title: string): NewsKind => {
  if (title.includes('大統領')) return 'election';
  if (title.includes('上院選')) return 'election';
  if (title.includes('大豆')) return 'economy';
  if (title.includes('人口')) return 'data-update';
  return 'policy';
};

const issueIdsFor = (title: string): string[] => {
  if (title.includes('大豆')) return ['trade-industry'];
  if (title.includes('人口')) return ['place-services'];
  if (title.includes('大統領') || title.includes('上院選')) return ['rights-institutions'];
  return ['household-economy'];
};

const stateLabel = (fips: string[]) => {
  const labels = fips.map(id => states.find(state => state.fips === id)?.nameJa).filter(Boolean);
  return labels.length ? `（${labels.join('・')}）` : '';
};

/**
 * Until the newsroom research is supplied, the first UI uses only the
 * source-linked event snapshots already present in the repository. These are
 * deliberately labelled as events in the interface and can be replaced by
 * reported news without changing the pagination or detail view.
 */
export const newsItems: NewsItem[] = events
  .filter(item => item.sourceIds.length > 0)
  .map(item => ({
    newsId: item.eventId,
    kind: classify(item.title),
    headline: `${item.title}${stateLabel(item.stateFips)}`,
    eventDate: eventDate(item.period),
    publishedAt: eventDate(item.period),
    summary: item.eventText,
    possibleImpact: item.localEffect ?? item.observedPoliticalChange ?? item.causalInterpretation.text,
    issueIds: issueIdsFor(item.title),
    sourceIds: item.sourceIds,
    location: (item.stateFips.length
      ? { mapMode: 'region', precision: 'state', stateFips: item.stateFips, label: stateLabel(item.stateFips).replace(/[（）]/g, '') }
      : { mapMode: 'none', precision: 'national' }) as NewsLocation,
    status: 'published' as const,
  }))
  .sort((left, right) => right.eventDate.localeCompare(left.eventDate));

export const newsEditorialNote = '表示中の項目は、現時点ではリポジトリ内の出典付きイベントスナップショットです。報道記事を追加する場合も、同じ項目形式で差し替えます。';

export const guideContent: { intro: string; sections: GuideSection[] } = {
  intro: 'このサイトは、2026年の米国中間選挙を「議席が動くと、議会の権限がどう変わるか」という順番で読むための入口です。ニュース、議席と権限、地図・シミュレーション、出典を行き来しながら、確認できた事実と仮定を分けてご覧ください。',
  sections: [
    { title: '米国議会', body: '議会は下院と上院から成ります。法案、歳出、監督、指名承認、条約、弾劾などで役割と必要な票数が異なります。' },
    { title: '中間選挙', body: '大統領選の2年後に行われ、下院は全435議席、上院は3つのClassのうち約3分の1を改選します。2026年は通常選挙に加えて特別選挙があります。' },
    { title: '上院のClass制度', body: '上院議員の任期は6年で、Class 1・2・3を2年ごとに順番に改選します。改選されない議席は今回の選挙では固定して表示します。' },
    { title: '地図の読み方', body: '選挙情勢モードは評価機関の分類、投票前の議席構成モードは現職会派を示します。色は州全体の支持率や当選確率そのものではありません。' },
    { title: 'シミュレーションの読み方', body: '手動シミュレーションは、各対象議席の会派を利用者が置き換えた場合の議席数です。権限から逆算する自動経路と因果係数は研究中で、未確認の確率は表示しません。' },
    { title: '出典と更新', body: 'カード、州詳細、権限表、論点レポートには対応する出典と対象期間を付けます。内容が更新された場合は、画面上の基準日とデータ版を確認してください。' },
  ],
};

export const issueReports: Record<string, IssueReportStatus> = Object.fromEntries(
  issueCategories.map(issue => [issue.issueId, {
    status: 'preparing',
    note: `${issue.label}の州別投票要因とレポート引用は調査・作成中です。現行の論点整理と出典欄は残したまま、検証済みのレポートへ差し替えます。`,
    sourceIds: issue.sourceIds,
  }]),
);

export const replaceableContentVersion = 'editorial-pending-2026-09-09';
