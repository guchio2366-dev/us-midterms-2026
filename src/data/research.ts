import { issueCategories } from './civics';
import type { CandidateBrief, HistoricalResult, IssueCaseStudy, IssueReport, Poll, PolicyPosition, RaceBrief, RatingObservation, RollCallVote } from './research-model';
import { focusCandidateBriefs, focusIssueCases, focusPolls, focusRaceBriefs, focusRatingObservations, focusRollCalls } from './research-focus';

const issueReadingGuide = 'この論点は、①生活・産業への影響、②有権者が重視する度合い、③政策への賛否、④候補者選択・投票参加との関係を分けて読みます。';
const issueCases: Record<string,IssueCaseStudy[]> = {
  'household-economy':[
    {caseId:'case-mi-close-polls',title:'ミシガン：小差の調査が続く',stateFips:['26'],electionIds:['2026-MI-2-regular'],body:'9月の確認済み3調査はいずれも主要候補間が1.4〜3ポイント差です。生活費や経済を候補者がどう結び付けるかを追いますが、調査の小差から原因を一つに決めません。',sourceIds:['poll-trafalgar-mi-2026-09','poll-ssrs-mi-topline-2026-09','poll-glengariff-mi-2026-09'],evidenceIds:['ev-mi-trafalgar-poll','ev-mi-ssrs-poll','ev-mi-glengariff-poll']},
  ],
  'trade-industry':[
    {caseId:'case-ia-trade',title:'アイオワ：農業への曝露と候補者の通商方針',stateFips:['19'],electionIds:['2026-IA-2-regular'],body:'Hinsonは農業市場の拡大と貿易法違反への執行を、Turekは農業分野の集中対策と現行platformで関税の見直しを掲げます。経済的な曝露と実際の支持変更は分けて確認します。',sourceIds:['hinson-farm-2026','hinson-trade-2026','turek-rural-plan-2026','turek-platform-2026'],evidenceIds:['ev-hinson-farm','ev-hinson-trade','ev-turek-rural','ev-turek-platform']},
    {caseId:'case-tariff-rollcall',title:'上院の実例：関税をめぐる超党派票',stateFips:['23'],electionIds:['2026-ME-2-regular'],body:'2025年のS.J.Res.37は上院を51対48で通過し、共和党4人が賛成しました。多数派の一議席と、特定政策の一票は同じではないことを示す過去例です。',sourceIds:['senate-rollcall-119-160'],evidenceIds:['ev-rollcall-160-result','ev-rollcall-160-republicans']},
  ],
  'health-family':[
    {caseId:'case-ia-health',title:'アイオワ：医療費と制度の候補者差',stateFips:['19'],electionIds:['2026-IA-2-regular'],body:'Hinsonは薬価・保険料と透明性を、TurekはMedicaid・地方医療とpublic optionを掲げています。候補者自身の発表を比較し、制度の実現条件は議会権限の欄で確認します。',sourceIds:['hinson-costs-2026','turek-health-2026'],evidenceIds:['ev-hinson-costs','ev-turek-health']},
  ],
};

