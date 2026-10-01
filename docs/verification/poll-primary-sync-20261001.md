# HPU・Foxの支持率データ同期（2026-10-01）

既存ニュースの一次資料を再照合し、NCのHPU投票予定者集計とMIのFox投票予定者・登録有権者集計を公開Pollへ追加した。MIの2集計は同じstudyIdで束ねる。州別の結論・棒グラフ・解釈・次に確認する事項を同じ資料へそろえ、元のsourceId・evidenceId・ニュース更新IDは保持した。

確認日は2026-10-01 UTC（確認時は同日JST）。実査日、公表日、確認日を分ける。今回の再照合は日次監視全体の完了ではなく、monitorの完了日時・latestRunを更新していない。

## 原資料で確認した範囲

| 原資料 | 実査・対象 | 公表結果 | 方法と留保 |
| --- | --- | --- | --- |
| [HPU Poll 127](https://www.highpoint.edu/blog/2026/09/hpu-poll-127-north-carolina-likely-voters-weigh-in-on-u-s-senate-race-and-more/)（9月24日公表） | 9月6〜16日。成人1,003人、登録有権者813人のうちLV706人 | Cooper50%、Whatley42%、他候補3%、未定5% | Dynata非確率オンラインパネルをQualtricsで調査。登録有権者の7項目中5〜7点をLVに分類。LV credibility interval ±3.9ポイント。大学は通常の無作為標本の標本誤差を付けるのは不適切と明記 |
| [Fox Michigan原表](https://static.foxnews.com/foxnews.com/content/uploads/2026/09/fox_september-24-28-2026_michigan_topline_september-30-release.pdf)（9月30日公表） | 9月24〜28日。RV1,203人、LV1,028人 | Q3：LV El-Sayed50%、Rogers49%、未定1%。RV51%、48%、未定1% | 州有権者名簿から無作為抽出。有人固定電話114人・携帯794人・SMSからウェブ295人。LVは投票履歴・関心・投票意向と属性の統計モデル。標本誤差LV ±3、RV ±2.5ポイント |

HPUは公開ページのU.S. Senate Election設問とMethodologyを確認。FoxはPDFの1ページ目のMethodologyと3ページ目のQ3を確認した。Q3は未定者への傾きの追質問を含む。追質問前の候補者支持率を作らない。OtherとWouldn’t voteは各*（0.5%未満）で公表されるため、0%や任意の数値には置き換えない。棒では確認できた整数値だけを表示し、部分公開・丸めとして注記する。

## 保存した取得証拠

原資料・取得証拠は公開リポジトリの外、作業ルートの `poll-source-artifacts-20261001/` に保持する。PDF・原文全文をリポジトリへ再配布しない。

| ローカル取得物 | SHA-256 | 取得状況 |
| --- | --- | --- |
| `fox-mi-sept2026.pdf`（577,846 bytes） | `9d8e1b85183d5040ba1ac3c4ff746005590326a1a8a5c1c5c0fd9b7d8d25a783` | 一次URLから直接取得したPDFのバイト列 |
| `hpu127-web-extract.txt` | `27156041495bd3b2f3ed98483d2209b12520e634af044ea5abb2851ef4e02b89` | web取得で確認した設問・方法の限定抽出。原HTMLのバイト列のhashではない |

HPUの直接HTML取得はCloudflareのJavaScript確認画面となり失敗した。webで大学の同じ一次URLの内容を取得・照合できたため、この制約と取得経路をsource.methodにも記録した。hashは上記ローカル抽出物の同一性を示し、サイトの原HTMLとの同一性を証明しない。

## 未確認の資料と維持した区別

NC AARPの原ページ・PDFは今回再照合できていない。既存の `obs-aarp-nc-20260928` / `ev-obs-aarp-nc-20260928` と、9月29日確認のニュース記録は保持し、公開Pollへ追加していない。記録済みのLV1,115人・53%対42%や50歳以上の内訳を今回の確認済み資料へ分類し直していない。

NCは単回の非確率パネルで、全体差から党派別の支持拡大は断定しない。MIは同一時期のLV/RVの差で、独立した2調査・支持の時系列移動・実投票率とは扱わない。平均・勝率・評価スナップショット・議席基準・保存形式は変更していない。

## 検証

対象は `poll-primary-sync.test.ts`、`briefing-polls.test.ts`、`briefing-evidence.test.ts`、`focus-research.test.ts`、`data.test.ts`、`observation.test.ts`。新しい人口集計・leaner段階・抑制値・確認日と公表日の区別、一次出典参照、結論と直接グラフの対応、同じPollの重複表示がないこと、AARPを未確認Pollへ追加しないことを検証する。

2026-10-01の実行で6ファイル・99テストが成功（Vitest 4.1.11、終了コード0）。実行結果は作業ルートの `poll-source-artifacts-20261001/focused-tests.log` に記録。通常sandboxではesbuildが上位ディレクトリを読めずテスト開始前に起動失敗したため、同じ対象を許可された環境で再実行して成功した。全体CI・本番ビルド・公開ブラウザ確認は統合作業で実施し、この文書のデータ検証から公開成功は推定しない。
