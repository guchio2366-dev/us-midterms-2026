# 10月4日公開に向けた信頼性確認（2026-09-30）

対象main: `e77169b8403e9522a015dc1744559f092babf4d7`。独立したソースアーカイブで作業し、既存checkoutや別サイトには変更していない。

## 候補者の訂正根拠と限界

- DE: [州選挙当局の本選名簿](https://elections.delaware.gov/candidates/candidatelist/genl_fcddt_2026.html)でChris Coons（D）、Michael Katz（R）のQualifiedを9月30日に確認。原本更新表示は9月29日19:56。[公式記名候補一覧](https://elections.delaware.gov/candidates/candidatelist/genl_wcddt_2026.html)でWilliam McVay、John Shulli、Travis Jack Stevensを確認。新規2人の党派は一覧に記載がないため不明。Shulliの共和党表記は以前の公式資料を保持し、両出典を明示。
- RI: [州務長官の候補検索](https://vote.sos.ri.gov/Candidates/CandidateSearchSummary?Election=18239&OfficeType=620)でJohn Francis Reed、Raymond T McKayのOn Election Ballot: Y、およびBurbridge/MunozのNを9月30日に確認。独立候補全員の再検証は未完了。Michael Bahryは9月9日資料を保持して本選掲載再確認待ちとし、撤回とは断定しない。
- DE/RIを予備選結果待ちから本選段階へ訂正。以前の予備選候補は現在名簿から区別し、新規選択を無効化。候補者IDと保存・共有案の復元は保持。
- OH/NH: 候補者資料は9月9日時点。9月29日確認で原本を取得できず、NHは9月30日の[本選PDF](https://mm.nh.gov/files/uploads/sos/docs/2026-ge-candidate-list.pdf)も取得不可。本文で資料時点と再照合未完了を明示し、調査状態をpartialへ変更。取得できない世論調査原票は従来どおり非掲載。

## 観測時刻

9月29日の実行記録は完了00:20 UTCに対して情報源確認00:22〜00:24 UTCを記載している。元の実行ログで時刻を回復できないため、原記録の時刻を変更せず`timingIntegrity: inconsistent`と理由を本文・実行記録に追加。新しい日次観測を実施したとは扱わない。外部日次自動化の稼働状態は未確認。

## スクロールと検証

関連ニュースから州詳細への遷移で、固定議席ヘッダーが見出しを約15px覆う問題（親側Chrome、1180×757、TX→9/28ニュース→OH）に対応。遷移時に実際のsticky/fixedヘッダーの高さとtopからscroll-marginを計算する。レイアウトは変更しない。

変更前の公開版について親側クラウドChromeで8州、Ohio Brown選択・議席変化、Undo/現案reset、2案保存比較/開く、共有URL別タブ復元を確認済み。最新baseline resetは確認ダイアログcancelで未検証。変更後の実ブラウザ検証はこのローカル環境では未実施（利用可能な実ブラウザ操作ツールなし）。公開後に親側で再確認する。

変更後にスクロール計算を含む149テスト（13ファイル）とTypeScript/Vite本番ビルドが成功。ビルドの大きいJSチャンク警告は既存課題。

## 公開後の再確認と本文補正

PR #32のPages配備（run 36694496572）は成功。親側クラウドChromeで1180×757のTXニュース→OH遷移を再確認し、見出しy220.80〜272.41、固定部bottom151.84で重なり解消を確認。OH/NHの資料時点注記、旧Ohio保存案読み込み、Brown→Husted→Undo、修正前共有URLのBrown復元も確認済み。

同じ再確認でDE/RIの下部要約が過去候補を印刷候補に数えていたことと、footerの古い予備選説明を発見したため補正。下部要約はDE印刷2・記名3・過去3、RI印刷2・再確認待ち1・過去2へ整理し、OH/NHも最新名簿の再照合未完了を明示する。DE/RI要約の確認時点と公式出典を更新。150テストで下部要約の整合性を確認。補正後の実画面は親側で再確認する。

## Ohio公式資料の回復（9月30日・後続更新）

PR #33後、親側クラウドChromeでDE/RI下部・footer・OH/NH注記・sticky・旧共有URL復元が通過。続いてOhioの掲載資格を以下の公式原本で再照合した。

- [州SOS Directive 2026-45](https://www.ohiosos.gov/assets/dir2026-45-form-of-the-official-ballot-for-the-november%203-general-election.pdf)：8月25日発行、9月30日取得・本文照合。VI.H（p7）で印刷4名と党派、III.B.ii（p4）で記名3名を確認。資料の対象は2029年1月3日までの上院残任期。
- [公式サンプル](https://www.ohiosos.gov/assets/dir2026-45-official-sample-ballot-november-3-2026.pdf)：p1で印刷4名を照合。紙面の8月20日表示は様式の日付として扱い、発行日と断定しない。
- [Cuyahoga郡一覧](https://boe.cuyahogacounty.gov/docs/default-source/boe/candidates-page/candidate-list.pdf?sfvrsn=4b1792c0_450)：9月17日15:34の資料（親側の視覚確認）、p5を9月30日に本文照合。印刷4名valid、記名3名valid write-inを確認。記名候補の党派欄空白は親側で視覚確認済み。郡一覧の日付を州の認証日として扱わない。Levyの郡Nonpartisan表記に対し、表示には州のOther-party candidateを採用。

7名の候補者IDは保持。掲載資格の調査状態をcompleteへ更新し、記名候補3名の党派・会派は未確認のまま。本文・下部・footerのOhio再照合待ちを更新。NH名簿とRI Bahryは従来の未確認状態を維持。9月29日の観測取得不能記録は過去の実行記録として保持し、9月30日に新しい日次観測を実施したとは扱わない。

変更後の151テスト（13ファイル）とTypeScript/Vite本番ビルド成功。回帰テストは7名のID、印刷/記名の区別、未知党派、原本発行日と確認日、下部要約、NH/RIの未確認維持を確認。公開結果と補正後の実画面確認は当該PRへ記録する。
