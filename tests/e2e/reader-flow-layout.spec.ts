import { expect, test } from '@playwright/test';
import {
  capture, captureElement, expectCurrentStage, expectNoClosedDisclosure, expectNoPageOverflow,
  goToStage, ready, seedOldScenario, settleScroll, storageSnapshot,
} from './reader-helpers';

test('the six reading topics stay in order while four navigation entries preserve their meaning', async ({ page }, testInfo) => {
  const { entries } = await seedOldScenario(page);
  const order = ['#reader-01', '#reader-04', '#updates', '.reader-national-map', '.intro-issues-card', '#reader-06'];
  for (const selector of order) await expectNoClosedDisclosure(page.locator(selector));
  expect(await page.evaluate(selectors => selectors.slice(1).every((selector, index) =>
    Boolean(document.querySelector(selectors[index])!.compareDocumentPosition(document.querySelector(selector)!) & Node.DOCUMENT_POSITION_FOLLOWING)), order)).toBe(true);
  await expect(page.locator('main > .reader-navigation a')).toHaveCount(4);
  await expect(page.locator('#reader-03-heading')).toHaveText('注目12州の情勢と候補者');
  await expect(page.locator('.intro-issues-card h2')).toHaveText('選挙を見る主な論点');
  await expect(page.locator('#reader-03 #map')).toHaveCount(1);
  await expect(page.locator('#reader-04 #map')).toHaveCount(0);
  await expect(page.locator('#reader-03 .reader-current-composition')).toHaveCount(1);
  const placement = await page.locator('.reader-current-composition').evaluate(table => ({
    inDetail: Boolean(table.closest('#detail')),
    afterMap: Boolean(document.querySelector('#map')!.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING),
  }));
  expect(placement).toEqual({ inDetail: false, afterMap: true });

  await page.goto('./#map-heading');
  await ready(page);
  await expectCurrentStage(page, 'reader-03');
  await capture(page, testInfo, 'reader-flow-national-map');
  await page.locator('.intro-issues-card').scrollIntoViewIfNeeded();
  await settleScroll(page);
  await capture(page, testInfo, 'reader-flow-issues-after-map');
  expect(await storageSnapshot(page)).toEqual(entries);
  await expectNoPageOverflow(page);
});

test('complete allocation prose sits beside small labeled comparison graphs without clipping', async ({ page }, testInfo) => {
  await page.goto('./');
  await ready(page);
  await goToStage(page, 'reader-04');
  const prose = page.locator('.approved-senate-intro');
  const charts = page.locator('.reader-allocation-charts');
  await expectNoClosedDisclosure(prose);
  await expectNoClosedDisclosure(charts);
  await expect(charts.locator('.comparison-row')).toHaveCount(3);
  await expect(charts).toContainText('非改選');
  await expect(charts).toContainText('51議席');
  const geometry = await page.evaluate(() => {
    const prose = document.querySelector('.approved-senate-intro')!.getBoundingClientRect();
    const charts = document.querySelector('.reader-allocation-charts')!.getBoundingClientRect();
    const layout = document.querySelector('.reader-allocation-layout')!.getBoundingClientRect();
    return { prose: { x: prose.x, right: prose.right, width: prose.width, top: prose.top, bottom: prose.bottom },
      charts: { x: charts.x, width: charts.width, top: charts.top }, width: layout.width };
  });
  if (testInfo.project.name.startsWith('desktop')) {
    expect(geometry.charts.x).toBeGreaterThanOrEqual(geometry.prose.right);
    expect(geometry.charts.width).toBeLessThan(geometry.prose.width);
    expect(geometry.charts.width / geometry.width).toBeLessThan(0.43);
    expect(Math.abs(geometry.charts.top - geometry.prose.top)).toBeLessThan(50);
  } else {
    expect(geometry.charts.top).toBeGreaterThanOrEqual(geometry.prose.bottom);
  }
  await capture(page, testInfo, 'reader-flow-allocation');
  await captureElement(page, testInfo, 'reader-flow-allocation-complete', page.locator('.reader-allocation-layout'));
  await expectNoPageOverflow(page);
});

