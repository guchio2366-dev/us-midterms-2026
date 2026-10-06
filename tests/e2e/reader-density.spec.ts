import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import {
  capture, captureElement, expectNoClosedDisclosure, expectNoPageOverflow, goToStage,
  ready, settleScroll, stages, storageSnapshot,
} from './reader-helpers';

// Exact full production stylesheet emitted by the da66c32 restoration build.
// Both measurements below use the same live DOM and complete prose. Only CSS
// changes, so startup fixes and transient browser scroll positions cannot be
// mistaken for a reduction in the amount of text or number of reading stages.
const baselineHead = 'da66c32ed47d522d451c326e60cc77a45ff9313d';
const baselineCss = readFileSync(new URL('./fixtures/reader-layout-before-compact.css', import.meta.url), 'utf8');
const baselineCssSha256 = createHash('sha256').update(baselineCss).digest('hex');
const expectedBaselineCssSha256 = '84ef983fc3e6c044c99657a05fc5db471ec0accde2e82d1e4209422bd96aaace';

async function settleLayout(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await settleScroll(page);
}

async function readingGeometry(page: Page) {
  return page.evaluate(() => {
    const round = (value: number) => Math.round(value * 100) / 100;
    const box = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector)!;
      const rect = element.getBoundingClientRect();
      return { width: round(rect.width), height: round(rect.height), top: round(rect.top + scrollY) };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
      main: box('main'),
      opening: box('.reader-opening'),
      sections: [...document.querySelectorAll<HTMLElement>('main > section[data-reader-section]')].map(section => ({
        id: section.id, ...box(`#${section.id}`),
      })),
      map: box('#map'),
      mapSvg: box('#map svg'),
      mapColumn: box('.reader-map-workspace > .map-column'),
      mapWorkspace: box('.reader-map-workspace'),
      stateDetail: box('#detail'),
      mapViewBox: document.querySelector('#map svg')!.getAttribute('viewBox'),
      approvedCopy: [...document.querySelectorAll<HTMLElement>('[data-approved-copy]')].map(paragraph => {
        const style = getComputedStyle(paragraph);
        return {
          id: paragraph.dataset.approvedCopy,
          characters: paragraph.textContent!.length,
          fontSize: Number.parseFloat(style.fontSize),
          lineHeight: Number.parseFloat(style.lineHeight),
          height: round(paragraph.getBoundingClientRect().height),
        };
      }),
    };
  });
}

async function captureDensity(page: Page, testInfo: TestInfo, label: 'before' | 'after') {
  await capture(page, testInfo, `density-${label}-opening-viewport`);
  await captureElement(page, testInfo, `density-${label}-opening-complete`, page.locator('.reader-opening'));
  await goToStage(page, 'reader-03');
  await page.locator('.reader-full-map-link a[href="#map-heading"]').click();
  await settleScroll(page);
  await capture(page, testInfo, `density-${label}-map-context`);
  await captureElement(page, testInfo, `density-${label}-map-full`, page.locator('#map'));
}

