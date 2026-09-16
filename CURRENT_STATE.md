# 現在の実装・公開状況

> **現状確認の入口。** 本書は確認したコード時点の記録である。着手時には最新main・公開処理・定点観測の実行記録と照合する。設計書にある「未実装」「次工程」は、その設計書の作成時点の表現である。

文書確認日：2026-09-16（日本時間）。概説・更新欄・州詳細のUX改善を[PR #13](https://github.com/guchio2366-dev/us-midterms-2026/pull/13)で反映した。公開後の品質確認は[PR #14](https://github.com/guchio2366-dev/us-midterms-2026/pull/14)で州詳細冒頭への主要候補表示と本文スキップリンクを補正し、マージコミット`6ece58187af088a8f7f4c1f23ad33cdf137bddf6`の[Pages配備](https://github.com/guchio2366-dev/us-midterms-2026/actions/runs/34910848773)が成功した。公開Chrome 1363×936で配置・州切替・候補者比較・議席変更とUndo・ニュースと予定を確認した。[今回の検証記録](docs/ux-layout-implementation-20260915.md)を参照。指定寸法とSafari実機は未検証。

## 1. 目的と参照先

争点・候補者への評価を読み、議席配分を仮定し、議会権限への影響を理解する。新しい出来事や予定の結果を継続して確認する。

- [公開サイト](https://guchio2366-dev.github.io/us-midterms-2026/)
- [README：構成・開発方法](README.md)
- [定点観測の更新手順](docs/observation/README.md)
- [定点観測の実行記録](docs/observation/runs/)
- [GitHub Actions](https://github.com/guchio2366-dev/us-midterms-2026/actions)
- [Notion：開発・運用の引継ぎ](https://app.notion.com/p/3da340138e7381549fe6c596bc794a62?pvs=204)

情報が食い違う場合は、最新の利用者との合意を要件の基準とし、実装状況はコード、公開状況は該当コミットの配備結果、調査状況は実行記録で確認する。本書・Notion・過去の会話だけを根拠に完了と扱わない。

## 2. 実装済みの状態

| 領域 | 確認した状態 | 実装・証拠 |
| --- | --- | --- |
| 冒頭 | iPad横で左に現在議席・改選範囲・論点、右に上院の暫定配分と51議席への配分例。注釈は開閉欄へ集約 | [実装記録](docs/ux-layout-implementation-20260915.md) |
| 直近の更新 | 注目8選挙を州名順のタブで切替。右側にニュース・今後の予定を配置し、見出しの縦縮小を防止 | [実装記録](docs/ux-layout-implementation-20260915.md) |
| 議席評価 | SabatoとInside Electionsの方向が一致する選挙を党派側へ配分。不一致・接戦は未配分。地図とシミュレーションは同じ統合評価を参照 | [評価集計](src/rating-consensus.ts)、[評価スナップショット](src/data/rating-snapshot.ts) |
| 暫定配分 | 非改選D34・R31に改選D側12・R側17を加え、D46・R48・未配分6。勝率・確定結果ではない | [初期値](src/scenario/baseline.ts)、[検証](tests/rating-consensus.test.ts) |
| ニュース | 既存12記事と分析更新16件を「最近のニュース」に統合。旧「直近の重要な更新」の独立欄は撤去。10件ごとにページング | [共通フィード](src/news-feed.ts)、[検証](tests/news-feed.test.ts) |
| 今後の予定 | 公開9件（統計公表3件、メーン討論会4件、アラスカ関連法案審議1件、ミシガン討論会1件）。同じ欄のタブで切替。州による絞込み、延期・中止・結果確認待ち、結果記事との相互参照に対応 | [観測データ](src/data/observation.json)、[予定ロジック](src/observation-logic.ts) |
| 接戦州 | Toss Up・評価分裂・Leanの8選挙を切替可能。AK・ME・MI・NH・OH特別・TXの6選挙には詳しい判断材料を公開 | [観測データ](src/data/observation.json)、[表示](src/ui/observation.ts) |
| 候補者比較 | 主要2候補の同じ項目を左右に同時表示。主要3項目を初期表示し、評価・受け止めの2項目はまとめて展開 | [観測データ](src/data/observation.json)、[表示](src/ui/observation.ts) |
| シミュレーション | 候補者・会派選択、未配分、権限から複数経路の提示、自動保存・名前付き保存・比較・共有URL。保存した基準を最新評価で勝手に上書きしない | [シナリオ](src/scenario/)、[経路](src/scenario/paths.ts) |
| 小さい画面 | 縦並びへ切替。スマホのニュースは高さ制限のある枠内スクロール。表示件数は文字量・画面寸法によって変わる | [style.css](src/style.css) |
| 基礎情報 | 上院100議席・35選挙（通常33＋特別2）、下院435区、50州背景、8論点と議会権限 | [データ](src/data/)、[基礎検証](tests/data.test.ts) |

件数・議席数は上記コミット時点の収録値であり、将来の更新時にはデータから再確認する。2機関の資料確認日は同一ではなく、スナップショットの基準日を全出典の再確認日と扱わない。

## 3. 二つの「重点6州」を区別する

| 調査層 | 対象 | 意味 |
| --- | --- | --- |
| 9月11日の研究第一波 | AK・IA・ME・MI・OH特別・TX | Poll、RaceBrief、CandidateBrief、評価履歴などを先に収録した範囲 |
| 9月13日の接戦州観測 | AK・ME・MI・NH・OH特別・TX | 現行の統合評価の未配分6選挙に対する判断材料・比較・予定 |

Iowaの既存研究を削除したわけではない。New Hampshireは後から観測対象へ追加した。対象と完成度はモジュールごとに確認する。

## 4. 定点観測の運用状態

- [9月16日の日次観測](docs/observation/runs/daily-20260916.json)は `partial`。NHの46%対46%の新調査、TXの候補者広告、MEの判事承認票、MIの討論会辞退と10月8日の次回予定、OHの政治資金報道を原文照合して追加。ME名簿とInside Elections全35選挙は照合したが、OH/NH名簿・Sabatoは未完了。統合評価・議席基準・保存案・共有URLは維持した。
- [9月15日の日次観測](docs/observation/runs/daily-20260915.json)は `partial`。既存の日次23情報源中18件と新規4件の対象箇所を照合。AKの漁業討論会と9月16日の法案審議予定、MEのマンチン推薦発表を追加。AK取材への接続は回復したが、ME名簿全体・OH/NH名簿・Sabato・Ohio取材の本文照合は未完了。全35選挙の評価差分は未完了のため、既存の統合評価と議席基準を保持した。
- 更新記事は州・党派・氏名・立場を冒頭に示し、利用者向け通知では前後の出来事と対戦構図も説明する。[編集方針](docs/observation/README.md)を参照。確認だけの州の分析更新日は進めない。

- 予約設定は毎日09:00 Asia/Tokyo、月曜は候補者比較・反証を再点検。初回予定は2026-09-14 09:00 JST。[設定の記録](docs/observation/schedule.json)は管理情報の写しであり、予約サービスの実行成功を保証しない。
- [9月14日の初回定期実行](docs/observation/runs/daily-20260914.json)は `partial`。登録43情報源のうち38件を照合し、Maine・New Hampshire・Ohioの一部名簿、Sabato、Alaska Public Mediaの一覧は再確認待ち。ミシガンの大会での攻防・Rogersの居住歴と、テキサスの広告投下を更新した。
- 9月14日の更新はコミット [`937ba4c`](https://github.com/guchio2366-dev/us-midterms-2026/commit/937ba4c3af859eeb3cbfea1b651575c68f57a322) に反映し、[GitHub Pages配備](https://github.com/guchio2366-dev/us-midterms-2026/actions/runs/34792436142) のテスト・ビルド・配備が成功。公開画面で2件の新しい更新と分析更新日を確認した。
- [初回の手動確認](docs/observation/runs/initial-20260913.json)は履歴として保持する。画面の監視表示、予約状態、調査完了、公開完了は引き続き分けて扱う。

## 5. 未完了・制約

1. 最新の日次観測には未完了の情報源・新規記事リードがある。詳細は上記の最新実行記録を参照。取得失敗や照合待ちを「変化なし」とせず、次回以降も情報源別の結果を残す。
2. 8論点レポートは部分公開。全州・全候補を同じ深さで調査したものではない。争点から投票変化・勝率を推定する因果モデル、調査平均、Xの自動話題抽出は未実装。
3. 公開Chromeで代表操作と長文表示を検証した。指定寸法のiPad・iPhoneおよび実機Safariは未検証。CI成功と実機の見た目の検証を混同しない。DE・RIなどの名簿状態、情報源別の対象時点も必要な更新時に再照合する。

追加工程：[設計](docs/data-ui-analysis-design-20260914.md)に基づきAを一巡し、8論点を各5節と新規8事例で拡充した。[実装記録](docs/data-ui-analysis-implementation-20260914.md)、[画面検証](docs/verification/ui-review-20260914.md)。C1・C2・C3の公開成功を確認。5情報源の内容照合と指定端末での表示検証は継続待ち。全8論点は証拠の不足を明示してpartialを維持する。

UI改善：[概説・直近の更新・州詳細のUX改善設計](docs/ux-layout-design-20260915.md)に基づく実装を公開。[実装記録](docs/ux-layout-implementation-20260915.md)に変更箇所と検証結果を記録した。GitHub反映・Actions・公開Chromeでの代表操作は確認済み。指定寸法・Safari実機は未確認。8論点の内容再設計・個別共有と一括校正は別工程として保留。

## 6. 設計書と実装の対応

| 文書 | 位置づけ・後続変更 |
| --- | --- |
| [概説・更新欄・州詳細のUX改善](docs/ux-layout-design-20260915.md) | 利用者の①〜⑪の合意を反映した後続設計。[実装記録](docs/ux-layout-implementation-20260915.md)あり。PR #13・Pages公開済み |
| [冒頭の概説設計](docs/intro-overview-design-20260913.md) | 作成時の設計記録。[実装報告](docs/intro-overview-implementation-20260913.md)あり。制度説明の置き場などは後続設計を優先 |
| [議席比較・iPad設計](docs/seat-comparison-ipad-design-20260913.md) | 議席比較・制度説明・地図と州詳細を実装。全国情勢の列構成、シミュレーションの初期値は後続実装で更新 |
| [接戦州観測設計](docs/observation/design.md) | 6州の詳説と観測データを実装。重要更新・予定の配置は次の統合設計で変更 |
| [ニュース統合設計](docs/observation/news-integration-design.md) | 3列とニュース・予定統合を実装。対応コミット：03861e3、727fa2c |
| [調査・分類・計算方法](RESEARCH_AND_METHOD.md) | 9月11日までの研究方式と収録状態。後続の評価統合・経路提示・ニュース導線は本書と実コードを参照 |
| [旧監査書](CURRENT_STATE_20260909.md)、[依頼01結果](TASK_01_RESULT.md)、[基礎照合記録](DATA_VERIFICATION.md) | 9月9日の工程別履歴。現在の未完了タスク一覧として使用しない |

## 7. 更新時の引継ぎルール

- 機能・対象範囲・制約・運用状態を変えた担当が、対応する本書の行を更新する。実装、公開、未確認を分け、確認したコミットまたは実行記録を示す。
- READMEは安定した案内・開発方法を扱い、変動する件数や進捗は本書へ集約する。日次の確認詳細は `docs/observation/runs/` と観測データに残す。
- 設計書は作成時の根拠を保存し、冒頭に実装済み範囲と後続変更へのリンクを追加する。古い記述を根拠に実装済み機能を作り直さない。
- Notionは入口・目的・参照先・更新規則を保持する。件数や実行状態の全文コピーは増やさず、GitHubの正本を参照する。目的や参照先が変わったときだけNotionも更新する。
- 作業終了時に最新mainとの差分、関連リンク、公開に関わる場合は該当コミットのActionsを確認する。未確認・失敗を完了や「変化なし」に置き換えない。
