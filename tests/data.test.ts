import { describe,expect,it } from 'vitest';
import houseTopology from '../public/data/house-2026-topo.json';
import { elections,events,profiles,seats,sources,states,vicePresident } from '../src/data/data';
import { issueCategories,powerRules } from '../src/data/civics';
import { guideContent } from '../src/data/content';
import { newsItems } from '../src/data/news';
import { candidateBriefs,historicalResults,issueReports,polls,raceBriefs,ratingObservations,rollCalls } from '../src/data/research';
import { evidenceRefs } from '../src/data/research-sources';
import { houseDistricts,houseSnapshot } from '../src/data/house';
import { soybeanTrade,stateContexts } from '../src/data/state-context';
import { verifiedRoster } from '../src/data/verified-roster';
import type { Election, Seat, VicePresident } from '../src/data/model';
import { currentCaucusCounts,houseMajorityText,houseRatingOutcome,majorityText,simulatedCounts,simulatedHouseCounts,uniqueElectionSeatIds,validateData,validateEditorialData,validateHouseData } from '../src/logic';
import { getPublishedNews,getPublishedPolls,getRatingHistory,twoPartyResultShares,validateResearchData } from '../src/research-logic';
import type { HistoricalResult, ResearchNewsItem } from '../src/data/research-model';

const total = (counts: ReturnType<typeof currentCaucusCounts>) => Object.values(counts).reduce((sum,value) => sum + value,0);

describe('2026 Senate data integrity',() => {
  it('has 50 states, 100 sourced seats, 33 regular and 2 special elections',() => {
    expect(validateData(states,seats,elections,sources,vicePresident)).toEqual([]);
    expect(elections.filter(election => election.type === 'regular')).toHaveLength(33);
    expect(elections.filter(election => election.type === 'special').map(election => election.seatId).sort()).toEqual(['FL-3','OH-3']);
    expect(uniqueElectionSeatIds(elections)).toHaveLength(35);
  });

  it('matches explicit party and caucus control totals without deriving caucus from party',() => {
    expect(seats.filter(seat => seat.party === 'R')).toHaveLength(53);
    expect(seats.filter(seat => seat.party === 'D')).toHaveLength(45);
    expect(seats.filter(seat => seat.party === 'I')).toHaveLength(2);
    expect(seats.filter(seat => seat.senateClass === 2 && seat.party === 'R')).toHaveLength(20);
    expect(seats.filter(seat => seat.senateClass === 2 && seat.party === 'D')).toHaveLength(13);
    expect(currentCaucusCounts(seats)).toEqual({Democratic:47,Republican:53,none:0,unconfirmed:0,vacant:0});
    const independent: Seat = {...seats[0],seatId:'XX-1',party:'I',caucus:'none'};
    expect(currentCaucusCounts([independent])).toEqual({Democratic:0,Republican:0,none:1,unconfirmed:0,vacant:0});
  });

  it('has 35 target and 65 non-election seats with requested baseline split',() => {
    const target = new Set(uniqueElectionSeatIds(elections));
    const targetSeats = seats.filter(seat => target.has(seat.seatId));
    const nonElection = seats.filter(seat => !target.has(seat.seatId));
    expect(targetSeats).toHaveLength(35);
    expect(targetSeats.filter(seat => seat.party === 'R')).toHaveLength(22);
    expect(targetSeats.filter(seat => seat.party === 'D')).toHaveLength(13);
    expect(nonElection).toHaveLength(65);
    expect(currentCaucusCounts(nonElection)).toEqual({Democratic:34,Republican:31,none:0,unconfirmed:0,vacant:0});
  });

  it.each(['AL-2','FL-3','OH-3'] as const)('applies a flip for %s and keeps the total at 100',(seatId) => {
    const seat = seats.find(item => item.seatId === seatId)!;
    const before = simulatedCounts(seats,elections,{});
    const target = seat.caucus === 'Republican' ? 'Democratic' : 'Republican';
    const after = simulatedCounts(seats,elections,{[seatId]:target});
    expect(after[target] - before[target]).toBe(1);
    expect(after[seat.caucus] - before[seat.caucus]).toBe(-1);
    expect(total(after)).toBe(100);
  });

  it('keeps every category in the denominator when all target seats are unresolved',() => {
    const assumptions = Object.fromEntries(uniqueElectionSeatIds(elections).map(seatId => [seatId,'unconfirmed'] as const));
    const counts = simulatedCounts(seats,elections,assumptions);
    expect(counts.unconfirmed).toBe(35);
    expect(counts.Democratic).toBe(34);
    expect(counts.Republican).toBe(31);
    expect(total(counts)).toBe(100);
  });

  it('keeps nonaligned, unconfirmed and vacant seats as separate categories',() => {
    const samples: Seat[] = [
      {...seats[0],seatId:'XX-1',party:'I',caucus:'none'},
      {...seats[0],seatId:'XX-2',party:'unknown',caucus:'unconfirmed'},
      {...seats[0],seatId:'XX-3',party:'vacant',caucus:'vacant',vacant:true,incumbent:null},
    ];
    expect(currentCaucusCounts(samples)).toEqual({Democratic:0,Republican:0,none:1,unconfirmed:1,vacant:1});
  });

  it('does not count an unreviewed affiliation as a verified party baseline',() => {
    const unreviewed: Seat = {...seats[0],verificationStatus:'primary-source-recheck-required',verifiedAt:null};
    expect(currentCaucusCounts([unreviewed]).unconfirmed).toBe(1);
    expect(simulatedCounts([unreviewed],elections,{}).unconfirmed).toBe(1);
    expect(simulatedCounts([unreviewed],elections,{[unreviewed.seatId]:'Democratic'}).Democratic).toBe(1);
  });

  it('an empty assumption object restores the explicit hold baseline',() => {
    const changed = simulatedCounts(seats,elections,{'FL-3':'Democratic','OH-3':'unconfirmed'});
    expect(changed).not.toEqual(currentCaucusCounts(seats));
    expect(simulatedCounts(seats,elections,{})).toEqual(currentCaucusCounts(seats));
  });

  it('rejects competing election records for the same seat and target Congress',() => {
    const duplicate: Election = {...elections[0],electionId:'duplicate'};
    expect(() => uniqueElectionSeatIds([...elections,duplicate])).toThrow(/Conflicting elections/);
    expect(validateData(states,seats,[...elections,duplicate],sources)).toContain(`Conflicting elections for ${duplicate.seatId} at 2027-01-03`);
  });
});

