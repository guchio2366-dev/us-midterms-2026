import { policyAdditions } from './policy-additions';
import type { CandidatePolicyRecord, PolicyAction, PolicyPrototypeData, PolicyRef, PolicySpec } from './policy-prototype-model';

const me='2026-ME-2-regular', mi='2026-MI-2-regular', ia='2026-IA-2-regular', oh='2026-OH-3-special', tx='2026-TX-2-regular';
const collins='cand-me-susan-m-collins', jackson='cand-me-troy-d-jackson', elsayed='cand-mi-abdul-el-sayed', rogers='cand-mi-mike-rogers';
const checked='2026-09-11';
const ref=(policyId:string,versionId:string):PolicyRef=>({policyId,versionId});
export const policyRefs={
  hr1:ref('hr1-package','senate-passage-2025-07-01'),
  medicaidFunding:ref('medicaid-funding-reduction','collins-description-2025-07-01'),
  medicaidWork:ref('medicaid-work-requirement','collins-exemptions-2025-07-01'),
  medicareAll:ref('medicare-for-all','elsayed-platform-asof-2026-09-11'),
  publicOption:ref('federal-public-option','campaign-principle-asof-2026-09-11'),
  canadaEmergency:ref('end-canada-tariff-emergency','sjres37-senate-vote-2025-04-02'),
  blanketCanada:ref('blanket-canada-tariffs','campaign-description-2026-09-01'),
  targetedTariffs:ref('targeted-tariffs','campaign-principle-asof-2026-09-11'),
  tradeEnforcement:ref('trade-law-enforcement','hinson-statement-2026-09-01'),
};
const policy=(r:PolicyRef,themeId:'healthcare'|'tariffs',title:string,definition:string,evidenceIds:string[],sourceIds:string[],kind:PolicySpec['kind']='campaign-proposal',scopeDate:string|null=null):PolicySpec=>({
  ...r,themeId,title,definition,issueIds:[themeId==='healthcare'?'health-family':'trade-industry'],kind,scopeDate,
  specification:kind==='historical-measure'?'identified-measure':'partial',sourceIds,evidenceIds,
  routes:themeId==='healthcare'?['ordinary-law','reconciliation','oversight']:['ordinary-law','oversight'],
  unknowns:['将来の法案文面と修正条件は未確定。現在の法律状態や将来の採決をこの記録から断定しない。',...(themeId==='healthcare'?['財政調整の適格性は別途確認が必要。']:['関税の既存行政権限は議会多数だけで自動消滅しない。'])],
});
const action=(actionId:string,kind:PolicyAction['kind'],text:string,sourceId:string,evidenceId:string,actionDate:string|null=null,scope:PolicyAction['scope']='exact-policy',vote:PolicyAction['vote']=null,checkedAt=checked):PolicyAction=>({actionId,kind,text,sourceIds:[sourceId],evidenceIds:[evidenceId],actionDate,datePrecision:actionDate?'day':'unknown',checkedAt,scope,vote,locator:`既存EvidenceRef ${evidenceId}の原文箇所。`});
const record=(recordId:string,candidateId:string,electionId:string,r:PolicyRef,stance:CandidatePolicyRecord['stance'],actions:PolicyAction[],conditions:string[]=[],unknowns:string[]=[]):CandidatePolicyRecord=>({
  recordId,candidateId,electionId,...r,stance,stancePeriod:stance==='unknown'?'unknown':r.versionId.includes('2025')?'historical':'campaign-as-of',
  stanceAsOf:stance==='unknown'?null:r.versionId.includes('2025-07-01')?'2025-07-01':r.versionId.includes('2025-04-02')?'2025-04-02':checked,
  checkedAt:actions.some(a=>a.checkedAt==='2026-09-30')?'2026-09-30':checked,
  stanceEvidenceIds:stance==='unknown'?[]:[...new Set(actions.filter(a=>a.scope==='exact-policy').flatMap(a=>a.evidenceIds))],
  actions,conditions,unknowns:[...unknowns,'当選後の提出・交渉・採決予定は、この記録だけでは確認できない。'],explicitlyPrioritized:actions.some(a=>a.kind==='stated-priority'&&a.scope==='exact-policy')?true:null,
});

