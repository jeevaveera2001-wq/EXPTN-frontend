import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:/Users/Devil/.gemini/antigravity/brain/9d5f9338-ad35-4283-9212-8d12764608fe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  console.log('Navigating to Cabs page...');
  await page.goto('http://localhost:5173/cabs', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for vehicles to load from backend
  try {
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('.grid .bg-white');
      return cards.length > 0;
    }, { timeout: 10000 });
  } catch (e) {
    console.log('Waiting timed out or 0 vehicles in database');
  }

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'cabs_catalog_live_fleet.png'), fullPage: false });
  console.log('📸 Captured cabs_catalog_live_fleet.png');

  // Click on the first cab card or "Details" button to open the modal
  const detailsBtn = await page.$('button:has-text("Details"), .grid .bg-white button');
  if (detailsBtn) {
    await detailsBtn.click();
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'guest_cab_detail_inspection_modal.png'), fullPage: false });
    console.log('📸 Captured guest_cab_detail_inspection_modal.png');
  }

  // Also test clicking a popular destination on Home page
  console.log('Testing Home page destination click navigation...');
  const pageHome = await browser.newPage();
  await pageHome.setViewport({ width: 1440, height: 950 });
  await pageHome.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Click on the first destination card (e.g. Ooty / Kodaikanal)
  await pageHome.evaluate(() => {
    const card = document.querySelector('section:nth-of-type(2) .grid > div');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await pageHome.screenshot({ path: path.join(ARTIFACTS_DIR, 'destination_click_routed_to_explore.png'), fullPage: false });
  console.log('📸 Captured destination_click_routed_to_explore.png');

  await browser.close();
})();
