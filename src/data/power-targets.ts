export type TargetCaucus = 'Democratic'|'Republican';

export interface PowerTarget {
  targetId: string;
  powerId: string;
  label: string;
  senateThreshold: number|null;
  houseThreshold: number|null;
  thresholdKind: 'control'|'pass'|'block-cloture'|'supermajority';
  requirement: string;
  caution: string;
}

export const powerTargets: PowerTarget[] = [
  {targetId:'ordinary-pass',powerId:'ordinary-law',label:'通常法案を最終可決する',senateThreshold:51,houseThreshold:218,thresholdKind:'pass',requirement:'両院が同じ文面を可決し、大統領へ送付します。上院では先に討論終結が必要になる場合があります。',caution:'51議席は全員出席時の単純多数の目安です。50対50では副大統領の決裁票が必要です。'},
  {targetId:'ordinary-cloture',powerId:'ordinary-law',label:'通常法案の討論を終結する',senateThreshold:60,houseThreshold:null,thresholdKind:'supermajority',requirement:'上院で選出・宣誓済み議員の5分の3を集め、討論を終えて採決へ進みます。',caution:'60は上院100人が選出・宣誓済みの場合の例です。法案の最終可決は別の採決です。'},
  {targetId:'ordinary-block',powerId:'ordinary-law',label:'通常法案の討論終結を阻む目安',senateThreshold:41,houseThreshold:null,thresholdKind:'block-cloture',requirement:'上院100人が選出・宣誓済みで、討論終結に反対する41人が結束する場合の目安です。',caution:'欠員・出席だけで自動的に41へ変わる計算ではありません。法案・手続ごとの行動は別に確認が必要です。'},
  {targetId:'appropriations-pass',powerId:'appropriations',label:'歳出法案を可決する',senateThreshold:51,houseThreshold:218,thresholdKind:'pass',requirement:'下院と上院が歳出法案を可決し、大統領へ送ります。',caution:'上院で討論終結が必要な場合や、大統領が拒否権を使う場合は追加条件があります。'},
  {targetId:'oversight-control',powerId:'oversight',label:'委員会の調査を主導する',senateThreshold:51,houseThreshold:218,thresholdKind:'control',requirement:'各院の多数派が委員長・議題・委員会運営を主導する目安です。',caution:'召喚状などの個別手続は各委員会・各院の規則に従います。'},
  {targetId:'nominations-pass',powerId:'nominations',label:'大統領指名を承認する',senateThreshold:51,houseThreshold:null,thresholdKind:'pass',requirement:'大統領が指名し、上院が助言と同意として承認します。',caution:'全員出席時の単純多数の目安です。下院は通常この承認投票に参加しません。'},
  {targetId:'treaties-consent',powerId:'treaties',label:'条約の批准に同意する',senateThreshold:67,houseThreshold:null,thresholdKind:'supermajority',requirement:'大統領が交渉・署名した条約に、出席上院議員の3分の2が同意します。',caution:'67は100人全員出席時の例です。行政協定は別の制度です。'},
  {targetId:'impeachment-charge',powerId:'impeachment',label:'下院で弾劾訴追する',senateThreshold:null,houseThreshold:218,thresholdKind:'pass',requirement:'下院が弾劾条項を提出し、出席して投票した議員の過半数で訴追します。',caution:'訴追だけでは罷免されません。上院の弾劾裁判が別に必要です。'},
  {targetId:'impeachment-convict',powerId:'impeachment',label:'上院の弾劾裁判で有罪とする',senateThreshold:67,houseThreshold:218,thresholdKind:'supermajority',requirement:'下院の訴追後、上院で出席議員の3分の2が有罪に投票します。',caution:'67は100人全員出席時の例です。議席数は個別議員の有罪票を保証しません。'},
  {targetId:'veto-override',powerId:'veto-override',label:'大統領の通常の拒否権を覆す',senateThreshold:67,houseThreshold:290,thresholdKind:'supermajority',requirement:'大統領が拒否した法案を、定足数の下で両院がそれぞれ3分の2で再可決します。',caution:'290・67は全議員が投票する場合の例です。両院の条件を満たす必要があります。'},
  {targetId:'reconciliation-pass',powerId:'reconciliation',label:'財政調整法を可決する',senateThreshold:51,houseThreshold:218,thresholdKind:'pass',requirement:'予算決議に基づく対象事項を両院の単純多数で可決します。',caution:'上院のバード・ルール等により、含められる内容が制限されます。'},
];