test('measures compact spacing against restoration CSS without changing any reading text', async ({ page }, testInfo) => {
  expect(baselineCssSha256).toBe(expectedBaselineCssSha256);
  await page.goto('./');
  await ready(page);
  const originalStorage = await storageSnapshot(page);
  const originalText = await page.locator('main').textContent();
  const originalCopy = await page.locator('[data-approved-copy]').allTextContents();
  const originalStylesheets = await page.locator('link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(node => ({
    href: (node as HTMLLinkElement).href, disabled: (node as HTMLLinkElement).disabled,
  })));
  expect(originalStylesheets.length).toBeGreaterThan(0);
  await page.locator('link[rel="stylesheet"]').evaluateAll(nodes => nodes.forEach(node => {
    const link = node as HTMLLinkElement;
    link.dataset.densityOriginalDisabled = String(link.disabled);
    link.disabled = true;
  }));
  const baselineStyle = await page.addStyleTag({ content: baselineCss });
  await settleLayout(page);
  await expectNoPageOverflow(page);
  for (const paragraph of await page.locator('[data-approved-copy]').all()) await expectNoClosedDisclosure(paragraph);
  const before = await readingGeometry(page);
  const beforeText = await page.locator('main').textContent();
  expect(beforeText).toBe(originalText);
  expect(await page.locator('[data-approved-copy]').allTextContents()).toEqual(originalCopy);
  await captureDensity(page, testInfo, 'before');

  await page.locator('link[data-density-original-disabled]').evaluateAll(nodes => nodes.forEach(node => {
    const link = node as HTMLLinkElement;
    link.disabled = link.dataset.densityOriginalDisabled === 'true';
    delete link.dataset.densityOriginalDisabled;
  }));
  await baselineStyle.evaluate(node => { node.parentNode?.removeChild(node); });
  await settleLayout(page);
  await expectNoPageOverflow(page);
  for (const paragraph of await page.locator('[data-approved-copy]').all()) await expectNoClosedDisclosure(paragraph);
  const after = await readingGeometry(page);
  const afterText = await page.locator('main').textContent();
  expect(afterText).toBe(beforeText);
  expect(await page.locator('[data-approved-copy]').allTextContents()).toEqual(originalCopy);
  await captureDensity(page, testInfo, 'after');

  const heightChange = (first: number, last: number) => ({
    before: first, after: last, reductionPixels: Math.round((first - last) * 100) / 100,
    reductionPercent: Math.round((first - last) / first * 10_000) / 100,
  });
  const measurement = {
    method: 'Same current DOM, data, prose, and closed optional panels. Disable all final linked stylesheets and apply the exact full da66c32 compiled CSS for before; remove it and restore the original linked stylesheets for after. Wait for fonts, two animation frames, and settled scroll before measuring. No text is removed and no one-screen height is required.',
    baselineHead, baselineCssSha256, baselineCompiledAsset: 'index-mVMSxSJz.css',
    currentWorkflowSha: process.env.GITHUB_SHA ?? null,
    project: testInfo.project.name, stylesheets: originalStylesheets,
    completeMainTextSha256: createHash('sha256').update(afterText!).digest('hex'),
    completeMainTextUnchanged: beforeText === afterText,
    approvedParagraphCount: originalCopy.length,
    before, after,
    changes: {
      page: heightChange(before.document.height, after.document.height),
      opening: heightChange(before.opening.height, after.opening.height),
      sections: stages.map(stage => ({
        id: stage.id,
        ...heightChange(before.sections.find(section => section.id === stage.id)!.height,
          after.sections.find(section => section.id === stage.id)!.height),
      })),
      map: heightChange(before.map.height, after.map.height),
      mapColumn: heightChange(before.mapColumn.height, after.mapColumn.height),
    },
  };
  const path = testInfo.outputPath(`${testInfo.project.name}-density-measurements.json`);
  writeFileSync(path, JSON.stringify(measurement, null, 2) + '\n');
  await testInfo.attach(`${testInfo.project.name}: before-after density measurements`, { path, contentType: 'application/json' });

  expect(originalCopy).toHaveLength(16);
  expect(after.sections.map(section => section.id)).toEqual(stages.map(stage => stage.id));
  expect(after.document.height).toBeLessThan(before.document.height);
  expect(after.opening.height).toBeLessThan(before.opening.height);
  expect(after.approvedCopy.every(paragraph => paragraph.fontSize >= 16)).toBe(true);
  expect(after.mapViewBox).toBe(before.mapViewBox);
  expect(after.map.width).toBeGreaterThanOrEqual(before.map.width - 1);
  await expect(page.locator('#map [data-state-fips]')).toHaveCount(50);
  await expect(page.locator('#reader-simulation-disclosure')).not.toHaveAttribute('open', '');
  expect(await storageSnapshot(page)).toEqual(originalStorage);
});
