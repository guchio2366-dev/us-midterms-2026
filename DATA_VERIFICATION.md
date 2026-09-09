# 上院基礎情報の一次資料照合

確認日・データ基準日：2026-09-09（UTC）。作業開始時の main：`b3a0cbe9bd55173bb4af7a7cd6cdaf91bbb13dd3`。

## 確認範囲と結果

現職100人、党籍、会派、空席の有無、議席Class、議席の6年任期、2026年通常33選挙・特別2選挙の基礎情報、現副大統領を一次資料で照合した。候補者・情勢評価・州別背景・年表の完成を意味しない。

| 項目 | 確認結果 |
| --- | --- |
| 州・議席 | 50州、100の一意な議席、各州2議席、空席0 |
| 党籍 | 共和党53、民主党45、無所属2 |
| 会派 | 共和党会派53、民主党会派47 |
| Class | I：33、II：33、III：34 |
| 選挙対象 | 通常33、特別2、重複のない35議席、非改選65議席 |
| 防衛する議席 | 共和党会派22（通常20・特別2）、民主党会派13 |
| 非改選の会派 | 共和党31、民主党34 |

現職名の更新漏れは次の2件。党籍・会派はいずれも共和党で、全体の構成は変わらない。[上院公式名簿](https://www.senate.gov/senators/)と[Class II一覧](https://www.senate.gov/senators/Class_II.htm)で確認した。

| 議席 | 以前の表示 | 確認後 |
| --- | --- | --- |
| OK-2 | Markwayne Mullin | Alan Armstrong |
| SC-2 | Lindsey Graham | Darline Graham |

## 照合方法と出典

- [上院公式名簿XML](https://www.senate.gov/general/contact_information/senators_cfm.xml)の全100件から、原表記、Bioguide ID、州・Classによる議席ID、党籍、公式サイトを抽出し、アプリの100議席と完全一致を確認。`verified-roster.ts` に照合用の識別情報も保存した。画面では従来の一般的な名前表記を維持し、原表記とは区別している。
- [民主党会派名簿](https://www.democrats.senate.gov/about-senate-dems/our-caucus)47人、[共和党会派の議員一覧](https://www.republican.senate.gov/)53人と個別照合。97人は公式議員サイトのホスト名で対応させ、リンクのないArmstrong・Banks・Darline Grahamの3人は一覧内の氏名と州を確認した。無所属のKing・Sandersは民主党会派の名簿掲載を根拠に算入し、党籍からの自動変換はしない。
- 議席Classと任期は上院の[Class I](https://www.senate.gov/senators/Class_I.htm)、[Class II](https://www.senate.gov/senators/Class_II.htm)、[Class III](https://www.senate.gov/senators/Class_III.htm)の個別一覧で確認した。
- [党派構成表](https://www.senate.gov/history/partydiv.htm)の119th Congress欄でR53・D45・I2を総数として照合。過去の議会についての会派注記を現在の個人所属の根拠に流用しない。
- 一般選挙日11月3日は[FECの2026年日程PDF](https://www.fec.gov/resources/cms-content/documents/2026pdates.pdf)を参照。通常選挙の新任期はClass IIの終了日と[憲法修正17条・20条](https://www.senate.gov/about/origins-foundations/senate-and-constitution/constitution.htm)から2027-01-03〜2033-01-03とした。

XML内の更新時刻は `2026-08-03T09:54-05:00`。これは9月9日の取得・内容確認日とは別の属性に保存した。資料に公開日がない場合は `publishedAt: null` のままにしている。未調査のCensus・BLS・BEA資料の取得・確認日もnullのまま。

## 特別選挙の扱い

| 議席 | 投票日 | 残任期の終了 | 開始の扱い |
| --- | --- | --- | --- |
| FL-3（Ashley Moody） | 2026-11-03 | 2029-01-03 | 就任日未定。州法の補充規定を別途表示 |
| OH-3（Jon Husted） | 2026-11-03 | 2029-01-03 | 就任日未定。州法上の暫定任命期限と実際の宣誓日を区別 |

フロリダは州当局の[2026年選挙対象公職](https://dos.fl.gov/elections/candidates-committees/offices-up-for-election/)と[日程](https://dos.fl.gov/elections/for-voters/election-dates/)、Miami-Dade郡の[一般選挙公式投票用紙p.1](https://www.miamidade.gov/elections/library/2026-11-03-general-election-master-ballot.pdf)、上院Class III一覧、[州法100.161](https://www.flsenate.gov/Laws/Statutes/2026/100.161)を組み合わせて対象議席と欠員補充選挙であることを照合した。

オハイオはFranklin郡選挙管理委員会の[2026年選挙日程p.1](https://vote.franklincountyohio.gov/getmedia/5a24ba93-6eaa-4cfe-ad8c-77c5aed0e496/2026-Election-Schedule-with-Candidate-Requirements-6)に、Hustedの上院議席・2029-01-03までの残任期・11月3日の一般選挙日がある。[州法3521.02](https://codes.ohio.gov/ohio-revised-code/section-3521.02)は暫定任命の在職期限を対象選挙後の12月15日としている。実際の宣誓日がその日に確定したとは扱わない。

`Election.termStart` のnullは、この2件では「将来の就任日が未定」を意味する。`termStartStatus: pending-inauguration` と根拠付きの `termStartRule` を伴い、調査未着手とは区別する。`Seat.termStart/termEnd` は議席の6年サイクルであり、途中就任した現職本人の在職期間ではない。

## 副大統領と多数派表示

[ホワイトハウスのJD Vance紹介](https://www.whitehouse.gov/administration/jd-vance/)で現副大統領と共和党所属を確認し、[上院の副大統領解説](https://www.senate.gov/about/officers-staff/vice-president.htm)で決裁票の規定を確認した。

シミュレーションでは「2027-01-03にもVanceが在職し、所属党側に決裁票を投じる」という将来の仮定を明示する。この前提で50対50なら共和党側と表示する。個別議員の投票行動や政策成立を予測する機能ではない。

## 実装と検証

- 議席・選挙・副大統領へ `verifiedAt` と項目別 `attributeSourceIds` を追加。出典の取得日・内容確認日・資料更新日は区別する。
- 「確認済み」なのに項目の出典がない、出典本文を未確認、確認日がない、参照IDが不正、といったレコードをデータ検証で拒否する。
- 未確認の議席所属は実数サマリーの確定会派に算入せず「未確認」に含める。ユーザーが明示した将来の仮定は別途適用できる。
- 画面上部は確認済み範囲を件数付きで表示。州詳細には氏名・会派等の項目別出典、特別選挙の任期規定、副大統領の出典を表示する。候補者・情勢・州解説の未調査状態は維持する。
- `npm test`：24テスト成功。100議席維持、35対象議席、更新漏れ2件、無所属の会派根拠、通常／特別の任期、出典不備の拒否、未確認値の集計、50対50判定を含む。
- `npm run build`：TypeScriptとViteの静的ビルド成功。

公開版の識別子は `verified01-2026-09-09`。公開先は [GitHub Pages](https://guchio2366-dev.github.io/us-midterms-2026/)。配備結果は当該PRとmainのActions実行で追跡する。iPad Safari実機・VoiceOver/NVDAの確認は別途必要。

## 取得資料の照合用ハッシュ

下記は今回取得した原文ファイルのSHA-256。サイトの将来更新で原文が変わりうるため、現在のURLの内容と永続的に同じであることを保証する値ではない。

| 資料 | SHA-256 |
| --- | --- |
| 上院名簿HTML | `986809537d7a656efaec0f9cd7ac96f01ab5d3aa9a4d6f5afe9f20a2b1383860` |
| 上院名簿XML | `984865a4a6e00af68c9617ea45f52b8939f49143780c832cb68c747fa4bfef5e` |
| Class I | `cfed4b2ffad38fd9edbee4a3a437e0478e6deb934b44db79ff340f818063b3d1` |
| Class II | `4b266287eaee132c92e34682ee1874835d31a382cbdb02b39e6ae9fd4af1a936` |
| Class III | `ba3cfd31a8a75e4336774f8b1ef90877bf4c06091e2e36180977258fbbec8249` |
| 民主党会派名簿 | `26979d043cd0f18cb373e777df41e4fbbe2cb01b4c1550de238eac95eaa52fdb` |
| 共和党会派一覧 | `72847b7fe4aa539c146698a02fbc2087dfbfdf2bdca1ecfa9153ebc65f257bf0` |

`CURRENT_STATE.md` と `TASK_01_RESULT.md` はそれぞれの作成時点の履歴であり、この照合後の最新状態は本書とREADMEを参照する。
