import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer-core';
import { startServer } from '../src/server/index.js';
import { CANONICAL_RECIPES } from '../src/shared/sample-data.js';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function clickButtonWithText(page: Page | ElementHandle, text: string): Promise<void> {
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const content = await btn.evaluate((el) => el.textContent || '');
    if (content.includes(text)) {
      await btn.click();
      return;
    }
  }
  throw new Error(`Button containing text "${text}" not found.`);
}

async function findCardWithText(page: Page, text: string): Promise<ElementHandle | null> {
  const cards = await page.$$('.recipe-card');
  for (const card of cards) {
    const content = await card.evaluate((el) => el.textContent || '');
    if (content.includes(text)) {
      return card;
    }
  }
  return null;
}

test('Product Acceptance Test: All 4 Canonical Recipes in Real Product Experience', async (t) => {
  process.env.NODE_ENV = 'production';
  const testDbFile = path.resolve(process.cwd(), 'data/atlas_canonical_browser_test.db');
  if (fs.existsSync(testDbFile)) {
    try { fs.unlinkSync(testDbFile); } catch {}
  }

  const TEST_PORT = 3335;
  const serverInstance = await startServer(TEST_PORT, testDbFile, CANONICAL_RECIPES);

  assert.ok(fs.existsSync(CHROME_PATH), `Chrome executable not found at ${CHROME_PATH}`);

  const browser: Browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900'],
  });

  t.after(async () => {
    try { await browser.close(); } catch {}
    try { await serverInstance.close(); } catch {}
    [testDbFile, `${testDbFile}.v1.bak`, `${testDbFile}-wal`, `${testDbFile}-shm`].forEach((f) => {
      if (fs.existsSync(f)) {
        try { fs.unlinkSync(f); } catch {}
      }
    });
  });

  const page: Page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleLogs: string[] = [];
  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleLogs.push(`[PAGE_ERROR] ${err.message}`));

  const baseUrl = `http://localhost:${TEST_PORT}`;

  // =========================================================================
  // SCENARIO 1: CATALOG & SEARCH FOR ALL 4 CANONICAL RECIPES
  // =========================================================================
  console.log('--- SCENARIO 1: CATALOG & SEARCH VERIFICATION ---');
  await page.goto(`${baseUrl}?mode=editorial`, { waitUntil: 'networkidle0' });

  // 1. Verify Catalog shows all 4 canonical recipes
  await page.waitForSelector('.recipe-grid');
  let cards = await page.$$('.recipe-card');
  assert.strictEqual(cards.length, 4, 'Expected all 4 canonical recipes in product catalog');

  const cardTitles = await page.$$eval('.card-title', (els) => els.map((el) => el.textContent?.trim()));
  assert.ok(cardTitles.includes('Tagliatelle al Ragù alla Bolognese'));
  assert.ok(cardTitles.includes('Risotto alla Milanese Tradizionale'));
  assert.ok(cardTitles.includes('Boeuf Bourguignon Tradițional'));
  assert.ok(cardTitles.includes('Soufflé Chaud au Fromage'));

  // 2. Search filtering
  const searchInput = await page.$('.search-input');
  assert.ok(searchInput, 'Search bar must exist');

  // Search "Risotto"
  await searchInput.type('Risotto');
  await new Promise((r) => setTimeout(r, 200));
  cards = await page.$$('.recipe-card');
  assert.strictEqual(cards.length, 1, 'Only Risotto should match search "Risotto"');

  // Clear search
  await searchInput.focus();
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await new Promise((r) => setTimeout(r, 200));

  // Search "Franceză" in search bar (matches both Boeuf and Soufflé by culinary_tradition)
  await searchInput.type('Franceză');
  await new Promise((r) => setTimeout(r, 200));
  cards = await page.$$('.recipe-card');
  assert.strictEqual(cards.length, 2, 'Expected 2 French canonical recipes (Boeuf & Soufflé)');

  // Clear search
  await searchInput.focus();
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await new Promise((r) => setTimeout(r, 200));

  // Select exact tradition filter for Bolognese
  const traditionSelect = (await page.$$('.select-filter'))[1];
  assert.ok(traditionSelect, 'Tradition filter dropdown must exist');
  await traditionSelect.select('Bologneză (Emilia-Romagna)');
  await new Promise((r) => setTimeout(r, 200));
  cards = await page.$$('.recipe-card');
  assert.strictEqual(cards.length, 1, 'Expected 1 Bolognese recipe');

  // Reset tradition filter
  await traditionSelect.select('');
  await new Promise((r) => setTimeout(r, 200));
  cards = await page.$$('.recipe-card');
  assert.strictEqual(cards.length, 4, 'Catalog restored to 4 canonical recipes');
  console.log('✓ Scenario 1 passed');

  // =========================================================================
  // SCENARIO 2: CANONICAL RECIPE 1 — TAGLIATELLE AL RAGÙ ALLA BOLOGNESE
  // =========================================================================
  console.log('--- SCENARIO 2: TAGLIATELLE BOLOGNESE V2 VERIFICATION ---');
  const tagliatelleCard = await findCardWithText(page, 'Tagliatelle al Ragù');
  assert.ok(tagliatelleCard);
  await tagliatelleCard.click();
  await page.waitForSelector('.recipe-title-input');

  // Verify Title
  const titleVal = await page.$eval('.recipe-title-input', (el: any) => el.value);
  assert.strictEqual(titleVal, 'Tagliatelle al Ragù alla Bolognese');

  // Check Ingredients Tab (18 ingredients)
  let tabs = await page.$$('.tab-btn');
  await tabs[1].click(); // Tab 2: Ingrediente
  await page.waitForSelector('.ing-table tbody tr');
  let ingredientRows = await page.$$('.ing-table tbody tr');
  assert.strictEqual(ingredientRows.length, 18, 'Tagliatelle must have 18 ingredients');

  // Check Steps Tab (8 steps)
  tabs = await page.$$('.tab-btn');
  await tabs[2].click(); // Tab 3: Pași
  await page.waitForSelector('.step-card');
  let stepCards = await page.$$('.step-card');
  assert.strictEqual(stepCards.length, 8, 'Tagliatelle must have 8 steps');

  // Check Preview Tab: V2 details (DAG parallel tracks + convergence)
  tabs = await page.$$('.tab-btn');
  await tabs[3].click(); // Tab 4: Previzualizare
  await new Promise((r) => setTimeout(r, 300));
  const previewText = await page.$eval('.main-content', (el) => el.textContent || '');
  assert.ok(previewText.includes('Pornire Paralelă Independentă (T=0)'), 'Parallel track for soffritto and pasta fresca');
  assert.ok(previewText.includes('Depinde de: step_ragu_05, step_pasta_07'), 'Step 8 convergence');
  assert.ok(previewText.includes('Atestare Istorică & Nivel de Încredere'), 'Claims section displayed');

  // Return to Catalog
  await clickButtonWithText(page, 'Bibliotecă');
  await page.waitForSelector('.recipe-grid');
  console.log('✓ Scenario 2 passed');

  // =========================================================================
  // SCENARIO 3: CANONICAL RECIPE 2 — RISOTTO ALLA MILANESE TRADIZIONALE
  // =========================================================================
  console.log('--- SCENARIO 3: RISOTTO ALLA MILANESE V2 VERIFICATION ---');
  const risottoCard = await findCardWithText(page, 'Risotto alla Milanese');
  assert.ok(risottoCard);
  await risottoCard.click();
  await page.waitForSelector('.recipe-title-input');

  // Check Ingredients count (10)
  tabs = await page.$$('.tab-btn');
  await tabs[1].click();
  await page.waitForSelector('.ing-table tbody tr');
  const risottoIngs = await page.$$('.ing-table tbody tr');
  assert.strictEqual(risottoIngs.length, 10, 'Risotto must have 10 ingredients');

  // Check Preview Tab: Mantecatura thermal constraint & risks
  tabs = await page.$$('.tab-btn');
  await tabs[3].click();
  await new Promise((r) => setTimeout(r, 300));
  const risottoPreview = await page.$eval('.main-content', (el) => el.textContent || '');
  assert.ok(risottoPreview.includes('Activ: 32 min'), 'Timing active 32 min');
  assert.ok(risottoPreview.includes('Miez: -75°C') || risottoPreview.includes('75°C'), 'Thermal barrier <= 75°C');
  assert.ok(risottoPreview.includes('Risc Ireversibil'), 'Irreversible risk badge on mantecatura');

  // Return to Catalog
  await clickButtonWithText(page, 'Bibliotecă');
  await page.waitForSelector('.recipe-grid');
  console.log('✓ Scenario 3 passed');

  // =========================================================================
  // SCENARIO 4: CANONICAL RECIPE 3 — BOEUF BOURGUIGNON TRADIȚIONAL
  // =========================================================================
  console.log('--- SCENARIO 4: BOEUF BOURGUIGNON V2 VERIFICATION ---');
  const boeufCard = await findCardWithText(page, 'Boeuf Bourguignon');
  assert.ok(boeufCard);
  await boeufCard.click();
  await page.waitForSelector('.recipe-title-input');

  // Check Ingredients count (17)
  tabs = await page.$$('.tab-btn');
  await tabs[1].click();
  await page.waitForSelector('.ing-table tbody tr');
  const boeufIngs = await page.$$('.ing-table tbody tr');
  assert.strictEqual(boeufIngs.length, 17, 'Boeuf must have 17 ingredients');

  // Check Preview Tab: 24h lead time, 150°C oven thermal constraint, parallel garniture
  tabs = await page.$$('.tab-btn');
  await tabs[3].click();
  await new Promise((r) => setTimeout(r, 300));
  const boeufPreview = await page.$eval('.main-content', (el) => el.textContent || '');
  assert.ok(boeufPreview.includes('Maturare: 24 ore'), 'Lead time 24h maturation');
  assert.ok(boeufPreview.includes('150°C'), 'Oven thermal constraint 150°C');
  assert.ok(boeufPreview.includes('Pornire Paralelă Independentă (T=0)'), 'Parallel garniture track');

  // Return to Catalog
  await clickButtonWithText(page, 'Bibliotecă');
  await page.waitForSelector('.recipe-grid');
  console.log('✓ Scenario 4 passed');

  // =========================================================================
  // SCENARIO 5: CANONICAL RECIPE 4 — SOUFFLÉ CHAUD AU FROMAGE
  // =========================================================================
  console.log('--- SCENARIO 5: SOUFFLÉ CHAUD AU FROMAGE V2 VERIFICATION ---');
  const souffleCard = await findCardWithText(page, 'Soufflé Chaud');
  assert.ok(souffleCard);
  await souffleCard.click();
  await page.waitForSelector('.recipe-title-input');

  // Check Ingredients count (11)
  tabs = await page.$$('.tab-btn');
  await tabs[1].click();
  await page.waitForSelector('.ing-table tbody tr');
  const souffleIngs = await page.$$('.ing-table tbody tr');
  assert.strictEqual(souffleIngs.length, 11, 'Soufflé must have 11 ingredients');

  // Check Preview Tab: Step 3 <=55°C, egg whites quality, oven 190°C static, 120-180s presentation window
  tabs = await page.$$('.tab-btn');
  await tabs[3].click();
  await new Promise((r) => setTimeout(r, 300));
  const soufflePreview = await page.$eval('.main-content', (el) => el.textContent || '');
  assert.ok(soufflePreview.includes('55°C'), 'Béchamel cooling threshold <= 55°C');
  assert.ok(soufflePreview.includes('190°C'), 'Oven static thermal constraint 190°C');
  assert.ok(soufflePreview.includes('Risc Ireversibil'), 'Irreversible risk badge on cooling & baking');
  // HACCP CCP must NOT be present
  assert.ok(!soufflePreview.includes('Punct Critic HACCP'), 'HACCP CCP must not be incorrectly applied');

  console.log('✓ Scenario 5 passed');

  // =========================================================================
  // SCENARIO 6: PERSISTENCE & EDIT ROUNDTRIP VIA UI
  // =========================================================================
  console.log('--- SCENARIO 6: PERSISTENCE ROUNDTRIP VIA UI ---');
  // Edit summary in General Info (Tab 0)
  tabs = await page.$$('.tab-btn');
  await tabs[0].click();
  await page.waitForSelector('textarea');
  const summaryTextarea = await page.$('textarea');
  assert.ok(summaryTextarea);
  await summaryTextarea.focus();
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await summaryTextarea.type('Soufflé clasic franțuzesc testat editorial pentru stabilitatea spumei proteice.');

  // Save changes
  await clickButtonWithText(page, 'Salvează Schița');
  await new Promise((r) => setTimeout(r, 600));

  // Reload page to verify persistence in SQLite through UI
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('.recipe-grid');

  // Re-open Soufflé
  const reloadedSouffle = await findCardWithText(page, 'Soufflé Chaud');
  assert.ok(reloadedSouffle, 'Soufflé must be present after reload');
  await reloadedSouffle.click();
  await page.waitForSelector('textarea');

  const reloadedSummary = await page.$eval('textarea', (el: any) => el.value);
  assert.strictEqual(reloadedSummary, 'Soufflé clasic franțuzesc testat editorial pentru stabilitatea spumei proteice.');

  // Verify steps and V2 fields remain preserved
  tabs = await page.$$('.tab-btn');
  await tabs[3].click();
  await new Promise((r) => setTimeout(r, 300));
  const reloadedPreview = await page.$eval('.main-content', (el) => el.textContent || '');
  assert.ok(reloadedPreview.includes('55°C'));
  assert.ok(reloadedPreview.includes('190°C'));

  // Return to Catalog
  await clickButtonWithText(page, 'Bibliotecă');
  await page.waitForSelector('.recipe-grid');
  console.log('✓ Scenario 6 passed');

  // =========================================================================
  // SCENARIO 7: MOBILE VIEWPORT & RESPONSIVENESS
  // =========================================================================
  console.log('--- SCENARIO 7: MOBILE VIEWPORT VERIFICATION ---');
  await page.setViewport({ width: 375, height: 667 });
  await new Promise((r) => setTimeout(r, 300));
  const mobileBodyWidth = await page.evaluate(() => document.body.scrollWidth);
  assert.ok(mobileBodyWidth <= 385, `Page width ${mobileBodyWidth} should fit mobile viewport cleanly`);

  // Open recipe preview in mobile viewport
  const mobileCard = await findCardWithText(page, 'Risotto');
  assert.ok(mobileCard);
  await mobileCard.click();
  await page.waitForSelector('.editor-tabs');
  tabs = await page.$$('.tab-btn');
  await tabs[3].click();
  await new Promise((r) => setTimeout(r, 300));
  const mobilePreviewWidth = await page.evaluate(() => document.body.scrollWidth);
  assert.ok(mobilePreviewWidth <= 385, `Preview width ${mobilePreviewWidth} should fit mobile viewport`);
  console.log('✓ Scenario 7 passed');

  // Verify no uncaught console errors
  const pageErrors = consoleLogs.filter((l) => l.startsWith('[PAGE_ERROR]') || l.startsWith('[error]'));
  assert.strictEqual(pageErrors.length, 0, `Expected 0 uncaught frontend errors, got: ${pageErrors.join(', ')}`);
});