test('desktop keeps the whole map alongside long state reading and mobile uses one page scroll', async ({ page }, testInfo) => {
  const { entries } = await seedOldScenario(page);
  await page.goto('./#map-heading');
  await ready(page);
  await page.locator('#state-search').selectOption('48');
  await settleScroll(page);
  const geometry = await page.evaluate(() => {
    const map = document.querySelector<HTMLElement>('.reader-map-workspace > .map-column')!;
    const detail = document.querySelector<HTMLElement>('#detail')!;
    const box = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { x: rect.x, right: rect.right, width: rect.width, top: rect.top, bottom: rect.bottom,
        height: rect.height, position: style.position, overflowY: style.overflowY,
        clientHeight: element.clientHeight, scrollHeight: element.scrollHeight };
    };
    return { map: box(map), detail: box(detail) };
  });
  for (const column of [geometry.map, geometry.detail]) {
    expect(['auto', 'scroll'].includes(column.overflowY) && column.scrollHeight > column.clientHeight + 1).toBe(false);
  }
  if (testInfo.project.name.startsWith('desktop')) {
    expect(geometry.detail.x).toBeGreaterThanOrEqual(geometry.map.right);
    expect(geometry.map.width / geometry.detail.width).toBeGreaterThan(0.75);
    expect(geometry.map.width / geometry.detail.width).toBeLessThan(1.35);
    expect(geometry.map.position).toBe('sticky');
    await page.locator('#detail').evaluate(detail => {
      const box = detail.getBoundingClientRect();
      // Read well below the initially selected state's heading using the outer page.
      window.scrollTo({ top: scrollY + box.top + Math.min(650, box.height / 2), behavior: 'instant' });
    });
    await settleScroll(page);
    const visibleMap = await page.locator('#map svg').evaluate(svg => {
      const rect = svg.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, viewport: innerHeight };
    });
    expect(visibleMap.top).toBeGreaterThanOrEqual(0);
    expect(visibleMap.bottom).toBeLessThanOrEqual(visibleMap.viewport);
    await expectCurrentStage(page, 'reader-03');
    await capture(page, testInfo, 'reader-flow-map-while-reading-state');
  } else {
    expect(geometry.detail.top).toBeGreaterThanOrEqual(geometry.map.bottom);
    expect(geometry.map.position).not.toBe('sticky');
    await capture(page, testInfo, 'reader-flow-mobile-state-reading');
  }
  await expectNoClosedDisclosure(page.locator('#detail'));
  await expect(page.locator('#map [data-state-fips]')).toHaveCount(50);
  await expect(page.locator('#reader-simulation-disclosure')).not.toHaveAttribute('open', '');
  expect(await storageSnapshot(page)).toEqual(entries);
  await expectNoPageOverflow(page);
});