describe('primary-source verification',() => {
  it('contains 100 identified current members and the two replacements found during review',() => {
    expect(verifiedRoster).toHaveLength(100);
    expect(new Set(verifiedRoster.map(member => member.bioguideId)).size).toBe(100);
    expect(new Set(verifiedRoster.map(member => member.seatId))).toEqual(new Set(seats.map(seat => seat.seatId)));
    expect(seats.find(seat => seat.seatId === 'OK-2')?.incumbent).toBe('Alan Armstrong');
    expect(seats.find(seat => seat.seatId === 'SC-2')?.incumbent).toBe('Darline Graham');
    expect(seats.some(seat => ['Markwayne Mullin','Lindsey Graham'].includes(seat.incumbent ?? ''))).toBe(false);
    expect(seats.every(seat => seat.verificationStatus === 'confirmed' && seat.verifiedAt === '2026-09-09')).toBe(true);
  });

  it('uses the caucus directory, including for both independent senators',() => {
    for (const seatId of ['ME-1','VT-1']) {
      const seat = seats.find(item => item.seatId === seatId)!;
      expect(seat.party).toBe('I');
      expect(seat.caucus).toBe('Democratic');
      expect(seat.attributeSourceIds.caucus).toEqual(['democratic-caucus']);
    }
  });

  it('keeps seat-cycle terms separate from the future inauguration date of special-election winners',() => {
    expect([1,2,3].map(value => seats.filter(seat => seat.senateClass === value).length)).toEqual([33,33,34]);
    const terms = {1:['2025-01-03','2031-01-03'],2:['2021-01-03','2027-01-03'],3:['2023-01-03','2029-01-03']};
    for (const seat of seats) expect([seat.termStart,seat.termEnd]).toEqual(terms[seat.senateClass]);
    for (const election of elections) {
      if (election.type === 'regular') {
        expect([election.termStart,election.termEnd]).toEqual(['2027-01-03','2033-01-03']);
        expect(election.termStartStatus).toBe('scheduled');
      } else {
        expect(election.termStart).toBeNull();
        expect(election.termStartStatus).toBe('pending-inauguration');
        expect(election.termStartRule).toBeTruthy();
        expect(election.termEnd).toBe('2029-01-03');
        expect(election.verificationStatus).toBe('confirmed');
      }
    }
  });

  it('rejects confirmed records with missing field evidence, dates or unchecked sources',() => {
    const noCaucusEvidence: Seat = {...seats[0],attributeSourceIds:{...seats[0].attributeSourceIds,caucus:[]}};
    expect(validateData(states,[noCaucusEvidence,...seats.slice(1)],elections,sources)).toContain(`${seats[0].seatId}.caucus: confirmed field needs evidence`);
    expect(validateData(states,[{...seats[0],verifiedAt:null},...seats.slice(1)],elections,sources)).toContain(`${seats[0].seatId}: confirmed record needs verification date`);
    const unchecked = sources.map(source => source.sourceId === 'senate-members' ? {...source,contentVerifiedAt:null} : source);
    expect(validateData(states,seats,elections,unchecked)).toContain(`${seats[0].seatId}.incumbent: source not verified by record date`);
    expect(validateData(states,seats,elections,[])).toContain('confirmed records require a source registry');
  });

  it('checks election and vice-president evidence rather than only seats',() => {
    const missingTerm = {...elections[0],attributeSourceIds:{...elections[0].attributeSourceIds,termEnd:[]}};
    expect(validateData(states,seats,[missingTerm,...elections.slice(1)],sources)).toContain(`${missingTerm.electionId}.termEnd: confirmed field needs evidence`);
    const badVicePresident = {...vicePresident,attributeSourceIds:{...vicePresident.attributeSourceIds,party:['missing']}};
    expect(validateData(states,seats,elections,sources,badVicePresident)).toContain('vice-president: unknown source missing');
    const special = elections.find(election => election.type === 'special')!;
    expect(validateData(states,seats,elections.map(election => election === special ? {...special,termStart:'2027-01-03'} : election),sources)).toContain(`${special.electionId}: pending inauguration needs a rule and no invented date`);
  });

  it('separates completed general ballots from the two still-pending September primaries',() => {
    expect(elections.flatMap(election => election.candidates).length).toBeGreaterThan(100);
    expect(elections.filter(election => election.contestStatus === 'general-ballot')).toHaveLength(33);
    expect(elections.filter(election => election.candidateResearchStatus === 'complete')).toHaveLength(33);
    expect(elections.find(election => election.seatId === 'DE-2')).toMatchObject({primaryDate:'2026-09-15',contestStatus:'primary-pending',candidateResearchStatus:'partial'});
    expect(elections.find(election => election.seatId === 'RI-2')).toMatchObject({primaryDate:'2026-09-09',contestStatus:'primary-result-pending',candidateResearchStatus:'partial'});
    expect(elections.every(election => election.candidates.length > 0 && election.rating.category !== 'unavailable' && election.rating.organization === "Sabato's Crystal Ball")).toBe(true);
    expect(elections.find(election => election.seatId === 'OH-3')?.rating.category).toBe('Toss Up');
    expect(elections.find(election => election.seatId === 'NC-2')?.rating.category).toBe('Lean D');
    for (const sourceId of ['census-profile','bls-qcew','bea-state']) {
      const source = sources.find(item => item.sourceId === sourceId)!;
      expect(source.retrievedAt).toBeNull();
      expect(source.contentVerifiedAt).toBeNull();
    }
    const xml = sources.find(source => source.sourceId === 'senate-members-xml')!;
    expect(xml.updatedAt).toBe('2026-08-03T09:54-05:00');
    expect(xml.retrievedAt).toBe('2026-09-09');
  });
});

