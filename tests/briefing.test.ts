import { describe, expect, it } from 'vitest';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import type { Topology } from 'topojson-specification';
import topology from '../public/data/states-10m.json';
import { elections, seats, states } from '../src/data/data';
import { observationData, observationFor } from '../src/data/observation';
import { newsItems } from '../src/data/news';
import { ratingSnapshotObservations } from '../src/data/rating-snapshot';
import { aggregateRatingConsensus } from '../src/rating-consensus';
import { buildRecentFeed, buildUpcomingFeed, filterFeed } from '../src/news-feed';
import { briefingElections, locatorMapMarkup } from '../src/ui/briefing';
import { observationBriefingMarkup, observationComparisonMarkup } from '../src/ui/observation';
import { introductionMarkup, nationalOverviewMarkup } from '../src/ui/overview';

const consensus = aggregateRatingConsensus(elections.map(e=>e.seatId),ratingSnapshotObservations);
const focus = briefingElections(elections,seats,states,consensus);

describe('state briefing', () => {
  it('adds Iowa and North Carolina without changing the six unallocated seats or duplicating races', () => {
    expect(focus.map(e=>e.seatId)).toEqual(['AK-2','IA-2','ME-2','MI-2','NH-2','NC-2','OH-3','TX-2']);
    expect(consensus.filter(c=>['tossup','split','missing'].includes(c.category))).toHaveLength(6);
    const changed=consensus.map(c=>['IA-2','GA-2'].includes(c.seatId) ? {...c,category:'missing' as const} : c);
    const expanded=briefingElections(elections,seats,states,changed);
    expect(expanded.filter(e=>e.seatId==='IA-2')).toHaveLength(1);
    expect(expanded.some(e=>e.seatId==='GA-2')).toBe(true);
  });

  it('highlights exactly the selected state using the shared 50-state geometry', () => {
    const topo=topology as unknown as Topology;
    const collection=feature(topo,topo.objects.states) as unknown as FeatureCollection;
    const features=collection.features.filter(f=>states.some(s=>s.fips===String(f.id).padStart(2,'0')));
    for(const e of focus) {
      const state=states.find(s=>s.fips===seats.find(s=>s.seatId===e.seatId)!.stateFips)!;
      const html=locatorMapMarkup(features,state);
      expect(html.match(/<path /g)).toHaveLength(50);
      expect(html.match(/data-locator-selected=/g)).toHaveLength(1);
      expect(html).toContain(`data-locator-selected="${state.fips}"`);
      expect(html).not.toContain('d=""');
      expect(html).not.toContain('NaN');
    }
  });

  it('keeps explanation, evidence and comparison in place without simulation inputs or duplicate IDs', () => {
    for(const e of focus) {
      const race=observationFor(e.electionId);
      if (!race) continue;
      const seat=seats.find(s=>s.seatId===e.seatId)!;
      const html=observationBriefingMarkup(race,e.candidates,seat.incumbent);
      expect(html).toContain(race.featuredSummary);
      expect(html).toContain(race.uncertainty);
      expect(html).toContain('根拠を確認');
      expect(html).not.toContain('data-senate-choice');
      expect(html).not.toContain('data-observation-jump');
      const combined=html+observationComparisonMarkup(race,e.candidates);
      const ids=[...combined.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('filters both recent news and upcoming events by each selected election while retaining the national feed', () => {
    const recent=buildRecentFeed(newsItems,observationData);
    const upcoming=buildUpcomingFeed(observationData,new Date('2026-09-23T00:00:00Z'));
    for(const e of focus) {
      if (observationFor(e.electionId)) expect(filterFeed(recent,e.electionId).length).toBeGreaterThan(0);
      for(const feed of [recent,upcoming]) expect(filterFeed(feed,e.electionId).every(i=>i.relatedElectionIds.includes(e.electionId))).toBe(true);
    }
    expect(filterFeed(recent,null)).toEqual(recent);
  });

  it('places the institutional link beside the first sentence and explains why to read the states', () => {
    expect(introductionMarkup()).toContain('米国議会は上院と下院から成り、中間選挙は大統領の4年の任期の中間に行われる。<button id="open-civics"');
    expect(nationalOverviewMarkup()).toContain('両党とも51議席に届かず、6議席が未配分');
    expect(nationalOverviewMarkup()).toContain('href="#updates">8つの州');
  });

});
