import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'design-reference');
const baseURL = process.env.RESPONSIVE_TEST_URL || 'http://127.0.0.1:5173/';
const browserPath = process.env.PLAYWRIGHT_EXECUTABLE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const widths = [320, 390, 768, 1024, 1600];
const tabLabels = ['Bhutan Festivals', 'Tourist Visa', 'Budget Tariff', 'How to get Bhutan', 'Accommodations'];
const reports = [];

await fs.mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath, headless: true });

function monitor(page) {
  const diagnostics = { errors: [], failedResponses: [], externalRequests: [], submissions: [] };
  page.on('pageerror', error => diagnostics.errors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') diagnostics.errors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) diagnostics.failedResponses.push({ url: response.url(), status: response.status() });
  });
  page.on('request', request => {
    const url = new URL(request.url());
    if (/^https?:$/.test(url.protocol) && url.origin !== new URL(baseURL).origin) diagnostics.externalRequests.push(request.url());
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) diagnostics.submissions.push({ method: request.method(), url: request.url() });
  });
  return diagnostics;
}

async function assertNoOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  assert(dimensions.document <= dimensions.viewport + 1, `${label}: document overflow ${JSON.stringify(dimensions)}`);
  assert(dimensions.body <= dimensions.viewport + 1, `${label}: body overflow ${JSON.stringify(dimensions)}`);
  return dimensions;
}

async function checkSelectedTab(page, tabs, index, width) {
  const states = await tabs.evaluateAll(elements => elements.map(element => ({
    selected: element.getAttribute('aria-selected'),
    tabindex: element.getAttribute('tabindex'),
    id: element.id,
    controls: element.getAttribute('aria-controls'),
  })));
  assert.equal(states.filter(state => state.selected === 'true').length, 1, `${width}px: exactly one tab should be selected`);
  assert.equal(states[index].selected, 'true', `${width}px: ${tabLabels[index]} was not selected`);
  assert.equal(states[index].tabindex, '0', `${width}px: selected tab must be keyboard reachable`);
  assert(states.every((state, stateIndex) => stateIndex === index || state.tabindex === '-1'), `${width}px: tabs need roving tabindex`);
  assert(states[index].id && states[index].controls, `${width}px: tab is missing its panel relationship`);
  const relationship = await page.evaluate(({ id, controls }) => {
    const panel = document.getElementById(controls);
    return panel ? {
      role: panel.getAttribute('role'),
      labelledBy: panel.getAttribute('aria-labelledby'),
      visible: !!panel.getClientRects().length && !panel.hidden,
      text: panel.textContent.trim(),
      linkedTabExists: !!document.getElementById(id),
    } : null;
  }, states[index]);
  assert(relationship, `${width}px: selected tab references a missing panel`);
  assert.equal(relationship.role, 'tabpanel', `${width}px: selected content is not a tab panel`);
  assert(relationship.labelledBy?.split(/\s+/).includes(states[index].id), `${width}px: panel is not labelled by the selected tab`);
  assert(relationship.visible, `${width}px: selected panel is hidden`);
  assert(relationship.text.length > 40, `${width}px: selected panel is missing its content`);
  return relationship.text;
}

async function checkTabs(page, additions, width) {
  const tablist = additions.getByRole('tablist', { name: 'Bhutan travel information', exact: true });
  await tablist.waitFor({ state: 'visible' });
  const tabs = tablist.getByRole('tab');
  assert.equal(await tabs.count(), 5, `${width}px: travel planning needs five tabs`);
  for (const [index, label] of tabLabels.entries()) assert.equal(await tabs.nth(index).innerText(), label, `${width}px: travel tab label changed`);
  await checkSelectedTab(page, tabs, 0, width);
  const contents = [];
  for (let index = 0; index < tabLabels.length; index++) {
    await tabs.nth(index).click();
    contents.push(await checkSelectedTab(page, tabs, index, width));
    await assertNoOverflow(page, `${width}px ${tabLabels[index]} panel`);
  }
  assert.equal(new Set(contents).size, 5, `${width}px: different tabs show identical copy`);

  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await checkSelectedTab(page, tabs, 1, width);
  assert(await tabs.nth(1).evaluate(element => element === document.activeElement), `${width}px: ArrowRight did not move focus`);
  await page.keyboard.press('ArrowLeft');
  await checkSelectedTab(page, tabs, 0, width);
  await page.keyboard.press('ArrowLeft');
  await checkSelectedTab(page, tabs, 4, width);
  await page.keyboard.press('Home');
  await checkSelectedTab(page, tabs, 0, width);
  await page.keyboard.press('End');
  await checkSelectedTab(page, tabs, 4, width);
  await page.keyboard.press('ArrowRight');
  await checkSelectedTab(page, tabs, 0, width);
  return { labels: tabLabels, uniquePanels: contents.length, keyboard: 'ArrowLeft / ArrowRight / Home / End passed' };
}

