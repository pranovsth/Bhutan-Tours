import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'design-reference');
const baseURL = process.env.RESPONSIVE_TEST_URL || 'http://127.0.0.1:5173/';
const browserPath = process.env.PLAYWRIGHT_EXECUTABLE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const widths = [320, 390, 480, 768, 1024, 1099, 1100, 1600];
const reports = [];

await fs.mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath, headless: true });

function monitor(page) {
  const diagnostics = { errors: [], failedResponses: [], submissions: [] };
  page.on('pageerror', error => diagnostics.errors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') diagnostics.errors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) diagnostics.failedResponses.push({ url: response.url(), status: response.status() });
  });
  page.on('request', request => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
      diagnostics.submissions.push({ method: request.method(), url: request.url() });
    }
  });
  return diagnostics;
}

function assertClean(diagnostics, label) {
  assert.deepEqual(diagnostics.errors, [], `${label}: browser errors`);
  assert.deepEqual(diagnostics.failedResponses, [], `${label}: failed asset responses`);
  assert.deepEqual(diagnostics.submissions, [], `${label}: portfolio controls submitted a request`);
}

async function assertNoOverflow(page, label) {
  const dimensions = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return {
      viewport: width,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      overflowingElements: [...document.querySelectorAll('body *')].flatMap(element => {
        const rect = element.getBoundingClientRect();
        if (rect.width && (rect.left < -1 || rect.right > width + 1)) {
          return [{ tag: element.tagName, className: String(element.className).slice(0, 100), left: rect.left, right: rect.right }];
        }
        return [];
      }).slice(0, 12),
    };
  });
  assert(dimensions.document <= dimensions.viewport + 1, `${label}: horizontal overflow ${JSON.stringify(dimensions)}`);
  assert(dimensions.body <= dimensions.viewport + 1, `${label}: body horizontal overflow ${JSON.stringify(dimensions)}`);
  return dimensions;
}

