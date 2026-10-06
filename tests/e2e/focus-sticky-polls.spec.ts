import { expect, test, type Locator, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import ts from 'typescript';
import { policyAdditionSources } from '../../src/data/policy-additions';
import {
  readerCandidateComparisons, readerCandidateExplanations, readerCandidateExplanationSources,
  type ReaderCandidateParagraph,
} from '../../src/data/reader-candidate-explanations';
import {
  capture, expectCurrentStage, expectNoClosedDisclosure, expectNoPageOverflow,
  goToStage, ready, seedOldScenario, settleScroll, storageSnapshot,
} from './reader-helpers';

const desktopViewports = [
  { width: 1440, height: 1000 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
];
// Read literal source references without importing the browser JSON module graph.
// The data unit tests independently validate source IDs and evidence references.
const dataDirectory = new URL('../../src/data/', import.meta.url);
const existingSourceUrls: { sourceId: string; url: string }[] = [];
for (const file of readdirSync(dataDirectory).filter(file => file.endsWith('.ts'))) {
  const syntax = ts.createSourceFile(file, readFileSync(new URL(file, dataDirectory), 'utf8'), ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const fields = new Map(node.properties.filter(ts.isPropertyAssignment).flatMap(property =>
        (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) && ts.isStringLiteralLike(property.initializer)
          ? [[property.name.text, property.initializer.text] as const] : []));
      if (fields.has('sourceId') && fields.has('url')) existingSourceUrls.push({ sourceId: fields.get('sourceId')!, url: fields.get('url')! });
    }
    ts.forEachChild(node, visit);
  };
  visit(syntax);
}
const sourceById = new Map([
  ...existingSourceUrls,
  ...(JSON.parse(readFileSync(new URL('observation.json', dataDirectory), 'utf8')) as { sources: { sourceId: string; url: string }[] }).sources,
  ...policyAdditionSources, ...readerCandidateExplanationSources,
].map(source => [source.sourceId, source]));

async function expectFullCandidateParagraph(paragraph: Locator, expected: ReaderCandidateParagraph, sourceDetails: Locator) {
  await expect(paragraph).toHaveText(expected.text);
  expect(await paragraph.textContent()).toBe(expected.text);
  await expectNoClosedDisclosure(paragraph);
  const style = await paragraph.evaluate(node => ({
    details: !!node.closest('details'), clamp: getComputedStyle(node).webkitLineClamp,
    font: Number.parseFloat(getComputedStyle(node).fontSize), overflow: getComputedStyle(node).overflowY,
  }));
  expect(style).toEqual({ details: false, clamp: 'none', font: 16, overflow: 'visible' });
  const links = sourceDetails.locator('.reader-candidate-sources a');
  const expectedUrls = [...new Set(expected.sourceIds)].map(id => {
    const source = sourceById.get(id);
    expect(source, `Source ${id} should be connected`).toBeDefined();
    return new URL(source!.url).href;
  });
  expect(await links.evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(expectedUrls);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
}

async function focusHeadingAtTop(page: Page) {
  await page.locator('#focus-race-panel .focus-summary-heading').evaluate(heading => {
    window.scrollTo({ top: scrollY + heading.getBoundingClientRect().top - 16, behavior: 'instant' });
  });
  await settleScroll(page);
}

async function expectInsideReadingBody(target: Locator) {
  await expect(target).toBeVisible();
  const geometry = await target.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const body = node.closest('.news-reading-body')!.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right,
      bodyTop: body.top, bodyBottom: body.bottom, bodyLeft: body.left, bodyRight: body.right };
  });
  expect(geometry.top).toBeGreaterThanOrEqual(geometry.bodyTop - 1);
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.bodyBottom + 1);
  expect(geometry.left).toBeGreaterThanOrEqual(geometry.bodyLeft - 1);
  expect(geometry.right).toBeLessThanOrEqual(geometry.bodyRight + 1);
}

