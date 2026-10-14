import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer-core';
import { startServer } from '../src/server/index.js';
import { COMPLETE_CATALOGUE } from '../src/shared/sample-data.js';

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

test('Phase 004 Acceptance Test: User-Facing Recipe App & Cook Mode Experience', async (t) => {
  process.env.NODE_ENV = 'production';
  const testDbFile = path.resolve(process.cwd(), 'data/atlas_phase004_cookmode_test.db');
  if (fs.existsSync(testDbFile)) {
    try { fs.unlinkSync(testDbFile); } catch {}
  }

  const TEST_PORT = 3337;
  const serverInstance = await startServer(TEST_PORT, testDbFile, COMPLETE_CATALOGUE);
  t.after(async () => {
    await serverInstance.close();
    if (fs.existsSync(testDbFile)) {
      try { fs.unlinkSync(testDbFile); } catch {}
    }
  });

  assert.ok(fs.existsSync(CHROME_PATH), `Chrome executable not found at ${CHROME_PATH}`);

  const browser: Browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900'],
  });
  t.after(async () => {
    await browser.close();
  });

  const page = await browser.newPage();
  const consoleLogs: string[] = [];
  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleLogs.push(`[PAGE_ERROR] ${err.message}`));

  await page.goto(`http://localhost:${TEST_PORT}`, { waitUntil: 'networkidle0' });

  // =========================================================================
  // SCENARIO 1: COMPLETE CATALOGUE (12+ RECIPES)
  // =========================================================================
  console.log('--- SCENARIO 1: CATALOGUE OF 12+ RECIPES ---');
  await page.waitForSelector('.recipe-grid');
  const initialCards = await page.$$('.recipe-card');
  assert.ok(initialCards.length >= 12, `Expected at least 12 recipes in catalogue, found ${initialCards.length}`);

  // Test search for traditional Romanian recipe
  const searchInput = await page.$('.search-input');
  assert.ok(searchInput);
  await searchInput.type('Rădăuțeană');
  await new Promise((r) => setTimeout(r, 200));
  let visibleCards = await page.$$('.recipe-card');
  assert.strictEqual(visibleCards.length, 1);
  let cardTitle = await visibleCards[0].$eval('.card-title', (el) => el.textContent?.trim());
  assert.strictEqual(cardTitle, 'Ciorbă Rădăuțeană Bucovineană Tradițională');

  // Clear search
  await searchInput.focus();
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await new Promise((r) => setTimeout(r, 200));
  visibleCards = await page.$$('.recipe-card');
  assert.ok(visibleCards.length >= 12, `Expected >= 12 cards after clearing search, got ${visibleCards.length}`);

  // Comprehensive Catalogue Acceptance: Verify all 12 recipes can be found and opened
  for (const item of COMPLETE_CATALOGUE) {
    const card = await findCardWithText(page, item.title);
    assert.ok(card, `Card for recipe "${item.title}" must be visible in catalogue`);
    const openBtn = await card.$('.btn-card-detail');
    assert.ok(openBtn, `Card for "${item.title}" must have "Vezi Rețeta" action button`);
    await openBtn.click();

    await page.waitForSelector('.recipe-detail-container');
    const openedTitle = await page.$eval('.detail-title', (el) => el.textContent?.trim());
    assert.strictEqual(openedTitle, item.title, `Detail title should match catalogue recipe title`);
    const ingredientsCount = await page.$$eval('.ingredient-item-row', (els) => els.length);
    assert.ok(ingredientsCount > 0, `Recipe "${item.title}" should display ingredients`);

    // Return to catalogue
    const backBtn = await page.$('.btn-back-catalogue');
    assert.ok(backBtn, 'Back button must exist to return to catalogue');
    await backBtn.click();
    await page.waitForSelector('.recipe-grid');
  }

  console.log('✓ Scenario 1 passed: All 12 recipes verified, found, and opened in catalogue');

  // =========================================================================
  // SCENARIO 2: RECIPE DETAIL VIEW & PREPARATION (PORTION SCALER & CHECKLIST)
  // =========================================================================
  console.log('--- SCENARIO 2: RECIPE DETAIL VIEW & SCALING ---');
  const risottoCard = await findCardWithText(page, 'Risotto alla Milanese');
  assert.ok(risottoCard, 'Risotto card should exist in catalogue');

  const detailBtn = await risottoCard.$('.btn-card-detail');
  assert.ok(detailBtn, 'Card must have "Vezi Rețeta" action button');
  await detailBtn.click();

  // Wait for RecipeDetail container
  await page.waitForSelector('.recipe-detail-container');
  const detailTitle = await page.$eval('.detail-title', (el) => el.textContent?.trim());
  assert.strictEqual(detailTitle, 'Risotto alla Milanese Tradizionale');

  // Verify serving scaler is present and test dynamic quantity calculation
  const scalerValue = await page.$eval('.serving-scaler-value', (el) => el.textContent?.trim());
  assert.strictEqual(scalerValue, '4', 'Default yield should be 4 servings');

  // Scaled ingredient initial text (e.g., 320 g Orez Carnaroli sau Arborio)
  let orezQty = await page.$eval('.ingredient-item-row', (el) => el.textContent || '');
  assert.ok(orezQty.includes('320'), 'Step 0: Should have 320 g rice for 4 servings');

  // Increase servings: 4 -> 6 (+ button)
  const plusBtn = await page.$('.btn-scaler-plus');
  assert.ok(plusBtn, 'Serving scaler plus button must exist');
  await plusBtn.click();
  await new Promise((r) => setTimeout(r, 100));
  const newScalerValue = await page.$eval('.serving-scaler-value', (el) => el.textContent?.trim());
  assert.strictEqual(newScalerValue, '5');
  await plusBtn.click();
  await new Promise((r) => setTimeout(r, 100));
  const newScalerValue6 = await page.$eval('.serving-scaler-value', (el) => el.textContent?.trim());
  assert.strictEqual(newScalerValue6, '6');

  // Scaled ingredient check: 320 * (6 / 4) = 480 g
  orezQty = await page.$eval('.ingredient-item-row', (el) => el.textContent || '');
  assert.ok(orezQty.includes('480'), 'Serving scaled from 4 to 6: 320 g should scale to 480 g');

  // Test interactive ingredient checklist
  const firstItem = await page.$('.ingredient-item-row');
  assert.ok(firstItem, 'Interactive ingredient item row should be present');
  await firstItem.click();
  const isChecked = await page.$eval('.ingredient-checkbox', (el: any) => el.checked);
  assert.strictEqual(isChecked, true, 'Ingredient checkbox should be toggleable');

  console.log('✓ Scenario 2 passed: Recipe detail, serving scaler and ingredient checklist verified');

  // =========================================================================
  // SCENARIO 3: DEDICATED COOK MODE (STEP-BY-STEP, TIMER, RISKS, SENSORY CUES)
  // =========================================================================
  console.log('--- SCENARIO 3: DEDICATED COOK MODE ---');
  const startCookBtn = await page.$('.btn-start-cook');
  assert.ok(startCookBtn, 'Prominent Cook Mode CTA should exist in RecipeDetail');
  await startCookBtn.click();

  // Wait for CookMode container
  await page.waitForSelector('.cook-mode-container');
  const stepIndicator = await page.$eval('.cook-step-indicator', (el) => el.textContent?.trim());
  assert.ok(stepIndicator?.includes('Pasul 1'), `Expected Pasul 1, got ${stepIndicator}`);
  assert.ok(stepIndicator?.includes('6 porții'), `Expected 6 porții in Cook Mode header, got ${stepIndicator}`);

  // Verify high-contrast dark theme styling
  const containerBg = await page.$eval('.cook-mode-container', (el) => window.getComputedStyle(el).backgroundColor);
  assert.ok(containerBg.includes('28') || containerBg.includes('1c1917'), 'High-contrast dark kitchen counter theme active');

  // Verify step instruction typography
  const instruction = await page.$eval('.cook-instruction', (el) => el.textContent?.trim());
  assert.ok(instruction && instruction.length > 20, 'Cook step instruction should be visible');

  // Verify timer widget is rendered and functional
  const timerDisplay = await page.$('.cook-timer-display');
  assert.ok(timerDisplay, 'Cook mode timer display should be visible');
  const timerInitialText = await page.$eval('.cook-timer-display', (el) => el.textContent?.trim());
  assert.ok(timerInitialText?.includes(':'), 'Timer should display mm:ss');

  // Step through steps
  const nextStepBtn = await page.$('.btn-cook-next');
  assert.ok(nextStepBtn, 'Next step button must be present');
  await nextStepBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  const step2Indicator = await page.$eval('.cook-step-indicator', (el) => el.textContent?.trim());
  assert.ok(step2Indicator?.includes('Pasul 2'), `Expected Pasul 2, got ${step2Indicator}`);

  // =========================================================================
  // RELOAD PERSISTENCE VERIFICATION:
  // Reload browser page while in Cook Mode on Pasul 2
  // =========================================================================
  console.log('--- RELOAD PERSISTENCE VERIFICATION (COOK MODE) ---');
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('.cook-mode-container');
  const reloadedBodyText = await page.evaluate(() => document.body.textContent || '');
  assert.ok(reloadedBodyText.includes('Risotto alla Milanese'), 'Recipe context must persist across reload');
  const reloadedStepIndicator = await page.$eval('.cook-step-indicator', (el) => el.textContent?.trim());
  assert.ok(
    reloadedStepIndicator?.includes('Pasul 2'),
    `Expected Pasul 2 to persist after browser reload, got: ${reloadedStepIndicator}`
  );
  console.log('✓ Cook Mode reload persistence verified: active recipe and step 2 retained');

  // Navigate through all steps to completion
  let canProceed = true;
  let iterations = 0;
  while (canProceed && iterations < 15) {
    iterations++;
    const currentBtn = await page.$('.btn-cook-next');
    if (!currentBtn) break;
    const btnText = await currentBtn.evaluate((el) => el.textContent?.trim() || '');
    if (btnText.includes('Finalizată') || btnText.includes('Finalizează')) {
      await currentBtn.click();
      break;
    }
    await currentBtn.click();
    await new Promise((r) => setTimeout(r, 100));
  }

  // Completion banner / screen verification
  const completionText = await page.evaluate(() => document.body.textContent || '');
  assert.ok(
    completionText.includes('Poftă Bună') || completionText.includes('completat cu succes') || completionText.includes('Finalizată'),
    'Recipe completion message should be displayed'
  );

  // Exit Cook Mode safely
  const exitBtn = await page.$('.btn-cook-exit');
  assert.ok(exitBtn, 'Exit Cook Mode button must be present');
  await exitBtn.click();

  // Verify safely back in Recipe Detail / Catalogue without data corruption
  await page.waitForSelector('.recipe-detail-container');
  console.log('✓ Scenario 3 passed: Complete Cook Mode journey, timer, and safe exit verified');

  // =========================================================================
  // SCENARIO 5: MULTI-RECIPE SERVING STATE ISOLATION & REGRESSION (PHASE 005-C)
  // =========================================================================
  console.log('--- SCENARIO 5: MULTI-RECIPE SERVING STATE ISOLATION & COOK MODE STEP SCALING ---');
  // 1. Verify returning from Cook Mode preserves Risotto's scaled selection (6 servings)
  const risottoScalerAfterExit = await page.$eval('.serving-scaler-value', (el) => el.textContent?.trim());
  assert.strictEqual(risottoScalerAfterExit, '6', 'Returning from Cook Mode must preserve Risotto scaled servings (6)');

  // 2. Return to catalogue
  const backToCatBtn = await page.$('.btn-back-catalogue');
  assert.ok(backToCatBtn);
  await backToCatBtn.click();
  await page.waitForSelector('.recipe-grid');

  // 3. Open Sarmale (original yield = 8)
  const sarmaleCard = await findCardWithText(page, 'Sarmale Tradiționale');
  assert.ok(sarmaleCard, 'Sarmale card must exist in catalogue');
  const sarmaleDetailBtn = await sarmaleCard.$('.btn-card-detail');
  assert.ok(sarmaleDetailBtn);
  await sarmaleDetailBtn.click();

  await page.waitForSelector('.recipe-detail-container');
  const sarmaleTitle = await page.$eval('.detail-title', (el) => el.textContent?.trim());
  assert.ok(sarmaleTitle?.includes('Sarmale Tradiționale'));

  // 4. Verify Sarmale initial yield is its OWN yield (8), NOT 6 carried over from Risotto!
  const sarmaleInitialScaler = await page.$eval('.serving-scaler-value', (el) => el.textContent?.trim());
  assert.strictEqual(sarmaleInitialScaler, '8', 'Sarmale must initialize with its own yield (8), not carry over Risotto selection');

  // 5. Scale Sarmale to 4 servings (0.5x yield) via minus button
  const sarmaleMinusBtn = await page.$('.btn-scaler-minus');
  assert.ok(sarmaleMinusBtn);
  for (let i = 0; i < 4; i++) {
    await sarmaleMinusBtn.click();
    await new Promise((r) => setTimeout(r, 60));
  }
  const sarmaleScaledValue = await page.$eval('.serving-scaler-value', (el) => el.textContent?.trim());
  assert.strictEqual(sarmaleScaledValue, '4', 'Sarmale scaled to 4 servings (0.5x)');

  // 6. Enter Cook Mode for Sarmale
  const startSarmaleCookBtn = await page.$('.btn-start-cook');
  assert.ok(startSarmaleCookBtn);
  await startSarmaleCookBtn.click();

  await page.waitForSelector('.cook-mode-container');
  const sarmaleCookHeader = await page.$eval('.cook-step-indicator', (el) => el.textContent?.trim());
  assert.ok(sarmaleCookHeader?.includes('4 porții'), `Cook Mode header must reflect 4 porții, got: ${sarmaleCookHeader}`);

  // Navigate to Step 6 (fierbere lentă) to verify exact 0.5x scaled quantities in step badges
  for (let s = 1; s <= 5; s++) {
    const nextBtn = await page.$('.btn-cook-next');
    assert.ok(nextBtn);
    await nextBtn.click();
    await new Promise((r) => setTimeout(r, 100));
  }
  const step6Header = await page.$eval('.cook-step-indicator', (el) => el.textContent?.trim());
  assert.ok(step6Header?.includes('Pasul 6'), `Should be on Pasul 6, got: ${step6Header}`);

  // Verify step badges for liquid (550ml * 0.5 = 275ml) and tomato paste (40g * 0.5 = 20g)
  const step6BadgesText = await page.evaluate(() => document.body.textContent || '');
  assert.ok(step6BadgesText.includes('275 ml'), 'Step 6 must display 275 ml cooking liquid scaled for 4 servings');
  assert.ok(step6BadgesText.includes('20 g'), 'Step 6 must display 20 g tomato paste allocated for 4 servings');
  assert.ok(step6BadgesText.includes('pasiv orientativ'), 'Timer must qualify passive time as orientativ guidance');

  // 7. Exit Cook Mode back to RecipeDetail
  const exitSarmaleCookBtn = await page.$('.btn-cook-exit');
  assert.ok(exitSarmaleCookBtn);
  await exitSarmaleCookBtn.click();

  await page.waitForSelector('.recipe-detail-container');
  const sarmalePreservedScaler = await page.$eval('.serving-scaler-value', (el) => el.textContent?.trim());
  assert.strictEqual(sarmalePreservedScaler, '4', 'RecipeDetail must preserve Sarmale scaled selection (4) after exiting Cook Mode');

  // 8. Return to catalogue, re-open Risotto, and verify Risotto STILL preserves its OWN selection (6)
  const backToCatFromSarmale = await page.$('.btn-back-catalogue');
  assert.ok(backToCatFromSarmale);
  await backToCatFromSarmale.click();
  await page.waitForSelector('.recipe-grid');

  const risottoCard2 = await findCardWithText(page, 'Risotto alla Milanese');
  assert.ok(risottoCard2);
  const risottoDetailBtn2 = await risottoCard2.$('.btn-card-detail');
  assert.ok(risottoDetailBtn2);
  await risottoDetailBtn2.click();

  await page.waitForSelector('.recipe-detail-container');
  const risottoPreservedScaler2 = await page.$eval('.serving-scaler-value', (el) => el.textContent?.trim());
  assert.strictEqual(risottoPreservedScaler2, '6', 'Risotto must preserve its own selection (6), completely isolated from Sarmale');

  console.log('✓ Scenario 5 passed: Multi-recipe serving state isolation, step scaling, and timer guidance verified');

  // =========================================================================
  // SCENARIO 4: PWA MANIFEST & ASSET INTEGRITY
  // =========================================================================
  console.log('--- SCENARIO 4: PWA MANIFEST & MOBILE ASSETS ---');
  const manifestHref = await page.$eval('link[rel="manifest"]', (el) => el.getAttribute('href'));
  assert.strictEqual(manifestHref, '/manifest.webmanifest', 'PWA manifest link must be in head');

  // Fetch manifest directly from server
  const manifestRes = await fetch(`http://localhost:${TEST_PORT}/manifest.webmanifest`);
  assert.strictEqual(manifestRes.status, 200, 'manifest.webmanifest must be served with 200 OK');
  const manifestJson = await manifestRes.json();
  assert.strictEqual(manifestJson.display, 'standalone');
  assert.ok(manifestJson.name.includes('Atlas Gastronomic'));

  // Fetch SVG icon
  const iconRes = await fetch(`http://localhost:${TEST_PORT}/icon.svg`);
  assert.strictEqual(iconRes.status, 200, 'icon.svg must be served with 200 OK');

  // Fetch Service Worker script
  const swRes = await fetch(`http://localhost:${TEST_PORT}/sw.js`);
  assert.strictEqual(swRes.status, 200, 'sw.js must be served with 200 OK');
  console.log('✓ Scenario 4 passed: PWA manifest, service worker and icon verified');

  // Verify 0 uncaught frontend errors during user journey
  const pageErrors = consoleLogs.filter((l) => l.startsWith('[PAGE_ERROR]'));
  assert.strictEqual(pageErrors.length, 0, `Expected 0 uncaught frontend errors, got: ${pageErrors.join(', ')}`);
});