export const polls: Poll[] = [
  {
    pollId:'poll-ia-emerson-2026-09',
    electionId:'2026-IA-2-regular',
    pollster:'Emerson College Polling',
    sponsor:'Nexstar Media',
    fieldStart:'2026-08-31',fieldEnd:'2026-09-01',
    population:'LV',populationLabel:'投票予定者',sampleSize:750,
    method:'選挙人ファイルへのSMS-to-webとオンラインパネルを併用。人口属性、党登録、地域等で重み付け。',
    question:'If the election for US Senate were held today, for whom would you vote?',questionExact:true,
    precisionLabel:'credibility interval ±3.6ポイント',
    results:[
      {label:'Ashley Hinson',candidateId:'cand-ia-ashley-hinson',party:'R',value:49.5,category:'candidate'},
      {label:'Josh Turek',candidateId:'cand-ia-josh-turek',party:'D',value:45.1,category:'candidate'},
      {label:'Thomas Laehn',candidateId:'cand-ia-thomas-laehn',party:'other',value:.8,category:'other-candidate'},
      {label:'未定',value:4.7,category:'undecided'},
    ],
    notes:['見出しの50%対45%ではなく、公表された丸め前の全回答を表示。','公表値の合計100.1%は丸めによるものです。','公表ページの用語に合わせ、通常の無作為標本の「標本誤差」と一律には表記しません。'],residualTreatment:'rounding',
    sourceIds:['poll-emerson-ia-2026-09','poll-emerson-ia-full-2026-09'],
    evidenceIds:['ev-ia-emerson-topline','ev-ia-emerson-method','ev-ia-emerson-full'],
    status:'published',
  },
  {
    pollId:'poll-ia-yougov-2026-09',studyId:'study-ia-yougov-2026-09',electionId:'2026-IA-2-regular',pollster:'YouGov',sponsor:null,
    fieldStart:'2026-09-03',fieldEnd:'2026-09-08',population:'RV',populationLabel:'登録有権者',sampleSize:2169,
    method:'アイオワ州有権者名簿から層化無作為抽出しSMSで招待。回答はYouGovのウェブ調査で実施。',
    question:'Who [did / will / would] you vote for in the election for U.S. Senator?',questionExact:true,precisionLabel:'±3.5ポイント',
    results:[
      {label:'Josh Turek',candidateId:'cand-ia-josh-turek',party:'D',value:44,category:'candidate'},
      {label:'Ashley Hinson',candidateId:'cand-ia-ashley-hinson',party:'R',value:43,category:'candidate'},
      {label:'Someone else',value:1,category:'other'},
      {label:'未定',value:11,category:'undecided'},
      {label:'投票しない',value:2,category:'not-voting'},
    ],
    notes:['登録有権者の結果。loose LVとstrict LVは別カードに分けます。','設問はThomas Laehnを氏名で提示せず、Someone elseとしています。','公表された整数値は丸めにより合計101%です。'],residualTreatment:'rounding',
    sourceIds:['poll-yougov-ia-2026-09'],evidenceIds:['ev-ia-yougov-poll'],status:'published',
  },
  {
    pollId:'poll-ia-yougov-2026-09-loose-lv',studyId:'study-ia-yougov-2026-09',electionId:'2026-IA-2-regular',pollster:'YouGov',sponsor:null,
    fieldStart:'2026-09-03',fieldEnd:'2026-09-08',population:'LV',populationLabel:'loose likely-voter model',sampleSize:2127,
    method:'同じYouGov調査を、比較的広い投票可能性モデルで集計。',question:'Who [did / will / would] you vote for in the election for U.S. Senator?',questionExact:true,precisionLabel:'±3.5ポイント',
    results:[{label:'Josh Turek',candidateId:'cand-ia-josh-turek',party:'D',value:45,category:'candidate'},{label:'Ashley Hinson',candidateId:'cand-ia-ashley-hinson',party:'R',value:43,category:'candidate'}],
    notes:['その他・未定・投票しないの個別値はこのカードで確認できないため、合計12%を「内訳未掲載」として残します。'],conditionLabel:'loose LV',completeness:'partial',residualTreatment:'unreported',
    sourceIds:['poll-yougov-ia-2026-09'],evidenceIds:['ev-ia-yougov-poll'],status:'published',
  },
  {
    pollId:'poll-ia-yougov-2026-09-strict-lv',studyId:'study-ia-yougov-2026-09',electionId:'2026-IA-2-regular',pollster:'YouGov',sponsor:null,
    fieldStart:'2026-09-03',fieldEnd:'2026-09-08',population:'LV',populationLabel:'strict likely-voter model',sampleSize:2041,
    method:'同じYouGov調査を、より厳しい投票可能性モデルで集計。',question:'Who [did / will / would] you vote for in the election for U.S. Senator?',questionExact:true,precisionLabel:'±3.5ポイント',
    results:[{label:'Josh Turek',candidateId:'cand-ia-josh-turek',party:'D',value:47,category:'candidate'},{label:'Ashley Hinson',candidateId:'cand-ia-ashley-hinson',party:'R',value:43,category:'candidate'}],
    notes:['その他・未定・投票しないの個別値はこのカードで確認できないため、合計10%を「内訳未掲載」として残します。'],conditionLabel:'strict LV',completeness:'partial',residualTreatment:'unreported',
    sourceIds:['poll-yougov-ia-2026-09'],evidenceIds:['ev-ia-yougov-poll'],status:'published',
  },
  {
    pollId:'poll-ia-suffolk-2026-08',electionId:'2026-IA-2-regular',pollster:'Suffolk University Political Research Center',sponsor:null,
    fieldStart:'2026-08-20',fieldEnd:'2026-08-23',population:'LV',populationLabel:'11月選挙へ投票する可能性が高い有権者',sampleSize:500,
    method:'固定電話・携帯電話へのライブインタビュー。地域別の確率比例抽出。',
    question:'There are three candidates for U.S. Senate who are certified to appear on the Iowa ballot… At this point if the election were today, who would be your first choice?',questionExact:true,precisionLabel:'標本誤差 ±4.4ポイント',
    results:[
      {label:'Ashley Hinson',candidateId:'cand-ia-ashley-hinson',party:'R',value:45.4,category:'candidate'},
      {label:'Josh Turek',candidateId:'cand-ia-josh-turek',party:'D',value:40.8,category:'candidate'},
      {label:'Thomas Laehn',candidateId:'cand-ia-thomas-laehn',party:'other',value:4,category:'other-candidate'},
      {label:'未定',value:9.2,category:'undecided'},
      {label:'回答拒否',value:.6,category:'other'},
    ],notes:[],residualTreatment:'none',sourceIds:['poll-suffolk-ia-2026-08','poll-suffolk-ia-method-2026'],evidenceIds:['ev-ia-suffolk-poll','ev-ia-suffolk-method'],status:'published',
  },
  {
    pollId:'poll-mi-trafalgar-2026-09',electionId:'2026-MI-2-regular',pollster:'The Trafalgar Group',sponsor:null,
    fieldStart:'2026-09-07',fieldEnd:'2026-09-09',population:'LV',populationLabel:'2026年一般選挙の投票予定者',sampleSize:1079,
    method:'集計表は独自手法の説明へリンクしていますが、具体的な収集モードは開示していません。',
    question:'If the election for U.S. Senate were tomorrow, for whom would you most likely vote?',precisionLabel:'標本誤差 ±2.9ポイント（95%信頼水準）',
    results:[
      {label:'Abdul El-Sayed',candidateId:'cand-mi-abdul-el-sayed',party:'D',value:46.3,category:'candidate'},
      {label:'Mike Rogers',candidateId:'cand-mi-mike-rogers',party:'R',value:44.8,category:'candidate'},
      {label:'Lydia Christensen',candidateId:'cand-mi-lydia-christensen',party:'other',value:.8,category:'other-candidate'},
      {label:'Tim Long',candidateId:'cand-mi-tim-long',party:'other',value:.7,category:'other-candidate'},
      {label:'Douglas P. Marsh',candidateId:'cand-mi-douglas-p-marsh',party:'other',value:.4,category:'other-candidate'},
      {label:'Walter P. Kristy',candidateId:'cand-mi-walter-p-kristy',party:'other',value:.2,category:'other-candidate'},
      {label:'未定',value:6.8,category:'undecided'},
    ],notes:['公式投票用紙の6候補をすべて選択肢に含む調査です。'],sourceIds:['poll-trafalgar-mi-2026-09'],evidenceIds:['ev-mi-trafalgar-poll'],status:'published',
  },
  {
    pollId:'poll-mi-cnn-ssrs-2026-09',electionId:'2026-MI-2-regular',pollster:'SSRS',sponsor:'CNN',
    fieldStart:'2026-08-31',fieldEnd:'2026-09-06',population:'LV',populationLabel:'投票予定者',sampleSize:843,
    method:'登録有権者にオンラインとライブ電話で調査し、予測投票可能性からLVをモデル化。',
    question:'一般選挙の連邦上院候補者選択（原文は集計表を参照）',precisionLabel:'標本誤差 ±4.1ポイント',
    results:[
      {label:'Abdul El-Sayed',candidateId:'cand-mi-abdul-el-sayed',party:'D',value:47,category:'candidate'},
      {label:'Mike Rogers',candidateId:'cand-mi-mike-rogers',party:'R',value:44,category:'candidate'},
      {label:'その他・どちらでもない・未定',value:9,category:'other'},
    ],notes:['アクセス可能な公表資料では残り9%を個別分類できないため、集計のまま表示します。'],sourceIds:['poll-ssrs-me-mi-2026-09','poll-ssrs-mi-topline-2026-09'],evidenceIds:['ev-ssrs-me-mi-method','ev-mi-ssrs-poll'],status:'published',
  },
  {
    pollId:'poll-mi-glengariff-2026-09',electionId:'2026-MI-2-regular',pollster:'Glengariff Group',sponsor:'The Detroit News / WDIV-TV',
    fieldStart:'2026-08-31',fieldEnd:'2026-09-03',population:'LV',populationLabel:'一般選挙の投票予定者',sampleSize:600,
    method:'電話インタビュー。公表記事では固定・携帯の内訳や完全な抽出・重み付け仕様を確認できません。',
    question:'正確な設問文は公表記事で確認できず',precisionLabel:'標本誤差 ±4.0ポイント',
    results:[
      {label:'Mike Rogers',candidateId:'cand-mi-mike-rogers',party:'R',value:45.8,category:'candidate'},
      {label:'Abdul El-Sayed',candidateId:'cand-mi-abdul-el-sayed',party:'D',value:44.4,category:'candidate'},
      {label:'未定',value:9,category:'undecided'},
    ],notes:['公表値の合計との差0.8ポイントは回答区分を確認できないため、グラフでは「内訳未掲載」と表示します。'],sourceIds:['poll-glengariff-mi-2026-09'],evidenceIds:['ev-mi-glengariff-poll'],status:'published',
  },
  ...focusPolls,
];

