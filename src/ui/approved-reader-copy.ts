import approvedCopy from '../data/approved-reader-copy.json';
import { escapeHtml as esc } from './research';

export type ApprovedParagraph = {text:string;links:{label:string;url:string}[]};
export interface ReaderCopyFacts {
  senateTotal:number; contested:number; houseTotal:number; regular:number; special:number; stateCount:number;
  fixedDemocratic:number; fixedRepublican:number; allocatedDemocratic:number; allocatedRepublican:number;
  unallocated:number; ratingAsOf:string; sabatoConfirmedAt:string[]; insideConfirmedAt:string[];
  electionDate:string; vicePresident:{name:string;party:string;verificationStatus:string};
}

/** The approved prose is immutable; only the explicit factual substitutions below are permitted. */
function replaceFact(text:string,source:string,replacement:string) {
  if(!text.includes(source)) throw new Error(`Approved copy fragment is missing: ${source}`);
  return text.replace(source,replacement);
}
function dateJa(date:string,year=true) {
  const [y,m,d]=date.split('-');
  return `${year ? `${y}年` : ''}${Number(m)}月${Number(d)}日`;
}
function paragraph(paragraph:ApprovedParagraph,text:string):ApprovedParagraph {return {...paragraph,text};}

export function approvedAboutParagraphs():ApprovedParagraph[] {
  const source:ApprovedParagraph[]=approvedCopy.sections['このサイトについて'];
  return source.map(item=>({...item,links:item.links.map(link=>({...link}))}));
}

export function approvedInstitutionParagraphs(facts:ReaderCopyFacts):ApprovedParagraph[] {
  const source=approvedCopy.sections['米国中間選挙の概説'];
  return source.map((item,index)=>{
    let text=item.text;
    if(index===0) text=replaceFact(text,'2026年の投票日は11月3日です。',`${facts.electionDate.slice(0,4)}年の投票日は${dateJa(facts.electionDate,false)}です。`);
    if(index===1) {
      text=replaceFact(text,'50州',`${facts.stateCount}州`);
      text=replaceFact(text,'計100人',`計${facts.senateTotal}人`);
      text=replaceFact(text,'全435議席',`全${facts.houseTotal}議席`);
    }
    if(index===2) {
      text=replaceFact(text,'100議席',`${facts.senateTotal}議席`);
      text=replaceFact(text,'33議席',`${facts.regular}議席`);
    }
    if(index===3) {
      text=replaceFact(text,'この2議席',`この${facts.special}議席`);
      text=replaceFact(text,'計35議席',`計${facts.contested}議席`);
    }
    if(index===4) text=replaceFact(text,'全435議席',`全${facts.houseTotal}議席`);
    return paragraph(item,text);
  });
}

