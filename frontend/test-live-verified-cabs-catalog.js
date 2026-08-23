import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:/Users/Devil/.gemini/antigravity/brain/9d5f9338-ad35-4283-9212-8d12764608fe';
const LIVE_URL = 'https://frontend-blond-iota-kzel6q4tzd.vercel.app/cabs';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  console.log('Navigating to Live Cabs Page:', LIVE_URL);
  await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_cabs_catalog_verified.png'), fullPage: false });
  console.log('📸 Captured live_cabs_catalog_verified.png');

  // Click on the first vehicle card to open inspection modal
  const firstCard = await page.$('.grid > div');
  if (firstCard) {
    await firstCard.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vehicle_details_inspection_modal.png'), fullPage: false });
    console.log('📸 Captured vehicle_details_inspection_modal.png');
  }

  await browser.close();
  console.log('✨ Live Cabs Catalog Test Complete!');
})();