describe('editorial research and issue model',() => {
  it('covers all 50 states with sourced context, four-part briefs and two to four events',() => {
    expect(validateEditorialData(states,profiles,events,stateContexts,powerRules,issueCategories,sources)).toEqual([]);
    expect(stateContexts).toHaveLength(50);
    expect(profiles).toHaveLength(50);
    expect(events).toHaveLength(145);
    expect(profiles.every(profile => profile.contentStatus === '確認済み' && profile.eventIds.length >= 2 && profile.eventIds.length <= 4)).toBe(true);
    expect(stateContexts.find(context => context.stateFips === '17')).toMatchObject({soybeanRank2026:1,soybeanProduction2026:698810});
    expect(stateContexts.find(context => context.stateFips === '55')).toMatchObject({presidentialWinner2024:'R',presidentialMargin2024:.9});
  });

  it('uses eight mutually exclusive primary issue domains and links each to powers and indicators',() => {
    expect(issueCategories).toHaveLength(8);
    expect(powerRules).toHaveLength(8);
    expect(new Set(issueCategories.map(issue => issue.issueId)).size).toBe(8);
    expect(issueCategories.every(issue => issue.relatedPowerIds.length > 0 && issue.indicatorLabels.length > 0)).toBe(true);
    expect(powerRules.find(rule => rule.powerId === 'veto-override')?.nominalSeats).toContain('下院290／上院67');
    expect(powerRules.find(rule => rule.powerId === 'nominations')?.nominalSeats).toContain('上院51');
  });

  it('preserves the soybean exposure calculation and its causal caveat inputs',() => {
    expect(soybeanTrade).toMatchObject({chinaMetricTons:12356115,priorYearChinaMetricTons:21598375.9,yearOverYearPercent:-42.8,chinaSharePercent:33.6});
    expect(stateContexts.filter(context => context.soybeanRank2026 !== null && context.soybeanRank2026 <= 10)).toHaveLength(10);
  });
});

