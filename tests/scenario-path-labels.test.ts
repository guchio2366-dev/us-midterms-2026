import {describe,expect,it} from 'vitest';
import {elections,seats} from '../src/data/data';
import {ratingSnapshotObservations,RATING_SNAPSHOT_ID,RATING_SNAPSHOT_AS_OF,RATING_METHOD_VERSION} from '../src/data/rating-snapshot';
import {aggregateRatingConsensus,consensusDisplayRating} from '../src/rating-consensus';
import {createRatingSenateBaseline} from '../src/scenario/baseline';
import {createScenarioState} from '../src/scenario/model';
import {generateSenatePaths} from '../src/scenario/paths';
import {scenarioPathDifficultyLabel} from '../src/ui/scenario-path-labels';
it('summarizes the neutral path category as unallocated while retaining weak and split state ratings',()=>{
  const consensus=aggregateRatingConsensus(elections.map(e=>e.seatId),ratingSnapshotObservations);
  const baseline=createRatingSenateBaseline({seats,elections,consensus,snapshotId:RATING_SNAPSHOT_ID,asOf:RATING_SNAPSHOT_AS_OF,methodVersion:RATING_METHOD_VERSION,seatDataVersion:'test'});
  const ratings=new Map(consensus.map(c=>[c.seatId,consensusDisplayRating(c)]));
  const path=generateSenatePaths({seats,elections,scenario:createScenarioState(baseline),caucus:'Republican',threshold:50,limit:1,ratings}).paths[0];
  expect(path.difficulty['Toss Up']).toBe(5);
  expect(scenarioPathDifficultyLabel(path)).toBe('未配分 5議席');
});
it('retains stronger-rating labels and the no-additional-seat state',()=>{
  expect(scenarioPathDifficultyLabel({difficulty:{'Likely R':2,'Toss Up':1}})).toBe('Likely R 2議席／未配分 1議席');
  expect(scenarioPathDifficultyLabel({difficulty:{}})).toBe('追加獲得なし');
});