async function loadAllSections(page) {
  await page.evaluate(() => document.fonts.ready);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(500, page.viewportSize().height - 100);
  for (let top = 0; top < height; top += step) {
    await page.evaluate(y => window.scrollTo(0, y), top);
    await page.waitForTimeout(65);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.evaluate(async () => {
    const visibleImages = [...document.images].filter(image => image.getClientRects().length);
    await Promise.all(visibleImages.map(image => image.decode().catch(() => {})));
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
}

async function assertMode(page, width) {
  if (width < 1100) {
    const site = page.locator('.responsive-site');
    assert(await site.isVisible(), `${width}px: responsive layout is missing`);
    assert(!(await page.locator('.prototype').isVisible()), `${width}px: desktop composition is still visible`);
    const typography = await site.evaluate(element => {
      const h1 = element.querySelector('h1');
      const paragraphs = [...element.querySelectorAll('p')].filter(paragraph => paragraph.getClientRects().length);
      return {
        h1: h1 ? Number.parseFloat(getComputedStyle(h1).fontSize) : 0,
        paragraphs: paragraphs.map(paragraph => ({ text: paragraph.textContent.trim().slice(0, 70), size: Number.parseFloat(getComputedStyle(paragraph).fontSize) })),
      };
    });
    assert(typography.h1 >= 48, `${width}px: main heading is too small (${typography.h1}px)`);
    assert(typography.paragraphs.length > 0, `${width}px: body copy is missing`);
    assert.deepEqual(typography.paragraphs.filter(paragraph => paragraph.size < 14), [], `${width}px: unreadable body copy`);
    assert.equal(await site.locator('.holiday-card').count(), 3, `${width}px: compact holiday cards`);
    assert.equal(await site.locator('.feature-journey').count(), 3, `${width}px: featured tour cards`);
    return { mode: 'responsive', headingSize: typography.h1, paragraphCount: typography.paragraphs.length };
  }

  assert(await page.locator('.prototype').isVisible(), `${width}px: original desktop composition is missing`);
  assert(!(await page.locator('.responsive-site').isVisible()), `${width}px: responsive composition is still visible`);
  const stage = await page.locator('.design-stage').boundingBox();
  assert(stage, `${width}px: desktop stage is missing`);
  if (width === 1600) {
    const extensionHeight = Number(await page.locator('.design-stage').getAttribute('data-extension-height') || 0);
    assert(Math.abs(stage.width - 1600) < 0.1, `Desktop stage width changed: ${stage.width}`);
    assert(Math.abs(stage.height - (6406 + extensionHeight)) < 0.1, `Desktop stage height changed: ${stage.height}`);
  }
  return { mode: 'desktop', stage };
}

async function checkResponsiveControls(page, width) {
  const site = page.locator('.responsive-site');
  const menu = await site.getByRole('button', { name: 'Open menu', exact: true }).elementHandle();
  assert(menu, `${width}px: mobile menu control is missing`);
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  await menu.click();
  await site.locator('.mobile-navigation').waitFor({ state: 'visible' });
  assert.equal(await menu.getAttribute('aria-expanded'), 'true', `${width}px: menu state did not open`);
  await assertNoOverflow(page, `${width}px with menu open`);
  await page.keyboard.press('Escape');
  await site.locator('.mobile-navigation').waitFor({ state: 'hidden' });
  assert.equal(await menu.getAttribute('aria-expanded'), 'false', `${width}px: Escape did not close menu`);

  const initialURL = page.url();
  const initialTabs = page.context().pages().length;
  const dummyButtons = site.getByRole('button', { name: /read more|view more/i });
  assert(await dummyButtons.count() > 0, `${width}px: expected a dummy CTA to exercise`);
  for (let index = 0; index < Math.min(3, await dummyButtons.count()); index++) {
    await dummyButtons.nth(index).click();
    assert.equal(page.url(), initialURL, `${width}px: dummy CTA navigated away`);
    assert.equal(page.context().pages().length, initialTabs, `${width}px: dummy CTA opened a tab`);
  }

  await site.getByRole('textbox', { name: 'Enter your e-mail', exact: true }).fill('portfolio@example.com');
  await site.getByRole('button', { name: 'Subscribe to email alerts', exact: true }).click();
  await page.waitForTimeout(100);
  assert.equal(page.url(), initialURL, `${width}px: newsletter navigated away`);
  assert.equal(page.context().pages().length, initialTabs, `${width}px: newsletter opened a tab`);
  await site.getByRole('textbox', { name: 'Enter your e-mail', exact: true }).fill('');
  await page.evaluate(() => window.scrollTo(0, 0));
}

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: width < 1100 ? 900 : 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const diagnostics = monitor(page);
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await loadAllSections(page);
    const mode = await assertMode(page, width);
    if (width < 1100) await checkResponsiveControls(page, width);
    const dimensions = await assertNoOverflow(page, `${width}px`);
    const images = await page.locator('img').evaluateAll(elements => elements.filter(image => image.getClientRects().length).map(image => ({ src: image.getAttribute('src'), loaded: image.complete && image.naturalWidth > 0 })));
    assert(images.length > 0, `${width}px: no rendered images`);
    assert.deepEqual(images.filter(image => !image.loaded), [], `${width}px: broken or unloaded images`);
    await page.screenshot({ path: path.join(outputDirectory, `responsive-${width}.png`), fullPage: true, animations: 'disabled', scale: 'css' });
    assertClean(diagnostics, `${width}px`);
    reports.push({ width, ...mode, dimensions, images: images.length, controls: width < 1100 ? 'passed' : 'desktop preserved', diagnostics });
    await page.close();
  }

  const resizePage = await browser.newPage({ viewport: { width: 1024, height: 900 }, reducedMotion: 'reduce' });
  const resizeDiagnostics = monitor(resizePage);
  await resizePage.goto(baseURL, { waitUntil: 'networkidle' });
  const resizeModes = [];
  for (const width of [1024, 1600, 1024]) {
    await resizePage.setViewportSize({ width, height: 900 });
    await resizePage.waitForTimeout(250);
    resizeModes.push({ width, ...await assertMode(resizePage, width) });
    await assertNoOverflow(resizePage, `${width}px after resize`);
  }
  await checkResponsiveControls(resizePage, 1024);
  assertClean(resizeDiagnostics, '1024 → 1600 → 1024 resize');
  reports.push({ resize: resizeModes, diagnostics: resizeDiagnostics });
  await resizePage.close();
  await fs.writeFile(path.join(outputDirectory, 'responsive-verification.json'), JSON.stringify({ passed: true, reports }, null, 2));
  console.log(JSON.stringify({ passed: true, widths, resize: '1024 → 1600 → 1024', screenshots: 'design-reference/responsive-{width}.png' }, null, 2));
} finally {
  await browser.close();
}
