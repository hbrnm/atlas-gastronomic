import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer, { Browser } from 'puppeteer-core';
import { startServer } from '../src/server/index.js';
import { COMPLETE_CATALOGUE } from '../src/shared/sample-data.js';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

test('Production Deployment & Private Access Lifecycle: Verification on Disk with Restart Persistence', async (t) => {
  const testDbFile = path.resolve(process.cwd(), 'data/atlas_prod_deploy_restart_test.db');
  if (fs.existsSync(testDbFile)) {
    try { fs.unlinkSync(testDbFile); } catch {}
  }

  const READ_KEY = 'atlas-private-family-guest-2026';
  const EDITORIAL_KEY = 'atlas-editor-in-chief-2026';

  process.env.NODE_ENV = 'production';
  process.env.ATLAS_ACCESS_KEY = READ_KEY;
  process.env.ATLAS_EDITORIAL_KEY = EDITORIAL_KEY;
  process.env.ATLAS_REQUIRE_AUTH = 'true';

  let restartedServer: any = null;
  let browser: Browser | null = null;

  t.after(async () => {
    delete process.env.ATLAS_ACCESS_KEY;
    delete process.env.ATLAS_EDITORIAL_KEY;
    delete process.env.ATLAS_REQUIRE_AUTH;
    if (browser) {
      try { await browser.close(); } catch {}
    }
    if (restartedServer) {
      try { await restartedServer.close(); } catch {}
    }
    [testDbFile, `${testDbFile}.v1.bak`, `${testDbFile}-wal`, `${testDbFile}-shm`].forEach((f) => {
      if (fs.existsSync(f)) {
        try { fs.unlinkSync(f); } catch {}
      }
    });
  });

  const PORT_1 = 3340;
  let serverInstance = await startServer(PORT_1, testDbFile, COMPLETE_CATALOGUE);

  const baseUrl = `http://localhost:${PORT_1}`;

  // =========================================================================
  // 1. VERIFY PRIVATE ACCESS ENFORCEMENT (FAIL-CLOSED)
  // =========================================================================
  console.log('--- 1. PRIVATE ACCESS ENFORCEMENT CHECK ---');
  // Unauthenticated read must fail closed with 401
  const unauthRes = await fetch(`${baseUrl}/api/recipes`);
  assert.strictEqual(unauthRes.status, 401, 'Public read access must fail closed when ATLAS_ACCESS_KEY is set');
  const unauthBody = await unauthRes.json();
  assert.strictEqual(unauthBody.code, 'APP_AUTH_REQUIRED');

  // Authenticated read with reader access key must succeed
  const authReadRes = await fetch(`${baseUrl}/api/recipes`, {
    headers: { 'x-atlas-access-key': READ_KEY },
  });
  assert.strictEqual(authReadRes.status, 200, 'Read with valid access key must succeed');
  const initialRecipes = await authReadRes.json();
  assert.strictEqual(initialRecipes.length, 12, 'Must serve complete catalogue of 12 recipes');

  // Read access key MUST NOT be able to perform editorial writes
  const unauthorizedWrite = await fetch(`${baseUrl}/api/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-atlas-editorial-key': READ_KEY,
    },
    body: JSON.stringify({ title: 'Tentativă Neautorizată' }),
  });
  assert.strictEqual(unauthorizedWrite.status, 401, 'Reader access key must not permit editorial writes');

  // Editorial key creates a persisted recipe
  const customRecipeTitle = 'Păstrăv la Grătar cu Mămăligă și Mujdei';
  const editorialWrite = await fetch(`${baseUrl}/api/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-atlas-editorial-key': EDITORIAL_KEY,
    },
    body: JSON.stringify({
      title: customRecipeTitle,
      category: 'Pește',
      culinary_tradition: 'Românească',
      yield: { quantity: 2, unit: 'porții' },
      timing: { active_minutes: 15, total_minutes: 25 },
      ingredients: [
        {
          id: 'ing_pastrav',
          ingredient_id: 'pastrav',
          name: 'Păstrăv proaspăt de munte',
          quantity: 2,
          unit: 'bucăți',
          sequence_order: 1,
        },
      ],
      steps: [
        {
          id: 'step_pastrav_1',
          step_id: 'step_pastrav_1',
          step_number: 1,
          instruction: 'Frigeți păstrăvul pe grătarul încins timp de 6 minute pe fiecare parte.',
          duration_minutes: 12,
        },
      ],
    }),
  });
  assert.strictEqual(editorialWrite.status, 201, 'Editorial write must succeed with 201');
  const createdRecipe = await editorialWrite.json();
  assert.strictEqual(createdRecipe.recipe.title, customRecipeTitle);

  // =========================================================================
  // 2. VERIFY DATA PERSISTENCE ACROSS COMPLETE SERVER SHUTDOWN & RESTART
  // =========================================================================
  console.log('--- 2. DATA PERSISTENCE ACROSS RESTART CHECK ---');
  // Completely close server
  await serverInstance.close();
  await new Promise((r) => setTimeout(r, 300));

  // Restart server on a different port using the exact same SQLite database file on disk
  const PORT_2 = 3341;
  restartedServer = await startServer(PORT_2, testDbFile);

  const restartedBaseUrl = `http://localhost:${PORT_2}`;

  // Query restarted server with valid key
  const afterRestartRes = await fetch(`${restartedBaseUrl}/api/recipes`, {
    headers: { 'x-atlas-access-key': READ_KEY },
  });
  assert.strictEqual(afterRestartRes.status, 200);
  const recipesAfterRestart = await afterRestartRes.json();

  // Catalogue must now contain 13 recipes (12 initial + 1 newly persisted)
  assert.strictEqual(recipesAfterRestart.length, 13, 'Persisted recipe must survive complete server restart');
  const foundPersisted = recipesAfterRestart.find((r: any) => r.title === customRecipeTitle);
  assert.ok(foundPersisted, 'Custom recipe must be present in database after restart');

  // =========================================================================
  // 3. REAL BROWSER ACCEPTANCE: PRIVATE ACCESS SCREEN UNLOCK & COOK MODE FLOW
  // =========================================================================
  console.log('--- 3. BROWSER VERIFICATION: PRIVATE ACCESS GATE & USER FLOW ---');
  browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900'],
  });

  const page = await browser.newPage();
  await page.goto(restartedBaseUrl, { waitUntil: 'networkidle0' });

  // Verify Private Access Gatekeeper is shown to unauthenticated users
  await page.waitForSelector('.private-auth-gate');
  const gateTitle = await page.$eval('.private-auth-gate h2', (el) => el.textContent?.trim());
  assert.ok(gateTitle?.includes('Atlas Privat') || gateTitle?.includes('Privat'), 'Private access gatekeeper screen active');

  // Try wrong access key
  const keyInput = await page.$('.access-key-input');
  assert.ok(keyInput);
  await keyInput.type('wrong-key-attempt');
  const unlockBtn = await page.$('.btn-unlock-app');
  assert.ok(unlockBtn);
  await unlockBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  // Verify auth error displayed
  const errorMsg = await page.$eval('.auth-error-msg', (el) => el.textContent?.trim());
  assert.ok(errorMsg?.includes('invalidă'), 'Expected invalid key error message');

  // Enter valid access key
  await keyInput.focus();
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await keyInput.type(READ_KEY);
  await unlockBtn.click();

  // Gate disappears, catalogue renders
  await page.waitForSelector('.recipe-grid');
  const cards = await page.$$('.recipe-card');
  assert.strictEqual(cards.length, 13, 'Expected 13 recipes rendered in catalogue after unlock');

  // Open recipe detail and start Cook Mode
  const firstCard = cards[0];
  const detailBtn = await firstCard.$('.btn-card-detail');
  assert.ok(detailBtn);
  await detailBtn.click();

  await page.waitForSelector('.recipe-detail-container');
  const startCookBtn = await page.$('.btn-start-cook');
  assert.ok(startCookBtn);
  await startCookBtn.click();

  await page.waitForSelector('.cook-mode-container');
  const cookStep = await page.$eval('.cook-step-indicator', (el) => el.textContent?.trim());
  assert.ok(cookStep?.includes('Pasul 1'));

  console.log('✓ Deployment verification passed: private access gatekeeper, restart persistence, and Cook Mode all verified!');
});
