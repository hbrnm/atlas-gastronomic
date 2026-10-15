import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';
import { startServer } from '../src/server/index.js';
import { COMPLETE_CATALOGUE } from '../src/shared/sample-data.js';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(process.cwd(), 'docs/architecture/design-system-v1/screenshots');
const ARTIFACTS_DIR = 'C:\\Users\\pc1\\.gemini\\antigravity\\brain\\5963767e-be8e-4709-a7ca-83248fb4fd99';

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const PORT = 3358;
  const dbFile = path.resolve(process.cwd(), 'data/screenshots_stage3_p83.db');
  if (fs.existsSync(dbFile)) {
    try { fs.unlinkSync(dbFile); } catch {}
  }

  process.env.NODE_ENV = 'production';
  const server = await startServer(PORT, dbFile, COMPLETE_CATALOGUE);
  console.log(`Server started on http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
  });

  try {
    // -------------------------------------------------------------
    // 1. Desktop Cook Mode - Step 1 with Circular Radial Timer (1440px)
    // -------------------------------------------------------------
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDesktop.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });

    // Open Tagliatelle al Ragù detail view
    await pageDesktop.waitForSelector('.recipe-card', { timeout: 10000 });
    await pageDesktop.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.recipe-card'));
      const targetCard = cards.find((c) => c.textContent?.includes('Tagliatelle')) || cards[0];
      const btn = targetCard?.querySelector('.btn-card-detail') as HTMLElement;
      btn?.click();
    });

    await pageDesktop.waitForSelector('.recipe-detail-container', { timeout: 10000 });
    await pageDesktop.waitForSelector('.btn-hero-start-cook', { timeout: 10000 });

    // Click "Gătește acum"
    await pageDesktop.click('.btn-hero-start-cook');
    await pageDesktop.waitForSelector('.cook-mode-container', { timeout: 10000 });
    await pageDesktop.waitForSelector('.cook-radial-timer-section', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 800));

    const pathDesktopTimer = path.join(OUTPUT_DIR, 'phase008-3-stage3-desktop-cookmode-radial-1440.png');
    await pageDesktop.screenshot({ path: pathDesktopTimer, fullPage: false });
    console.log(`Saved: ${pathDesktopTimer}`);

    // -------------------------------------------------------------
    // 2. Desktop Cook Mode - Scrolled to Sfat Card & Thermal / Risks (1440px)
    // -------------------------------------------------------------
    // Advance to step with thermal / sfat
    await pageDesktop.click('.btn-cook-next');
    await new Promise((r) => setTimeout(r, 600));

    const pathDesktopStep2 = path.join(OUTPUT_DIR, 'phase008-3-stage3-desktop-cookmode-cues-1440.png');
    await pageDesktop.screenshot({ path: pathDesktopStep2, fullPage: false });
    console.log(`Saved: ${pathDesktopStep2}`);

    // -------------------------------------------------------------
    // 3. Desktop Cook Mode - Completion Screen (1440px)
    // -------------------------------------------------------------
    // Navigate through all steps
    let hasMoreSteps = true;
    while (hasMoreSteps) {
      const nextBtn = await pageDesktop.$('.btn-cook-next');
      if (!nextBtn) break;
      const isFinish = await pageDesktop.evaluate((btn) => btn.textContent?.includes('Finalizează'), nextBtn);
      await nextBtn.click();
      await new Promise((r) => setTimeout(r, 200));
      if (isFinish) break;
    }

    await pageDesktop.waitForSelector('.cook-completion-screen', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 800));

    const pathDesktopComplete = path.join(OUTPUT_DIR, 'phase008-3-stage3-desktop-cookmode-complete-1440.png');
    await pageDesktop.screenshot({ path: pathDesktopComplete, fullPage: false });
    console.log(`Saved: ${pathDesktopComplete}`);

    await pageDesktop.evaluate(() => localStorage.clear());
    await pageDesktop.close();

    // -------------------------------------------------------------
    // 4. Mobile Cook Mode - Step with Circular Timer (390px)
    // -------------------------------------------------------------
    const mobileContext = await browser.createBrowserContext();
    const pageMobile = await mobileContext.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await pageMobile.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });

    // Open Tagliatelle al Ragù
    await pageMobile.waitForSelector('.recipe-card', { timeout: 10000 });
    await pageMobile.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.recipe-card'));
      const targetCard = cards.find((c) => c.textContent?.includes('Tagliatelle')) || cards[0];
      const btn = targetCard?.querySelector('.btn-card-detail') as HTMLElement;
      btn?.click();
    });

    await pageMobile.waitForSelector('.btn-hero-start-cook', { timeout: 10000 });
    await pageMobile.click('.btn-hero-start-cook');
    await pageMobile.waitForSelector('.cook-mode-container', { timeout: 10000 });
    await pageMobile.waitForSelector('.cook-radial-timer-section', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 800));

    const pathMobileTimer = path.join(OUTPUT_DIR, 'phase008-3-stage3-mobile-cookmode-radial-390.png');
    await pageMobile.screenshot({ path: pathMobileTimer, fullPage: false });
    console.log(`Saved: ${pathMobileTimer}`);

    // -------------------------------------------------------------
    // 5. Mobile Cook Mode - Scrolled to Sfat Card & Ingredients (390px)
    // -------------------------------------------------------------
    await pageMobile.evaluate(() => {
      document.querySelector('.cook-tip-callout-card')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 600));

    const pathMobileCues = path.join(OUTPUT_DIR, 'phase008-3-stage3-mobile-cookmode-cues-390.png');
    await pageMobile.screenshot({ path: pathMobileCues, fullPage: false });
    console.log(`Saved: ${pathMobileCues}`);

    // Copy captures to brain artifacts directory
    const screenshotFiles = [
      'phase008-3-stage3-desktop-cookmode-radial-1440.png',
      'phase008-3-stage3-desktop-cookmode-cues-1440.png',
      'phase008-3-stage3-desktop-cookmode-complete-1440.png',
      'phase008-3-stage3-mobile-cookmode-radial-390.png',
      'phase008-3-stage3-mobile-cookmode-cues-390.png',
    ];

    for (const file of screenshotFiles) {
      const srcPath = path.join(OUTPUT_DIR, file);
      const destPath = path.join(ARTIFACTS_DIR, file);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied to artifacts: ${destPath}`);
      }
    }

    console.log('--- ALL STAGE 3 SCREENSHOTS CAPTURED AND COPIED TO ARTIFACTS SUCCESSFULLY ---');
  } finally {
    await browser.close();
    await server.close();
    if (fs.existsSync(dbFile)) {
      try { fs.unlinkSync(dbFile); } catch {}
    }
  }
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