async function checkDummyButtons(page, additions, width, initialURL, initialPageCount) {
  const panel = additions.getByRole('tabpanel');
  const festivalButton = panel.getByRole('button', { name: /view all festivals/i });
  assert.equal(await festivalButton.count(), 1, `${width}px: festival CTA missing`);
  await festivalButton.click();
  const electricity = page.getByRole('button', { name: 'Electricity', exact: true });
  assert.equal(await electricity.count(), 1, `${width}px: Electricity information control missing`);
  await electricity.click();
  assert.equal(page.url(), initialURL, `${width}px: dummy CTA navigated away`);
  assert.equal(page.context().pages().length, initialPageCount, `${width}px: dummy CTA opened a tab`);
}

async function checkMobileMenu(page, width) {
  if (width >= 1100) return;
  const toggle = await page.getByRole('button', { name: 'Open menu', exact: true }).elementHandle();
  assert(toggle, `${width}px: mobile menu control missing`);
  await toggle.click();
  await page.locator('.mobile-navigation').waitFor({ state: 'visible' });
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true', `${width}px: menu did not open`);
  await assertNoOverflow(page, `${width}px menu open`);
  await page.keyboard.press('Escape');
  await page.locator('.mobile-navigation').waitFor({ state: 'hidden' });
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false', `${width}px: menu did not close`);
}

try {
  for (const width of widths) {
    console.log(`Checking travel sections at ${width}px`);
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const diagnostics = monitor(page);
    await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    const initialURL = page.url();
    const initialPageCount = page.context().pages().length;
    const additions = page.locator('.travel-additions');
    assert.equal(await additions.count(), 1, `${width}px: expected one shared travel additions component`);
    await additions.scrollIntoViewIfNeeded();
    await additions.getByRole('heading', { name: 'Bhutan in a Glance', exact: true }).waitFor({ state: 'visible' });
    assert.equal(await additions.locator('.glance-gallery figure').count(), 3, `${width}px: glance photo count`);
    assert.equal(await additions.locator('.glance-fact-grid .glance-fact-card').count(), 7, `${width}px: glance fact count`);
    await additions.locator('img').evaluateAll(async images => {
      await Promise.all(images.map(image => image.decode().catch(() => {})));
    });
    const images = await additions.locator('img').evaluateAll(elements => elements.filter(image => image.getClientRects().length).map(image => ({ src: image.getAttribute('src'), loaded: image.complete && image.naturalWidth > 0 })));
    assert.equal(images.length, 4, `${width}px: festival and three Glance photos must be rendered`);
    assert.deepEqual(images.filter(image => !image.loaded), [], `${width}px: added section images failed to load`);
    const tabs = await checkTabs(page, additions, width);
    await checkDummyButtons(page, additions, width, initialURL, initialPageCount);
    await checkMobileMenu(page, width);
    assert.equal(page.url(), initialURL, `${width}px: travel controls changed the URL`);
    assert.equal(page.context().pages().length, initialPageCount, `${width}px: travel controls opened a new page`);
    const dimensions = await assertNoOverflow(page, `${width}px final`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(outputDirectory, `travel-${width}.png`), fullPage: true, animations: 'disabled', scale: 'css' });
    if ([390, 1600].includes(width)) await additions.screenshot({ path: path.join(outputDirectory, `travel-sections-${width}.png`), animations: 'disabled', scale: 'css' });
    assert.deepEqual(diagnostics.errors, [], `${width}px: browser errors`);
    assert.deepEqual(diagnostics.failedResponses, [], `${width}px: failed responses`);
    assert.deepEqual(diagnostics.externalRequests, [], `${width}px: portfolio requested an external URL`);
    assert.deepEqual(diagnostics.submissions, [], `${width}px: portfolio submitted a request`);
    reports.push({ width, mode: width < 1100 ? 'responsive' : 'desktop', dimensions, tabs, images, dummyButtons: 'passed', diagnostics });
    console.log(`Passed travel sections at ${width}px`);
    await page.close();
  }
  await fs.writeFile(path.join(outputDirectory, 'travel-verification.json'), JSON.stringify({ passed: true, reports }, null, 2));
  console.log(JSON.stringify({ passed: true, widths, tabNavigation: 'passed', portfolioControls: 'passed', screenshots: 'design-reference/travel-{width}.png', sectionCrops: 'design-reference/travel-sections-{390|1600}.png' }, null, 2));
} finally {
  await browser.close();
}
