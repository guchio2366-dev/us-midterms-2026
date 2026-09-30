import type { Election } from '../data/model';
import { createScenarioState, type ScenarioState, type SenateBaselineSnapshot } from './model';
import { applyReasonedChoice, setCommonAssumption, type FactorRole } from './reasoning';

/** Examples are conditional user assumptions, not predictions or recommendations. */
export function createPolicyExampleScenarios(baseline:SenateBaselineSnapshot,elections:Election[]) {
  const election=(id:string)=>{const e=elections.find(e=>e.electionId===id);if(!e)throw new Error('例示対象の選挙がありません。');return e;};
  const choose=(state:ScenarioState,id:string,candidateId:string,assumptionId:string,factorId:string,role:FactorRole='candidate-case')=>applyReasonedChoice(state,election(id),{kind:'candidate',electionId:id,candidateId},{assessment:'conditional',assumptionIds:[assumptionId],factors:[{factorId,role}],evidenceIds:[]},elections);
  const hold=(state:ScenarioState,id:string,assumptionId:string,factorId:string)=>applyReasonedChoice(state,election(id),{kind:'unassigned',electionId:id},{assessment:'hold',assumptionIds:[assumptionId],factors:[{factorId,role:'uncertain'}],evidenceIds:['ev-hr1-rollcall']},elections);
  const healthId='assume-medical-access-concern',tradeId='assume-tariff-cost-concern';
  let healthBase=setCommonAssumption(createScenarioState(baseline),{assumptionId:healthId,assessment:'adopt',evidenceIds:['ev-collins-reconciliation-2025','ev-jackson-priorities','ev-elsayed-priorities']},elections);
  healthBase=choose(healthBase,'2026-MI-2-regular','cand-mi-abdul-el-sayed',healthId,'factor-mi-elsayed-medicare-all');
  healthBase=hold(healthBase,'2026-OH-3-special',healthId,'factor-oh-hold-health');
  const healthIncumbent=choose(healthBase,'2026-ME-2-regular','cand-me-susan-m-collins',healthId,'factor-me-collins-medical-record','counterweight');
  const healthChallenger=choose(healthBase,'2026-ME-2-regular','cand-me-troy-d-jackson',healthId,'factor-me-jackson-reform-expectation');
  const tradeBase=setCommonAssumption(createScenarioState(baseline),{assumptionId:tradeId,assessment:'adopt',evidenceIds:['ev-obs-reuters-canada-tariffs-20260917','ev-rogers-tariffs','ev-elsayed-tariffs']},elections);
  let tradeNegotiation=choose(tradeBase,'2026-MI-2-regular','cand-mi-mike-rogers',tradeId,'factor-mi-rogers-negotiation','counterweight');
  tradeNegotiation=choose(tradeNegotiation,'2026-ME-2-regular','cand-me-susan-m-collins',tradeId,'factor-me-tariff-record');
  tradeNegotiation=choose(tradeNegotiation,'2026-IA-2-regular','cand-ia-ashley-hinson',tradeId,'factor-ia-trade-distinction','counterweight');
  let tradeOpposition=choose(tradeBase,'2026-MI-2-regular','cand-mi-abdul-el-sayed',tradeId,'factor-mi-elsayed-tariff-opposition');
  tradeOpposition=choose(tradeOpposition,'2026-ME-2-regular','cand-me-troy-d-jackson',tradeId,'factor-me-tariff-record');
  tradeOpposition=choose(tradeOpposition,'2026-IA-2-regular','cand-ia-josh-turek',tradeId,'factor-ia-trade-distinction');
  return [
    {exampleId:'health-incumbent-record',themeId:'healthcare' as const,label:'同じ医療不安でもCollinsの反対実績を評価する案',state:healthIncumbent},
    {exampleId:'health-challenger-reform',themeId:'healthcare' as const,label:'同じ医療不安でもJacksonの改革期待を評価する案',state:healthChallenger},
    {exampleId:'tariff-negotiation',themeId:'tariffs' as const,label:'関税負担を懸念しつつ交渉・執行を評価する案',state:tradeNegotiation},
    {exampleId:'tariff-opposition',themeId:'tariffs' as const,label:'関税負担を懸念し政権への異論・見直しを評価する案',state:tradeOpposition},
  ];
}
