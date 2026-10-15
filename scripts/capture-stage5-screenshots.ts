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

  const PORT = 3361;
  const dbFile = path.resolve(process.cwd(), 'data/screenshots_stage5.db');
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
    await new Promise((r) => setTimeout(r, 800));

    const pathDesktopCatalog = path.join(OUTPUT_DIR, 'stage5-desktop-catalog-1440.png');
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

      const pathDesktopDetail = path.join(OUTPUT_DIR, 'stage5-desktop-detail-1440.png');
      await pageDesktop.screenshot({ path: pathDesktopDetail, fullPage: false });
      console.log(`Saved: ${pathDesktopDetail}`);

      // 3. Desktop Cook Mode (Stage 5 Primary Deliverable)
      const cookBtn = await pageDesktop.$('.btn-start-cook');
      if (cookBtn) {
        await cookBtn.click();
        await pageDesktop.waitForSelector('.cook-mode-container, .btn-cook-exit', { timeout: 10000 });
        await new Promise((r) => setTimeout(r, 600));

        const pathDesktopCook = path.join(OUTPUT_DIR, 'stage5-desktop-cookmode-1440.png');
        await pageDesktop.screenshot({ path: pathDesktopCook, fullPage: false });
        console.log(`Saved: ${pathDesktopCook}`);

        // 3b. Desktop Cook Mode with Timer Started
        const timerStartBtn = await pageDesktop.$('.cook-timer-btn-primary');
        if (timerStartBtn) {
          await timerStartBtn.click();
          await new Promise((r) => setTimeout(r, 500));
          const pathDesktopCookTimer = path.join(OUTPUT_DIR, 'stage5-desktop-cookmode-timer-1440.png');
          await pageDesktop.screenshot({ path: pathDesktopCookTimer, fullPage: false });
          console.log(`Saved: ${pathDesktopCookTimer}`);
        }
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
    await new Promise((r) => setTimeout(r, 800));

    const pathMobileCatalog = path.join(OUTPUT_DIR, 'stage5-mobile-catalog-390.png');
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

      const pathMobileDetail = path.join(OUTPUT_DIR, 'stage5-mobile-detail-390.png');
      await pageMobile.screenshot({ path: pathMobileDetail, fullPage: false });
      console.log(`Saved: ${pathMobileDetail}`);

      // 6. Mobile Cook Mode (Stage 5 Primary Deliverable)
      const cookBtnMobile = await pageMobile.$('.btn-start-cook');
      if (cookBtnMobile) {
        await cookBtnMobile.click();
        await pageMobile.waitForSelector('.cook-mode-container, .btn-cook-exit', { timeout: 10000 });
        await new Promise((r) => setTimeout(r, 600));

        const pathMobileCook = path.join(OUTPUT_DIR, 'stage5-mobile-cookmode-390.png');
        await pageMobile.screenshot({ path: pathMobileCook, fullPage: false });
        console.log(`Saved: ${pathMobileCook}`);

        // 6b. Mobile Cook Mode Scrolled to Timer & Controls
        await pageMobile.evaluate(() => {
          document.querySelector('.cook-timer-panel')?.scrollIntoView();
        });
        await new Promise((r) => setTimeout(r, 500));
        const pathMobileCookTimer = path.join(OUTPUT_DIR, 'stage5-mobile-cookmode-timer-390.png');
        await pageMobile.screenshot({ path: pathMobileCookTimer, fullPage: false });
        console.log(`Saved: ${pathMobileCookTimer}`);
      }
    }
    await pageMobile.close();

    // Copy to brain artifacts directory so user can inspect directly
    if (fs.existsSync(ARTIFACTS_DIR)) {
      const files = fs.readdirSync(OUTPUT_DIR);
      for (const f of files) {
        if (f.startsWith('stage5-') && f.endsWith('.png')) {
          fs.copyFileSync(path.join(OUTPUT_DIR, f), path.join(ARTIFACTS_DIR, f));
        }
      }
      console.log(`Copied stage5 screenshots to artifacts directory: ${ARTIFACTS_DIR}`);
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