export const ratingObservations: RatingObservation[] = [
  {ratingId:'rating-ia-cook-2026-06-02',electionId:'2026-IA-2-regular',organization:'The Cook Political Report',ratingRaw:'Lean Republican',category:'Lean R',ratedAt:'2026-06-02',retrievedAt:'2026-09-11',sourceIds:['cook-ia-race-2026'],evidenceIds:['ev-ia-cook-rating'],status:'published'},
  {ratingId:'rating-ia-cook-2026-08-20',electionId:'2026-IA-2-regular',organization:'The Cook Political Report',ratingRaw:'Toss Up',category:'Toss Up',ratedAt:'2026-08-20',retrievedAt:'2026-09-11',sourceIds:['cook-ia-race-2026'],evidenceIds:['ev-ia-cook-rating'],status:'published'},
  {ratingId:'rating-ia-inside-2026-08-06',electionId:'2026-IA-2-regular',organization:'Inside Elections',ratingRaw:'Tilt Republican',category:'Tilt R',ratedAt:'2026-08-06',retrievedAt:'2026-09-11',sourceIds:['inside-ia-race-2026'],evidenceIds:['ev-ia-inside-rating'],status:'published'},
  {ratingId:'rating-ia-sabato-2026-06-03',electionId:'2026-IA-2-regular',organization:"Sabato's Crystal Ball",ratingRaw:'Leans Republican',category:'Lean R',ratedAt:'2026-06-03',retrievedAt:'2026-09-11',sourceIds:['sabato-ia-change-2026','sabato-senate-labor-day-2026'],evidenceIds:['ev-ia-sabato-rating'],status:'published'},
  {ratingId:'rating-mi-cook-2026-08-20',electionId:'2026-MI-2-regular',organization:'The Cook Political Report',ratingRaw:'Toss Up',category:'Toss Up',ratedAt:'2026-08-20',retrievedAt:'2026-09-11',sourceIds:['cook-mi-race-2026'],evidenceIds:['ev-mi-cook-rating'],status:'published'},
  {ratingId:'rating-mi-inside-2025-07-24',electionId:'2026-MI-2-regular',organization:'Inside Elections',ratingRaw:'Toss-up',category:'Toss Up',ratedAt:'2025-07-24',retrievedAt:'2026-09-11',sourceIds:['inside-mi-race-2026'],evidenceIds:['ev-mi-inside-rating'],status:'published'},
  {ratingId:'rating-mi-sabato-2026-08-05',electionId:'2026-MI-2-regular',organization:"Sabato's Crystal Ball",ratingRaw:'Toss-up',category:'Toss Up',ratedAt:'2026-08-05',retrievedAt:'2026-09-11',sourceIds:['sabato-mi-post-primary-2026'],evidenceIds:['ev-mi-sabato-rating'],status:'published'},
  {
    ratingId:'rating-ak-inside-2026-09-03',electionId:'2026-AK-2-regular',
    organization:'Inside Elections',ratingRaw:'Tilt Republican',category:'Tilt R',
    ratedAt:'2026-09-03',retrievedAt:'2026-09-11',
    sourceIds:['inside-elections-2026-ratings','inside-elections-ak-2026'],
    evidenceIds:['ev-inside-ak-change','ev-inside-ak-current'],status:'published',
  },
  ...focusRatingObservations,
];

