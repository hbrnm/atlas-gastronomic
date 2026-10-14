import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer, { Browser } from 'puppeteer-core';
import { execFileSync } from 'node:child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const STAGING_URL = 'https://atlas-gastronomic-production.up.railway.app';

// Read staging credentials from local .env.production.local
function getStagingCredentials() {
  const envPath = path.resolve(process.cwd(), '.env.production.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.production.local file missing. Cannot run live staging acceptance test.');
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  let accessKey = '';
  let editorialKey = '';
  for (const line of content.split('\n')) {
    if (line.startsWith('ATLAS_ACCESS_KEY=')) {
      accessKey = line.replace('ATLAS_ACCESS_KEY=', '').trim();
    }
    if (line.startsWith('ATLAS_EDITORIAL_KEY=')) {
      editorialKey = line.replace('ATLAS_EDITORIAL_KEY=', '').trim();
    }
  }
  return { accessKey, editorialKey };
}

test('Phase 007-C: Online Acceptance & Live Staging Validation on Railway', async (t) => {
  const { accessKey, editorialKey } = getStagingCredentials();
  assert.ok(accessKey, 'Must have ATLAS_ACCESS_KEY');
  assert.ok(editorialKey, 'Must have ATLAS_EDITORIAL_KEY');

  // =========================================================================
  // SECTION A: AVAILABILITY & HEALTH CHECK
  // =========================================================================
  console.log('\n--- SECTION A: AVAILABILITY & HEALTH CHECK ---');
  const healthRes = await fetch(`${STAGING_URL}/api/health`);
  assert.strictEqual(healthRes.status, 200, '/api/health must return HTTP 200');
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok');
  assert.strictEqual(healthData.service, 'Atlas Gastronomic — Recipe Core V1');
  assert.ok(healthData.timestamp, 'Health check must provide ISO timestamp');
  console.log('✓ /api/health returned 200 OK:', healthData);

  // =========================================================================
  // SECTION B: PRIVATE ACCESS ENFORCEMENT & SECURITY
  // =========================================================================
  console.log('\n--- SECTION B: PRIVATE ACCESS ENFORCEMENT & SECURITY ---');
  // 1. Unauthenticated read attempt must fail with 401
  const unauthGet = await fetch(`${STAGING_URL}/api/recipes`);
  assert.strictEqual(unauthGet.status, 401, 'Unauthenticated read must return 401');
  const unauthBody = await unauthGet.json();
  assert.strictEqual(unauthBody.code, 'APP_AUTH_REQUIRED');

  // 2. Invalid key attempt must fail with 401
  const invalidGet = await fetch(`${STAGING_URL}/api/recipes`, {
    headers: { 'x-atlas-access-key': 'invalid_secret_key_12345' },
  });
  assert.strictEqual(invalidGet.status, 401, 'Invalid access key must return 401');

  // 3. Status endpoint must not expose secrets
  const statusRes = await fetch(`${STAGING_URL}/api/auth/status`);
  assert.strictEqual(statusRes.status, 200);
  const statusData = await statusRes.json();
  assert.strictEqual(statusData.privateAccessRequired, true);
  assert.strictEqual(statusData.readAuthenticated, false);
  assert.strictEqual((statusData as any).secret, undefined);
  assert.strictEqual((statusData as any).key, undefined);

  // 4. Verification with Reader Key
  const verifyReaderRes = await fetch(`${STAGING_URL}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: accessKey }),
  });
  assert.strictEqual(verifyReaderRes.status, 200);
  const verifyReader = await verifyReaderRes.json();
  assert.strictEqual(verifyReader.valid, true);
  assert.strictEqual(verifyReader.canRead, true);
  assert.strictEqual(verifyReader.canWrite, false);

  // 5. Verification with Editorial Key
  const verifyEditorRes = await fetch(`${STAGING_URL}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: editorialKey }),
  });
  assert.strictEqual(verifyEditorRes.status, 200);
  const verifyEditor = await verifyEditorRes.json();
  assert.strictEqual(verifyEditor.valid, true);
  assert.strictEqual(verifyEditor.canRead, true);
  assert.strictEqual(verifyEditor.canWrite, true);

  // 6. Reader key cannot perform editorial write
  const readerWriteRes = await fetch(`${STAGING_URL}/api/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-atlas-editorial-key': accessKey,
    },
    body: JSON.stringify({ title: 'Tentativă Neautorizată' }),
  });
  assert.strictEqual(readerWriteRes.status, 401, 'Reader key must not permit editorial POST');

  console.log('✓ Private access gates and key differentiation verified on Railway.');

  // =========================================================================
  // SECTION C: RECIPE CORE & 5 CANONICAL RECIPES
  // =========================================================================
  console.log('\n--- SECTION C: RECIPE CORE & 5 CANONICAL RECIPES ---');
  const catalogRes = await fetch(`${STAGING_URL}/api/recipes`, {
    headers: { 'x-atlas-access-key': accessKey },
  });
  assert.strictEqual(catalogRes.status, 200);
  const recipes = await catalogRes.json();
  assert.ok(Array.isArray(recipes) && recipes.length >= 5, 'Catalogue must serve canonical recipes');

  const recipeMap = new Map(recipes.map((r: any) => [r.id || r.recipe_id, r]));

  // Check 5 canonical recipes exist
  const canonicalIds = [
    'rec_tagliatelle_ragu_001',
    'rec_risotto_milanese_002',
    'rec_boeuf_bourguignon_003',
    'rec_souffle_fromage_004',
    'rec_sarmale_traditionale_012',
  ];

  for (const cid of canonicalIds) {
    const found = recipes.find((r: any) => r.id === cid || r.recipe_id === cid);
    assert.ok(found, `Canonical recipe ${cid} must be present in online catalogue`);
  }

  // Deep check Sarmale (FIND-005A-01, FIND-005A-02, FIND-005A-04)
  const sarmaleRes = await fetch(`${STAGING_URL}/api/recipes/rec_sarmale_traditionale_012`, {
    headers: { 'x-atlas-access-key': accessKey },
  });
  assert.strictEqual(sarmaleRes.status, 200);
  const sarmaleJson = await sarmaleRes.json();
  const sarmale = sarmaleJson.recipe || sarmaleJson;
  assert.strictEqual(sarmale.title, 'Sarmale Tradiționale în Foi de Varză Murată');
  
  // Cooking liquid present
  const cookingLiquid = sarmale.ingredients.find((i: any) => i.ingredient_id === 'lichid-fierbere-sarmale');
  assert.ok(cookingLiquid, 'Sarmale must include declared cooking liquid');
  assert.strictEqual(cookingLiquid.quantity, 550);
  assert.strictEqual(cookingLiquid.unit, 'ml');

  // Tomato paste total = 70g (30g filling + 40g liquid)
  const paste = sarmale.ingredients.find((i: any) => i.ingredient_id === 'pasta-tomate');
  assert.ok(paste, 'Tomato paste must be declared');
  assert.strictEqual(paste.quantity, 70);

  console.log('✓ All 5 canonical recipes and culinary remediation verified on live Railway instance.');

  // =========================================================================
  // SECTION D: SQLITE PERSISTENCE ACROSS RESTART
  // =========================================================================
  console.log('\n--- SECTION D: SQLITE PERSISTENCE ACROSS CONTAINER RESTART ---');
  // Create a persistent test recipe with Editorial Key
  const testRecipeId = `rec_staging_test_${Date.now()}`;
  const createRes = await fetch(`${STAGING_URL}/api/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-atlas-editorial-key': editorialKey,
    },
    body: JSON.stringify({
      id: testRecipeId,
      recipe_id: testRecipeId,
      title: 'Rețetă Test Persistență Railway Staging',
      summary: 'Verifică persistența datelor pe volumul /app/data la restart.',
      category: 'Test',
      yield_quantity: 2,
      yield_unit: 'porții',
      ingredients: [
        {
          id: 'ing_test_1',
          ingredient_id: 'sare',
          name: 'Sare marină',
          quantity: 5,
          unit: 'g',
          sequence_order: 1,
        },
      ],
      steps: [
        {
          id: 'step_test_1',
          step_id: 'step_test_1',
          step_number: 1,
          instruction: 'Presărați sarea uniform pe suprafață.',
          duration_minutes: 1,
        },
      ],
    }),
  });
  assert.strictEqual(createRes.status, 201, 'POST /api/recipes with valid editorial key must return 201');
  console.log(`✓ Test recipe created with ID: ${testRecipeId}`);

  // Restart Railway container
  console.log('Triggering Railway service restart to test volume persistence via GraphQL API...');
  const os = await import('node:os');
  const cfgPath = path.join(os.homedir(), '.railway', 'config.json');
  assert.ok(fs.existsSync(cfgPath), 'Railway config file must exist');
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const railwayToken = cfg.user?.accessToken;
  assert.ok(railwayToken, 'Railway access token must be present');

  // Query latest deployment ID for service
  const queryDep = `
    query GetDeployments($serviceId: String!) {
      deployments(input: { serviceId: $serviceId }, first: 1) {
        edges {
          node {
            id
            status
          }
        }
      }
    }
  `;
  const depQueryRes = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${railwayToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: queryDep,
      variables: { serviceId: '02c1ad09-8103-48f1-b93f-6b0f54f7ccf7' },
    }),
  });
  const depQueryData = await depQueryRes.json();
  const latestDepId = depQueryData.data?.deployments?.edges?.[0]?.node?.id;
  assert.ok(latestDepId, 'Must find latest deployment ID to restart');

  const restartGql = `
    mutation RestartDeployment($id: String!) {
      deploymentRestart(id: $id)
    }
  `;
  const restartRes = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${railwayToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: restartGql,
      variables: { id: latestDepId },
    }),
  });
  const restartData = await restartRes.json();
  console.log('Railway deploymentRestart GraphQL response:', restartData);
  assert.strictEqual(restartData.data?.deploymentRestart, true, 'deploymentRestart must succeed');

  // Wait for container to restart and become healthy
  console.log('Waiting for Railway container to restart (15s)...');
  await new Promise((resolve) => setTimeout(resolve, 15000));

  // Poll until healthcheck returns 200
  let isBackUp = false;
  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      const probe = await fetch(`${STAGING_URL}/api/health`);
      if (probe.status === 200) {
        isBackUp = true;
        console.log(`✓ Container is back up and healthy on attempt ${attempt}`);
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  assert.ok(isBackUp, 'Container must become healthy after restart');

  // Verify the created recipe persisted across restart on /app/data
  const verifyPersistedRes = await fetch(`${STAGING_URL}/api/recipes/${testRecipeId}`, {
    headers: { 'x-atlas-access-key': accessKey },
  });
  assert.strictEqual(verifyPersistedRes.status, 200, 'Test recipe must persist across container restart');
  const persistedData = await verifyPersistedRes.json();
  assert.strictEqual(persistedData.recipe.title, 'Rețetă Test Persistență Railway Staging');
  console.log('✓ Data persistence on /app/data verified across container restart!');

  // Clean up: delete test recipe
  const deleteRes = await fetch(`${STAGING_URL}/api/recipes/${testRecipeId}`, {
    method: 'DELETE',
    headers: { 'x-atlas-editorial-key': editorialKey },
  });
  assert.strictEqual(deleteRes.status, 200, 'DELETE test recipe must succeed');
  console.log('✓ Cleaned up test recipe.');

  // =========================================================================
  // SECTION E: SECURITY HEADERS & RATE LIMITING
  // =========================================================================
  console.log('\n--- SECTION E: SECURITY HEADERS & RATE LIMITING ---');
  const secHeadersRes = await fetch(`${STAGING_URL}/api/health`);
  assert.ok(secHeadersRes.headers.get('Strict-Transport-Security'), 'Must have HSTS');
  assert.strictEqual(secHeadersRes.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.strictEqual(secHeadersRes.headers.get('X-Frame-Options'), 'DENY');
  assert.ok(secHeadersRes.headers.get('Referrer-Policy'), 'Must have Referrer-Policy');
  console.log('✓ Security headers verified on live HTTPS responses.');

  // =========================================================================
  // SECTION F: MOBILE VIEWPORT & BROWSER USER FLOW (PUPPETEER)
  // =========================================================================
  console.log('\n--- SECTION F: MOBILE VIEWPORT BROWSER FLOW (PUPPETEER) ---');
  if (fs.existsSync(CHROME_PATH)) {
    const browser: Browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      // Mobile viewport: iPhone 12/13/14
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

      // Navigate to live staging
      await page.goto(STAGING_URL, { waitUntil: 'networkidle2', timeout: 30000 });

      // 1. Verify gatekeeper UI is displayed
      const hasKeyInput = await page.$('input[type="password"]');
      assert.ok(hasKeyInput, 'Gatekeeper access key input must be visible on first visit');
      console.log('✓ Gatekeeper lock screen rendered correctly on mobile viewport.');

      // 2. Enter access key and unlock
      await page.type('input[type="password"]', accessKey);
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
      } else {
        await page.keyboard.press('Enter');
      }

      // Wait for catalog to render
      await page.waitForSelector('h1, h2, .recipe-card', { timeout: 15000 });
      console.log('✓ Private gate unlocked; recipe catalogue rendered.');

      // 3. Find and click Tagliatelle
      await page.waitForSelector('.recipe-card', { timeout: 15000 });
      const cards = await page.$$('.recipe-card');
      let clicked = false;
      for (const card of cards) {
        const titleText = await card.$eval('.card-title', (el) => el.textContent || '').catch(() => '');
        if (titleText.includes('Tagliatelle')) {
          const detailBtn = await card.$('.btn-card-detail');
          if (detailBtn) {
            await detailBtn.click();
          } else {
            await card.click();
          }
          clicked = true;
          break;
        }
      }
      assert.ok(clicked, 'Must be able to click Tagliatelle recipe in mobile catalogue');

      // 4. Verify Recipe Detail & Cook Mode button
      await page.waitForSelector('.recipe-detail-container, .btn-start-cook, h1', { timeout: 15000 });
      console.log('✓ Recipe detail view loaded on mobile.');

      // Check serving scaler presence
      const pageContent = await page.evaluate(() => document.body.innerText);
      assert.ok(
        pageContent.includes('porții') || pageContent.includes('Mod de Gătit') || pageContent.includes('Gătește'),
        'Recipe detail must include serving scaler or Cook Mode button'
      );

      console.log('✓ Mobile viewport acceptance test passed completely.');
    } finally {
      await browser.close();
    }
  } else {
    console.log('⚠ Chrome path not found; skipped browser Puppeteer phase, API tests passed.');
  }

  console.log('\n======================================================');
  console.log('  ALL LIVE STAGING ACCEPTANCE TESTS PASSED ON RAILWAY');
  console.log('======================================================\n');
});
