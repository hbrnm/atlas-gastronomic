import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer-core';
import { startServer } from '../src/server/index.js';

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

test('Browser Acceptance Test: Complete Atlas Gastronomic Recipe Core V1 Scenarios', async (t) => {
  // 1. Start Server on port 3333 in production mode (pre-built assets, no dev reloads)
  process.env.NODE_ENV = 'production';
  const testDbFile = path.resolve(process.cwd(), 'data/atlas_browser_test.db');
  if (fs.existsSync(testDbFile)) {
    try { fs.unlinkSync(testDbFile); } catch {}
  }

  const TEST_PORT = 3333;
  const serverInstance = await startServer(TEST_PORT, testDbFile);
  t.after(async () => {
    await serverInstance.close();
    if (fs.existsSync(testDbFile)) {
      try { fs.unlinkSync(testDbFile); } catch {}
    }
  });

  // Verify Chrome exists
  assert.ok(fs.existsSync(CHROME_PATH), `Chrome executable not found at ${CHROME_PATH}`);

  // 2. Launch Browser via Puppeteer Core
  const browser: Browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900'],
  });
  t.after(async () => {
    await browser.close();
  });

  const page: Page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleLogs: string[] = [];
  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleLogs.push(`[PAGE_ERROR] ${err.message}`));

  const baseUrl = `http://localhost:${TEST_PORT}`;

  // =========================================================================
  // SCENARIO A: CATALOG
  // =========================================================================
  console.log('--- SCENARIO A: CATALOG ---');
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });

  // A1. Verify Catalog loaded
  const titleText = await page.$eval('h1', (el) => el.textContent?.trim());
  assert.strictEqual(titleText, 'Catalog Editorial de Rețete');

  // A2. Verify Seed recipes displayed
  let recipeCards = await page.$$('.recipe-card');
  assert.strictEqual(recipeCards.length, 2, 'Expected 2 seed recipes');

  const cardTitles = await page.$$eval('.card-title', (els) => els.map((el) => el.textContent?.trim()));
  assert.ok(cardTitles.includes('Supă simplă de legume de grădină'));
  assert.ok(cardTitles.includes('Mămăligă pripită de mălai măcinat la moară'));

  // A3. Search test
  const searchInput = await page.$('.search-input');
  assert.ok(searchInput, 'Search input should exist');
  await searchInput.type('Mămăligă');
  await new Promise((r) => setTimeout(r, 200));

  recipeCards = await page.$$('.recipe-card');
  assert.strictEqual(recipeCards.length, 1, 'Expected 1 recipe after searching "Mămăligă"');

  // Clear search
  await searchInput.focus();
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await new Promise((r) => setTimeout(r, 200));
  recipeCards = await page.$$('.recipe-card');
  assert.strictEqual(recipeCards.length, 2, 'Expected 2 recipes after clearing search');

  // A4. Category Filter
  const selects = await page.$$('.select-filter');
  assert.ok(selects.length >= 3, 'Expected 3 filters: category, tradition, difficulty');
  const categorySelect = selects[0];
  await categorySelect.select('Supe și Ciorbe');
  await new Promise((r) => setTimeout(r, 200));
  recipeCards = await page.$$('.recipe-card');
  assert.strictEqual(recipeCards.length, 1);
  const filteredTitle = await page.$eval('.card-title', (el) => el.textContent?.trim());
  assert.strictEqual(filteredTitle, 'Supă simplă de legume de grădină');

  // Reset category
  await categorySelect.select('');
  await new Promise((r) => setTimeout(r, 200));

  // A5. Tradition Filter
  const traditionSelect = selects[1];
  await traditionSelect.select('Românească');
  await new Promise((r) => setTimeout(r, 200));
  recipeCards = await page.$$('.recipe-card');
  assert.strictEqual(recipeCards.length, 2);
  await traditionSelect.select('');
  await new Promise((r) => setTimeout(r, 200));

  // A6. Difficulty Filter
  const difficultySelect = selects[2];
  await difficultySelect.select('moderate');
  await new Promise((r) => setTimeout(r, 200));
  recipeCards = await page.$$('.recipe-card');
  assert.strictEqual(recipeCards.length, 1);
  const modTitle = await page.$eval('.card-title', (el) => el.textContent?.trim());
  assert.strictEqual(modTitle, 'Mămăligă pripită de mălai măcinat la moară');
  await difficultySelect.select('');
  await new Promise((r) => setTimeout(r, 200));

  // A7. Open existing recipe
  const firstCard = await page.$('.recipe-card');
  assert.ok(firstCard);
  await firstCard.click();
  await page.waitForSelector('.recipe-title-input');
  const currentTitle = await page.$eval('.recipe-title-input', (el: any) => el.value);
  assert.ok(currentTitle.length > 0);

  // Return to catalog
  await clickButtonWithText(page, 'Bibliotecă');
  await page.waitForSelector('.recipe-grid');
  console.log('✓ Scenario A passed');

  // =========================================================================
  // SCENARIO B: CREAREA UNEI REȚETE
  // =========================================================================
  console.log('--- SCENARIO B: CREARE REȚETĂ NOUĂ ---');
  // Click Add New Recipe in header
  await clickButtonWithText(page, 'Adaugă Rețetă Nouă');
  await page.waitForSelector('.recipe-title-input');

  // B1. Fill Metadata in Tab 1
  const titleInput = await page.$('.recipe-title-input');
  await titleInput?.type('Sarmale Tradiționale Moldovenești');

  // Fill GeneralInfo fields
  const textareas = await page.$$('textarea');
  await textareas[0].type('Sarmale festive în foi de varză murată cu carne tocată și afumătură.');

  // Fill Category, Tradition, Region
  const infoInputs = await page.$$('.form-control');
  // [0] is Title in GeneralInfo, [1] Category, [2] Tradition, [3] Region
  await infoInputs[0].click({ clickCount: 3 });
  await infoInputs[0].type('Sarmale Tradiționale Moldovenești');
  await infoInputs[1].type('Fel Principal');
  await infoInputs[2].type('Românească');
  await infoInputs[3].type('Moldova');

  // B2. Add Ingredients in Tab 2
  const tabs = await page.$$('.tab-btn');
  // tabs[1] is Ingrediente
  await tabs[1].click();
  await page.waitForSelector('.editor-panel');
  await clickButtonWithText(page, 'Adaugă primul ingredient');

  // Ingredient 1: Carne de porc
  let ingRows = await page.$$('.ing-table tbody tr');
  assert.strictEqual(ingRows.length, 1);
  let inputsRow1 = await ingRows[0].$$('.table-input');
  await inputsRow1[0].type('Carne tocată de porc');
  await inputsRow1[1].type('600');
  await inputsRow1[2].click({ clickCount: 3 });
  await inputsRow1[2].type('g');
  await inputsRow1[3].type('pulpă tocată mediu');

  // Add Ingredient 2: Carne de vită
  await clickButtonWithText(page, 'Adaugă Ingredient');
  ingRows = await page.$$('.ing-table tbody tr');
  assert.strictEqual(ingRows.length, 2);
  let inputsRow2 = await ingRows[1].$$('.table-input');
  await inputsRow2[0].type('Carne tocată de vită');
  await inputsRow2[1].type('400');
  await inputsRow2[2].click({ clickCount: 3 });
  await inputsRow2[2].type('g');

  // Add Ingredient 3: Orez
  await clickButtonWithText(page, 'Adaugă Ingredient');
  ingRows = await page.$$('.ing-table tbody tr');
  assert.strictEqual(ingRows.length, 3);
  let inputsRow3 = await ingRows[2].$$('.table-input');
  await inputsRow3[0].type('Orez cu bob rotund');
  await inputsRow3[1].type('120');
  await inputsRow3[2].click({ clickCount: 3 });
  await inputsRow3[2].type('g');

  // Add Ingredient 4: Cimbru uscat (Optional)
  await clickButtonWithText(page, 'Adaugă Ingredient');
  ingRows = await page.$$('.ing-table tbody tr');
  assert.strictEqual(ingRows.length, 4);
  let inputsRow4 = await ingRows[3].$$('.table-input');
  await inputsRow4[0].type('Cimbru uscat de grădină');
  await inputsRow4[1].type('5');
  await inputsRow4[2].click({ clickCount: 3 });
  await inputsRow4[2].type('g');
  // Check optional checkbox
  const optCheckbox = await ingRows[3].$('input[type="checkbox"]');
  await optCheckbox?.click();

  // Add Ingredient 5: Smântână pentru servire (Unused in steps to test warning!)
  await clickButtonWithText(page, 'Adaugă Ingredient');
  ingRows = await page.$$('.ing-table tbody tr');
  assert.strictEqual(ingRows.length, 5);
  let inputsRow5 = await ingRows[4].$$('.table-input');
  await inputsRow5[0].type('Smântână fermentată 30%');
  await inputsRow5[1].type('200');
  await inputsRow5[2].click({ clickCount: 3 });
  await inputsRow5[2].type('g');
  const optCheckbox5 = await ingRows[4].$('input[type="checkbox"]');
  await optCheckbox5?.click();

  // Test Reordering Ingredients: Move Ingredient 4 Up
  const moveUpBtn = await ingRows[3].$('button[title="Mută mai sus"]');
  await moveUpBtn?.click();
  await new Promise((r) => setTimeout(r, 100));
  ingRows = await page.$$('.ing-table tbody tr');
  const movedName = await ingRows[2].$$eval('.table-input', (els: any) => els[0].value);
  assert.strictEqual(movedName, 'Cimbru uscat de grădină');
  console.log('✓ Scenario B passed');

  // =========================================================================
  // SCENARIO C: PAȘII DE PREPARARE & ASOCIERE INGREDIENTE
  // =========================================================================
  console.log('--- SCENARIO C: PAȘI DE PREPARARE ---');
  // Tab 3: Pași
  await tabs[2].click();
  await page.waitForSelector('.editor-panel');
  await clickButtonWithText(page, 'Adaugă primul pas');

  // Step 1
  let stepCards = await page.$$('.step-card');
  assert.strictEqual(stepCards.length, 1);
  const step1Textarea = await stepCards[0].$('textarea');
  await step1Textarea?.type('Călește ceapa și amestecă orezul timp de 3 minute.');
  
  // Associate Orez pill
  const pillsStep1 = await stepCards[0].$$('.ref-pill-label');
  for (const pill of pillsStep1) {
    const txt = await pill.evaluate((el) => el.textContent || '');
    if (txt.includes('Orez cu bob rotund')) {
      await pill.click();
      break;
    }
  }

  // Add Step 2
  await clickButtonWithText(page, 'Adaugă Pas');
  stepCards = await page.$$('.step-card');
  assert.strictEqual(stepCards.length, 2);
  const step2Textarea = await stepCards[1].$('textarea');
  await step2Textarea?.type('Omogenizează carnea de porc, carnea de vită și cimbrul.');

  // Associate Porc, Vită, Cimbru
  const pillsStep2 = await stepCards[1].$$('.ref-pill-label');
  for (const pill of pillsStep2) {
    const txt = await pill.evaluate((el) => el.textContent || '');
    if (
      txt.includes('Carne tocată de porc') ||
      txt.includes('Carne tocată de vită') ||
      txt.includes('Cimbru uscat de grădină')
    ) {
      await pill.click();
    }
  }

  // Add Step 3: Cooking
  await clickButtonWithText(page, 'Adaugă Pas');
  stepCards = await page.$$('.step-card');
  assert.strictEqual(stepCards.length, 3);
  const step3Textarea = await stepCards[2].$('textarea');
  await step3Textarea?.type('Fierbe sarmalele la foc mic în oala de lut timp de 3 ore.');
  
  // Duration, Temp, Heat, Cue
  const step3Controls = await stepCards[2].$$('.form-control');
  // [0] is instruction textarea, [1] duration, [2] temp, [3] heat, [4] cue
  await step3Controls[1].type('180');
  await step3Controls[2].type('95');
  await step3Controls[3].type('Mic');
  await step3Controls[4].type('Varza este fragedă');

  // Test Step Reordering: Move Step 1 down
  stepCards = await page.$$('.step-card');
  const step1Down = await stepCards[0].$('button[title="Mută pasul mai jos"]');
  await step1Down?.evaluate((b: any) => b.click());
  await new Promise((r) => setTimeout(r, 250));
  stepCards = await page.$$('.step-card');
  const newStep1Text = await stepCards[0].$eval('textarea', (el: any) => el.value);
  assert.ok(newStep1Text.includes('Omogenizează carnea'));

  // Move back up
  const step1Up = await stepCards[1].$('button[title="Mută pasul mai sus"]');
  await step1Up?.evaluate((b: any) => b.click());
  await new Promise((r) => setTimeout(r, 250));
  console.log('✓ Scenario C passed');

  // =========================================================================
  // SCENARIO D: VALIDARE
  // =========================================================================
  console.log('--- SCENARIO D: VALIDARE STRUCTURALĂ & EDITORIALĂ ---');
  // Switch to Tab 4: Validare & Previzualizare
  await tabs[3].click();
  await page.waitForSelector('.validation-card');

  // Verify warning about unreferenced ingredient ("Smântână")
  const warningText = await page.$eval('.val-item.warning', (el) => el.textContent?.trim());
  assert.ok(warningText?.includes('Smântână fermentată 30%'), 'Expected warning for unused declared ingredient');
  assert.ok(warningText?.includes('nu este menționat în niciun pas de preparare'), 'Expected specific warning phrasing');

  // Verify currently Valid (no blocking errors)
  const validationSummary = await page.$eval('.validation-card h3', (el) => el.textContent?.trim());
  assert.strictEqual(validationSummary, 'Integritate & Validare Editorială');
  const errorBadge = await page.$eval('.validation-card .badge:first-child', (el) => el.textContent?.trim());
  const errorDetails = await page.$$eval('.val-item.error', (els) => els.map((e) => e.textContent?.trim()));
  console.log('Validation panel errors:', errorDetails);
  assert.strictEqual(errorBadge, '0 erori');

  // Test Error appearance: Go to Tab 1, erase Title
  await tabs[0].click();
  const mainTitleInput = await page.$('.recipe-title-input');
  assert.ok(mainTitleInput);
  await mainTitleInput.focus();
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await new Promise((r) => setTimeout(r, 200));

  // Check header error badge
  const headerErrorBadge = await page.waitForSelector('.badge-val-error', { timeout: 2000 });
  assert.ok(headerErrorBadge, 'Expected error badge in header');
  const errorBadgeText = await headerErrorBadge.evaluate((el) => el.textContent?.trim());
  assert.ok(errorBadgeText?.includes('eroare'), 'Expected error badge text');

  // Restore Title
  await mainTitleInput.type('Sarmale Tradiționale Moldovenești');
  await new Promise((r) => setTimeout(r, 200));
  const headerValidBadge = await page.waitForSelector('.badge-val-valid', { timeout: 2000 });
  assert.ok(headerValidBadge, 'Expected valid badge after restoring title');
  console.log('✓ Scenario D passed');

  // =========================================================================
  // SCENARIO E: PERSISTENȚĂ
  // =========================================================================
  console.log('--- SCENARIO E: PERSISTENȚĂ & SALVARE ÎN BD ---');
  // Click Save
  await clickButtonWithText(page, 'Salvează Schița');
  await new Promise((r) => setTimeout(r, 600));

  // Navigate back to Library
  await clickButtonWithText(page, 'Bibliotecă');
  await page.waitForSelector('.recipe-grid');

  // Verify Catalog now has 3 recipes
  recipeCards = await page.$$('.recipe-card');
  assert.strictEqual(recipeCards.length, 3, 'Catalog must contain 3 recipes after saving new recipe');

  // Reopen the newly saved recipe
  const sarmaleCard = await findCardWithText(page, 'Sarmale Tradiționale Moldovenești');
  assert.ok(sarmaleCard, 'Sarmale card must exist in catalog');
  await sarmaleCard.click();
  await page.waitForSelector('.recipe-title-input');

  // Check ingredients count in Tab 2 header
  const tab2Text = await page.$eval('.editor-tabs .tab-btn:nth-child(2)', (el) => el.textContent?.trim());
  assert.ok(tab2Text?.includes('5'), 'Expected 5 ingredients persisted');

  // Check steps count in Tab 3 header
  const tab3Text = await page.$eval('.editor-tabs .tab-btn:nth-child(3)', (el) => el.textContent?.trim());
  assert.ok(tab3Text?.includes('3'), 'Expected 3 steps persisted');

  // Reload page
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('.recipe-grid');
  // Re-verify that the newly saved recipe is still in the catalog after reload!
  const reloadedCard = await findCardWithText(page, 'Sarmale Tradiționale Moldovenești');
  assert.ok(reloadedCard, 'Saved recipe must persist in catalog across full page reload');
  await reloadedCard.click();
  await page.waitForSelector('.recipe-title-input');
  const reloadedTitle = await page.$eval('.recipe-title-input', (el: any) => el.value);
  assert.strictEqual(reloadedTitle, 'Sarmale Tradiționale Moldovenești');
  console.log('✓ Scenario E passed');

  // =========================================================================
  // SCENARIO F: MODIFICARE ȘI ȘTERGERE
  // =========================================================================
  console.log('--- SCENARIO F: MODIFICARE ȘI ȘTERGERE ---');
  // 1. Modify title
  const currentTitleInput = await page.$('.recipe-title-input');
  assert.ok(currentTitleInput);
  await currentTitleInput.focus();
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await currentTitleInput.type('Sarmale Tradiționale Moldovenești — Ediție de Festin');
  await clickButtonWithText(page, 'Salvează Schița');
  await new Promise((r) => setTimeout(r, 600));

  // Verify in library
  await clickButtonWithText(page, 'Bibliotecă');
  await page.waitForSelector('.recipe-grid');
  let updatedCard = await findCardWithText(page, 'Ediție de Festin');
  assert.ok(updatedCard, 'Updated title must appear in catalog');

  // Reopen to delete
  await updatedCard.click();
  await page.waitForSelector('.recipe-title-input');

  // Accept confirmation dialog automatically
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });

  // Click Delete button
  await clickButtonWithText(page, 'Șterge');

  // Wait for return to catalog
  await page.waitForSelector('.recipe-grid');
  await new Promise((r) => setTimeout(r, 500));

  // Verify recipe is deleted and catalog is back to 2 recipes
  recipeCards = await page.$$('.recipe-card');
  assert.strictEqual(recipeCards.length, 2, 'Catalog must be back to 2 recipes after deletion');

  // Search for Sarmale -> 0 results
  const searchInputFinal = await page.$('.search-input');
  assert.ok(searchInputFinal);
  await searchInputFinal.focus();
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await searchInputFinal.type('Sarmale');
  await new Promise((r) => setTimeout(r, 200));
  const emptyState = await page.$('.recipe-grid');
  assert.strictEqual(emptyState, null, 'Recipe grid should be replaced by empty state');
  const emptyMsg = await page.$eval('h3', (el) => el.textContent?.trim());
  assert.strictEqual(emptyMsg, 'Nicio rețetă găsită');
  console.log('✓ Scenario F passed');

  // =========================================================================
  // MOBILE RESPONSIVENESS & UI INTEGRITY CHECK
  // =========================================================================
  console.log('--- MOBILE & RESPONSIVE CHECK ---');
  await page.setViewport({ width: 375, height: 667 });
  await new Promise((r) => setTimeout(r, 300));
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  assert.ok(bodyWidth <= 385, `Page width ${bodyWidth} should fit viewport cleanly`);
  console.log('✓ Mobile viewport check passed');

  // Verify no uncaught page errors
  const pageErrors = consoleLogs.filter((l) => l.startsWith('[PAGE_ERROR]') || l.startsWith('[error]'));
  assert.strictEqual(pageErrors.length, 0, `Expected 0 uncaught frontend errors, got: ${pageErrors.join(', ')}`);
});