const presidentialResult = (resultId:string,stateFips:string,democraticVotes:number,republicanVotes:number,evidenceId:string): HistoricalResult => ({
  resultId,stateFips,electionDate:'2024-11-05',office:'president',
  candidates:[
    {label:'Kamala D. Harris',party:'D',votes:democraticVotes},
    {label:'Donald J. Trump',party:'R',votes:republicanVotes},
  ],
  sourceIds:['fec-pres-2024'],evidenceIds:[evidenceId],status:'published',
});

export const historicalResults: HistoricalResult[] = [
  presidentialResult('result-2024-president-ak','02',140026,184458,'ev-2024-president-ak'),
  presidentialResult('result-2024-president-ia','19',707278,927019,'ev-2024-president-ia'),
  presidentialResult('result-2024-president-me','23',435652,377977,'ev-2024-president-me'),
  presidentialResult('result-2024-president-mi','26',2736533,2816636,'ev-2024-president-mi'),
  presidentialResult('result-2024-president-oh','39',2533699,3180116,'ev-2024-president-oh'),
  presidentialResult('result-2024-president-tx','48',4835250,6393597,'ev-2024-president-tx'),
];

export const raceBriefs: RaceBrief[] = [
  {
    electionId:'2026-IA-2-regular',updatedAt:'2026-09-11',status:'published',completeness:'substantial',
    headline:'州の基礎党派と異なり、調査・評価機関で先頭や分類が割れる',
    summary:'2024年大統領選では共和党が二桁差で上回りましたが、上院選ではCookがToss Up、InsideがTilt R、SabatoがLean Rです。YouGovの登録有権者ではTurek 44%・Hinson 43%、Emersonの投票予定者ではHinson 49.5%・Turek 45.1%でした。',
    balance:'最新の確認済み調査でも、母集団と方法により先頭が入れ替わります。YouGovの登録有権者ではTurekが1ポイント上、EmersonとSuffolkの投票予定者ではHinsonが約4.4〜4.6ポイント上です。単一の平均や勝率へ変換せず、設問・対象・未定票を保ったまま比較します。',
    keyIssues:['生活費と州経済','関税・輸出市場・農業','医療と社会保障'],
    analysis:[
      {heading:'いま確認できること',body:'共和党寄りの州の基礎地盤と、競争的な上院情勢を分けて見る必要があります。Cookは6月2日にLikely RからLean R、8月20日にToss Upへ変更しました。SabatoとInsideは現在も共和党寄りの原表記を維持しています。',evidenceKind:'observed',evidenceIds:['ev-ia-cook-rating','ev-ia-inside-rating','ev-ia-sabato-rating']},
      {heading:'関税・農業の読み方',body:'候補者の農業・通商方針には確認可能な差があります。ただし、農業の経済的な曝露や関税への懸念だけでは、同じ有権者が支持先を変えたことまでは示せません。',evidenceKind:'interpretation',evidenceIds:['ev-hinson-farm','ev-hinson-trade','ev-turek-rural','ev-turek-platform']},
    ],
    supportChange:'同じ人が支持先を変えたことを直接示す比較可能なパネル調査は、現在の掲載資料では確認していません。',
    turnout:'投票予定者調査は実際の投票参加を確定するものではありません。支持先と投票参加を別に更新します。',
    updateConditions:['別の州全体調査の原表を確認したとき','評価機関が同一選挙の分類を変更したとき','候補者の通商・農業政策が具体化したとき'],
    pollIds:['poll-ia-yougov-2026-09','poll-ia-yougov-2026-09-loose-lv','poll-ia-yougov-2026-09-strict-lv','poll-ia-emerson-2026-09','poll-ia-suffolk-2026-08'],ratingIds:['rating-ia-cook-2026-06-02','rating-ia-cook-2026-08-20','rating-ia-inside-2026-08-06','rating-ia-sabato-2026-06-03'],relatedIssueIds:['household-economy','trade-industry','health-family'],
    sourceIds:['poll-yougov-ia-2026-09','poll-emerson-ia-2026-09','poll-emerson-ia-full-2026-09','poll-suffolk-ia-2026-08','poll-suffolk-ia-method-2026','cook-ia-race-2026','inside-ia-race-2026','sabato-ia-change-2026','sabato-senate-labor-day-2026'],evidenceIds:['ev-ia-yougov-poll','ev-ia-emerson-topline','ev-ia-emerson-method','ev-ia-emerson-full','ev-ia-suffolk-poll','ev-ia-suffolk-method','ev-ia-cook-rating','ev-ia-inside-rating','ev-ia-sabato-rating'],
  },
  {
    electionId:'2026-MI-2-regular',updatedAt:'2026-09-11',status:'published',completeness:'substantial',
    headline:'複数の直近調査が小差で、主要3評価機関はいずれもToss Up',
    summary:'ミシガン州は2024年大統領選も僅差でした。9月の3調査ではEl-Sayedが1.5〜3ポイント上、またはRogersが1.4ポイント上で、いずれも公表された精度幅より差が小さい結果です。Cook、Inside Elections、SabatoはいずれもToss Upとしています。',
    balance:'TrafalgarはEl-Sayed 46.3%・Rogers 44.8%、CNN/SSRSは47%・44%、GlengariffはRogers 45.8%・El-Sayed 44.4%。各調査で先頭や残余回答の分類が異なり、どれも数ポイントの小差です。全6候補を示す調査と二大候補中心の公表値を同じ分母へ作り替えません。',
    keyIssues:['生活費・医療費','製造業・関税','候補者の政策的な位置'],
    analysis:[
      {heading:'Toss Upの根拠',body:'公開調査が少ないだけでなく、異なる調査が狭い範囲で逆方向を示し、三つの評価機関もToss Upで一致しています。候補者差と未定票を更新の中心に置きます。',evidenceKind:'interpretation',evidenceIds:['ev-mi-trafalgar-poll','ev-mi-ssrs-poll','ev-mi-glengariff-poll','ev-mi-cook-rating','ev-mi-inside-rating','ev-mi-sabato-rating']},
      {heading:'政策差',body:'El-Sayedは医療制度改革、一律的な関税への反対、frontier AIの一時停止を掲げます。Rogersは関税を一律ではなく交渉手段として使う考え、教育・住宅政策を示しています。両者の自己説明として表示し、実現可能性は議会権限と分けます。',evidenceKind:'observed',evidenceIds:['ev-elsayed-priorities','ev-elsayed-tariffs','ev-elsayed-ai','ev-rogers-tariffs','ev-rogers-education','ev-rogers-housing']},
    ],
    supportChange:'直近の横断調査から、同一人物の支持先変更を直接測定したとは扱いません。候補者支持、候補者イメージ、過去投票先は別項目です。',
    turnout:'LVの作り方は調査ごとに異なります。CNN/SSRSのモデル、Trafalgarの対象、Glengariffの電話調査を同じ参加確率として扱いません。',
    updateConditions:['追加の独立した州全体調査を確認したとき','未定票・第三候補の比率が継続して変わったとき','評価機関がToss Upから変更したとき'],
    pollIds:['poll-mi-trafalgar-2026-09','poll-mi-cnn-ssrs-2026-09','poll-mi-glengariff-2026-09'],ratingIds:['rating-mi-cook-2026-08-20','rating-mi-inside-2025-07-24','rating-mi-sabato-2026-08-05'],relatedIssueIds:['household-economy','trade-industry','health-family','rights-institutions'],
    sourceIds:['poll-trafalgar-mi-2026-09','poll-ssrs-me-mi-2026-09','poll-ssrs-mi-topline-2026-09','poll-glengariff-mi-2026-09','cook-mi-race-2026','inside-mi-race-2026','sabato-mi-post-primary-2026'],evidenceIds:['ev-mi-trafalgar-poll','ev-mi-ssrs-poll','ev-mi-glengariff-poll','ev-mi-cook-rating','ev-mi-inside-rating','ev-mi-sabato-rating'],
  },
  ...focusRaceBriefs,
];