test.describe('PC focus polls and sticky news', () => {
  // The existing eighteen mobile regressions remain in their original files.
  // This request adds PC and notebook coverage only.
  test.skip(({ isMobile }) => isMobile, 'This additional coverage is limited to PC and notebook viewports.');

  for (const viewport of desktopViewports) {
    const size = `${viewport.width}x${viewport.height}`;

    test(`${size}: slim red-left blue-right polls match their labels and candidate columns`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      const { entries } = await seedOldScenario(page);
      await goToStage(page, 'reader-03');
      await page.locator('[data-focus-election="2026-AK-2-regular"]').click();
      await focusHeadingAtTop(page);
      const panel = page.locator('#focus-race-panel');
      const polls = panel.locator('[data-summary-poll-id]');
      await expect(polls).toHaveCount(2);
      for (const poll of await polls.all()) {
        await expectNoClosedDisclosure(poll);
        const track = poll.locator('.briefing-poll-track');
        const dimensions = await track.evaluate(node => {
          const rect = node.getBoundingClientRect();
          const segments = [...node.querySelectorAll<HTMLElement>(':scope > i')];
          const first = segments[0], last = segments.at(-1)!;
          return { height: rect.height, width: rect.width, firstClass: first.className, lastClass: last.className,
            firstLeft: first.getBoundingClientRect().left, lastRight: last.getBoundingClientRect().right,
            left: rect.left, right: rect.right, firstColor: getComputedStyle(first).backgroundColor,
            lastColor: getComputedStyle(last).backgroundColor };
        });
        expect(dimensions.height).toBeGreaterThan(0);
        expect(dimensions.height).toBeLessThanOrEqual(8.5);
        expect(dimensions.width).toBeGreaterThan(180);
        expect(dimensions.firstClass).toBe('briefing-poll-r');
        expect(dimensions.lastClass).toBe('briefing-poll-d');
        expect(dimensions.firstLeft).toBeCloseTo(dimensions.left, 0);
        expect(dimensions.lastRight).toBeCloseTo(dimensions.right, 0);
        const red = dimensions.firstColor.match(/\d+/g)!.map(Number);
        const blue = dimensions.lastColor.match(/\d+/g)!.map(Number);
        expect(red[0]).toBeGreaterThan(red[2]);
        expect(blue[2]).toBeGreaterThan(blue[0]);
        expect(await poll.locator('.briefing-poll-major-labels [data-poll-party]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-poll-party')))).toEqual(['R', 'D']);
        await expect(poll.locator('.briefing-poll-major-labels [data-poll-party="R"]')).toContainText('共和党');
        await expect(poll.locator('.briefing-poll-major-labels [data-poll-party="D"]')).toContainText('民主党');
        await expect(poll.locator('time')).toHaveAttribute('datetime', /^2026-\d{2}-\d{2}$/);
        const pollId = await poll.getAttribute('data-summary-poll-id');
        expect(await poll.locator('.briefing-poll-labels b').allTextContents()).toEqual(
          await panel.locator(`[data-poll-id="${pollId}"]`).first().locator('.briefing-poll-labels b').allTextContents());
      }
      const rows = await polls.evaluateAll(nodes => nodes.map(node => {
        const rect = node.getBoundingClientRect(); return { left: rect.left, width: rect.width, top: rect.top, bottom: rect.bottom };
      }));
      expect(rows[1].top).toBeGreaterThanOrEqual(rows[0].bottom);
      expect(rows[1].left).toBeCloseTo(rows[0].left, 0);
      expect(rows[1].width).toBeCloseTo(rows[0].width, 0);
      const candidates = await panel.locator('.reader-candidate-card').evaluateAll(nodes => nodes.map(node => ({
        party: node.getAttribute('data-reader-party'), left: node.getBoundingClientRect().left,
      })));
      expect(candidates.map(candidate => candidate.party)).toEqual(['R', 'D']);
      expect(candidates[1].left).toBeGreaterThan(candidates[0].left);
      await expect(panel.locator('.briefing-headline-note')).toContainText('日付・対象・質問は調査ごとに異なります（平均なし）');
      await expect(panel.locator('.focus-rating-note')).toHaveText('情勢評価は支持率や当選確率ではありません。');
      await capture(page, testInfo, `${size}-focus-top`);
      expect(await storageSnapshot(page)).toEqual(entries);
      await expectNoPageOverflow(page);
    });

    test(`${size}: the right news controls stay visible and one reading scroll reaches the complete tail`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      const { entries } = await seedOldScenario(page);
      await goToStage(page, 'reader-03');
      await page.locator('[data-focus-election="2026-AK-2-regular"]').click();
      await page.locator('#news-expand').click();
      await expect(page.locator('#news')).toHaveClass(/news-expanded/);
      await expect(page.locator('#news-list .news-card')).toHaveCount(10);
      await focusHeadingAtTop(page);
      await page.evaluate(() => scrollBy({ top: 650, behavior: 'instant' }));
      await settleScroll(page);
      const news = page.locator('#news');
      const body = news.locator('.news-reading-body');
      const structure = await news.evaluate(node => {
        const rect = node.getBoundingClientRect();
        const body = node.querySelector<HTMLElement>('.news-reading-body')!;
        const list = node.querySelector<HTMLElement>('#news-list')!;
        const scrollOwners = [node, ...node.querySelectorAll<HTMLElement>('*')].filter(element => {
          const style = getComputedStyle(element);
          return /^(auto|scroll)$/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1;
        }).map(element => element.className);
        return { position: getComputedStyle(node).position, top: rect.top, bottom: rect.bottom,
          viewport: innerHeight, bodyOverflow: getComputedStyle(body).overflowY,
          bodyHeight: body.clientHeight, bodyScroll: body.scrollHeight, listOverflow: getComputedStyle(list).overflowY, scrollOwners };
      });
      expect(structure.position).toBe('sticky');
      expect(structure.top).toBeGreaterThanOrEqual(15);
      expect(structure.top).toBeLessThanOrEqual(17);
      expect(structure.bottom).toBeLessThanOrEqual(structure.viewport - 15);
      expect(structure.bodyOverflow).toMatch(/auto|scroll/);
      expect(structure.bodyHeight).toBeGreaterThan(200);
      expect(structure.bodyScroll).toBeGreaterThan(structure.bodyHeight);
      expect(structure.listOverflow).toBe('visible');
      expect(structure.scrollOwners).toEqual(['news-reading-body']);
      await expect(news.locator('.news-sticky-controls #news-heading')).toBeInViewport();
      await expect(body).toHaveAttribute('tabindex', '0');
      await expect(body).toHaveAttribute('aria-label', /\S+/);
      await capture(page, testInfo, `${size}-left-reading-scroll`);
      const outerY = await page.evaluate(() => scrollY);
      await body.focus();
      await page.keyboard.press('End');
      await expect.poll(() => body.evaluate(node => node.scrollHeight - node.clientHeight - node.scrollTop)).toBeLessThanOrEqual(2);
      expect(await page.evaluate(() => scrollY)).toBeCloseTo(outerY, 0);
      await expectInsideReadingBody(news.locator('#news-next'));
      const firstPageKeys = await page.locator('#news-list [data-feed-key]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-feed-key')));
      await news.locator('#news-next').click();
      await expect(page.locator('#news-page-status')).toContainText('2 /');
      expect(await page.locator('#news-list [data-feed-key]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-feed-key')))).not.toEqual(firstPageKeys);
      await expect.poll(() => body.evaluate(node => node.scrollTop)).toBe(0);
      await body.focus();
      await page.keyboard.press('End');
      await expect.poll(() => body.evaluate(node => node.scrollHeight - node.clientHeight - node.scrollTop)).toBeLessThanOrEqual(2);
      const tailArticle = page.locator('#news-list .news-card').last();
      const tailArticleKey = await tailArticle.getAttribute('data-feed-key');
      await tailArticle.scrollIntoViewIfNeeded();
      await settleScroll(page);
      const beforeArticle = await body.evaluate(node => ({ bodyY: node.scrollTop, windowY: scrollY }));
      await tailArticle.click();
      await expect(page.locator('#overlay-root')).toBeVisible();
      await page.goBack();
      await settleScroll(page);
      await expect(page.locator('#overlay-root')).toBeHidden();
      await expect(tailArticle).toBeFocused();
      await expect(page.locator('#news-page-status')).toContainText('2 /');
      await expect.poll(() => body.evaluate(node => node.scrollTop)).toBeCloseTo(beforeArticle.bodyY, 0);
      expect(await page.evaluate(() => scrollY)).toBeCloseTo(beforeArticle.windowY, 0);
      await page.goForward();
      await settleScroll(page);
      await expect(page.locator('#overlay-root')).toBeVisible();
      expect(new URL(page.url()).searchParams.get('newsItem')).toBe(tailArticleKey);
      await page.keyboard.press('Escape');
      await expect(page.locator('#overlay-root')).toBeHidden();
      await expect(tailArticle).toBeFocused();
      await expect.poll(() => body.evaluate(node => node.scrollTop)).toBeCloseTo(beforeArticle.bodyY, 0);
      expect(await page.evaluate(() => scrollY)).toBeCloseTo(beforeArticle.windowY, 0);
      await body.focus();
      await page.keyboard.press('End');
      await expect.poll(() => body.evaluate(node => node.scrollHeight - node.clientHeight - node.scrollTop)).toBeLessThanOrEqual(2);
      const monitoring = news.locator('.observation-monitor details');
      await monitoring.locator(':scope > summary').click();
      await expect(monitoring).toHaveAttribute('open', '');
      await body.focus();
      await page.keyboard.press('End');
      await expect.poll(() => body.evaluate(node => node.scrollHeight - node.clientHeight - node.scrollTop)).toBeLessThanOrEqual(2);
      await expectInsideReadingBody(monitoring.locator('li a').last());
      await expect(news.locator('.news-sticky-controls #news-heading')).toBeInViewport();
      await body.hover();
      await page.mouse.wheel(0, 600);
      await settleScroll(page);
      expect(await page.evaluate(() => scrollY)).toBeCloseTo(outerY, 0);
      await capture(page, testInfo, `${size}-right-long-content-tail`);
      await page.locator('#map-heading').evaluate(heading => scrollTo({ top: scrollY + heading.getBoundingClientRect().top - 16, behavior: 'instant' }));
      await settleScroll(page);
      const boundary = await page.evaluate(() => ({ newsBottom: document.querySelector('#news')!.getBoundingClientRect().bottom,
        mapTop: document.querySelector('#map-heading')!.getBoundingClientRect().top }));
      expect(boundary.newsBottom).toBeLessThanOrEqual(boundary.mapTop + 1);
      expect(await storageSnapshot(page)).toEqual(entries);
      await expectNoPageOverflow(page);
    });

    test(`${size}: twelve states, arrow keys, Tab, upcoming entry and history preserve all approved prose and saved state`, async ({ page }, testInfo) => {
      test.setTimeout(150_000);
      await page.setViewportSize(viewport);
      const { entries } = await seedOldScenario(page);
      const copy = await page.locator('[data-approved-copy]').allTextContents();
      expect(copy).toHaveLength(16);
      for (const paragraph of await page.locator('[data-approved-copy]').all()) {
        await expectNoClosedDisclosure(paragraph);
        const style = await paragraph.evaluate(node => {
          const style = getComputedStyle(node); return { clamp: style.webkitLineClamp, font: Number.parseFloat(style.fontSize), overflow: style.overflowY };
        });
        expect(style.clamp).toBe('none');
        expect(style.font).toBeGreaterThanOrEqual(16);
        expect(style.overflow).not.toBe('hidden');
      }
      await goToStage(page, 'reader-03');
      const tabs = page.locator('.focus-tabs [role="tab"]');
      const ids = await tabs.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-focus-election')!));
      expect(ids).toHaveLength(12);
      let candidateParagraphCount = 0;
      let comparisonCount = 0;
      let candidateCount = 0;
      await tabs.first().focus();
      await page.keyboard.press('Home');
      for (const [index, id] of ids.entries()) {
        if (index) await page.keyboard.press('ArrowRight');
        const current = page.locator(`[data-focus-election="${id}"]`);
        await expect(current).toBeFocused();
        await expect(current).toHaveAttribute('aria-selected', 'true');
        await expect(page.locator('#focus-race-panel')).toHaveAttribute('aria-labelledby', `focus-tab-${id}`);
        expect(new URL(page.url()).searchParams.get('briefRace')).toBe(id);
        const parties = await page.locator('#focus-race-panel .reader-candidate-card').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-reader-party')));
        if (parties.includes('R') && parties.includes('D')) expect(parties).toEqual(['R', 'D']);
        if (id === '2026-NE-2-regular') {
          expect(parties).toEqual(['R', 'I']);
          await expect(page.locator('.reader-candidate-card[data-reader-party="I"] .reader-candidate-party')).toContainText('無所属');
        }
        for (const entry of readerCandidateExplanations.filter(entry => entry.electionId === id)) {
          candidateCount++;
          const context = page.locator(`[data-candidate-context="${entry.candidateId}"]`);
          const expectedParagraphs = entry.sections.flatMap(section => section.paragraphs);
          await expect(context.locator('.reader-candidate-context-paragraph')).toHaveCount(expectedParagraphs.length);
          for (const [paragraphIndex, expected] of expectedParagraphs.entries()) {
            await expectFullCandidateParagraph(context.locator('.reader-candidate-context-paragraph').nth(paragraphIndex), expected,
              context.locator('.reader-paragraph-sources').nth(paragraphIndex));
            candidateParagraphCount++;
          }
        }
        for (const [comparisonIndex, expected] of readerCandidateComparisons.filter(entry => entry.electionId === id).entries()) {
          const comparison = page.locator('.reader-candidate-comparison').nth(comparisonIndex);
          await expectFullCandidateParagraph(comparison.locator(':scope > p'), expected, comparison.locator(':scope > details'));
          comparisonCount++;
        }
        if (id === '2026-ME-2-regular') {
          await expect(page.locator('.reader-candidate-context-paragraph')).toHaveCount(7);
        }
      }
      // The data unit tests pin the supplied-copy inventory; additional states
      // remain absent here until their complete reviewed copy is delivered.
      expect(candidateCount).toBeGreaterThan(0);
      expect(candidateCount).toBe(readerCandidateExplanations.length);
      expect(candidateParagraphCount).toBe(readerCandidateExplanations.reduce((total, entry) =>
        total + entry.sections.reduce((count, section) => count + section.paragraphs.length, 0), 0));
      expect(comparisonCount).toBe(readerCandidateComparisons.length);
      await page.keyboard.press('ArrowRight');
      await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('ArrowLeft');
      await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('Tab');
      const upcoming = page.locator('#focus-race-panel [data-briefing-feed="upcoming"]');
      await expect(upcoming).toBeFocused();
      await page.keyboard.press('Enter');
      await settleScroll(page);
      await expect(page.locator('#news-heading')).toBeFocused();
      await expect(page.locator('#news-tab-upcoming')).toHaveAttribute('aria-selected', 'true');
      await expectCurrentStage(page, 'reader-03');
      await capture(page, testInfo, `${size}-upcoming-entry`);
      await page.locator('#news-tab-upcoming').focus();
      await page.keyboard.press('ArrowLeft');
      await expect(page.locator('#news-tab-recent')).toBeFocused();
      await expect(page.locator('#news-tab-recent')).toHaveAttribute('aria-selected', 'true');
      const article = page.locator('#news-list .news-card').first();
      const articleKey = await article.getAttribute('data-feed-key');
      await article.click();
      await expect(page.locator('#overlay-root')).toBeVisible();
      expect(new URL(page.url()).searchParams.get('newsItem')).toBe(articleKey);
      await page.reload();
      await ready(page);
      await expect(page.locator('#overlay-root')).toBeVisible();
      expect(new URL(page.url()).searchParams.get('newsItem')).toBe(articleKey);
      await page.goBack();
      await settleScroll(page);
      await expect(page.locator('#overlay-root')).toBeHidden();
      await page.goForward();
      await settleScroll(page);
      await expect(page.locator('#overlay-root')).toBeVisible();
      expect(new URL(page.url()).searchParams.get('newsItem')).toBe(articleKey);
      await page.keyboard.press('Escape');
      await expect(page.locator('#overlay-root')).toBeHidden();
      expect(await page.locator('[data-approved-copy]').allTextContents()).toEqual(copy);
      expect(await storageSnapshot(page)).toEqual(entries);
      await expectNoPageOverflow(page);
    });
  }
});
