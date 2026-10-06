import { expect, test } from '@playwright/test';
import {
  capture, DRAFT_STORAGE_KEY, expectCurrentStage, expectNoPageOverflow, goToStage,
  ready, SAVED_STORAGE_KEY, seedOldScenario, settleScroll, stages, storageSnapshot,
} from './reader-helpers';

test('captures the opening and all four stages in the real browser', async ({ page }, testInfo) => {
  await page.goto('./');
  await ready(page);
  await capture(page, testInfo, '00-opening');
  for (const stage of stages) {
    await goToStage(page, stage.id);
    await capture(page, testInfo, `${stage.number}-${stage.capture}`);
  }
});

test('four-stage navigation, current position and history preserve the saved draft', async ({ page }, testInfo) => {
  const { entries } = await seedOldScenario(page);
  await page.goto('./?newsRace=2026-ME-2-regular#reader-01');
  await ready(page);
  expect(await storageSnapshot(page)).toEqual(entries);

  const nav = page.locator('main > .reader-navigation');
  await expect(nav.locator('a')).toHaveCount(4);
  expect(await nav.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href'))))
    .toEqual(stages.map(stage => `#${stage.id}`));
  expect(await page.locator('main > section[data-reader-section]').evaluateAll(nodes => nodes.map(node => node.id)))
    .toEqual(stages.map(stage => stage.id));
  await expect(nav.locator('.reader-nav-number')).toHaveText(['01', '02', '03', '04']);
  expect(await nav.evaluate(node => getComputedStyle(node).position))
    .toBe(testInfo.project.name.startsWith('mobile') ? 'sticky' : 'fixed');

  for (const stage of stages) {
    await goToStage(page, stage.id);
    await expectCurrentStage(page, stage.id);
    await expect(page.locator(`#${stage.id}-heading`)).toHaveText(stage.label);
    await expect(page.locator(`#${stage.id} > .reader-section-heading .reader-section-number`)).toHaveText(stage.number);
    expect(new URL(page.url()).searchParams.get('newsRace')).toBe('2026-ME-2-regular');
    expect(new URL(page.url()).hash).toBe(`#${stage.id}`);
    const geometry = await page.locator(`#${stage.id}-heading`).evaluate(heading => {
      const nav = document.querySelector('main > .reader-navigation')!;
      const clearance = getComputedStyle(nav).position === 'sticky' ? nav.getBoundingClientRect().bottom : 0;
      return { top: heading.getBoundingClientRect().top, clearance, height: innerHeight };
    });
    expect(geometry.top).toBeGreaterThanOrEqual(geometry.clearance - 1);
    expect(geometry.top).toBeLessThan(geometry.height / 2);
    await expectNoPageOverflow(page);
  }
  await page.goBack();
  await settleScroll(page);
  await expectCurrentStage(page, 'reader-03');
  await page.goForward();
  await settleScroll(page);
  await expectCurrentStage(page, 'reader-06');

  // A manual read-position change updates only aria-current, not the URL or saved data.
  const url = page.url();
  await page.locator('#reader-04-heading').evaluate(heading => {
    const nav = document.querySelector('main > .reader-navigation')!;
    const top = getComputedStyle(nav).position === 'sticky' ? nav.getBoundingClientRect().height + 8 : 16;
    window.scrollTo({ top: window.scrollY + heading.getBoundingClientRect().top - top, behavior: 'smooth' });
  });
  await settleScroll(page);
  await expectCurrentStage(page, 'reader-04');
  expect(page.url()).toBe(url);
  expect(await storageSnapshot(page)).toEqual(entries);
});

test('legacy section and numbered-heading links reveal their semantic content', async ({ page }) => {
  const { entries } = await seedOldScenario(page);
  const destinations = [
    { id: 'reader-02', stage: 'reader-03', disclosure: 'reader-02' },
    { id: 'reader-02-heading', stage: 'reader-03', disclosure: 'reader-02' },
    { id: 'reader-05', stage: 'reader-03', disclosure: 'reader-05' },
    { id: 'reader-05-heading', stage: 'reader-03', disclosure: 'reader-05' },
    { id: 'policy-workbench', stage: 'reader-03', disclosure: 'reader-05' },
    { id: 'powers', stage: 'reader-04', disclosure: 'power-disclosure' },
    { id: 'scenario-manager', stage: 'reader-04', disclosure: 'reader-simulation-disclosure' },
    { id: 'map-heading', stage: 'reader-04', disclosure: 'reader-simulation-disclosure' },
    { id: 'sources', stage: 'reader-06', disclosure: null },
  ];
  for (const destination of destinations) {
    await test.step(`#${destination.id}`, async () => {
      await page.goto(`./#${destination.id}`);
      await ready(page);
      await expect(page.locator(`#${destination.id}`)).toBeVisible();
      await expectCurrentStage(page, destination.stage);
      if (destination.disclosure) await expect(page.locator(`#${destination.disclosure}`)).toHaveAttribute('open', '');
      const closedAncestors = await page.locator(`#${destination.id}`).evaluate(target => {
        const closed = [];
        for (let node: Element | null = target; node; node = node.parentElement) {
          if (node instanceof HTMLDetailsElement && !node.open) closed.push(node.id || node.className);
        }
        return closed;
      });
      expect(closedAncestors).toEqual([]);
      expect(new URL(page.url()).hash).toBe(`#${destination.id}`);
      expect(await storageSnapshot(page)).toEqual(entries);
      await expectNoPageOverflow(page);
    });
  }
});

test('all twelve state tabs and policy reading remain read-only', async ({ page }, testInfo) => {
  const { entries } = await seedOldScenario(page);
  await goToStage(page, 'reader-03');
  const tabs = page.locator('.focus-tabs [role="tab"]');
  await expect(tabs).toHaveCount(12);
  const ids = await tabs.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-focus-election')!));
  for (const id of ids) {
    await page.locator(`[data-focus-election="${id}"]`).click();
    await expect(page.locator(`[data-focus-election="${id}"]`)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.focus-tabs [aria-selected="true"]')).toHaveCount(1);
    await expect(page.locator('#focus-race-panel')).toHaveAttribute('aria-labelledby', `focus-tab-${id}`);
    await expect(page.locator(`#focus-race-panel [data-reader-policy-election="${id}"]`)).toBeVisible();
    await expectNoPageOverflow(page);
  }
  // Keyboard movement is part of the tab contract, including wrapping to the first/last tab.
  await tabs.last().focus();
  await page.keyboard.press('Home');
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');

  for (const id of ['2026-MN-2-regular', '2026-NE-2-regular', '2026-ME-2-regular']) {
    await goToStage(page, 'reader-03');
    await page.locator(`[data-focus-election="${id}"]`).click();
    await page.locator(`#focus-race-panel [data-reader-policy-election="${id}"]`).click();
    await settleScroll(page);
    await expect(page.locator('#reader-05')).toHaveAttribute('open', '');
    await expect(page.locator('select[data-policy-action="choose-election"]')).toHaveValue(id);
    await expect(page.locator('[data-policy-reading-context]')).toBeVisible();
    await expectCurrentStage(page, 'reader-03');
    if (id.includes('-MN-') || id.includes('-NE-')) {
      await expect(page.locator('[data-policy-reading-context] [data-policy-coverage]')).toContainText('未収録');
    }
    expect(await storageSnapshot(page)).toEqual(entries);
    await expectNoPageOverflow(page);
  }
  await capture(page, testInfo, 'policy-reading-context');
  await page.goBack();
  await settleScroll(page);
  await expectCurrentStage(page, 'reader-03');
  expect(await storageSnapshot(page)).toEqual(entries);
});

test('issue overlay power links open both the new outer and old inner disclosures', async ({ page }) => {
  const { entries } = await seedOldScenario(page);
  await page.goto('./#reader-02');
  await ready(page);
  await page.locator('#reader-02 [data-reader-issue="health-family"]').first().click();
  const powerLink = page.locator('#overlay-content [data-power-link]').first();
  await expect(powerLink).toBeVisible();
  const powerId = await powerLink.getAttribute('data-power-link');
  await powerLink.click();
  await settleScroll(page);
  await expect(page.locator('#power-disclosure')).toHaveAttribute('open', '');
  const powerTarget = await page.evaluate(() => matchMedia('(max-width: 800px)').matches)
    ? page.locator(`#power-card-${powerId}`) : page.locator(`#power-${powerId}`);
  await expect(powerTarget).toBeVisible();
  const powerTop = await powerTarget.evaluate(target => target.getBoundingClientRect().top);
  const clearance = await page.locator('main > .reader-navigation').evaluate(nav =>
    getComputedStyle(nav).position === 'sticky' ? nav.getBoundingClientRect().bottom : 0);
  expect(powerTop).toBeGreaterThanOrEqual(clearance - 1);
  expect(powerTop).toBeLessThan(page.viewportSize()!.height);
  const outer = page.locator('#powers').locator('xpath=ancestor::details[1]');
  await expect(outer).toHaveAttribute('open', '');
  expect(await storageSnapshot(page)).toEqual(entries);
  await expectNoPageOverflow(page);
});

test('old Brown proposal supports candidate changes, save, compare, share and Undo', async ({ page }, testInfo) => {
  // Exercise the app's visible fallback instead of depending on CI clipboard permissions.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new Error('Clipboard unavailable in this test'); } },
    });
  });
  const { state } = await seedOldScenario(page);
  await page.goto('./?race=2026-OH-3-special#simulator');
  await ready(page);
  await expect(page.locator('#reader-simulation-disclosure')).toHaveAttribute('open', '');
  const choice = page.locator('#detail [data-senate-choice="OH-3"]');
  await expect(choice).toHaveValue('candidate:cand-oh-sherrod-brown');
  await expect(page.locator('#sim-result .scenario-baseline-note')).toContainText('2026-09-24');
  await expect(page.locator('#sim-result .projected > div > strong')).toHaveText(['47', '6', '47']);
  const next = await choice.locator('option[value^="candidate:"]').evaluateAll(options =>
    options.map(option => (option as HTMLOptionElement).value).find(value => value !== 'candidate:cand-oh-sherrod-brown'));
  expect(next).toBeTruthy();
  await choice.selectOption(next!);
  await expect.poll(async () => JSON.parse((await storageSnapshot(page))[DRAFT_STORAGE_KEY]!).senate['OH-3'].candidateId)
    .toBe(next!.slice('candidate:'.length));
  await page.locator('#scenario-name').fill('E2E 比較案');
  await page.locator('[data-save-scenario]').click();
  await expect(page.locator('[data-compare-scenario]')).toHaveCount(2);
  const compareIds = await page.locator('[data-compare-scenario]').evaluateAll(inputs => inputs.map(input => input.getAttribute('data-compare-scenario')!));
  for (const id of compareIds) await page.locator(`[data-compare-scenario="${id}"]`).check();
  await expect(page.locator('.saved-comparison article')).toHaveCount(2);
  await capture(page, testInfo, 'simulation-saved-comparison');
  await page.locator('#scenario-manager [data-undo-scenario]').click();
  await expect(choice).toHaveValue('candidate:cand-oh-sherrod-brown');
  await expect.poll(async () => JSON.parse((await storageSnapshot(page))[DRAFT_STORAGE_KEY]!).senate)
    .toEqual(state.senate);
  const draft = JSON.parse((await storageSnapshot(page))[DRAFT_STORAGE_KEY]!);
  expect(draft.senateBaseline).toEqual(state.senateBaseline);
  expect(draft.house).toEqual(state.house);
  expect(draft.reasoning.privateNote).toBe(state.reasoning!.privateNote);
  await page.locator('[data-share-scenario]').click();
  const sharedInput = page.locator('#scenario-action-status input[readonly]');
  await expect(sharedInput).toBeVisible();
  const sharedUrl = await sharedInput.inputValue();
  const payload = new URL(sharedUrl).searchParams.get('s');
  expect(payload).toBeTruthy();
  const shared = await page.evaluate(payload => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload!.replaceAll('-', '+').replaceAll('_', '/')), value => value.charCodeAt(0)))), payload);
  expect(shared.senate).toEqual(state.senate);
  expect(shared.senateBaseline).toEqual(state.senateBaseline);
  expect(JSON.stringify(shared)).not.toContain('E2E private note');
  expect(shared.reasoning).not.toHaveProperty('privateNote');
  const beforeShareView = await storageSnapshot(page);
  const saved = JSON.parse(beforeShareView[SAVED_STORAGE_KEY]!);
  expect(saved).toHaveLength(2);
  await page.goto(sharedUrl);
  await ready(page);
  await expect(page.locator('.shared-pending')).toBeVisible();
  expect(await storageSnapshot(page)).toEqual(beforeShareView);
  await expect(page.locator('#detail [data-senate-choice="OH-3"]')).toHaveValue('candidate:cand-oh-sherrod-brown');
  await expectNoPageOverflow(page);
});