export const candidateBriefs: CandidateBrief[] = [
  {
    candidateId:'cand-ia-ashley-hinson',updatedAt:'2026-09-11',status:'published',
    summary:'本人・陣営資料では、生活費、医療費、農業市場、貿易法執行を前面に出しています。関税回避の取締り支持を、あらゆる関税への包括的支持とは読み替えません。',
    currentPositions:['保険料・薬価の引下げと企業・保険会社の透明性','通年E15、輸出市場拡大、Farm Bill、農業投入費の抑制','中国を含む貿易法違反・関税回避への執行強化'],
    record:['連邦下院議員として貿易犯罪取締りの強化を発表'],
    supportAndFinance:['陣営発表でIowa Farm Bureauの支持を掲載'],
    differences:['Turekの現行platformは「chaotic tariffs」の終了を掲げ、Hinsonは市場拡大と貿易法執行を重視'],
    policyPositions:['生活費・医療費','農業・燃料','対中貿易法執行'],opposedPolicies:['California Proposition 12'],
    sourceIds:['hinson-costs-2026','hinson-farm-2026','hinson-trade-2026'],evidenceIds:['ev-hinson-costs','ev-hinson-farm','ev-hinson-trade'],
  },
  {
    candidateId:'cand-ia-josh-turek',updatedAt:'2026-09-11',status:'published',
    summary:'陣営資料では、地方経済、農業市場の競争、医療アクセス、中絶の権利、現行関税の見直しを結び付けています。',
    currentPositions:['農機の連邦right-to-repair、原産国表示、肥料・農業分野の集中対策','Medicaidと地方医療の保護、public option','Roe期の保護の法制化','現行platformで「End the chaotic tariffs」'],
    record:[],supportAndFinance:[],
    differences:['Hinsonより関税の撤回、Medicaid保護、中絶の権利を明確に掲げる'],
    policyPositions:['地方・農業','医療','中絶','関税'],opposedPolicies:['陣営がchaoticと表現する現行関税','Medicaid削減'],
    sourceIds:['turek-rural-plan-2026','turek-health-2026','turek-abortion-2026','turek-platform-2026'],evidenceIds:['ev-turek-rural','ev-turek-health','ev-turek-abortion','ev-turek-platform'],
  },
  {
    candidateId:'cand-ia-thomas-laehn',updatedAt:'2026-09-11',status:'published',
    summary:'Libertarian候補として、本選候補一覧と調査の第三候補票を構成します。二大候補だけの選挙として表示しません。',
    currentPositions:['PAC・Super PACの影響抑制','議会承認のない戦争への反対','国境管理と合法移民枠拡大','連邦による中絶規制への反対'],
    record:[],supportAndFinance:[],differences:['二大政党双方と異なる市民的自由・財政・戦争権限の組合せ'],
    policyPositions:['選挙資金','戦争権限','移民','中絶','大麻の非犯罪化'],opposedPolicies:['商業目的のeminent domain','議会承認のない戦争'],
    sourceIds:['laehn-issues-2026'],evidenceIds:['ev-laehn-issues'],
  },
  {
    candidateId:'cand-mi-abdul-el-sayed',updatedAt:'2026-09-11',status:'published',
    summary:'医療費と生活費を中心に、政治制度改革、関税、AI政策まで幅広い提案を掲げています。候補者自身の公表方針として表示します。',
    currentPositions:['Medicare for All、薬価抑制、大規模医療企業の分割','企業献金禁止、filibuster廃止、投票制度・最高裁改革','一律的な対カナダ関税に反対し、targeted tariffsを支持','frontier AI開発の一時停止'],
    record:[],supportAndFinance:[],
    differences:['Rogersより公的医療拡大と制度改革を強く掲げ、現行の広範な関税へ反対'],
    policyPositions:['医療','生活費','制度改革','通商','AI'],opposedPolicies:['広範で一律的な対カナダ関税','大企業による選挙資金支配'],
    sourceIds:['elsayed-priorities-2026','elsayed-tariffs-2026','elsayed-ai-2026'],evidenceIds:['ev-elsayed-priorities','ev-elsayed-tariffs','ev-elsayed-ai'],
  },
  {
    candidateId:'cand-mi-mike-rogers',updatedAt:'2026-09-11',status:'published',
    summary:'関税を一律ではなく交渉手段として用いる考えと、教育・住宅の具体策を陣営資料で示しています。州政府の協力が必要な提案は、上院単独の権限とは表示しません。',
    currentPositions:['関税を選択的な交渉手段として用い、カナダとの合意を求める','phonics、Title I tutoring、職業教育の拡充','529資金の住宅頭金利用、家賃履歴の信用評価、住宅供給促進'],
    record:['元連邦下院議員'],supportAndFinance:[],
    differences:['El-Sayedより市場・規制面の住宅策を重視し、関税を政策手段として残す'],
    policyPositions:['製造業・通商','教育','住宅'],opposedPolicies:['一律の関税適用'],
    sourceIds:['rogers-tariffs-2026','rogers-education-2026','rogers-housing-2026'],evidenceIds:['ev-rogers-tariffs','ev-rogers-education','ev-rogers-housing'],
  },
  ...focusCandidateBriefs,
];

