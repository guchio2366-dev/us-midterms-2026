import { createHash } from 'node:crypto';
import { describe,expect,it } from 'vitest';
import approvedCopy from '../src/data/approved-reader-copy.json';
import { approvedAboutParagraphs,approvedAllocationParagraphs,approvedInstitutionParagraphs } from '../src/ui/approved-reader-copy';
import { currentReaderCopyFacts,introductionMarkup,nationalOverviewMarkup } from '../src/ui/overview';

const decode=(html:string)=>html.replace(/<[^>]*>/g,'').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#039;',"'").replaceAll('&amp;','&');
const blocks=(html:string,prefix:string)=>[...html.matchAll(new RegExp(`<p data-approved-copy="(${prefix}-[0-9]+)">([\\s\\S]*?)<\\/p>`,'g'))].map(match=>({id:match[1],text:decode(match[2])}));
const dateJa=(date:string,year=true)=>{const[y,m,d]=date.split('-');return `${year?`${y}年`:''}${Number(m)}月${Number(d)}日`;};
const facts=currentReaderCopyFacts();

/** Full expected paragraphs, with only the separately documented factual corrections. */
function expectedAllocation() {
  const source=approvedCopy.sections['上院の情勢と51議席への配分'].map(item=>item.text);
  return [
    source[0],
    source[1],
    source[2].replace('両方が同じ党を優勢と評価している議席','両方が同じ党についてLikely（優勢）以上と評価している議席')
      .replace('「やや優勢」など優位の小さい評価でも、2機関の方向が一致していれば配分に含めます。','「やや優勢」（Lean）や「わずかに優勢」（Tilt）は、2機関の方向が一致していても未配分に含めます。'),
    source[3].replace('民主党側が12議席、共和党側が16議席',`民主党側が${facts.allocatedDemocratic}議席、共和党側が${facts.allocatedRepublican}議席`)
      .replace('民主党側46議席、共和党側47議席',`民主党側${facts.fixedDemocratic+facts.allocatedDemocratic}議席、共和党側${facts.fixedRepublican+facts.allocatedRepublican}議席`),
    source[4].replaceAll('7議席',`${facts.unallocated}議席`)
      .replace(`残る${facts.unallocated}議席は、`,`残る${facts.unallocated}議席は、少なくとも一方が「やや優勢」（Lean）や「わずかに優勢」（Tilt）と評価している場合、`)
      .replace('評価の方向が一致していない議席です。','配分基準を満たしていない議席です。'),
    source[5].replace('2026年9月24日',dateJa(facts.ratingAsOf))
      .replace('Sabatoは9月24日',`Sabatoは${facts.sabatoConfirmedAt.map(date=>dateJa(date,false)).join('・')}`)
      .replace('Inside Electionsは9月18日',`Inside Electionsは${facts.insideConfirmedAt.map(date=>dateJa(date,false)).join('・')}`),
    source[6],
  ];
}

describe('complete approved reader prose, protected against summarization',()=>{
  it('locks the full approved source fixture, not a set of keywords',()=>{
    // Change only after an explicitly reviewed new source; never update to accommodate an accidental rewrite.
    expect(createHash('sha256').update(JSON.stringify(approvedCopy)).digest('hex')).toBe('d96f72f3ac7817b92397f33ef176affdb4bdfcd707d748471a34b29a68f1e959');
    expect(Object.values(approvedCopy.sections).map(paragraphs=>paragraphs.length)).toEqual([4,5,7]);
  });

  it('renders every word of the purpose, all three goals and their explanatory sentences',()=>{
    const expected=approvedCopy.sections['このサイトについて'].map(item=>item.text);
    expect(approvedAboutParagraphs().map(item=>item.text)).toEqual(expected);
    expect(blocks(introductionMarkup(),'about')).toEqual(expected.map((text,index)=>({id:`about-${index}`,text})));
  });

  it('renders every word of all five institutional paragraphs in order',()=>{
    const expected=approvedCopy.sections['米国中間選挙の概説'].map(item=>item.text);
    expect(approvedInstitutionParagraphs(facts).map(item=>item.text)).toEqual(expected);
    expect(blocks(introductionMarkup(),'institution')).toEqual(expected.map((text,index)=>({id:`institution-${index}`,text})));
  });

  it('renders all seven allocation paragraphs in order with explicit current-method/count/date substitutions',()=>{
    const expected=expectedAllocation();
    expect(approvedAllocationParagraphs(facts).map(item=>item.text)).toEqual(expected);
    expect(blocks(nationalOverviewMarkup(),'allocation')).toEqual(expected.map((text,index)=>({id:`allocation-${index}`,text})));
  });

  it('does not put any required approved paragraph inside a disclosure',()=>{
    for(const html of [introductionMarkup(),nationalOverviewMarkup()]) {
      for(const match of html.matchAll(/<p data-approved-copy="[^"]+">/g)) {
        const tags=[...html.slice(0,match.index).matchAll(/<details\b[^>]*>|<\/details>/g)];
        expect(tags.reduce((depth,tag)=>depth+(tag[0].startsWith('</')?-1:1),0)).toBe(0);
      }
    }
  });

  it('keeps every approved source link alongside its paragraph',()=>{
    const html=introductionMarkup()+nationalOverviewMarkup();
    for(const paragraphs of Object.values(approvedCopy.sections)) for(const paragraph of paragraphs) {
      for(const link of paragraph.links) expect(html).toContain(`href="${link.url}"`);
    }
  });

  it('updates the variable facts without dropping the surrounding explanations',()=>{
    const changed={...facts,allocatedDemocratic:10,allocatedRepublican:13,unallocated:12,
      ratingAsOf:'2026-10-07',sabatoConfirmedAt:['2026-10-06'],insideConfirmedAt:['2026-10-07']};
    const actual=approvedAllocationParagraphs(changed).map(item=>item.text);
    const expected=expectedAllocation();
    expected[3]=expected[3].replace('民主党側が9議席、共和党側が14議席','民主党側が10議席、共和党側が13議席')
      .replace('民主党側43議席、共和党側45議席','民主党側44議席、共和党側44議席');
    expected[5]='この配分の集計基準日は2026年10月7日です。機関ごとの確認日は異なり、Sabatoは10月6日、Inside Electionsは10月7日の記録を使っています。';
    expect(actual).toEqual(expected);
  });
});
