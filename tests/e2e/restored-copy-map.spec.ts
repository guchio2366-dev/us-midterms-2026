import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
  DRAFT_STORAGE_KEY, expectCurrentStage, expectHeadingInView, expectNoClosedDisclosure, expectNoPageOverflow,
  goToStage, ready, seedOldScenario, settleScroll, storageSnapshot,
} from './reader-helpers';

// Load independent approved text as bytes: importing app code here would make the
// browser regression inherit the implementation and Node's JSON-module contract.
const approved = JSON.parse(readFileSync(new URL('../../src/data/approved-reader-copy.json', import.meta.url), 'utf8')) as {
  sections: Record<string, { text: string; links: { label: string; url: string }[] }[]>;
};
const copyGroups = [
  { prefix: 'about', source: 'このサイトについて', host: '.reader-opening', count: 4 },
  { prefix: 'institution', source: '米国中間選挙の概説', host: '#reader-01', count: 5 },
  { prefix: 'allocation', source: '上院の情勢と51議席への配分', host: '#reader-04', count: 7 },
] as const;

// Independently reviewed values for the included 2026-10-01 rating snapshot.
// A deliberate data update must update these facts after review; no output from
// the paragraph renderer is reused as the expected text in the real browser.
function approvedAllocationForCurrentSnapshot() {
  const source = approved.sections['上院の情勢と51議席への配分'].map(paragraph => paragraph.text);
  return [
    source[0], source[1],
    source[2].replace('両方が同じ党を優勢と評価している議席', '両方が同じ党についてLikely（優勢）以上と評価している議席')
      .replace('「やや優勢」など優位の小さい評価でも、2機関の方向が一致していれば配分に含めます。', '「やや優勢」（Lean）や「わずかに優勢」（Tilt）は、2機関の方向が一致していても未配分に含めます。'),
    source[3].replace('民主党側が12議席、共和党側が16議席', '民主党側が9議席、共和党側が14議席')
      .replace('民主党側46議席、共和党側47議席', '民主党側43議席、共和党側45議席'),
    source[4].replaceAll('7議席', '12議席')
      .replace('残る12議席は、', '残る12議席は、少なくとも一方が「やや優勢」（Lean）や「わずかに優勢」（Tilt）と評価している場合、')
      .replace('評価の方向が一致していない議席です。', '配分基準を満たしていない議席です。'),
    source[5].replace('2026年9月24日', '2026年10月1日').replace('Inside Electionsは9月18日', 'Inside Electionsは10月2日'),
    source[6],
  ];
}

test('all sixteen approved paragraphs and their sources remain fully visible with only reviewed fact substitutions', async ({ page }) => {
  await page.goto('./');
  await ready(page);
  const before = await storageSnapshot(page);
  const expectedIds = copyGroups.flatMap(group => Array.from({ length: group.count }, (_, index) => `${group.prefix}-${index}`));
  await expect(page.locator('[data-approved-copy]')).toHaveCount(16);
  expect(await page.locator('[data-approved-copy]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-approved-copy'))))
    .toEqual(expectedIds);

  for (const group of copyGroups) {
    expect(approved.sections[group.source]).toHaveLength(group.count);
    for (let index = 0; index < group.count; index++) {
      const paragraph = page.locator(`${group.host} [data-approved-copy="${group.prefix}-${index}"]`);
      await expectNoClosedDisclosure(paragraph);
      // Paragraphs must not exist merely as hidden, clipped, or line-clamped copy.
      const layout = await paragraph.evaluate(node => {
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        return { width: box.width, height: box.height, lineClamp: style.webkitLineClamp, overflowY: style.overflowY };
      });
      expect(layout.width).toBeGreaterThan(0);
      expect(layout.height).toBeGreaterThan(0);
      expect(layout.lineClamp).toBe('none');
      expect(layout.overflowY).not.toBe('hidden');
      const expected = group.prefix === 'allocation'
        ? approvedAllocationForCurrentSnapshot()[index] : approved.sections[group.source][index].text;
      expect(await paragraph.textContent()).toBe(expected);
      for (const link of approved.sections[group.source][index].links) {
        const sourceLink = paragraph.locator('xpath=..').getByRole('link', { name: link.label, exact: true });
        await expectNoClosedDisclosure(sourceLink);
        await expect(sourceLink).toHaveAttribute('href', link.url);
      }
    }
  }
  await expect(page.locator('.reader-opening .approved-goals > li')).toHaveCount(3);
  await expect(page.locator('#reader-simulation-disclosure')).not.toHaveAttribute('open', '');
  expect(await storageSnapshot(page)).toEqual(before);
  await expectNoPageOverflow(page);
});

