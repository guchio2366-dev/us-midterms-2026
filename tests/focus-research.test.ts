import { describe,expect,it } from 'vitest';
import { elections } from '../src/data/data';
import { newsItems } from '../src/data/news';
import { candidateBriefs,polls,raceBriefs,ratingObservations } from '../src/data/research';
import { getFeaturedCandidates,getPublishedNews,getPublishedPolls } from '../src/research-logic';

const focusRaces = [
  {electionId:'2026-IA-2-regular',majorCandidates:['cand-ia-ashley-hinson','cand-ia-josh-turek'],minimumStudies:3},
  {electionId:'2026-MI-2-regular',majorCandidates:['cand-mi-abdul-el-sayed','cand-mi-mike-rogers'],minimumStudies:3},
  {electionId:'2026-ME-2-regular',majorCandidates:['cand-me-susan-m-collins','cand-me-troy-d-jackson'],minimumStudies:3},
  {electionId:'2026-OH-3-special',majorCandidates:['cand-oh-sherrod-brown','cand-oh-jon-husted'],minimumStudies:2},
  {electionId:'2026-TX-2-regular',majorCandidates:['cand-tx-james-talarico','cand-tx-ken-paxton'],minimumStudies:3},
  {electionId:'2026-AK-2-regular',majorCandidates:['cand-ak-mary-peltola','cand-ak-dan-s-sullivan'],minimumStudies:3},
] as const;

const electionById = (electionId:string) => elections.find(election => election.electionId === electionId)!;

describe('six-state published research package',() => {
  it.each(focusRaces)('$electionId has a substantial brief, multiple poll studies and multiple rating organizations',({electionId,minimumStudies}) => {
    const brief = raceBriefs.find(item => item.electionId === electionId && item.status === 'published');
    const publishedPolls = getPublishedPolls(polls,electionId);
    const publishedRatings = ratingObservations.filter(item => item.electionId === electionId && item.status === 'published');
    const studyIds = new Set(publishedPolls.map(item => item.studyId ?? item.pollId));
    const organizations = new Set(publishedRatings.map(item => item.organization));

    expect(electionById(electionId).contestStatus).toBe('general-ballot');
    expect(brief).toMatchObject({electionId,status:'published',completeness:'substantial'});
    expect(studyIds.size).toBeGreaterThanOrEqual(minimumStudies);
    expect(organizations.size).toBeGreaterThanOrEqual(2);
    expect(brief!.pollIds.every(pollId => publishedPolls.some(poll => poll.pollId === pollId))).toBe(true);
    expect(brief!.ratingIds.every(ratingId => publishedRatings.some(rating => rating.ratingId === ratingId))).toBe(true);
    expect(brief!.analysis.every(section => section.body.length > 0 && section.evidenceIds.length > 0)).toBe(true);
    expect(brief!.sourceIds.length).toBeGreaterThan(0);
    expect(brief!.evidenceIds.length).toBeGreaterThan(0);
  });

  it.each(focusRaces)('$electionId publishes sourced briefs for both major candidates',({electionId,majorCandidates}) => {
    const electionCandidateIds = new Set(electionById(electionId).candidates.map(candidate => candidate.candidateId));

    for (const candidateId of majorCandidates) {
      const brief = candidateBriefs.find(item => item.candidateId === candidateId);
      expect(electionCandidateIds.has(candidateId)).toBe(true);
      expect(brief).toMatchObject({candidateId,status:'published'});
      expect(brief!.summary.length).toBeGreaterThan(0);
      expect(brief!.currentPositions.length).toBeGreaterThan(0);
      expect(brief!.sourceIds.length).toBeGreaterThan(0);
      expect(brief!.evidenceIds.length).toBeGreaterThan(0);
    }
  });
});

describe('news publication and ten-item pagination contract',() => {
  it('returns twelve published items as a full first page and a two-item second page',() => {
    const pageSize = 10;
    const published = getPublishedNews(newsItems);
    const pages = Array.from({length:Math.ceil(published.length / pageSize)},(_,index) =>
      published.slice(index * pageSize,(index + 1) * pageSize));

    expect(published).toHaveLength(12);
    expect(pages.map(page => page.length)).toEqual([10,2]);
    expect(published.every(item => item.status === 'published')).toBe(true);
    expect(published.some(item => item.newsId === 'news-draft-filter-fixture')).toBe(false);
    expect(new Set(published.map(item => item.newsId)).size).toBe(12);
  });

  it.each(focusRaces)('$electionId is represented by at least one published news item',({electionId}) => {
    expect(getPublishedNews(newsItems).some(item => item.relatedElectionIds.includes(electionId))).toBe(true);
  });
});

