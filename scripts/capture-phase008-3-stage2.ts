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

  const PORT = 3356;
  const dbFile = path.resolve(process.cwd(), 'data/screenshots_stage2_p83.db');
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
    // 1. Desktop Recipe Detail Side-by-Side Hero (1440px)
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDesktop.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });

    // Open first canonical recipe (Tagliatelle al Ragù) via .btn-card-detail
    await pageDesktop.waitForSelector('.recipe-card', { timeout: 10000 });
    const detailOpened = await pageDesktop.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.recipe-card'));
      const targetCard = cards.find((c) => c.textContent?.includes('Tagliatelle')) || cards[0];
      const btn = targetCard?.querySelector('.btn-card-detail') as HTMLElement;
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log(`Desktop detail button clicked: ${detailOpened}`);

    await pageDesktop.waitForSelector('.recipe-detail-container', { timeout: 10000 });
    await pageDesktop.waitForSelector('.recipe-hero-split-section', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));

    const pathDesktopHero = path.join(OUTPUT_DIR, 'phase008-3-stage2-desktop-detail-hero-1440.png');
    await pageDesktop.screenshot({ path: pathDesktopHero, fullPage: false });
    console.log(`Saved: ${pathDesktopHero}`);

    // 2. Desktop Two-Column Cookbook Spread (scrolled to steps and scaler)
    await pageDesktop.evaluate(() => {
      document.querySelector('.recipe-editorial-tabs-strip')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));

    const pathDesktopSpread = path.join(OUTPUT_DIR, 'phase008-3-stage2-desktop-cookbook-spread-1440.png');
    await pageDesktop.screenshot({ path: pathDesktopSpread, fullPage: false });
    console.log(`Saved: ${pathDesktopSpread}`);

    // 3. Desktop Scrolled to Sfatul Bucătarului & Terroir Box
    await pageDesktop.evaluate(() => {
      document.querySelector('.chef-tip-highlight-card')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));

    const pathDesktopChefTip = path.join(OUTPUT_DIR, 'phase008-3-stage2-desktop-chef-tip-1440.png');
    await pageDesktop.screenshot({ path: pathDesktopChefTip, fullPage: false });
    console.log(`Saved: ${pathDesktopChefTip}`);

    // 4. Mobile Viewport (390px iPhone 14 Pro style)
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await pageMobile.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });

    // Open Tagliatelle on mobile
    await pageMobile.waitForSelector('.recipe-card', { timeout: 10000 });
    const mobileDetailOpened = await pageMobile.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.recipe-card'));
      const targetCard = cards.find((c) => c.textContent?.includes('Tagliatelle')) || cards[0];
      const btn = targetCard?.querySelector('.btn-card-detail') as HTMLElement;
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log(`Mobile detail button clicked: ${mobileDetailOpened}`);

    await pageMobile.waitForSelector('.recipe-hero-split-section', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));

    const pathMobileHero = path.join(OUTPUT_DIR, 'phase008-3-stage2-mobile-detail-hero-390.png');
    await pageMobile.screenshot({ path: pathMobileHero, fullPage: false });
    console.log(`Saved: ${pathMobileHero}`);

    // 5. Mobile Scrolled to Steps and Circular Badges
    await pageMobile.evaluate(() => {
      document.querySelector('.procedural-steps-section')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));

    const pathMobileSteps = path.join(OUTPUT_DIR, 'phase008-3-stage2-mobile-detail-steps-390.png');
    await pageMobile.screenshot({ path: pathMobileSteps, fullPage: false });
    console.log(`Saved: ${pathMobileSteps}`);

    // 6. Mobile Scrolled to Sfatul Bucătarului Highlight Card
    await pageMobile.evaluate(() => {
      document.querySelector('.chef-tip-highlight-card')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));

    const pathMobileChefTip = path.join(OUTPUT_DIR, 'phase008-3-stage2-mobile-chef-tip-390.png');
    await pageMobile.screenshot({ path: pathMobileChefTip, fullPage: false });
    console.log(`Saved: ${pathMobileChefTip}`);

    // Copy all captures to Artifacts dir for immediate viewing
    const filesToCopy = [
      'phase008-3-stage2-desktop-detail-hero-1440.png',
      'phase008-3-stage2-desktop-cookbook-spread-1440.png',
      'phase008-3-stage2-desktop-chef-tip-1440.png',
      'phase008-3-stage2-mobile-detail-hero-390.png',
      'phase008-3-stage2-mobile-detail-steps-390.png',
      'phase008-3-stage2-mobile-chef-tip-390.png',
    ];

    for (const f of filesToCopy) {
      const src = path.join(OUTPUT_DIR, f);
      const dst = path.join(ARTIFACTS_DIR, f);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        console.log(`Copied to artifact: ${dst}`);
      }
    }

    console.log('--- ALL STAGE 2 SCREENSHOTS CAPTURED SUCCESSFULLY ---');
  } finally {
    await browser.close();
    await server.close();
    if (fs.existsSync(dbFile)) {
      try { fs.unlinkSync(dbFile); } catch {}
    }
  }
}

main().catch((err) => {
  console.error('Stage 2 Screenshot capture failed:', err);
  process.exit(1);
});
