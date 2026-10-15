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

  const PORT = 3355;
  const dbFile = path.resolve(process.cwd(), 'data/screenshots_stage1_p83.db');
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
    // 1. Desktop Catalog Top Hero & Curated Showcase (1440px)
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDesktop.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
    await pageDesktop.waitForSelector('.catalog-hero-banner', { timeout: 10000 });
    await pageDesktop.waitForSelector('.curated-showcase-section', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));

    const pathDesktopHero = path.join(OUTPUT_DIR, 'phase008-3-stage1-desktop-hero-1440.png');
    await pageDesktop.screenshot({ path: pathDesktopHero, fullPage: false });
    console.log(`Saved: ${pathDesktopHero}`);

    // 2. Desktop Collections Section & Catalog Grid (1440px scrolled)
    await pageDesktop.evaluate(() => {
      document.querySelector('.collections-section')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));

    const pathDesktopCollections = path.join(OUTPUT_DIR, 'phase008-3-stage1-desktop-collections-1440.png');
    await pageDesktop.screenshot({ path: pathDesktopCollections, fullPage: false });
    console.log(`Saved: ${pathDesktopCollections}`);

    // 3. Desktop Interactive Collection Filter Test: Click "Bucătăria italiană"
    await pageDesktop.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 400));
    const collectionClicked = await pageDesktop.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.collection-card'));
      const italianCard = cards.find((c) => c.textContent?.includes('italiană')) as HTMLElement;
      if (italianCard) {
        italianCard.click();
        return true;
      }
      return false;
    });
    console.log(`Collection clicked: ${collectionClicked}`);
    await new Promise((r) => setTimeout(r, 1000));

    const pathDesktopFiltered = path.join(OUTPUT_DIR, 'phase008-3-stage1-desktop-filtered-1440.png');
    await pageDesktop.screenshot({ path: pathDesktopFiltered, fullPage: false });
    console.log(`Saved: ${pathDesktopFiltered}`);

    // 4. Mobile Viewport (390px iPhone 14 Pro style)
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await pageMobile.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
    await pageMobile.waitForSelector('.catalog-hero-banner', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));

    const pathMobileHero = path.join(OUTPUT_DIR, 'phase008-3-stage1-mobile-hero-390.png');
    await pageMobile.screenshot({ path: pathMobileHero, fullPage: false });
    console.log(`Saved: ${pathMobileHero}`);

    // 5. Mobile Scrolled to Curated Cards & Collections
    await pageMobile.evaluate(() => {
      document.querySelector('.curated-showcase-section')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));

    const pathMobileCurated = path.join(OUTPUT_DIR, 'phase008-3-stage1-mobile-curated-390.png');
    await pageMobile.screenshot({ path: pathMobileCurated, fullPage: false });
    console.log(`Saved: ${pathMobileCurated}`);

    // 6. Mobile Scrolled to Collections Section
    await pageMobile.evaluate(() => {
      document.querySelector('.collections-section')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));

    const pathMobileCollections = path.join(OUTPUT_DIR, 'phase008-3-stage1-mobile-collections-390.png');
    await pageMobile.screenshot({ path: pathMobileCollections, fullPage: false });
    console.log(`Saved: ${pathMobileCollections}`);

    // Copy all captures to Artifacts dir for viewing
    const filesToCopy = [
      'phase008-3-stage1-desktop-hero-1440.png',
      'phase008-3-stage1-desktop-collections-1440.png',
      'phase008-3-stage1-desktop-filtered-1440.png',
      'phase008-3-stage1-mobile-hero-390.png',
      'phase008-3-stage1-mobile-curated-390.png',
      'phase008-3-stage1-mobile-collections-390.png',
    ];

    for (const f of filesToCopy) {
      const src = path.join(OUTPUT_DIR, f);
      const dst = path.join(ARTIFACTS_DIR, f);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        console.log(`Copied to artifact: ${dst}`);
      }
    }

    console.log('--- ALL STAGE 1 SCREENSHOTS CAPTURED SUCCESSFULLY ---');
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
