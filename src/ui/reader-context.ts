import { houseSnapshot } from '../data/house';
import { sources } from '../data/data';
import { ROSTER_VERIFIED_AT } from '../data/verified-roster';
import { escapeHtml as esc } from './research';

/** Membership snapshots have their own dates, independent of news and rating updates. */
export function readerCompositionSourcesMarkup(chamber:'senate'|'house'|'both'='both') {
  const houseSource=sources.find(source=>source.sourceId===houseSnapshot.sourceIds[0]);
  const ids=chamber==='senate' ? ['senate-members','democratic-caucus','republican-conference']
    : chamber==='house' ? houseSnapshot.sourceIds
    : ['senate-members','democratic-caucus','republican-conference',...houseSnapshot.sourceIds];
  const links=ids
    .flatMap(id=>{
      const source=sources.find(item=>item.sourceId===id);
      return source ? [`<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a>`] : [];
    }).join('／');
  const senateDate=`上院 ${esc(ROSTER_VERIFIED_AT)}確認`;
  const houseDate=`下院 ${esc(houseSnapshot.asOf)}時点${houseSource?.contentVerifiedAt ? `（${esc(houseSource.contentVerifiedAt)}確認）` : ''}`;
  const date=chamber==='senate' ? senateDate : chamber==='house' ? houseDate : `${senateDate}／${houseDate}`;
  return `<p class="reader-composition-date">議席資料の時点：${date}。日々のニュース・情勢評価の更新日とは異なります。</p><details class="reader-membership-sources"><summary>名簿・会派の出典</summary><p class="reader-context-source-line">${links}</p></details>`;
}

/** Institutional context checked against the linked official sources on 2026-10-06. */
export function readerMechanismContextMarkup() {
  return `<div class="reader-mechanism-context">
    <h3>政権への評価と、候補者選び</h3>
    <p>大統領を選び直す選挙ではありません。トランプ政権への評価が投票に表れるとしても、結果によって大統領の続投・退任を決める制度上の信任投票ではありません。議会の構成が変わることで、政権が政策を進める条件が変わります。</p>
    <p>多くの州では、予備選などを通じて党の本選候補を選びます。届け出や本選進出のルールは州ごとに異なり、トランプ氏の推薦は政治的な支持表明です。推薦の有無が立候補の許可を決めるわけではありません。大統領・副大統領候補を選ぶ全国党大会は、これとは別の手続です。</p>
    <details class="reader-context-sources"><summary>制度の出典</summary><ul>
      <li><a href="https://www.usa.gov/midterm-elections" target="_blank" rel="noopener noreferrer">USAGov：連邦議会選挙と中間選挙</a></li>
      <li><a href="https://www.archives.gov/founding-docs/constitution-transcript" target="_blank" rel="noopener noreferrer">米国立公文書館：憲法第2条（大統領の任期・罷免）</a></li>
      <li><a href="https://www.usa.gov/voting-political-party" target="_blank" rel="noopener noreferrer">USAGov：政党と予備選での投票</a>／<a href="https://www.fec.gov/introduction-campaign-finance/election-results-and-voting-information/#placing-candidates-on-the-ballot" target="_blank" rel="noopener noreferrer">FEC：州法に基づく候補者の投票用紙への掲載</a></li>
      <li><a href="https://www.usa.gov/national-conventions" target="_blank" rel="noopener noreferrer">USAGov：大統領候補を選ぶ全国党大会</a></li>
    </ul><p>制度資料の内容確認：2026-10-06。「信任投票」との違いは、この制度に基づく説明です。現在の世論を測ったものではありません。</p></details>
  </div>`;
}

export function readerMajorityContextMarkup() {
  const houseMajority = Math.floor(houseSnapshot.total / 2) + 1;
  return `<div class="reader-majority-context">
    <p>下院は全${houseSnapshot.total}議席を選び直します。全議席が埋まる場合、過半数は${houseMajority}議席です。上院は今回選ばない議席が残るため、非改選分を含む配分で多数派への条件を確かめます。</p>
    <h3>多数派と、一つひとつの政策への賛否</h3>
    <p>多数派は議題や委員会運営に大きく関わります。ただし、同じ党でも個々の政策への賛否は一致するとは限らず、僅差の多数派ほど少数の異論が採決を左右します。党の議席数と、候補者の公約・過去の採決を合わせて読む必要があります。</p>
    <p>法律の成立には原則として両院で同じ内容を可決し、大統領への手続を経ます。拒否権を覆す場合や上院の討論終結など、案件ごとの条件もあります。<a href="#powers">権限と採決条件を詳しく読む</a></p>
    <p class="reader-context-source-line">制度の出典：<a href="https://www.house.gov/the-house-explained/the-legislative-process" target="_blank" rel="noopener noreferrer">米下院：立法過程</a>／<a href="https://www.house.gov/the-house-explained/the-legislative-process/to-the-president" target="_blank" rel="noopener noreferrer">大統領への送付と拒否権</a>／<a href="https://www.senate.gov/legislative/LIS/roll_call_votes/vote1192/vote_119_2_00252.htm" target="_blank" rel="noopener noreferrer">米上院：議員ごとの採決記録の例</a>（内容確認 2026-10-06）</p>
  </div>`;
}
