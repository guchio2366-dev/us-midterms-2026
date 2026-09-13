import type { ObservationDataset, ObservationEvent, ObservationUpdate } from './data/observation-model';
import type { ResearchNewsItem } from './data/research-model';
import { eventInstant, eventStatus } from './observation-logic';

export type NewsFeedTab = 'recent' | 'upcoming';
export type NewsFeedSourceKind = 'news' | 'update' | 'event';
export type NewsFeedKey = `${NewsFeedSourceKind}:${string}`;

export interface NewsFeedItem {
  key: NewsFeedKey;
  sourceKind: NewsFeedSourceKind;
  tab: NewsFeedTab;
  sourceId: string;
  title: string;
  summary: string;
  sortDate: string;
  sortInstant: number | null;
  updatedAt: string;
  dateLabel: string;
  statusLabel: string | null;
  relatedElectionIds: string[];
  history: boolean;
}

const publicNews = (items: ResearchNewsItem[]) => items.filter(item => item.status === 'published');
const publicUpdates = (data: ObservationDataset) => data.updates.filter(item => item.status === 'published');
const publicEvents = (data: ObservationDataset) => data.events.filter(item => item.publicationStatus === 'published');

function recentSort(left: NewsFeedItem, right: NewsFeedItem) {
  return right.sortDate.localeCompare(left.sortDate) || right.updatedAt.localeCompare(left.updatedAt) || left.key.localeCompare(right.key);
}

function upcomingSort(left: NewsFeedItem, right: NewsFeedItem) {
  if (left.history !== right.history) return left.history ? 1 : -1;
  if (!left.sortDate && right.sortDate) return 1;
  if (left.sortDate && !right.sortDate) return -1;
  if (!left.history && left.sortDate===right.sortDate && left.sortInstant!==null && right.sortInstant!==null) return left.sortInstant-right.sortInstant || left.key.localeCompare(right.key);
  return left.history
    ? right.sortDate.localeCompare(left.sortDate) || left.key.localeCompare(right.key)
    : left.sortDate.localeCompare(right.sortDate) || left.key.localeCompare(right.key);
}

function updateFeedItem(update: ObservationUpdate): NewsFeedItem {
  return {
    key: `update:${update.updateId}`,
    sourceKind: 'update',
    tab: 'recent',
    sourceId: update.updateId,
    title: update.title,
    summary: update.meaning,
    sortDate: update.eventDate || update.updatedAt,
    sortInstant: null,
    updatedAt: update.updatedAt,
    dateLabel: `出来事 ${update.eventDate}`,
    statusLabel: null,
    relatedElectionIds: [...new Set(update.electionIds)],
    history: false,
  };
}

function eventFeedItem(event: ObservationEvent, now: Date): NewsFeedItem {
  const status = eventStatus(event, now);
  const firstMeaning = event.relevance[0]?.why ?? '関連州への影響を確認する予定。';
  const summary = event.relevance.length > 1
    ? `関連する${event.relevance.length}州ごとの「注目する理由」と「確認する点」を掲載。`
    : firstMeaning;
  const history = event.status !== 'scheduled' || status === '予定日経過・結果確認待ち';
  return {
    key: `event:${event.eventId}`,
    sourceKind: 'event',
    tab: 'upcoming',
    sourceId: event.eventId,
    title: event.title,
    summary,
    sortDate: event.date ?? '',
    sortInstant: eventInstant(event)?.getTime() ?? null,
    updatedAt: event.checkedAt,
    dateLabel: event.date ? `予定 ${event.date}` : '日程未定',
    statusLabel: status,
    relatedElectionIds: [...new Set(event.relevance.map(item => item.electionId))],
    history,
  };
}

/** Creates one recent feed. An update explicitly linked to a public news item is represented by that news item. */
export function buildRecentFeed(newsItems: ResearchNewsItem[], data: ObservationDataset): NewsFeedItem[] {
  const news = publicNews(newsItems);
  const newsIds = new Set(news.map(item => item.newsId));
  const updates=publicUpdates(data);
  const representedUpdateIds = new Set(updates.filter(item => item.newsId && newsIds.has(item.newsId)).map(item => item.updateId));
  return [
    ...news.map<NewsFeedItem>(item => ({
      key: `news:${item.newsId}`,
      sourceKind: 'news',
      tab: 'recent',
      sourceId: item.newsId,
      title: item.headline,
      summary: item.summary,
      sortDate: item.eventDate ?? item.publishedAt,
      sortInstant: null,
      updatedAt: item.updatedAt,
      dateLabel: item.eventDate ? `出来事 ${item.eventDate}` : `掲載 ${item.publishedAt}`,
      statusLabel: null,
      relatedElectionIds: [...new Set([...item.relatedElectionIds,...updates.filter(update=>update.newsId===item.newsId).flatMap(update=>update.electionIds)])],
      history: false,
    })),
    ...updates.filter(item => !representedUpdateIds.has(item.updateId)).map(updateFeedItem),
  ].sort(recentSort);
}

export function buildUpcomingFeed(data: ObservationDataset, now = new Date()): NewsFeedItem[] {
  return publicEvents(data).map(event => eventFeedItem(event, now)).sort(upcomingSort);
}

export function filterFeed(items: NewsFeedItem[], electionId: string | null): NewsFeedItem[] {
  return electionId ? items.filter(item => item.relatedElectionIds.includes(electionId)) : items;
}

export function resolveFeedKey(rawKey: string | null, newsItems: ResearchNewsItem[], data: ObservationDataset): NewsFeedKey | null {
  if (!rawKey) return null;
  const parsed = rawKey.match(/^(news|update|event):(.+)$/);
  const kind = parsed?.[1] as NewsFeedSourceKind | undefined;
  const id = parsed?.[2] ?? rawKey;
  const news = publicNews(newsItems).find(item => item.newsId === id);
  if ((!parsed || kind === 'news') && news) return `news:${id}`;
  if (kind === 'update') {
    const update = publicUpdates(data).find(item => item.updateId === id);
    if (!update) return null;
    if (update.newsId && publicNews(newsItems).some(item => item.newsId === update.newsId)) return `news:${update.newsId}`;
    return `update:${id}`;
  }
  if (kind === 'event' && publicEvents(data).some(item => item.eventId === id)) return `event:${id}`;
  return null;
}

export function feedItemByKey(key: NewsFeedKey, newsItems: ResearchNewsItem[], data: ObservationDataset, now = new Date()): NewsFeedItem | undefined {
  return [...buildRecentFeed(newsItems, data), ...buildUpcomingFeed(data, now)].find(item => item.key === key);
}

export function legacyObservationFeedKey(electionId: string, section: string | null, newsItems: ResearchNewsItem[], data: ObservationDataset): NewsFeedKey | null {
  if (!section) return null;
  const update = publicUpdates(data).find(item => item.updateId === section && item.electionIds.includes(electionId));
  if (update) return resolveFeedKey(`update:${update.updateId}`, newsItems, data);
  const event = publicEvents(data).find(item => item.eventId === section && item.relevance.some(relevance => relevance.electionId === electionId));
  return event ? `event:${event.eventId}` : null;
}

export function linkedUpdatesForNews(newsId: string, data: ObservationDataset): ObservationUpdate[] {
  return publicUpdates(data).filter(item => item.newsId === newsId)
    .sort((left, right) => right.eventDate.localeCompare(left.eventDate) || right.updatedAt.localeCompare(left.updatedAt) || left.updateId.localeCompare(right.updateId));
}