describe('poll result stages and residual semantics',() => {
  it('keeps the Texas Overton initial choice separate from its allocated-leaner result',() => {
    const base = polls.find(item => item.pollId === 'poll-tx-overton-2026-08-base')!;
    const withLeaners = polls.find(item => item.pollId === 'poll-tx-overton-2026-08-with-leaners')!;

    expect(base.studyId).toBe('study-tx-overton-2026-08');
    expect(withLeaners.studyId).toBe(base.studyId);
    expect(base).toMatchObject({resultStage:'base',conditionLabel:'初回候補者選択',residualTreatment:'none'});
    expect(withLeaners).toMatchObject({resultStage:'cumulative-with-leaners',conditionLabel:'未定者のleaner回答を割当後',residualTreatment:'none'});
    expect(base.results.map(result => [result.candidateId ?? result.category,result.value])).toEqual([
      ['cand-tx-james-talarico',44],
      ['cand-tx-ken-paxton',43.4],
      ['undecided',12.6],
    ]);
    expect(withLeaners.results.map(result => [result.candidateId,result.value])).toEqual(expect.arrayContaining([
      ['cand-tx-james-talarico',50],
      ['cand-tx-ken-paxton',50],
    ]));
    expect(withLeaners.results).toHaveLength(2);
  });

  it('labels the Alaska ASR 50.6–49.4 result as a partial final RCV subgroup, not first choice',() => {
    const finalRound = polls.find(item => item.pollId === 'poll-ak-asr-2026-08-final')!;

    expect(finalRound).toMatchObject({
      electionId:'2026-AK-2-regular',population:'LV',sampleSize:1495,
      resultStage:'final',conditionLabel:'最終RCVラウンド',completeness:'partial',residualTreatment:'none',
    });
    expect(finalRound.notes.join(' ')).toContain('第一選択ではありません');
    expect(finalRound.results.map(result => [result.candidateId,result.value])).toEqual([
      ['cand-ak-mary-peltola',50.6],
      ['cand-ak-dan-s-sullivan',49.4],
    ]);
  });

  it('orders stages within the same poll study from the initial result to the final result',() => {
    const alaskaStages = getPublishedPolls(polls,'2026-AK-2-regular')
      .filter(item => item.studyId === 'study-ak-dfp-2026-08')
      .map(item => item.resultStage);
    const texasStages = getPublishedPolls(polls,'2026-TX-2-regular')
      .filter(item => item.studyId === 'study-tx-overton-2026-08')
      .map(item => item.resultStage);

    expect(alaskaStages).toEqual(['first-choice','final']);
    expect(texasStages).toEqual(['base','cumulative-with-leaners']);
  });

  it('treats Maine YouGov\'s 99% total as rounding rather than an invented unreported category',() => {
    const maine = polls.find(item => item.pollId === 'poll-me-yougov-2026-09')!;
    const total = maine.results.reduce((sum,result) => sum + result.value,0);

    expect(total).toBe(99);
    expect(maine.residualTreatment).toBe('rounding');
    expect(maine.results.some(result => result.label === '内訳未掲載')).toBe(false);
    expect(maine.notes.join(' ')).toContain('丸め');
  });
});

describe('official candidate roster distinctions',() => {
  it('keeps the incumbent and both major-party candidates ahead of researched minor candidates',() => {
    const iowa = electionById('2026-IA-2-regular').candidates.filter(candidate => candidate.ballotStage !== 'write-in');
    const researchedIds = new Set(candidateBriefs.map(brief => brief.candidateId));
    const featured = getFeaturedCandidates(iowa,null,researchedIds);

    expect(featured.map(candidate => candidate.candidateId)).toEqual([
      'cand-ia-ashley-hinson',
      'cand-ia-josh-turek',
      'cand-ia-thomas-laehn',
    ]);
  });

  it('separates printed candidates and declared write-ins in Maine and Ohio',() => {
    const maine = electionById('2026-ME-2-regular').candidates;
    const ohio = electionById('2026-OH-3-special').candidates;

    expect(maine.filter(candidate => candidate.ballotStage === 'general-ballot')).toHaveLength(2);
    expect(maine.filter(candidate => candidate.ballotStage === 'write-in')).toHaveLength(6);
    expect(maine.filter(candidate => candidate.ballotStage === 'general-ballot').every(candidate => candidate.sourceIds.includes('me-candidate-list-2026'))).toBe(true);
    expect(maine.filter(candidate => candidate.ballotStage === 'write-in').every(candidate => candidate.sourceIds.includes('me-writein-list-2026'))).toBe(true);

    expect(ohio.filter(candidate => candidate.ballotStage === 'general-ballot')).toHaveLength(4);
    expect(ohio.filter(candidate => candidate.ballotStage === 'write-in')).toHaveLength(3);
    expect(ohio.every(candidate => candidate.sourceIds.includes('oh-candidate-list-2026'))).toBe(true);
  });

  it('keeps Alaska\'s two Sullivan candidates as separate people and stable candidate records',() => {
    const alaska = electionById('2026-AK-2-regular').candidates;
    const dan = alaska.find(candidate => candidate.name === 'Dan S. Sullivan')!;
    const daniel = alaska.find(candidate => candidate.name === 'Daniel J. Sullivan Jr.')!;

    expect(alaska.filter(candidate => candidate.ballotStage === 'general-ballot')).toHaveLength(4);
    expect(dan).toMatchObject({candidateId:'cand-ak-dan-s-sullivan',personId:'person-dan-s-sullivan'});
    expect(daniel).toMatchObject({candidateId:'cand-ak-daniel-j-sullivan-jr',personId:'person-daniel-j-sullivan-jr'});
    expect(dan.candidateId).not.toBe(daniel.candidateId);
    expect(dan.personId).not.toBe(daniel.personId);
    expect([dan,daniel].every(candidate => candidate.sourceIds.includes('ak-doe-2026-general-candidates'))).toBe(true);
  });
});