describe('2026 House model',() => {
  it('contains 435 unique, sourced districts and all seven rating categories',() => {
    expect(validateHouseData(houseDistricts,states,sources)).toEqual([]);
    expect(houseDistricts).toHaveLength(435);
    expect(new Set(houseDistricts.map(district => district.districtId)).size).toBe(435);
    expect(Object.fromEntries(['Solid D','Likely D','Lean D','Toss Up','Lean R','Likely R','Solid R'].map(rating => [rating,houseDistricts.filter(district => district.rating === rating).length]))).toEqual({'Solid D':182,'Likely D':14,'Lean D':12,'Toss Up':20,'Lean R':10,'Likely R':30,'Solid R':167});
    expect(houseSnapshot).toMatchObject({total:435,Democratic:214,Republican:218,Independent:1,vacant:2});
  });

  it('keeps simulations at 435 and changes exactly one seat per override',() => {
    const baseline = simulatedHouseCounts(houseDistricts,{});
    expect(baseline).toEqual({Democratic:208,Republican:207,unconfirmed:20});
    expect(houseMajorityText(baseline)).toContain('未確定20議席');
    const tossup = houseDistricts.find(district => houseRatingOutcome(district) === 'unconfirmed')!;
    const changed = simulatedHouseCounts(houseDistricts,{[tossup.districtId]:'Democratic'});
    expect(changed).toEqual({Democratic:209,Republican:207,unconfirmed:19});
    expect(Object.values(changed).reduce((sum,value) => sum + value,0)).toBe(435);
  });

  it('ships one 2026 boundary geometry for every modeled district',() => {
    const geometries = houseTopology.objects.districts.geometries.filter(geometry => geometry.properties?.election === '2026');
    const modelIds = new Set(houseDistricts.map(district => `${district.stateFips}${district.districtId.endsWith('-AL') ? '00' : String(district.district).padStart(2,'0')}`));
    expect(geometries).toHaveLength(435);
    expect(new Set(geometries.map(geometry => String(geometry.properties?.GEOID).padStart(4,'0')))).toEqual(modelIds);
  });
});

describe('majority guide',() => {
  const republicanVicePresident: VicePresident = {...vicePresident,party:'R',verificationStatus:'confirmed'};
  const unknownVicePresident: VicePresident = {...vicePresident,party:'unknown',verificationStatus:'confirmed'};
  it.each([
    [{Democratic:51,Republican:49,none:0,unconfirmed:0,vacant:0},'民主党会派'],
    [{Democratic:50,Republican:50,none:0,unconfirmed:0,vacant:0},'共和党会派'],
    [{Democratic:51,Republican:48,none:0,unconfirmed:1,vacant:0},'民主党会派'],
    [{Democratic:49,Republican:50,none:0,unconfirmed:1,vacant:0},'共和党会派'],
    [{Democratic:49,Republican:49,none:0,unconfirmed:2,vacant:0},'2議席次第'],
  ] as const)('evaluates %o without discarding unresolved seats',(counts,expected) => {
    expect(majorityText({...counts},republicanVicePresident)).toContain(expected);
  });
  it('does not call a 50-50 Senate for an unconfirmed vice president',() => {
    expect(majorityText({Democratic:50,Republican:50,none:0,unconfirmed:0,vacant:0},unknownVicePresident)).toContain('未確認');
    expect(majorityText({Democratic:50,Republican:50,none:0,unconfirmed:0,vacant:0},{...vicePresident,verificationStatus:'primary-source-recheck-required',verifiedAt:null})).toContain('未確認');
  });
  it('uses the verified current vice president for the explicitly stated continuation assumption',() => {
    expect(vicePresident).toMatchObject({name:'JD Vance',party:'R',verificationStatus:'confirmed',verifiedAt:'2026-09-09'});
    expect(majorityText({Democratic:50,Republican:50,none:0,unconfirmed:0,vacant:0},vicePresident)).toContain('共和党会派');
  });
});