export const issueReports: IssueReport[] = issueCategories.map(issue => ({
  issueId:issue.issueId,updatedAt:'2026-09-11',status:'published',completeness:'partial',
  summary:issue.scope,
  readingGuide:issueReadingGuide,
  sections:[{
    heading:'この論点で確認する順序',
    body:`${issue.voterQuestion} 影響の大きさと、投票時の優先度、政策への賛否、候補者選択との関係を別々に確認します。`,
    evidenceKind:'interpretation',evidenceIds:[],
  }],
  caseStudies:[...(issueCases[issue.issueId] ?? []),...(focusIssueCases[issue.issueId] ?? [])],
  sourceIds:[...new Set([...issue.sourceIds,...([...(issueCases[issue.issueId] ?? []),...(focusIssueCases[issue.issueId] ?? [])].flatMap(item => item.sourceIds))])],
  evidenceIds:[...(issueCases[issue.issueId] ?? []),...(focusIssueCases[issue.issueId] ?? [])].flatMap(item => item.evidenceIds),
}));

export const rollCalls: RollCallVote[] = [
  {
    rollCallId:'senate-119-1-160',chamber:'Senate',congress:'119',session:'1',
    question:'On the Joint Resolution',measure:'S.J.Res.37',voteDate:'2025-04-02',result:'Passed',
    yea:51,nay:48,notVoting:1,
    summary:'カナダからの輸入品への関税の根拠となった国家非常事態を終了させる共同決議を、上院が51対48で可決しました。これは上院通過時点の実例であり、法律成立や関税撤廃そのものを意味しません。',
    notableVotes:['共和党のCollins、Murkowski、McConnell、Paulが賛成','賛成51・反対48・投票なし1'],
    relatedPowerIds:['ordinary-law'],relatedIssueIds:['trade-industry','rights-institutions'],
    sourceIds:['senate-rollcall-119-160'],evidenceIds:['ev-rollcall-160-result','ev-rollcall-160-republicans'],status:'published',
  },
  ...focusRollCalls,
];

export const policyPositions: PolicyPosition[] = [];
