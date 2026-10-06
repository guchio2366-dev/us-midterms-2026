import { describe, expect, it } from 'vitest';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import type { Topology } from 'topojson-specification';
import topology from '../public/data/states-10m.json';
import { elections, seats, states, sources } from '../src/data/data';
import { briefingLenses } from '../src/data/briefing-lenses';
import { briefingLensEvidence } from '../src/data/briefing-lens-sources';
import { briefingLensMarkup, briefingTakeawayMarkup } from '../src/ui/briefing-lens';
import { observationData, observationFor } from '../src/data/observation';
import { newsItems } from '../src/data/news';
import { ratingSnapshotObservations } from '../src/data/rating-snapshot';
import { aggregateRatingConsensus } from '../src/rating-consensus';
import { buildRecentFeed, buildUpcomingFeed, filterFeed } from '../src/news-feed';
import { briefingElections, featuredAllocationCoverage, locatorMapMarkup } from '../src/ui/briefing';
import { observationBriefingMarkup, observationBriefingParts, observationComparisonMarkup, observationBriefingNextMarkup } from '../src/ui/observation';
import { introductionMarkup, nationalOverviewMarkup } from '../src/ui/overview';
import approvedCopy from '../src/data/approved-reader-copy.json';

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
      expect(briefingTakeawayMarkup(lens.electionId)).toContain(lens.finding);
      expect(visible).not.toContain(lens.finding);
      expect(visible).toContain(lens.evidence);
      expect(visible).toContain(lens.nextData);
      expect(visible).not.toContain(lens.question);
      for (const id of lens.evidenceIds) {
        const ref=briefingLensEvidence.find(item=>item.evidenceId===id);
        expect(ref, `${lens.electionId}: ${id}`).toBeDefined();
        expect(lens.sourceIds).toContain(ref!.sourceId);
      }
    }
    expect(briefingLensMarkup('2026-NC-2-regular')).toContain('党派別の投票先・投票意向を確認する');
    expect(briefingLensMarkup('2026-NC-2-regular')).toContain('通常の無作為標本の標本誤差ではない');
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

  it('keeps Minnesota and Nebraska in the briefing when ratings weaken to Lean', () => {
    expect(focus.map(e=>e.seatId)).toEqual(['AK-2','GA-2','IA-2','KS-2','ME-2','MI-2','MN-2','NE-2','NH-2','NC-2','OH-3','TX-2']);
    expect(consensus.filter(c=>['lean','tossup','split','missing'].includes(c.category))).toHaveLength(12);
    const changed=consensus.map(c=>['IA-2','GA-2'].includes(c.seatId) ? {...c,category:'missing' as const} : c);
    const expanded=briefingElections(elections,seats,states,changed);
    expect(expanded.filter(e=>e.seatId==='IA-2')).toHaveLength(1);
    expect(expanded.some(e=>e.seatId==='GA-2')).toBe(true);
  });

  it('verifies that the current twelve featured states correspond to the twelve unallocated seats', () => {
    const coverage=featuredAllocationCoverage(focus,seats,consensus);
    expect(coverage).toMatchObject({stateCount:12,unallocatedCount:12,matched:12,corresponds:true});
    expect(coverage.description).toContain('12州は、現在の暫定配分で未配分となっている12議席に対応');
    expect([...new Set(focus.map(e=>e.seatId))].sort()).toEqual(consensus
      .filter(item=>['lean','tossup','split','missing'].includes(item.category)).map(item=>item.seatId).sort());
  });

  it('does not claim exact correspondence when an editorially retained state becomes allocated', () => {
    const changed=consensus.map(item=>item.seatId==='IA-2'?{...item,category:'D' as const}:item);
    const retained=briefingElections(elections,seats,states,changed);
    expect(retained.some(e=>e.seatId==='IA-2')).toBe(true);
    const coverage=featuredAllocationCoverage(retained,seats,changed);
    expect(coverage).toMatchObject({stateCount:12,unallocatedCount:11,matched:11,corresponds:false});
    expect(coverage.description).toContain('12州には、現在の未配分11議席のうち11議席');
    expect(coverage.description).not.toContain('議席に対応します');
  });

  it('compares seat identities even when the featured and unallocated counts happen to match', () => {
    const mismatched=[...focus.filter(e=>e.seatId!=='TX-2'),elections.find(e=>e.seatId==='AL-2')!];
    const coverage=featuredAllocationCoverage(mismatched,seats,consensus);
    expect(coverage).toMatchObject({stateCount:12,unallocatedCount:12,matched:11,corresponds:false});
    expect(coverage.description).toContain('未配分12議席のうち11議席');
  });

  it('counts a future second contest in the same state as a seat without inventing an extra state', () => {
    const alaska=focus.find(e=>e.seatId==='AK-2')!;
    const alaskaSeat=seats.find(seat=>seat.seatId==='AK-2')!;
    const alaskaRating=consensus.find(item=>item.seatId==='AK-2')!;
    const additional={...alaska,electionId:'2026-AK-3-special',seatId:'AK-3'};
    const expandedSeats=[...seats,{...alaskaSeat,seatId:'AK-3'}];
    const expandedConsensus=[...consensus,{...alaskaRating,seatId:'AK-3'}];
    const coverage=featuredAllocationCoverage([...focus,additional,additional],expandedSeats,expandedConsensus);
    expect(coverage).toMatchObject({stateCount:12,unallocatedCount:13,matched:13,corresponds:true});
    expect(coverage.description).toContain('12州は、現在の暫定配分で未配分となっている13議席に対応');
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

  it('exposes every recorded watch-point title with one disclosure and does not turn undated checks into events',()=>{
    for(const race of observationData.races.filter(race=>race.status==='published')) {
      const html=observationBriefingNextMarkup(race.electionId,'次の観測データ',race);
      expect(html).toContain(`id="briefing-next-${race.electionId}"`);
      expect(html).toContain('<h4>次の確認材料</h4>');
      expect(html).toContain('<h5>見通しを変え得る材料</h5>');
      expect(html).toContain('公表日が決まった予定とは分けて');
      for(const item of race.watchItems) {
        expect(html).toContain(`<summary>${item.title}</summary>`);
        expect(html).toContain(item.what);
        expect(html).toContain(item.how);
      }
      expect((html.match(/<details>/g)??[]).length).toBe(race.watchItems.length);
    }
    const missing=observationBriefingNextMarkup('missing',undefined,undefined);
    expect(missing).toContain('具体的な材料は未収録です');
    expect(missing).not.toContain('<details>');
  });

  it('retains the institutional entry point and explains why to read the states', () => {
    expect(introductionMarkup()).toContain('id="open-civics"');
    expect(introductionMarkup()).toContain(approvedCopy.sections['米国中間選挙の概説'][0].text);
    expect(nationalOverviewMarkup()).toContain('両党とも51議席に届かず、12議席が未配分');
    expect(nationalOverviewMarkup()).toContain('href="#updates">12州');
  });

});