test('all featured states show labeled party colors and dated poll summaries before complete candidate and poll explanations', async ({ page }, testInfo) => {
  const { entries } = await seedOldScenario(page);
  await goToStage(page, 'reader-03');
  const tabs = page.locator('.focus-tabs [data-focus-election]');
  const ids = await tabs.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-focus-election')!));
  expect(ids).toHaveLength(12);
  for (const id of ids) {
    await page.locator(`[data-focus-election="${id}"]`).click();
    const panel = page.locator('#focus-race-panel');
    const summary = panel.locator('.briefing-headline-polls');
    await expectNoClosedDisclosure(summary);
    const candidates = panel.locator('.reader-candidate-card');
    expect(await candidates.count()).toBeGreaterThan(0);
    for (const party of ['D', 'R'] as const) {
      for (const candidate of await panel.locator(`.reader-candidate-card[data-reader-party="${party}"]`).all()) {
        const label = candidate.locator('.reader-candidate-party');
        await expectNoClosedDisclosure(label);
        await expect(label).toContainText(party === 'D' ? '民主党' : '共和党');
        const color = await label.evaluate(node => getComputedStyle(node).color.match(/\d+/g)!.map(Number));
        expect(party === 'D' ? color[2] > color[0] : color[0] > color[2], `${id} ${party}: ${color.join(',')}`).toBe(true);
      }
    }
    const compactPolls = summary.locator('[data-summary-poll-id]');
    expect(await compactPolls.count()).toBeLessThanOrEqual(2);
    if (await compactPolls.count()) {
      await expect(summary).toContainText('情勢評価・当選確率とは別の実測値');
      if (await compactPolls.count() === 2) await expect(summary).toContainText('日付・対象・質問が異なり、平均していません');
      for (const compact of await compactPolls.all()) {
        await expectNoClosedDisclosure(compact);
        await expect(compact.locator('time')).toHaveAttribute('datetime', /^2026-\d{2}-\d{2}$/);
        await expect(compact.locator('.briefing-compact-note').first()).toContainText('人');
        const pollId = await compact.getAttribute('data-summary-poll-id');
        const detailPoll = panel.locator(`[data-poll-id="${pollId}"]`).first();
        await expect(detailPoll).toHaveCount(1);
        expect(await compact.locator('.briefing-poll-labels b').allTextContents())
          .toEqual(await detailPoll.locator('.briefing-poll-labels b').allTextContents());
        const correctOrder = await detailPoll.evaluate(poll => {
          const panel = poll.closest('#focus-race-panel')!;
          const lastCandidate = [...panel.querySelectorAll('.reader-candidate-card')].at(-1)!;
          return Boolean(lastCandidate.compareDocumentPosition(poll) & Node.DOCUMENT_POSITION_FOLLOWING);
        });
        expect(correctOrder).toBe(true);
      }
    } else {
      await expect(summary).toContainText('確認済みの調査結果は、まだ収録していません');
    }
    await expectNoPageOverflow(page);
  }
  await page.locator('[data-focus-election="2026-AK-2-regular"]').click();
  await panelHeadingInView(page);
  await capture(page, testInfo, 'reader-flow-party-poll-summary-alaska');
  expect(await storageSnapshot(page)).toEqual(entries);
});

async function panelHeadingInView(page: import('@playwright/test').Page) {
  await page.locator('#focus-race-panel .focus-summary-heading').scrollIntoViewIfNeeded();
  await settleScroll(page);
}

test('each featured state reaches its next evidence and upcoming feed in a single visible action', async ({ page }, testInfo) => {
  const { entries } = await seedOldScenario(page);
  await goToStage(page, 'reader-03');
  const ids = await page.locator('.focus-tabs [data-focus-election]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-focus-election')!));
  for (const id of ids) {
    await page.locator(`[data-focus-election="${id}"]`).click();
    const entry = page.locator('#focus-race-panel .briefing-next-nav');
    await expectNoClosedDisclosure(entry);
    await entry.locator(`a[href="#briefing-next-${id}"]`).click();
    await settleScroll(page);
    const next = page.locator(`#briefing-next-${id}`);
    await expectNoClosedDisclosure(next);
    await expect(next).toBeFocused();
    await expect(next.locator('h4')).toHaveText('次の確認材料');
    await expect(next.locator('h5')).toHaveText('見通しを変え得る材料');
    await entry.locator('[data-briefing-feed="upcoming"]').click();
    await settleScroll(page);
    await expect(page.locator('#news-tab-upcoming')).toHaveAttribute('aria-selected', 'true');
    await expectNoClosedDisclosure(page.locator('#news-list'));
    await expect(page.locator('#news-heading')).toBeFocused();
    expect(new URL(page.url()).searchParams.get('newsRace')).toBe(id);
    expect(new URL(page.url()).searchParams.get('newsTab')).toBe('upcoming');
    await expectCurrentStage(page, 'reader-03');
    expect(await storageSnapshot(page)).toEqual(entries);
  }
  await capture(page, testInfo, 'reader-flow-upcoming-events-entry');
  await expectNoPageOverflow(page);
});
