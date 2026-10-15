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

  const PORT = 3359;
  const dbFile = path.resolve(process.cwd(), 'data/screenshots_stage4.db');
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
    // 1. Desktop Catalog (1440px)
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDesktop.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
    await pageDesktop.waitForSelector('.recipe-grid', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));

    const pathDesktopCatalog = path.join(OUTPUT_DIR, 'stage4-desktop-catalog-1440.png');
    await pageDesktop.screenshot({ path: pathDesktopCatalog, fullPage: false });
    console.log(`Saved: ${pathDesktopCatalog}`);

    // 2. Desktop Detail View
    const readBtn = await pageDesktop.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find((b) => b.textContent?.includes('Citește Rețeta')) || null;
    });

    if (readBtn && readBtn.asElement()) {
      await (readBtn.asElement() as any).click();
      await pageDesktop.waitForSelector('.recipe-detail-container', { timeout: 10000 });
      await new Promise((r) => setTimeout(r, 600));

      const pathDesktopDetail = path.join(OUTPUT_DIR, 'stage4-desktop-detail-1440.png');
      await pageDesktop.screenshot({ path: pathDesktopDetail, fullPage: false });
      console.log(`Saved: ${pathDesktopDetail}`);

      // 2b. Desktop Detail View Scrolled to Dual Columns (Ingredients & Steps)
      await pageDesktop.evaluate(() => {
        document.querySelector('.cookbook-body-columns')?.scrollIntoView();
      });
      await new Promise((r) => setTimeout(r, 600));
      const pathDesktopDetailColumns = path.join(OUTPUT_DIR, 'stage4-desktop-detail-columns-1440.png');
      await pageDesktop.screenshot({ path: pathDesktopDetailColumns, fullPage: false });
      console.log(`Saved: ${pathDesktopDetailColumns}`);

      // 3. Desktop Cook Mode
      const cookBtn = await pageDesktop.$('.btn-start-cook');
      if (cookBtn) {
        await cookBtn.click();
        await pageDesktop.waitForSelector('.cook-mode-container, .btn-cook-exit', { timeout: 10000 });
        await new Promise((r) => setTimeout(r, 600));
        const pathDesktopCook = path.join(OUTPUT_DIR, 'stage4-desktop-cookmode-1440.png');
        await pageDesktop.screenshot({ path: pathDesktopCook, fullPage: false });
        console.log(`Saved: ${pathDesktopCook}`);
      }
    }
    await pageDesktop.close();

    // 4. Mobile Catalog (390px)
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await pageMobile.evaluateOnNewDocument(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await pageMobile.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
    await pageMobile.waitForSelector('.recipe-grid', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));

    const pathMobileCatalog = path.join(OUTPUT_DIR, 'stage4-mobile-catalog-390.png');
    await pageMobile.screenshot({ path: pathMobileCatalog, fullPage: false });
    console.log(`Saved: ${pathMobileCatalog}`);

    // 5. Mobile Detail View
    const readBtnMobile = await pageMobile.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find((b) => b.textContent?.includes('Citește Rețeta')) || null;
    });

    if (readBtnMobile && readBtnMobile.asElement()) {
      await (readBtnMobile.asElement() as any).click();
      await pageMobile.waitForSelector('.recipe-detail-container', { timeout: 10000 });
      await new Promise((r) => setTimeout(r, 600));
      const pathMobileDetail = path.join(OUTPUT_DIR, 'stage4-mobile-detail-390.png');
      await pageMobile.screenshot({ path: pathMobileDetail, fullPage: false });
      console.log(`Saved: ${pathMobileDetail}`);

      // 5b. Mobile Detail Scrolled to Ingredients & Scaler
      await pageMobile.evaluate(() => {
        document.querySelector('.serving-scaler-control')?.scrollIntoView();
      });
      await new Promise((r) => setTimeout(r, 600));
      const pathMobileDetailIngredients = path.join(OUTPUT_DIR, 'stage4-mobile-detail-ingredients-390.png');
      await pageMobile.screenshot({ path: pathMobileDetailIngredients, fullPage: false });
      console.log(`Saved: ${pathMobileDetailIngredients}`);

      // 6. Mobile Cook Mode
      const cookBtnMobile = await pageMobile.$('.btn-start-cook');
      if (cookBtnMobile) {
        await cookBtnMobile.click();
        await pageMobile.waitForSelector('.cook-mode-container, .btn-cook-exit', { timeout: 10000 });
        await new Promise((r) => setTimeout(r, 600));
        const pathMobileCook = path.join(OUTPUT_DIR, 'stage4-mobile-cookmode-390.png');
        await pageMobile.screenshot({ path: pathMobileCook, fullPage: false });
        console.log(`Saved: ${pathMobileCook}`);
      }
    }
    await pageMobile.close();

    // Copy to brain artifacts directory so user can inspect directly
    if (fs.existsSync(ARTIFACTS_DIR)) {
      const files = fs.readdirSync(OUTPUT_DIR);
      for (const f of files) {
        if (f.startsWith('stage4-') && f.endsWith('.png')) {
          fs.copyFileSync(path.join(OUTPUT_DIR, f), path.join(ARTIFACTS_DIR, f));
        }
      }
      console.log(`Copied stage4 screenshots to artifacts directory: ${ARTIFACTS_DIR}`);
    }

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
