import { describe,expect,it } from 'vitest';
import { observationData } from '../src/data/observation';
import { newsItems } from '../src/data/news';
import type { ObservationDataset } from '../src/data/observation-model';
import type { ResearchNewsItem } from '../src/data/research-model';
import { buildRecentFeed,buildUpcomingFeed,filterFeed,legacyObservationFeedKey,resolveFeedKey } from '../src/news-feed';

const copyData=():ObservationDataset=>structuredClone(observationData);
const copyNews=():ResearchNewsItem[]=>structuredClone(newsItems);

describe('ニュース・予定の共通フィード',()=>{
  it('keeps every public current item and represents a multi-state event once',()=>{
    const recent=buildRecentFeed(newsItems,observationData);
    const upcoming=buildUpcomingFeed(observationData,new Date('2026-09-17T00:00:00Z'));
    expect(recent).toHaveLength(40);
    expect(recent.filter(item=>item.sourceKind==='news')).toHaveLength(12);
    expect(recent.filter(item=>item.sourceKind==='update')).toHaveLength(28);
    expect(upcoming).toHaveLength(10);
    expect(upcoming.filter(item=>item.sourceId==='bls-jobs-2026-10-02')).toHaveLength(1);
    expect(filterFeed(upcoming,'2026-AK-2-regular')).toHaveLength(4);
    expect(filterFeed(upcoming,'2026-ME-2-regular')).toHaveLength(7);
  });

  it('hides non-public events from both national and race views',()=>{
    const data=copyData();
    data.events[0].publicationStatus='draft';
    expect(buildUpcomingFeed(data).some(item=>item.sourceId===data.events[0].eventId)).toBe(false);
    expect(resolveFeedKey(`event:${data.events[0].eventId}`,newsItems,data)).toBeNull();
  });

  it('deduplicates only an explicit update link and resolves its old key',()=>{
    const data=copyData();
    const news=copyNews();
    const publicNews=news.find(item=>item.status==='published')!;
    const update=data.updates[0];
    update.newsId=publicNews.newsId;
    const feed=buildRecentFeed(news,data);
    expect(feed.some(item=>item.key===`update:${update.updateId}`)).toBe(false);
    expect(resolveFeedKey(`update:${update.updateId}`,news,data)).toBe(`news:${publicNews.newsId}`);
    expect(feed.filter(item=>item.key===`news:${publicNews.newsId}`)).toHaveLength(1);
  });

  it('does not hide an update when its linked news is missing or non-public',()=>{
    const data=copyData();
    const news=copyNews();
    const draft=news.find(item=>item.status!=='published')!;
    const update=data.updates[0];
    update.newsId=draft.newsId;
    expect(buildRecentFeed(news,data).some(item=>item.key===`update:${update.updateId}`)).toBe(true);
    expect(resolveFeedKey(`update:${update.updateId}`,news,data)).toBe(`update:${update.updateId}`);
    update.newsId='missing-news';
    expect(buildRecentFeed(news,data).some(item=>item.key===`update:${update.updateId}`)).toBe(true);
  });

  it('keeps similar unlinked reports separate and distinguishes event dates from publication dates',()=>{
    const data=copyData();
    const news=copyNews();
    const first=news.find(item=>item.status==='published')!;
    const duplicate={...structuredClone(first),newsId:'same-title-different-report',publishedAt:'2026-09-12',updatedAt:'2026-09-12'};
    news.push(duplicate);
    const feed=buildRecentFeed(news,data);
    expect(feed.filter(item=>item.title===first.headline)).toHaveLength(2);
    expect(feed.find(item=>item.key===`news:${first.newsId}`)?.dateLabel).toMatch(/^出来事 /);
    const noDate={...structuredClone(first),newsId:'publication-date-only',eventDate:null,publishedAt:'2026-09-12',updatedAt:'2026-09-12'};
    news.push(noDate);
    expect(buildRecentFeed(news,data).find(item=>item.key==='news:publication-date-only')?.dateLabel).toBe('掲載 2026-09-12');
  });

  it('orders future events by date and resolves legacy update and event links',()=>{
    const upcoming=buildUpcomingFeed(observationData,new Date('2026-09-17T00:00:00Z'));
    expect(upcoming.map(item=>item.sourceId)).toEqual([
      'mi-harris-el-sayed-2026-09-22','bls-jobs-2026-10-02','me-debate-2026-10-06','me-debate-2026-10-08','mi-debate-2026-10-08','me-debate-2026-10-13','bls-cpi-2026-10-14','me-debate-2026-10-15','bls-state-jobs-2026-10-20','ak-bycatch-markup-2026-09-16',
    ]);
    expect(legacyObservationFeedKey('2026-MI-2-regular','obs-update-mi-ai-2026-09-09',newsItems,observationData)).toBe('update:obs-update-mi-ai-2026-09-09');
    expect(legacyObservationFeedKey('2026-ME-2-regular','me-debate-2026-10-06',newsItems,observationData)).toBe('event:me-debate-2026-10-06');
    expect(legacyObservationFeedKey('2026-AK-2-regular','me-debate-2026-10-06',newsItems,observationData)).toBeNull();
  });
});
