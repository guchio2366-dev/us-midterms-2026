import { texasPollContext as context, texasPollContextSources } from '../data/texas-poll-context';
import { escapeHtml as esc } from './research';

/** Only the Texas briefing has this pilot; no current poll or scenario data is changed. */
export function texasPollContextMarkup(electionId: string): string {
  if (electionId !== context.electionId) return '';
  const races = [context.president, context.senate];
  const pollMargin = (race: typeof races[number]) => race.pollR - race.pollD;
  const resultMargin = (race: typeof races[number]) => 100 * (race.votesR - race.votesD) / race.totalValidVotes;
  const relativePoll = pollMargin(context.president) - pollMargin(context.senate);
  const relativeResult = resultMargin(context.president) - resultMargin(context.senate);
  return `<section class="texas-poll-context" aria-label="テキサスの過去調査から読むポイント">
    <p class="texas-context-eyebrow">過去の投票から読む</p>
    <h4>共和党が強い州でも、<br>候補者によって差は変わる</h4>
    <p>2024年は、上院選のほうが大統領選より共和党の勝ち幅が小さかった。同じ調査の中にも、この違いが表れていた。</p>
    <table class="texas-context-table">
      <caption>2024年｜共和党候補のリード幅<span>単位：ポイント</span></caption>
      <thead><tr><th scope="col">選挙</th><th scope="col">Emerson調査</th><th scope="col">実結果</th></tr></thead>
      <tbody>${races.map(race => `<tr><th scope="row">${esc(race.label)}</th><td>${pollMargin(race).toFixed(1)}</td><td>${resultMargin(race).toFixed(1)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><th scope="row">上院で縮まった差</th><td>${relativePoll.toFixed(1)}</td><td>${relativeResult.toFixed(1)}</td></tr></tfoot>
    </table>
    <p class="texas-context-limit">ただし、上院の差は調査では1.0ポイント、実結果は8.5ポイントで、大きく外れた。今回の支持率を補正する数字ではない。</p>
    <p class="texas-context-next"><b>今年はここを見る</b>自党の支持を固め、無党派にも広げられるか。候補別の支持率と、党派別の内訳を併せて追いたい。</p>
    <details class="texas-context-details"><summary>比較の条件・計算・出典</summary>
      <p>調査は${esc(context.fieldStart)}〜${esc(context.fieldEnd)}、投票予定者${context.sampleSize}人。携帯へのMMSからウェブ回答、固定電話の自動音声、CINTオンラインパネルを併用。投票日は2024年11月5日で、調査終了から15日ある。</p>
      <p>大統領選はトランプ対ハリス、上院選はクルーズ対オルレッド。同じ調査の2設問を比較しており、独立した2調査ではない。</p>
      <p>リード幅＝共和候補の割合−民主候補の割合。実結果は各選挙の全有効票を分母に計算し、小数第1位へ丸めた。「上院で縮まった差」は大統領選と上院選のリード幅の差で、候補者本人の得票率の上乗せや、分割投票した人数を示さない。</p>
      <p>一つの調査・選挙の事例であり、相対差なら常に正確という意味ではない。調査後の情勢変化や第三候補なども関わるため、違いの原因を候補者や調査方式だけに特定できない。</p>
      <ul>${texasPollContextSources.map(source => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)}：${esc(source.title)}</a></li>`).join('')}</ul>
      <small>資料確認 ${esc(context.checkedAt)}</small>
    </details>
  </section>`;
}