describe('replaceable editorial UI content',() => {
  it('publishes twelve sourced news items across two ten-item pages',() => {
    const published = getPublishedNews(newsItems);
    expect(published).toHaveLength(12);
    expect(Math.ceil(published.length / 10)).toBe(2);
    expect(published.slice(0,10)).toHaveLength(10);
    expect(published.slice(10)).toHaveLength(2);
    expect(new Set(newsItems.map(item => item.newsId)).size).toBe(newsItems.length);
    expect(published.every(item => item.status === 'published' && item.sourceIds.length > 0)).toBe(true);
    expect(published.some(item => item.newsId === 'news-draft-filter-fixture')).toBe(false);
  });

  it('keeps the ten-to-eleven item pagination boundary after publication filtering',() => {
    const fixture = Array.from({length:12},(_,index): ResearchNewsItem => ({
      ...newsItems[0],newsId:`fixture-${index}`,status:index === 11 ? 'draft' : 'published',
      updatedAt:`2026-09-${String(30-index).padStart(2,'0')}`,
    }));
    const published = getPublishedNews(fixture);
    expect(published).toHaveLength(11);
    expect(Math.ceil(published.length / 10)).toBe(2);
  });

  it('keeps the first-visit introduction and all eight report replacement slots',() => {
    expect(guideContent.intro).toContain('ニュース');
    const electionSection = guideContent.sections.find(section => section.title === '中間選挙');
    expect(electionSection).toBeTruthy();
    expect(electionSection?.body).toContain('Class IIの通常選挙33議席');
    expect(electionSection?.body).toContain('特別選挙2議席');
    expect(electionSection?.body).toContain('任期途中の欠員');
    const classSection = guideContent.sections.find(section => section.title === '上院のClass制度');
    expect(classSection?.body).toContain('Class I・II・III');
    expect(classSection?.body).not.toContain('2026年');
    expect(issueReports.map(report => report.issueId).sort()).toEqual(issueCategories.map(issue => issue.issueId).sort());
    expect(issueReports.every(report => report.status === 'published' && report.completeness === 'partial')).toBe(true);
  });

  it('provides a foundational explanation for every congressional power',() => {
    expect(powerRules).toHaveLength(8);
    expect(powerRules.every(rule => rule.explanation.trim().length > 0)).toBe(true);
    expect(powerRules.find(rule => rule.powerId === 'nominations')?.explanation).toContain('大統領が');
    expect(powerRules.find(rule => rule.powerId === 'veto-override')?.explanation).toContain('法案');
  });
});

