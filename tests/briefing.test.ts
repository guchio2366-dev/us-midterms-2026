import { describe, expect, it } from 'vitest';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import type { Topology } from 'topojson-specification';
import topology from '../public/data/states-10m.json';
import { elections, seats, states, sources } from '../src/data/data';
import { briefingLenses } from '../src/data/briefing-lenses';
import { briefingLensEvidence } from '../src/data/briefing-lens-sources';
import { briefingLensMarkup } from '../src/ui/briefing-lens';
import { observationData, observationFor } from '../src/data/observation';
import { newsItems } from '../src/data/news';
import { ratingSnapshotObservations } from '../src/data/rating-snapshot';
import { aggregateRatingConsensus } from '../src/rating-consensus';
import { buildRecentFeed, buildUpcomingFeed, filterFeed } from '../src/news-feed';
import { briefingElections, locatorMapMarkup } from '../src/ui/briefing';
import { observationBriefingMarkup, observationBriefingParts, observationComparisonMarkup } from '../src/ui/observation';
import { introductionMarkup, nationalOverviewMarkup } from '../src/ui/overview';

const consensus = aggregateRatingConsensus(elections.map(e=>e.seatId),ratingSnapshotObservations);
const focus = briefingElections(elections,seats,states,consensus);

describe('state briefing', () => {
  it('binds editorial findings to the correct races and existing sources, with honest gaps', () => {
    expect(briefingLenses.map(lens=>lens.electionId).sort()).toEqual(focus.map(e=>e.electionId).sort());
    for (const lens of briefingLenses) {
      expect(lens.sourceIds.length).toBeGreaterThan(0);
      const html=briefingLensMarkup(lens.electionId);
      for (const id of lens.sourceIds) {
        const source=sources.find(item=>item.sourceId===id);
        expect(source,`${lens.electionId}: ${id}`).toBeDefined();
        expect(html).toContain(source!.url.replaceAll('&','&amp;'));
      }
      expect(html).toContain(lens.limitation);
      const visible=html.split('<details>')[0];
      expect(visible).toContain(lens.finding);
      expect(visible).toContain(lens.evidence);
      expect(visible).not.toContain(lens.question);
      for (const id of lens.evidenceIds) {
        const ref=briefingLensEvidence.find(item=>item.evidenceId===id);
        expect(ref, `${lens.electionId}: ${id}`).toBeDefined();
        expect(lens.sourceIds).toContain(ref!.sourceId);
      }
    }
    expect(briefingLensMarkup('2026-NC-2-regular')).toContain('候補別・党派別調査をまだ収録していない');
    expect(briefingLensMarkup('unknown-election')).toBe('');
  });

  it('separates candidate identity from the analysis without losing candidates in the complete briefing', () => {
    for (const e of focus) {
      const race=observationFor(e.electionId);
      if (!race) continue;
      const seat=seats.find(s=>s.seatId===e.seatId)!;
      const parts=observationBriefingParts(race,e.candidates,seat.incumbent);
      expect(parts.candidates).toContain('aria-label="主要候補"');
      expect(parts.lead).not.toContain('observation-candidate-intro');
      const complete=observationBriefingMarkup(race,e.candidates,seat.incumbent);
      expect(complete.match(/class="observation-candidate-intro"/g)).toHaveLength(1);
    }
  });

  it('keeps Iowa in the briefing when it becomes the seventh unallocated seat', () => {
    expect(focus.map(e=>e.seatId)).toEqual(['AK-2','IA-2','ME-2','MI-2','NH-2','NC-2','OH-3','TX-2']);
    expect(consensus.filter(c=>['tossup','split','missing'].includes(c.category))).toHaveLength(7);
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
    expect(nationalOverviewMarkup()).toContain('両党とも51議席に届かず、7議席が未配分');
    expect(nationalOverviewMarkup()).toContain('href="#updates">8つの州');
  });

});
