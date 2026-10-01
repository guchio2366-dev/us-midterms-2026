import { describe, expect, it } from 'vitest';
import { polls } from '../src/data/research';
import { sources } from '../src/data/data';
import { briefingLenses } from '../src/data/briefing-lenses';
import { briefingEvidenceDisplays } from '../src/data/briefing-evidence';
import { getPublishedPolls } from '../src/research-logic';
import { briefingTakeawayMarkup, briefingLensMarkup } from '../src/ui/briefing-lens';
import { briefingEvidenceMarkup, briefingComparisonPollsMarkup } from '../src/ui/briefing-polls';

const pollIds = (html: string) => [...html.matchAll(/data-poll-id="([^"]+)"/g)].map(match => match[1]);

describe('evidence paired with the state conclusion', () => {
  it('pairs every state finding with dated evidence and the recorded primary sources', () => {
    expect(briefingEvidenceDisplays.map(item => item.electionId).sort()).toEqual(briefingLenses.map(item => item.electionId).sort());
    for (const lens of briefingLenses) {
      const takeaway = briefingTakeawayMarkup(lens.electionId);
      const evidence = briefingEvidenceMarkup(polls, lens.electionId);
      const explanation = briefingLensMarkup(lens.electionId);
      const display = briefingEvidenceDisplays.find(item => item.electionId === lens.electionId)!;
      expect(takeaway).toContain(lens.finding);
      expect(takeaway).toContain(display.periodLabel);
      expect(evidence).toContain(display.periodLabel);
      expect(explanation.split('<details>')[0]).toContain(lens.nextData);
      expect(explanation).not.toContain(lens.finding);
      for (const sourceId of lens.sourceIds) {
        const source = sources.find(item => item.sourceId === sourceId);
        expect(source, sourceId).toBeDefined();
        expect(evidence).toContain(source!.url.replaceAll('&', '&amp;'));
      }
    }
  });

  it('shows the Alaska final round behind 53/47 and labels the survey-wide sample and uncertainty', () => {
    const html = briefingEvidenceMarkup(polls, '2026-AK-2-regular');
    expect(pollIds(html)).toEqual(['poll-ak-dfp-2026-08-final']);
    expect(html).toContain('<b>53%</b>');
    expect(html).toContain('<b>47%</b>');
    expect(html).toContain('調査全体 605人');
    expect(html).toContain('最終集計の人数ではない');
    expect(html).toContain('調査全体の公表値：標本誤差 ±4ポイント');
    expect(html).toContain('第一希望とは集計の分母が異なる');
    expect(html).not.toContain('data-poll-id="poll-ak-dfp-2026-08-first"');
  });

  it('compares Iowa populations within one survey without substituting a newer poll or implying a time change', () => {
    const html = briefingEvidenceMarkup(polls, '2026-IA-2-regular');
    expect(pollIds(html)).toEqual(['poll-ia-yougov-2026-09', 'poll-ia-yougov-2026-09-strict-lv']);
    expect(html).toContain('登録有権者全体');
    expect(html).toContain('厳しい投票予定者基準（strict LV）');
    expect(html).toContain('<b>44%</b>');
    expect(html).toContain('<b>47%</b>');
    expect(html).toContain('時系列の支持変化ではない');
    expect(html).toContain('詳しい抽出条件は未記載');
    expect(html).not.toContain('data-poll-id="poll-ia-marist-2026-09"');
  });

  it.each([
    ['2026-ME-2-regular', ['登録有権者', '2024年大統領選', 'ハリス', '86%', '5%', 'トランプ', '4%', '89%']],
    ['2026-NH-2-regular', ['大統領の職務評価', '不支持 56%', '上院の投票先', 'パパス 46% ／ スヌヌ 46%']],
    ['2026-OH-3-special', ['登録有権者', '傾きの追質問', '民主党', '97%', '共和党', '11%', '無党派', '66%', '28%']],
    ['2026-TX-2-regular', ['登録有権者', '民主党', '98%', '1%未満', '共和党', '9%', '87%', '無党派', '55%', '35%']],
  ])('shows the recorded table for %s without manufacturing a whole-electorate poll', (electionId, expected) => {
    const html = briefingEvidenceMarkup(polls, electionId);
    expect(html).toContain('class="briefing-evidence-table"');
    for (const text of expected) expect(html).toContain(text);
    expect(pollIds(html)).toEqual([]);
    expect(html).not.toContain('briefing-poll-track');
    expect(html).not.toContain('class="briefing-poll-precision"');
  });

  it('does not put Maine LV sample size or full-survey error on the RV past-vote table', () => {
    const html = briefingEvidenceMarkup(polls, '2026-ME-2-regular');
    expect(html).not.toContain('1,335人');
    expect(html).not.toContain('±4.9');
    expect(html).toContain('投票予定者全体の48%対44%とは対象が異な');
    expect(briefingComparisonPollsMarkup(polls, '2026-ME-2-regular')).toContain('data-poll-id="poll-me-yougov-2026-09"');
  });

  it('keeps North Carolina ratings categorical alongside the confirmed HPU candidate percentages', () => {
    const html = briefingEvidenceMarkup(polls, '2026-NC-2-regular');
    expect(html).toContain('Lean D');
    expect(html).toContain('Tilt D');
    expect(html).toContain('支持率や当選確率ではない');
    expect(pollIds(html)).toEqual(['poll-nc-hpu-2026-09-lv']);
    expect(html).toContain('<b>50%</b>');
    expect(html).toContain('<b>42%</b>');
    expect(html).toContain('credibility interval');
    expect(html).toContain('通常の標本誤差ではない');
  });

  it('retains every published poll exactly once between direct evidence and comparison, including other rounds and populations', () => {
    for (const lens of briefingLenses) {
      const actual = pollIds(briefingEvidenceMarkup(polls, lens.electionId) + briefingComparisonPollsMarkup(polls, lens.electionId));
      const expected = getPublishedPolls(polls, lens.electionId).map(poll => poll.pollId);
      expect(actual.sort(), lens.electionId).toEqual(expected.sort());
      expect(new Set(actual).size, lens.electionId).toBe(actual.length);
    }
    const comparison = briefingComparisonPollsMarkup(polls, '2026-AK-2-regular');
    expect(pollIds(comparison.split('<details')[0])).toEqual(['poll-ak-asr-2026-08-final']);
    expect(comparison).toContain('data-poll-id="poll-ak-dfp-2026-08-first"');
    expect(comparison).not.toContain('data-poll-id="poll-ak-dfp-2026-08-final"');
    const ia = briefingComparisonPollsMarkup(polls, '2026-IA-2-regular');
    expect(pollIds(ia.split('<details')[0])).toEqual(['poll-ia-marist-2026-09']);
    expect(ia).toContain('data-poll-id="poll-ia-yougov-2026-09-loose-lv"');
  });

  it('never renders a draft, a withdrawn record, or a matching ID from another race as direct evidence', () => {
    const original = polls.find(poll => poll.pollId === 'poll-ak-dfp-2026-08-final')!;
    for (const replacement of [
      { ...original, status: 'draft' as const },
      { ...original, status: 'withdrawn' as const },
      { ...original, electionId: '2026-TX-2-regular' },
    ]) {
      const items = polls.filter(poll => poll.pollId !== original.pollId).concat(replacement);
      const html = briefingEvidenceMarkup(items, '2026-AK-2-regular');
      expect(pollIds(html)).toEqual([]);
      expect(html).toContain('現在表示できる調査データにありません');
    }
    expect(briefingTakeawayMarkup('missing')).toBe('');
    expect(briefingEvidenceMarkup(polls, 'missing')).toBe('');
    expect(briefingComparisonPollsMarkup(polls, 'missing')).toBe('');
  });
});