describe('sourced race research contract',() => {
  it('uses unique stable candidate IDs and valid cross-record references',() => {
    const candidates = elections.flatMap(election => election.candidates);
    expect(new Set(candidates.map(candidate => candidate.candidateId)).size).toBe(candidates.length);
    expect(candidates.find(candidate => candidate.name === 'Daniel J. Sullivan Jr.')?.candidateId).toBe('cand-ak-daniel-j-sullivan-jr');
    expect(candidates.find(candidate => candidate.name === 'Dan S. Sullivan')?.candidateId).toBe('cand-ak-dan-s-sullivan');
    expect(validateResearchData({elections,sources,evidenceRefs,polls,ratingObservations,raceBriefs,candidateBriefs,historicalResults,issueReports,rollCalls,newsItems,stateFips:states.map(state => state.fips),powerIds:powerRules.map(rule => rule.powerId)})).toEqual([]);
  });

  it('rejects a poll candidate that belongs to a different election',() => {
    const iowa = polls.find(poll => poll.pollId === 'poll-ia-emerson-2026-09')!;
    const crossElectionPoll = {
      ...iowa,
      pollId:'poll-fixture-cross-election-candidate',
      results:iowa.results.map((result,index) => index === 0 ? {...result,candidateId:'cand-mi-abdul-el-sayed'} : result),
    };
    const errors = validateResearchData({
      elections,sources,evidenceRefs,polls:[...polls,crossElectionPoll],ratingObservations,raceBriefs,candidateBriefs,
      historicalResults,issueReports,rollCalls,newsItems,stateFips:states.map(state => state.fips),powerIds:powerRules.map(rule => rule.powerId),
    });
    expect(errors).toContain('poll-fixture-cross-election-candidate: candidate cand-mi-abdul-el-sayed belongs to another election');
  });

  it('publishes a substantial race brief for every first-wave focus state',() => {
    const focusElectionIds = [
      '2026-AK-2-regular','2026-IA-2-regular','2026-ME-2-regular',
      '2026-MI-2-regular','2026-OH-3-special','2026-TX-2-regular',
    ];
    const publishedFocus = raceBriefs
      .filter(brief => brief.status === 'published' && focusElectionIds.includes(brief.electionId))
      .sort((left,right) => left.electionId.localeCompare(right.electionId));
    expect(publishedFocus.map(brief => brief.electionId)).toEqual(focusElectionIds);
    expect(publishedFocus.every(brief => brief.completeness === 'substantial')).toBe(true);
    expect(publishedFocus.every(brief => brief.pollIds.length > 0 && brief.ratingIds.length > 0 && brief.sourceIds.length > 0 && brief.evidenceIds.length > 0)).toBe(true);
  });

  it('publishes sourced briefs for both major candidates in all six focus elections',() => {
    const expected: Record<string,string[]> = {
      '2026-AK-2-regular':['cand-ak-mary-peltola','cand-ak-dan-s-sullivan'],
      '2026-IA-2-regular':['cand-ia-ashley-hinson','cand-ia-josh-turek'],
      '2026-ME-2-regular':['cand-me-susan-m-collins','cand-me-troy-d-jackson'],
      '2026-MI-2-regular':['cand-mi-abdul-el-sayed','cand-mi-mike-rogers'],
      '2026-OH-3-special':['cand-oh-sherrod-brown','cand-oh-jon-husted'],
      '2026-TX-2-regular':['cand-tx-james-talarico','cand-tx-ken-paxton'],
    };
    for (const [electionId,candidateIds] of Object.entries(expected)) {
      const election = elections.find(item => item.electionId === electionId)!;
      expect(candidateIds.every(candidateId => election.candidates.some(candidate => candidate.candidateId === candidateId))).toBe(true);
      for (const candidateId of candidateIds) {
        const brief = candidateBriefs.find(item => item.candidateId === candidateId);
        expect(brief).toMatchObject({candidateId,status:'published'});
        expect(brief!.summary.length).toBeGreaterThan(0);
        expect(brief!.currentPositions.length).toBeGreaterThan(0);
        expect(brief!.sourceIds.length).toBeGreaterThan(0);
        expect(brief!.evidenceIds.length).toBeGreaterThan(0);
      }
    }
  });

  it('distinguishes printed candidates from declared write-ins in Maine and Ohio',() => {
    const candidateNames = (electionId:string,stage:'general-ballot'|'write-in') => elections
      .find(election => election.electionId === electionId)!.candidates
      .filter(candidate => candidate.ballotStage === stage)
      .map(candidate => candidate.name)
      .sort();
    expect(candidateNames('2026-ME-2-regular','general-ballot')).toEqual(['Susan M. Collins','Troy D. Jackson']);
    expect(candidateNames('2026-ME-2-regular','write-in')).toEqual(['Ashley J. Webb','Brent Andrews','Gina Oswald','Joseph Steinberger','Michael Turcotte','Sigrid Ann Olson']);
    expect(candidateNames('2026-OH-3-special','general-ballot')).toEqual(['Greg Levy','Jon Husted','Sherrod Brown','William B. Redpath']);
    expect(candidateNames('2026-OH-3-special','write-in')).toEqual(['Anthony Holliman','Stephen Faris','Timothy Telymonde']);
  });

  it('keeps Texas leaner allocation and Alaska RCV rounds as separate poll stages',() => {
    const txBase = polls.find(poll => poll.pollId === 'poll-tx-overton-2026-08-base')!;
    const txLeaners = polls.find(poll => poll.pollId === 'poll-tx-overton-2026-08-with-leaners')!;
    expect(txBase).toMatchObject({studyId:'study-tx-overton-2026-08',resultStage:'base',conditionLabel:'初回候補者選択'});
    expect(txLeaners).toMatchObject({studyId:'study-tx-overton-2026-08',resultStage:'cumulative-with-leaners',conditionLabel:'未定者のleaner回答を割当後'});
    expect(txBase.results.find(result => result.category === 'undecided')?.value).toBe(12.6);
    expect(txLeaners.results.map(result => result.value)).toEqual([50,50]);

    const akFirst = polls.find(poll => poll.pollId === 'poll-ak-dfp-2026-08-first')!;
    const akFinal = polls.find(poll => poll.pollId === 'poll-ak-dfp-2026-08-final')!;
    const akAsrFinal = polls.find(poll => poll.pollId === 'poll-ak-asr-2026-08-final')!;
    expect(akFirst).toMatchObject({studyId:'study-ak-dfp-2026-08',resultStage:'first-choice',conditionLabel:'第1選択'});
    expect(akFinal).toMatchObject({studyId:'study-ak-dfp-2026-08',resultStage:'final',conditionLabel:'移転後の仮想最終ラウンド'});
    expect(akAsrFinal).toMatchObject({resultStage:'final',conditionLabel:'最終RCVラウンド',sampleSize:1495,completeness:'partial'});
    expect(akAsrFinal.results.map(result => result.value)).toEqual([50.6,49.4]);
  });

  it('preserves residual categories and labels rounding separately from unreported shares',() => {
    const sum = (pollId:string) => polls.find(poll => poll.pollId === pollId)!.results.reduce((total,result) => total + result.value,0);
    const iowa = getPublishedPolls(polls,'2026-IA-2-regular').find(poll => poll.pollId === 'poll-ia-emerson-2026-09')!;
    expect(iowa.results).toEqual(expect.arrayContaining([
      expect.objectContaining({candidateId:'cand-ia-ashley-hinson',value:49.5}),
      expect.objectContaining({candidateId:'cand-ia-josh-turek',value:45.1}),
      expect.objectContaining({candidateId:'cand-ia-thomas-laehn',value:.8}),
      expect.objectContaining({label:'未定',value:4.7}),
    ]));
    expect(iowa.residualTreatment).toBe('rounding');
    expect(sum('poll-ia-emerson-2026-09')).toBeCloseTo(100.1);
    expect(polls.find(poll => poll.pollId === 'poll-me-yougov-2026-09')).toMatchObject({residualTreatment:'rounding'});
    expect(sum('poll-me-yougov-2026-09')).toBe(99);
    expect(polls.find(poll => poll.pollId === 'poll-oh-aarp-2026-06')).toMatchObject({residualTreatment:'rounding'});
    expect(sum('poll-oh-aarp-2026-06')).toBe(101);
    expect(polls.find(poll => poll.pollId === 'poll-me-cnn-ssrs-2026-09')).toMatchObject({residualTreatment:'unreported',completeness:'partial'});
    expect(sum('poll-me-cnn-ssrs-2026-09')).toBe(93);
  });

  it('computes two-party historical shares from raw votes rather than a reported margin',() => {
    const fixture: HistoricalResult = {resultId:'fixture',stateFips:'00',electionDate:'2024-11-05',office:'president',candidates:[{label:'D',party:'D',votes:40},{label:'R',party:'R',votes:50},{label:'Other',party:'other',votes:10}],sourceIds:[],evidenceIds:[],status:'published'};
    expect(twoPartyResultShares(fixture)).toEqual({D:44.44444444444444,R:55.55555555555556});
    expect(historicalResults).toHaveLength(6);
    const alaska = historicalResults.find(result => result.stateFips === '02')!;
    expect(alaska.candidates).toEqual([
      {label:'Kamala D. Harris',party:'D',votes:140026},
      {label:'Donald J. Trump',party:'R',votes:184458},
    ]);
    expect(twoPartyResultShares(alaska)).toEqual({D:140026 / (140026 + 184458) * 100,R:184458 / (140026 + 184458) * 100});
  });

  it('keeps rating history within one organization',() => {
    const history = getRatingHistory(ratingObservations,'2026-AK-2-regular','Inside Elections');
    expect(history.map(item => item.ratingRaw)).toEqual(['Solid Republican','Lean Republican','Tilt Republican']);
    expect(history.at(-1)).toMatchObject({ratingRaw:'Tilt Republican',category:'Tilt R'});
  });
});
