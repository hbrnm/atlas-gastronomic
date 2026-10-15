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

  const PORT = 3365;
  const dbFile = path.resolve(process.cwd(), 'data/screenshots_final.db');
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
    // DESKTOP VIEWS (1440px)
    // -------------------------------------------------------------
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDesktop.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
    await pageDesktop.waitForSelector('.recipe-grid', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 800));

    // 1. Desktop homepage/catalog (hero spread + dateline + masthead)
    const p1 = path.join(OUTPUT_DIR, 'final-01-desktop-catalog-1440.png');
    await pageDesktop.screenshot({ path: p1, fullPage: false });
    console.log(`Saved: ${p1}`);

    // 2. Desktop editorial recipe grid (scrolled to recipe cards)
    await pageDesktop.evaluate(() => {
      document.querySelector('.recipe-grid')?.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 600));
    const p2 = path.join(OUTPUT_DIR, 'final-02-desktop-grid-1440.png');
    await pageDesktop.screenshot({ path: p2, fullPage: false });
    console.log(`Saved: ${p2}`);

    // 3. Desktop recipe detail
    const readBtn = await pageDesktop.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find((b) => b.textContent?.includes('Citește Rețeta')) || null;
    });

    if (readBtn && readBtn.asElement()) {
      await (readBtn.asElement() as any).click();
      await pageDesktop.waitForSelector('.recipe-detail-container', { timeout: 10000 });
      await new Promise((r) => setTimeout(r, 600));
      const p3 = path.join(OUTPUT_DIR, 'final-03-desktop-detail-1440.png');
      await pageDesktop.screenshot({ path: p3, fullPage: false });
      console.log(`Saved: ${p3}`);

      // 4. Desktop Cook Mode
      const cookBtn = await pageDesktop.$('.btn-start-cook');
      if (cookBtn) {
        await cookBtn.click();
        await pageDesktop.waitForSelector('.cook-mode-container, .btn-cook-exit', { timeout: 10000 });
        await new Promise((r) => setTimeout(r, 600));
        const p4 = path.join(OUTPUT_DIR, 'final-04-desktop-cookmode-1440.png');
        await pageDesktop.screenshot({ path: p4, fullPage: false });
        console.log(`Saved: ${p4}`);
      }
    }
    await pageDesktop.close();

    // -------------------------------------------------------------
    // MOBILE VIEWS (390px)
    // -------------------------------------------------------------
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await pageMobile.evaluateOnNewDocument(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await pageMobile.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
    await pageMobile.waitForSelector('.recipe-grid', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 800));

    // 5. Mobile homepage/catalog
    const p5 = path.join(OUTPUT_DIR, 'final-05-mobile-catalog-390.png');
    await pageMobile.screenshot({ path: p5, fullPage: false });
    console.log(`Saved: ${p5}`);

    // 6. Mobile recipe detail
    const readBtnMobile = await pageMobile.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find((b) => b.textContent?.includes('Citește Rețeta')) || null;
    });

    if (readBtnMobile && readBtnMobile.asElement()) {
      await (readBtnMobile.asElement() as any).click();
      await pageMobile.waitForSelector('.recipe-detail-container', { timeout: 10000 });
      await new Promise((r) => setTimeout(r, 600));
      const p6 = path.join(OUTPUT_DIR, 'final-06-mobile-detail-390.png');
      await pageMobile.screenshot({ path: p6, fullPage: false });
      console.log(`Saved: ${p6}`);

      // 7. Mobile Cook Mode
      const cookBtnMobile = await pageMobile.$('.btn-start-cook');
      if (cookBtnMobile) {
        await cookBtnMobile.click();
        await pageMobile.waitForSelector('.cook-mode-container, .btn-cook-exit', { timeout: 10000 });
        await new Promise((r) => setTimeout(r, 600));
        const p7 = path.join(OUTPUT_DIR, 'final-07-mobile-cookmode-390.png');
        await pageMobile.screenshot({ path: p7, fullPage: false });
        console.log(`Saved: ${p7}`);
      }
    }
    await pageMobile.close();

    // Copy to brain artifacts directory so user can inspect directly
    if (fs.existsSync(ARTIFACTS_DIR)) {
      const files = fs.readdirSync(OUTPUT_DIR);
      for (const f of files) {
        if (f.startsWith('final-') && f.endsWith('.png')) {
          fs.copyFileSync(path.join(OUTPUT_DIR, f), path.join(ARTIFACTS_DIR, f));
        }
      }
      console.log(`Copied final acceptance screenshots to artifacts directory: ${ARTIFACTS_DIR}`);
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
  console.error('Final screenshot capture failed:', err);
  process.exit(1);
});
