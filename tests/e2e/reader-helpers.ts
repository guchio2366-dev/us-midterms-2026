import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import type { ScenarioState } from '../../src/scenario/model';
import { oldBrownFixture } from './fixtures/old-brown';

export const DRAFT_STORAGE_KEY = 'us-midterms-2026:scenario-draft:v2';
export const SAVED_STORAGE_KEY = 'us-midterms-2026:scenarios:v2';
export const stages = [
  { id: 'reader-01', number: '01', label: '中間選挙の仕組み', capture: 'mechanisms' },
  { id: 'reader-04', number: '02', label: '議会の議席配分', capture: 'seats' },
  { id: 'reader-03', number: '03', label: '各州の情勢と候補者', capture: 'states' },
  { id: 'reader-06', number: '04', label: '今後の見通し', capture: 'outlook' },
] as const;

export async function ready(page: Page) {
  await expect(page.locator('body')).toHaveClass(/reader-experience/);
  await expect(page.locator('main > .reader-navigation a')).toHaveCount(4);
  // Both bundled maps must load; an HTML response or missing base path is a failure.
  await expect(page.locator('#map [data-state-fips]')).toHaveCount(50);
  await expect(page.locator('#house-map svg')).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
  await settleScroll(page);
}

/** Wait for actual scroll geometry to stop, then allow the 120 ms current-section debounce. */
export async function settleScroll(page: Page) {
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const started = performance.now();
    let changedAt = started;
    let x = window.scrollX;
    let y = window.scrollY;
    const check = () => {
      const now = performance.now();
      if (Math.abs(window.scrollX - x) > 0.5 || Math.abs(window.scrollY - y) > 0.5) {
        x = window.scrollX;
        y = window.scrollY;
        changedAt = now;
      }
      if (now - started >= 400 && now - changedAt >= 250) return resolve();
      if (now - started > 8_000) return reject(new Error('The reader did not finish scrolling.'));
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  }));
}

export async function goToStage(page: Page, id: string) {
  await page.locator(`main > .reader-navigation a[href="#${id}"]`).click();
  await settleScroll(page);
}

export async function expectCurrentStage(page: Page, id: string) {
  const current = page.locator('main > .reader-navigation a[aria-current="location"]');
  await expect(current).toHaveCount(1);
  await expect(current).toHaveAttribute('href', `#${id}`);
}

export async function expectNoPageOverflow(page: Page) {
  const size = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(size.content, JSON.stringify(size)).toBeLessThanOrEqual(size.viewport + 1);
  expect(size.body, JSON.stringify(size)).toBeLessThanOrEqual(size.viewport + 1);
}

export async function capture(page: Page, testInfo: TestInfo, name: string) {
  await settleScroll(page);
  const path = testInfo.outputPath(`${testInfo.project.name}-${name}.png`);
  await page.screenshot({ path, animations: 'disabled' });
  await testInfo.attach(`${testInfo.project.name}: ${name}`, { path, contentType: 'image/png' });
}

/** Capture a complete reading surface when it is taller than a phone viewport. */
export async function captureElement(page: Page, testInfo: TestInfo, name: string, target: Locator) {
  await settleScroll(page);
  const path = testInfo.outputPath(`${testInfo.project.name}-${name}.png`);
  await target.screenshot({ path, animations: 'disabled' });
  await testInfo.attach(`${testInfo.project.name}: ${name}`, { path, contentType: 'image/png' });
}

export async function expectNoClosedDisclosure(target: Locator) {
  await expect(target).toBeVisible();
  const closedAncestors = await target.evaluate(element => {
    const closed = [];
    for (let node: Element | null = element; node; node = node.parentElement) {
      if (node instanceof HTMLDetailsElement && !node.open) closed.push(node.id || node.className);
    }
    return closed;
  });
  expect(closedAncestors).toEqual([]);
}

export async function expectHeadingInView(page: Page, selector: string) {
  const geometry = await page.locator(selector).evaluate(heading => {
    const nav = document.querySelector('main > .reader-navigation')!;
    const clearance = getComputedStyle(nav).position === 'sticky' ? nav.getBoundingClientRect().bottom : 0;
    return { top: heading.getBoundingClientRect().top, clearance, height: innerHeight };
  });
  expect(geometry.top).toBeGreaterThanOrEqual(geometry.clearance - 1);
  expect(geometry.top).toBeLessThan(geometry.height / 2);
}

export async function storageSnapshot(page: Page): Promise<Record<string, string | null>> {
  return page.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])));
}

export function oldBrownScenario(): ScenarioState {
  return JSON.parse(JSON.stringify(oldBrownFixture)) as ScenarioState;
}

export async function seedOldScenario(page: Page) {
  await page.goto('./');
  await ready(page);
  const state = oldBrownScenario();
  const entries = {
    [DRAFT_STORAGE_KEY]: JSON.stringify(state),
    [SAVED_STORAGE_KEY]: JSON.stringify([{ id: 'e2e-old-brown', name: '旧基準のBrown案', savedAt: state.updatedAt, state }]),
    'us-midterms-2026:power-disclosure:v1': 'closed',
  };
  await page.evaluate(entries => {
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
  }, entries);
  await page.reload();
  await ready(page);
  return { state, entries };
}