export function approvedAllocationParagraphs(facts:ReaderCopyFacts):ApprovedParagraph[] {
  const source=approvedCopy.sections['上院の情勢と51議席への配分'];
  const majority=Math.floor(facts.senateTotal/2)+1;
  return source.map((item,index)=>{
    let text=item.text;
    if(index===0) {
      text=replaceFact(text,'上院の100議席',`上院の${facts.senateTotal}議席`);
      text=text.replaceAll('35議席',`${facts.contested}議席`);
      text=replaceFact(text,'残る65議席',`残る${facts.senateTotal-facts.contested}議席`);
    }
    if(index===1) {
      text=replaceFact(text,'民主党側が34議席、共和党側が31議席',`民主党側が${facts.fixedDemocratic}議席、共和党側が${facts.fixedRepublican}議席`);
      text=replaceFact(text,'100議席の過半数に当たる51議席',`${facts.senateTotal}議席の過半数に当たる${majority}議席`);
      text=replaceFact(text,'民主党側は17議席、共和党側は20議席',`民主党側は${majority-facts.fixedDemocratic}議席、共和党側は${majority-facts.fixedRepublican}議席`);
    }
    if(index===2) {
      text=replaceFact(text,'35議席',`${facts.contested}議席`);
      text=replaceFact(text,'両方が同じ党を優勢と評価している議席','両方が同じ党についてLikely（優勢）以上と評価している議席');
      text=replaceFact(text,'「やや優勢」など優位の小さい評価でも、2機関の方向が一致していれば配分に含めます。','「やや優勢」（Lean）や「わずかに優勢」（Tilt）は、2機関の方向が一致していても未配分に含めます。');
    }
    if(index===3) {
      text=replaceFact(text,'民主党側が12議席、共和党側が16議席',`民主党側が${facts.allocatedDemocratic}議席、共和党側が${facts.allocatedRepublican}議席`);
      text=replaceFact(text,'民主党側46議席、共和党側47議席',`民主党側${facts.fixedDemocratic+facts.allocatedDemocratic}議席、共和党側${facts.fixedRepublican+facts.allocatedRepublican}議席`);
    }
    if(index===4) {
      text=text.replaceAll('7議席',`${facts.unallocated}議席`);
      text=replaceFact(text,`残る${facts.unallocated}議席は、`,`残る${facts.unallocated}議席は、少なくとも一方が「やや優勢」（Lean）や「わずかに優勢」（Tilt）と評価している場合、`);
      text=replaceFact(text,'評価の方向が一致していない議席です。','配分基準を満たしていない議席です。');
    }
    if(index===5) {
      text=replaceFact(text,'2026年9月24日',dateJa(facts.ratingAsOf));
      text=replaceFact(text,'Sabatoは9月24日',`Sabatoは${facts.sabatoConfirmedAt.map(date=>dateJa(date,false)).join('・')||'確認日未収録'}`);
      text=replaceFact(text,'Inside Electionsは9月18日',`Inside Electionsは${facts.insideConfirmedAt.map(date=>dateJa(date,false)).join('・')||'確認日未収録'}`);
    }
    if(index===6) {
      const half=facts.senateTotal/2;
      text=text.replaceAll('50対50',`${half}対${half}`);
      text=replaceFact(text,'51議席への距離',`${majority}議席への距離`);
      if(facts.vicePresident.verificationStatus==='confirmed' && facts.vicePresident.party==='R') {
        text=replaceFact(text,'バンス氏',`${facts.vicePresident.name==='JD Vance'?'バンス':facts.vicePresident.name}氏`);
        text=replaceFact(text,'今回19議席',`今回${half-facts.fixedRepublican}議席`);
        text=replaceFact(text,'合計50議席',`合計${half}議席`);
      } else {
        text=replaceFact(text,'現在の副大統領は共和党のバンス氏です。そのため、共和党側は今回19議席を獲得して合計50議席となった場合でも、副大統領の決裁票を通じて多数派として運営することが可能です。','副大統領の現在の党派・在職情報を改めて確認する必要があります。決裁票の扱いは、その確認結果に基づいて読みます。');
      }
    }
    return paragraph(item,text);
  });
}

export function renderApprovedParagraphs(paragraphs:ApprovedParagraph[],prefix:string) {
  return paragraphs.map((item,index)=>`<div class="approved-copy-paragraph"><p data-approved-copy="${prefix}-${index}">${esc(item.text)}</p>${item.links.length?`<p class="approved-copy-source">${item.links.map(link=>`<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)}</a>`).join('／')}</p>`:''}</div>`).join('');
}

export function renderApprovedAbout() {
  const paragraphs=approvedAboutParagraphs();
  return renderApprovedParagraphs(paragraphs.slice(0,1),'about')+`<ol class="intro-goals approved-goals">${paragraphs.slice(1).map((item,index)=>{
    const [heading,...explanation]=item.text.split('\n');
    return `<li><p data-approved-copy="about-${index+1}"><strong>${esc(heading)}</strong>\n${esc(explanation.join('\n'))}</p></li>`;
  }).join('')}</ol>`;
}