test('explicitly comparing a non-election state reveals comparison and still supports removal', async ({ page }) => {
  const { entries } = await seedOldScenario(page);
  await page.goto('./#map-heading');
  await ready(page);
  const simulation = page.locator('#reader-simulation-disclosure');
  const comparison = page.locator('#state-compare');
  const scenarioSummary = await page.locator('#sim-result').textContent();
  await page.locator('#state-search').selectOption('06');
  await settleScroll(page);
  await expect(page.locator('#state-detail-heading')).toHaveText('カリフォルニア');
  await expect(page.locator('#detail .forecast-brief')).toContainText('2026年の上院選はありません。');
  await expect(simulation).not.toHaveAttribute('open', '');
  expect(await storageSnapshot(page)).toEqual(entries);

  await page.locator('#detail [data-compare-state="06"]').click();
  await settleScroll(page);
  await expect(simulation).toHaveAttribute('open', '');
  await expectNoClosedDisclosure(comparison);
  await expectHeadingInView(page, '#state-compare h3');
  await expect(comparison.locator('h3')).toBeFocused();
  expect(await comparison.locator('h3').evaluate(heading => {
    const box = heading.getBoundingClientRect();
    return heading.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
  })).toBe(true);
  await expect(comparison.locator('.state-compare-grid article')).toHaveCount(1);
  await expect(comparison.locator('h4')).toHaveText('カリフォルニア');
  await expect(comparison.locator('.state-compare-grid article')).toContainText('2026年の上院選はありません。');
  await expect(page.locator('#detail [data-compare-state="06"]')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('#sim-result').textContent()).toBe(scenarioSummary);
  expect(await storageSnapshot(page)).toEqual(entries);

  await comparison.locator('[data-remove-compare="06"]').click();
  await settleScroll(page);
  await expect(comparison.locator('.state-compare-grid article')).toHaveCount(0);
  await expect(comparison.locator('.compare-empty')).toBeVisible();
  await expect(page.locator('#detail [data-compare-state="06"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#detail [data-compare-state="06"]')).toHaveText('比較に追加');
  await expect(comparison.locator('h3')).toBeFocused();

  // Removing a card must not leave a stale selected button or stale click handler
  // in state detail: the same button must add again, then remove again.
  await page.locator('#detail [data-compare-state="06"]').click();
  await settleScroll(page);
  await expect(comparison.locator('.state-compare-grid article')).toHaveCount(1);
  await expect(page.locator('#detail [data-compare-state="06"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#detail [data-compare-state="06"]').click();
  await settleScroll(page);
  await expect(comparison.locator('.state-compare-grid article')).toHaveCount(0);
  await expect(comparison.locator('.compare-empty')).toBeVisible();
  await expect(page.locator('#detail [data-compare-state="06"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(simulation).toHaveAttribute('open', '');
  expect(await page.locator('#sim-result').textContent()).toBe(scenarioSummary);
  expect(await storageSnapshot(page)).toEqual(entries);
  await expectNoPageOverflow(page);
});

test('repeated Texas comparison choices keep focus and scroll in the comparison card', async ({ page }) => {
  const { state } = await seedOldScenario(page);
  await page.goto('./#map-heading');
  await ready(page);
  await page.locator('#state-search').selectOption('48');
  await settleScroll(page);
  await page.locator('#detail [data-compare-state="48"]').click();
  await settleScroll(page);
  const comparison = page.locator('#state-compare');
  await expectNoClosedDisclosure(comparison);
  const choice = comparison.locator('[data-senate-choice="TX-2"]');
  const candidates = await choice.locator('option[value^="candidate:"]').evaluateAll(options =>
    options.map(option => (option as HTMLOptionElement).value));
  expect(candidates.length).toBeGreaterThanOrEqual(2);

  const manualDisclosure = page.locator('#seat-controls').locator('xpath=ancestor::details[1]');
  await expect(manualDisclosure).not.toHaveAttribute('open', '');
  for (const manualOpen of [false, true]) {
    await test.step(`Comparison changes with manual all-seat controls ${manualOpen ? 'open' : 'closed'}`, async () => {
      if (manualOpen) {
        await manualDisclosure.locator(':scope > summary').click();
        await expect(manualDisclosure).toHaveAttribute('open', '');
        await expect(page.locator('#seat-controls [data-senate-choice]')).toHaveCount(35);
        await expect(page.locator('#seat-controls [data-senate-choice="TX-2"]')).toBeVisible();
      }
      const selections = manualOpen ? [candidates[1], candidates[0], candidates[1]] : [candidates[0], candidates[1], candidates[0]];
      for (const value of selections) {
        await choice.scrollIntoViewIfNeeded();
        await choice.focus();
        await settleScroll(page);
        const beforeScroll = await page.evaluate(() => window.scrollY);
        await choice.selectOption(value);
        await expect.poll(async () => JSON.parse((await storageSnapshot(page))[DRAFT_STORAGE_KEY]!).senate['TX-2']?.candidateId)
          .toBe(value.slice('candidate:'.length));
        await settleScroll(page);
        await expect(choice).toHaveValue(value);
        await expect(choice).toBeFocused();
        const afterScroll = await page.evaluate(() => window.scrollY);
        // Duplicates exist in both state detail and optional manual controls. A
        // rerender must retain the comparison control that was actually used.
        expect(Math.abs(afterScroll - beforeScroll), `scroll moved from ${beforeScroll} to ${afterScroll}`)
          .toBeLessThan(page.viewportSize()!.height / 2);
      }
    });
  }
  const draft = JSON.parse((await storageSnapshot(page))[DRAFT_STORAGE_KEY]!);
  expect(draft.senate['OH-3']).toEqual(state.senate['OH-3']);
  expect(draft.senateBaseline).toEqual(state.senateBaseline);
  expect(draft.house).toEqual(state.house);
  expect(draft.reasoning.privateNote).toBe(state.reasoning!.privateNote);
  await expectNoPageOverflow(page);
});

test('stage 03 continues directly to the visible national map without opening simulation', async ({ page }) => {
  const { entries } = await seedOldScenario(page);
  await goToStage(page, 'reader-03');
  const mapLink = page.locator('#reader-03 .reader-full-map-link a[href="#map-heading"]');
  await expectNoClosedDisclosure(mapLink);
  await expect(mapLink).toContainText('全国50州');
  await mapLink.click();
  await settleScroll(page);
  await expectCurrentStage(page, 'reader-03');
  await expectHeadingInView(page, '#map-heading');
  await expectNoClosedDisclosure(page.locator('#map'));
  await expectNoClosedDisclosure(page.locator('#detail'));
  await expect(page.locator('#simulator #map, #simulator #detail')).toHaveCount(0);
  await expect(page.locator('#reader-simulation-disclosure')).not.toHaveAttribute('open', '');
  expect(new URL(page.url()).hash).toBe('#map-heading');
  expect(await storageSnapshot(page)).toEqual(entries);
  await page.goBack();
  await settleScroll(page);
  await expectCurrentStage(page, 'reader-03');
  await page.goForward();
  await settleScroll(page);
  await expectHeadingInView(page, '#map-heading');
  expect(await storageSnapshot(page)).toEqual(entries);
  await expectNoPageOverflow(page);
});

test('every national-map state changes detail while the old saved scenario stays untouched', async ({ page }) => {
  // Fifty complete real-keyboard selection cycles are intentionally exhaustive.
  // Keep each assertion's normal deadline while allowing the full loop on slower runners.
  test.setTimeout(150_000);
  // Other tests exercise smooth navigation; reduced motion keeps fifty complete
  // keyboard read/return cycles deterministic without skipping real UI events.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const { entries } = await seedOldScenario(page);
  await page.goto('./#map-heading');
  await ready(page);
  const map = page.locator('#map');
  const detail = page.locator('#detail');
  const simulation = page.locator('#reader-simulation-disclosure');
  await expectNoClosedDisclosure(map);
  await expectNoClosedDisclosure(detail);
  await expect(simulation).not.toHaveAttribute('open', '');
  const scenarioSummary = await page.locator('#sim-result').textContent();
  const states = await page.locator('#state-search option[value]:not([value=""])').evaluateAll(options =>
    options.map(option => ({ fips: (option as HTMLOptionElement).value, name: option.textContent!.split(' / ')[0] })));
  expect(states).toHaveLength(50);
  expect(new Set(states.map(state => state.fips)).size).toBe(50);
  expect((await map.locator('[data-state-fips]').evaluateAll(paths => paths.map(path => path.getAttribute('data-state-fips')))).sort())
    .toEqual(states.map(state => state.fips).sort());

  for (const state of states) {
    await test.step(`Read ${state.name} (${state.fips}) from its actual map button`, async () => {
      const stateButton = map.locator(`[data-state-fips="${state.fips}"]`);
      await expect(stateButton).toHaveAttribute('role', 'button');
      await expect(stateButton).toHaveAttribute('tabindex', '0');
      await expect(stateButton).toHaveAttribute('d', /\S+/);
      await stateButton.focus();
      await stateButton.press('Enter');
      await expect(page.locator('#state-detail-heading')).toHaveText(state.name);
      await expect(page.locator('#state-search')).toHaveValue(state.fips);
      await expect(map.locator('[aria-pressed="true"]')).toHaveCount(1);
      await expect(stateButton).toHaveAttribute('aria-pressed', 'true');
      await expectNoClosedDisclosure(detail);
      await expect(simulation).not.toHaveAttribute('open', '');
      expect(await page.locator('#sim-result').textContent()).toBe(scenarioSummary);
      expect(await storageSnapshot(page)).toEqual(entries);
    });
  }

  // Pointer activation and the full-state selector use the same reading behavior.
  await map.locator('[data-state-fips="48"]').click();
  await expect(page.locator('#state-detail-heading')).toHaveText(states.find(state => state.fips === '48')!.name);
  await page.locator('#state-search').selectOption('39');
  await expect(page.locator('#state-detail-heading')).toHaveText(states.find(state => state.fips === '39')!.name);
  await expect(page.locator('#detail [data-senate-choice="OH-3"]')).toHaveValue('candidate:cand-oh-sherrod-brown');
  await expect(simulation).not.toHaveAttribute('open', '');
  await page.locator('#detail .close').click();
  await expect(page.locator('#detail .empty-detail')).toBeVisible();
  await expect(page.locator('#state-search')).toHaveValue('');
  await expect(map.locator('[aria-pressed="true"]')).toHaveCount(0);
  expect(await page.locator('#sim-result').textContent()).toBe(scenarioSummary);
  expect(await storageSnapshot(page)).toEqual(entries);
  await expectNoPageOverflow(page);
});