/** Existing checked sources are reused; no new current-law or voter-response claims. */
const basePolicyPrototype:PolicyPrototypeData={
  prototypeVersion:1,builtAt:'2026-09-30',
  focusElectionIds:['2026-AK-2-regular',me,mi,'2026-NH-2-regular',oh,tx,ia,'2026-NC-2-regular'],
  themes:[{themeId:'healthcare',label:'医療',issueIds:['health-family']},{themeId:'tariffs',label:'関税',issueIds:['trade-industry']}],
  policies:[
    policy(policyRefs.hr1,'healthcare','H.R.1全体の上院通過版への票','2025年7月1日に上院が採決した法案全体。Medicaidの個別条項への賛否とは別記録。',['ev-hr1-rollcall'],['senate-rollcall-119-372'],'historical-measure','2025-07-01'),
    policy(policyRefs.medicaidFunding,'healthcare','将来のMedicaid資金削減への対応','Collinsの2025年7月1日声明が反対理由として挙げた将来のMedicaid資金削減。特定条文の全文と改正案は未収録。',['ev-prototype-collins-medicaid-funding'],['collins-reconciliation-statement-2025'],'described-design','2025-07-01'),
    policy(policyRefs.medicaidWork,'healthcare','例外を設けたMedicaid就労要件','Collinsが述べた就労可能な成人への要件。幼い子の養育、介護、就学を例外とする条件付き設計で、法案個別条文と同一とは断定しない。',['ev-prototype-collins-medicaid-work'],['collins-reconciliation-statement-2025'],'described-design','2025-07-01'),
    policy(policyRefs.medicareAll,'healthcare','Medicare for All','El-Sayedが掲げる公的医療制度改革。Medicaid資金変更や就労要件とは別の政策。',['ev-elsayed-priorities'],['elsayed-priorities-2026']),
    policy(policyRefs.publicOption,'healthcare','連邦の公的医療選択肢','TurekとTalaricoの候補者資料にあるpublic option。財源、加入資格、法案版は未確認。',['ev-turek-health','ev-tx-candidate-positions-talarico-2026'],['turek-health-2026','candidate-talarico-issues-2026']),
    policy(policyRefs.canadaEmergency,'tariffs','対カナダ関税の非常事態終了決議','2025年4月2日のS.J.Res.37上院採決。上院通過と最終成立、現在の関税状態を区別する。',['ev-rollcall-160-result','ev-rollcall-160-republicans'],['senate-rollcall-119-160'],'historical-measure','2025-04-02'),
    policy(policyRefs.blanketCanada,'tariffs','広範で一律的な対カナダ関税','El-Sayedの2026年9月1日発表が反対する広範な関税。具体税率・法令版は未収録。',['ev-elsayed-tariffs'],['elsayed-tariffs-2026']),
    policy(policyRefs.targetedTariffs,'tariffs','対象を絞った関税と交渉利用','El-SayedとRogersの選択的・対象限定の考えを比較する。対象品目と条件が同一だとは断定しない。',['ev-elsayed-tariffs','ev-rogers-tariffs'],['elsayed-tariffs-2026','rogers-tariffs-2026']),
    policy(policyRefs.tradeEnforcement,'tariffs','関税回避・貿易法違反の取締り','Hinsonの2026年9月1日発表。関税率引上げや一律関税への支持とは区別する。',['ev-hinson-trade'],['hinson-trade-2026']),
  ],
  contextLinks:[
    {linkId:'context-hr1-healthcare',themeId:'healthcare',policyRefs:[policyRefs.hr1,policyRefs.medicaidFunding,policyRefs.medicaidWork],scope:'national',feedRefs:[{kind:'roll-call',id:'senate-119-1-372'}],issueIds:['health-family'],electionLinks:[{electionId:me,candidateIds:[collins],relation:'direct'},{electionId:oh,candidateIds:['cand-oh-jon-husted'],relation:'direct'}],eventDate:'2025-07-01',publishedAt:'2025-07-01',checkedAt:checked,sourceIds:['senate-rollcall-119-372','collins-reconciliation-statement-2025'],evidenceIds:['ev-hr1-rollcall','ev-collins-reconciliation-2025'],title:'全国の財政法案と医療をめぐる過去の採決',description:'同じ法案全体でCollinsは反対、Hustedは賛成。候補者の現在の個別医療政策や有権者の反応は別に確認する。',unknowns:['個別条項への賛否と2026年の得票への影響。']},
    {linkId:'context-health-platforms',themeId:'healthcare',policyRefs:[policyRefs.medicareAll,policyRefs.publicOption],scope:'cross-state',feedRefs:[{kind:'candidate-platform',id:'cand-mi-abdul-el-sayed'},{kind:'candidate-platform',id:'cand-ia-josh-turek'}],issueIds:['health-family'],electionLinks:[{electionId:mi,candidateIds:[elsayed],relation:'direct'},{electionId:ia,candidateIds:['cand-ia-josh-turek'],relation:'direct'},{electionId:tx,candidateIds:['cand-tx-james-talarico'],relation:'direct'}],eventDate:null,publishedAt:null,checkedAt:checked,sourceIds:['elsayed-priorities-2026','turek-health-2026','candidate-talarico-issues-2026'],evidenceIds:['ev-elsayed-priorities','ev-turek-health','ev-tx-candidate-positions-talarico-2026'],title:'医療改革の提案を州横断で区別する',description:'Medicare for Allとpublic optionを別政策として扱う候補者資料の比較。',unknowns:['公開日が不明なページがあり、これは最新ニュースではない。財源や具体法案は未確認。']},
    {linkId:'context-canada-tariff-reporting',themeId:'tariffs',policyRefs:[policyRefs.blanketCanada,policyRefs.targetedTariffs,policyRefs.canadaEmergency],scope:'cross-state',feedRefs:[{kind:'observation-update',id:'obs-update-me-rating-tariffs-2026-09-17'},{kind:'observation-update',id:'obs-update-mi-polls-tariffs-2026-09-17'}],issueIds:['trade-industry','household-economy'],electionLinks:[{electionId:me,candidateIds:[collins,jackson],relation:'direct'},{electionId:mi,candidateIds:[elsayed,rogers],relation:'direct'}],eventDate:'2026-09-17',publishedAt:'2026-09-17',checkedAt:'2026-09-18',sourceIds:['obs-reuters-canada-tariffs-20260917'],evidenceIds:['ev-obs-reuters-canada-tariffs-20260917'],title:'同じ対カナダ関税でメーン・ミシガンの対応を比べる',description:'既存Reuters取材と二つの観測更新を関税テーマへ結び付ける。候補者の説明と実際の効果を区別する。',unknowns:['発言が価格・雇用・支持先を変えた因果効果は未確認。現在の法的状態の新規確認は行っていない。']},
  ],
  assumptions:[
    {assumptionId:'assume-medical-access-concern',themeId:'healthcare',label:'医療アクセスへの不安を共通前提に置く',description:'有権者が医療アクセスの維持を重視すると仮定する。候補者ごとの実績評価で異なる当落案を置ける。',kind:'user-hypothesis',electionIds:[me,mi,oh,ia,tx],policyRefs:[policyRefs.medicaidFunding,policyRefs.medicareAll,policyRefs.publicOption],contextLinkIds:['context-hr1-healthcare','context-health-platforms'],evidenceIds:['ev-collins-reconciliation-2025','ev-jackson-priorities','ev-elsayed-priorities','ev-turek-health'],unknowns:['重視する人の比率、支持移動、投票参加、当選確率は生成しない。']},
    {assumptionId:'assume-tariff-cost-concern',themeId:'tariffs',label:'関税の家計・地域産業負担を重視すると仮定',description:'同じ全国的な負担への懸念でも、政権との交渉力と異論を唱える姿勢のどちらを評価するかは分かれ得る。',kind:'user-hypothesis',electionIds:[me,mi,ia,tx],policyRefs:[policyRefs.blanketCanada,policyRefs.targetedTariffs,policyRefs.tradeEnforcement],contextLinkIds:['context-canada-tariff-reporting'],evidenceIds:['ev-obs-reuters-canada-tariffs-20260917','ev-elsayed-tariffs','ev-rogers-tariffs','ev-hinson-trade'],unknowns:['関税の経済効果を得票変化へ自動換算しない。']},
  ],
  factors:[
    {factorId:'factor-me-collins-medical-record',themeId:'healthcare',electionId:me,candidateIds:[collins],kind:'candidate-record',label:'Collinsの反対票と条件付きの医療姿勢を評価',description:'過去の法案反対と声明を個人の実績として評価する仮定。共和党会派の議席と個別政策票は別。',evidenceIds:['ev-hr1-rollcall','ev-collins-reconciliation-2025'],unknowns:['将来の採決予定、個人票への寄与は未確認。']},
    {factorId:'factor-me-jackson-reform-expectation',themeId:'healthcare',electionId:me,candidateIds:[jackson],kind:'candidate-position',label:'Jacksonの医療改革への期待を重視',description:'医療アクセス・薬価を掲げる挑戦者への期待。個別のMedicaid条項への賛否は未確認。',evidenceIds:['ev-jackson-priorities'],unknowns:['法案の具体版と実現方法は未確認。']},
    {factorId:'factor-mi-elsayed-medicare-all',themeId:'healthcare',electionId:mi,candidateIds:[elsayed],kind:'candidate-position',label:'El-SayedのMedicare for Allを評価',description:'Medicaid変更への賛否とは別の制度改革への期待。',evidenceIds:['ev-elsayed-priorities'],unknowns:['成立に必要な支持と財源の確認は未完了。']},
    {factorId:'factor-oh-hold-health',themeId:'healthcare',electionId:oh,candidateIds:['cand-oh-jon-husted','cand-oh-sherrod-brown'],kind:'uncertainty',label:'Ohioの医療政策判断を保留',description:'Hustedの法案全体への賛成とBrownの医療費方針は、同じ個別政策への票ではない。',evidenceIds:['ev-hr1-rollcall','ev-brown-issues'],unknowns:['両者の同一政策版への将来の票は未確認。']},
    {factorId:'factor-mi-rogers-negotiation',themeId:'tariffs',electionId:mi,candidateIds:[rogers],kind:'candidate-position',label:'Rogersの交渉手段としての関税を評価',description:'交渉力が地域負担の軽減に働くと利用者が仮定する場合。実際の成功は断定しない。',evidenceIds:['ev-rogers-tariffs','ev-obs-reuters-canada-tariffs-20260917'],unknowns:['交渉成果と得票への効果は未確認。']},
    {factorId:'factor-mi-elsayed-tariff-opposition',themeId:'tariffs',electionId:mi,candidateIds:[elsayed],kind:'candidate-position',label:'El-Sayedの一律関税への異論を評価',description:'政権への異論と対象限定関税への立場を別々に扱う。',evidenceIds:['ev-elsayed-tariffs','ev-obs-reuters-canada-tariffs-20260917'],unknowns:['支持移動は未確認。']},
    {factorId:'factor-me-tariff-record',themeId:'tariffs',electionId:me,candidateIds:[collins,jackson],kind:'candidate-record',label:'Collinsの反対行動とJacksonの不足批判を比べる',description:'同じ関税負担で現職の行動と挑戦者の批判の評価が分かれる。',evidenceIds:['ev-rollcall-160-republicans','ev-obs-reuters-canada-tariffs-20260917'],unknowns:['免除措置が負担をどこまで相殺したか未確認。']},
    {factorId:'factor-ia-trade-distinction',themeId:'tariffs',electionId:ia,candidateIds:['cand-ia-ashley-hinson','cand-ia-josh-turek'],kind:'candidate-position',label:'貿易法執行と広範関税の見直しを区別',description:'Hinsonの取締り支持とTurekの関税批判は、同じ法案への賛否ではない。',evidenceIds:['ev-hinson-trade','ev-turek-platform'],unknowns:['具体税率・対象・実施権限は未確認。']},
  ],
  candidateRecords:[
    record('position-collins-hr1',collins,me,policyRefs.hr1,'oppose',[action('action-collins-hr1-vote','vote','法案全体の上院最終採決で反対。','senate-rollcall-119-372','ev-hr1-rollcall','2025-07-01','exact-policy','nay')]),
    record('position-husted-hr1','cand-oh-jon-husted',oh,policyRefs.hr1,'support',[action('action-husted-hr1-vote','vote','法案全体の上院最終採決で賛成。','senate-rollcall-119-372','ev-hr1-rollcall','2025-07-01','exact-policy','yea')]),
    record('position-collins-medicaid-funding',collins,me,policyRefs.medicaidFunding,'oppose',[action('action-collins-funding-statement','statement','将来のMedicaid資金削減と地方医療への悪影響を反対理由に説明。','collins-reconciliation-statement-2025','ev-prototype-collins-medicaid-funding','2025-07-01','exact-policy',null,'2026-09-30')]),
    record('position-collins-medicaid-work',collins,me,policyRefs.medicaidWork,'conditional',[action('action-collins-work-statement','statement','就労可能な成人への要件支持と例外を述べた。','collins-reconciliation-statement-2025','ev-prototype-collins-medicaid-work','2025-07-01','exact-policy',null,'2026-09-30')],['幼い子を養育する人、介護者、就学中の人を除外。'],['具体的な法案条項との一致は未確認。']),
    record('position-husted-medicaid-work','cand-oh-jon-husted',oh,policyRefs.medicaidWork,'unknown',[{...action('action-husted-package-context','vote','H.R.1全体への賛成は個別の就労要件版への支持に換算しない。','senate-rollcall-119-372','ev-hr1-rollcall','2025-07-01','whole-measure','yea'),targetPolicyRef:policyRefs.hr1}]),
    record('position-jackson-medicaid-funding',jackson,me,policyRefs.medicaidFunding,'unknown',[action('action-jackson-health-priority','stated-priority','候補者資料に医療アクセスと薬価を掲げる。特定の資金削減版への立場は未確認。','jackson-priorities-2026','ev-jackson-priorities',null,'topic-only')]),
    record('position-elsayed-medicare-all',elsayed,mi,policyRefs.medicareAll,'support',[action('action-elsayed-mfa-priority','stated-priority','Medicare for Allを候補者の方針として明示。','elsayed-priorities-2026','ev-elsayed-priorities')]),
    record('position-elsayed-medicaid-funding',elsayed,mi,policyRefs.medicaidFunding,'unknown',[action('action-elsayed-health-context','stated-priority','医療制度改革の方針は別のMedicaid変更版への賛否に換算しない。','elsayed-priorities-2026','ev-elsayed-priorities',null,'topic-only')]),
    record('position-turek-public-option','cand-ia-josh-turek',ia,policyRefs.publicOption,'support',[action('action-turek-health-priority','stated-priority','公的医療選択肢を候補者発表で掲げる。','turek-health-2026','ev-turek-health','2026-06-22')]),
    record('position-talarico-public-option','cand-tx-james-talarico',tx,policyRefs.publicOption,'support',[action('action-talarico-health-priority','stated-priority','公的医療選択肢を候補者方針として掲げる。','candidate-talarico-issues-2026','ev-tx-candidate-positions-talarico-2026')]),
    record('position-collins-canada-emergency',collins,me,policyRefs.canadaEmergency,'support',[action('action-collins-sjres37-vote','vote','非常事態終了決議の上院採決で賛成。','senate-rollcall-119-160','ev-rollcall-160-republicans','2025-04-02','exact-policy','yea')]),
    record('position-elsayed-blanket-canada',elsayed,mi,policyRefs.blanketCanada,'oppose',[action('action-elsayed-canada-statement','statement','一律的な対カナダ関税への反対を表明。','elsayed-tariffs-2026','ev-elsayed-tariffs','2026-09-01')]),
    record('position-elsayed-targeted',elsayed,mi,policyRefs.targetedTariffs,'conditional',[action('action-elsayed-targeted-statement','statement','対象を絞った関税を支持する考えを述べる。','elsayed-tariffs-2026','ev-elsayed-tariffs','2026-09-01')],['対象を絞ること。具体対象・税率は未確認。']),
    record('position-rogers-targeted',rogers,mi,policyRefs.targetedTariffs,'conditional',[action('action-rogers-targeted-statement','statement','一律適用ではなく選択的な交渉手段として用いる方針。','rogers-tariffs-2026','ev-rogers-tariffs','2026-08-29')],['一律適用ではなく交渉手段として使う。']),
    record('position-hinson-trade-enforcement','cand-ia-ashley-hinson',ia,policyRefs.tradeEnforcement,'support',[action('action-hinson-trade-statement','statement','貿易法違反と関税回避の取締りを発表。','hinson-trade-2026','ev-hinson-trade','2026-09-01')]),
  ],
  additionalEvidence:[
    {evidenceId:'ev-prototype-collins-medicaid-funding',sourceId:'collins-reconciliation-statement-2025',locator:'July 1, 2025 statement: future Medicaid funding reductions, access and rural hospitals; stated reason for bill opposition.',checkedAt:'2026-09-30',kind:'observed'},
    {evidenceId:'ev-prototype-collins-medicaid-work',sourceId:'collins-reconciliation-statement-2025',locator:'July 1, 2025 statement: work requirements for able-bodied adults with child-care, caregiver and student exemptions.',checkedAt:'2026-09-30',kind:'observed'},
  ],
  sourceReviews:[{sourceId:'collins-reconciliation-statement-2025',checkedAt:'2026-09-30',scope:'2025年7月1日の過去声明を再読。現在の法的状態や将来の票を確認したものではない。'}],
};

/** Reviewed, sparse ten-state records; absence remains unresearched. */
export const policyPrototype:PolicyPrototypeData={
  ...basePolicyPrototype,
  focusElectionIds:[...policyAdditions.focusElectionIds],
  policies:[...basePolicyPrototype.policies,...policyAdditions.policies],
  candidateRecords:[...basePolicyPrototype.candidateRecords,...policyAdditions.candidateRecords],
  contextLinks:[...basePolicyPrototype.contextLinks,...policyAdditions.contextLinks],
  factors:[...basePolicyPrototype.factors,...policyAdditions.factors],
  assumptions:[...basePolicyPrototype.assumptions,...policyAdditions.assumptions],
  additionalEvidence:[...basePolicyPrototype.additionalEvidence,...policyAdditions.additionalEvidence],
  sourceReviews:[...basePolicyPrototype.sourceReviews,...policyAdditions.sourceReviews],
};
