import { describe, expect, it } from 'vitest';
import { readerIntroduction, readerSections } from '../src/data/reader-journey';
import { houseSnapshot } from '../src/data/house';
import { readerCompositionSourcesMarkup, readerMajorityContextMarkup, readerMechanismContextMarkup } from '../src/ui/reader-context';
import { ROSTER_VERIFIED_AT } from '../src/data/verified-roster';
import { readerNavigationMarkup } from '../src/ui/reader-layout';

describe('four-stage reader contract',()=>{
  it('puts seat conditions before states and preserves the old semantic section IDs',()=>{
    expect(readerSections.map(({id,number,title})=>({id,number,title}))).toEqual([
      {id:'reader-01',number:'01',title:'中間選挙の仕組み'},
      {id:'reader-04',number:'02',title:'議会の議席配分'},
      {id:'reader-03',number:'03',title:'各州の情勢と候補者'},
      {id:'reader-06',number:'04',title:'今後の見通し'},
    ]);
    const navigation=readerNavigationMarkup();
    expect([...navigation.matchAll(/href="(#[^"]+)"/g)].map(match=>match[1])).toEqual([
      '#reader-01','#reader-04','#reader-03','#reader-06',
    ]);
    expect(navigation).not.toContain('href="#reader-02"');
    expect(navigation).not.toContain('href="#reader-05"');
    expect(navigation).toContain('<span class="reader-nav-phrase">仕組み</span>');
    expect(navigation).toContain('<span class="reader-nav-phrase">候補者</span>');
    expect(readerIntroduction).toContain('米国中間選挙の動向と見通しを、自ら判断できるようになるサイトです。');
  });

  it('keeps membership dates and sources next to the current-seat table',()=>{
    const html=readerCompositionSourcesMarkup();
    expect(html).toContain(`上院 ${ROSTER_VERIFIED_AT}確認`);
    expect(html).toContain(`下院 ${houseSnapshot.asOf}時点`);
    expect(html).toContain('日々のニュース・情勢評価の更新日とは異なります');
    expect(html).toContain('https://www.senate.gov/senators/');
    expect(html).toContain('https://www.democrats.senate.gov/about-senate-dems/our-caucus');
    expect(html).toContain('https://clerk.house.gov/xml/lists/MemberData.xml');
  });

  it('distinguishes political evaluation, state nomination rules and endorsements with official sources',()=>{
    const html=readerMechanismContextMarkup();
    expect(html).toContain('大統領を選び直す選挙ではありません');
    expect(html).toContain('制度上の信任投票ではありません');
    expect(html).toContain('多くの州では、予備選など');
    expect(html).toContain('推薦の有無が立候補の許可を決めるわけではありません');
    expect(html).toContain('大統領・副大統領候補を選ぶ全国党大会');
    for(const source of ['usa.gov/midterm-elections','archives.gov/founding-docs/constitution-transcript',
      'fec.gov/introduction-campaign-finance/election-results-and-voting-information/', 'usa.gov/national-conventions']) {
      expect(html).toContain(`https://www.${source}`);
    }
    expect(html).not.toMatch(/<form|<input|data-scenario/);
  });

  it('connects majority conditions with individual policy votes without changing seat math',()=>{
    const html=readerMajorityContextMarkup();
    expect(html).toContain(`全${houseSnapshot.total}議席`);
    expect(html).toContain(`過半数は${Math.floor(houseSnapshot.total/2)+1}議席`);
    expect(html).toContain('同じ党でも個々の政策への賛否は一致するとは限らず');
    expect(html).toContain('拒否権を覆す場合');
    expect(html).toContain('href="#powers"');
    expect(html).not.toContain('大統領の署名が必ず');
    expect(html).not.toMatch(/<form|<input|data-scenario/);
  });
});
