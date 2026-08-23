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

  // 1. Popular Destinations Click Route Verification
  console.log('1. Verifying Popular Destinations Click Navigation...');
  const pageHome = await browser.newPage();
  await pageHome.setViewport({ width: 1440, height: 950 });
  await pageHome.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Click on the first popular destination card (e.g. Ooty - Queen of Hill Stations)
  const clicked = await pageHome.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div, a, button'));
    const ootyCard = cards.find(el => el.textContent && el.textContent.includes('Ooty') && el.textContent.includes('Queen of Hill Stations'));
    if (ootyCard) {
      ootyCard.click();
      return true;
    }
    // Fallback click on any destination card
    const anyCard = document.querySelector('img[alt*="Ooty"], img[alt*="Kodaikanal"]')?.closest('div');
    if (anyCard) {
      anyCard.click();
      return true;
    }
    return false;
  });
  console.log('Clicked destination card:', clicked);
  await new Promise(r => setTimeout(r, 2500));
  await pageHome.screenshot({ path: path.join(ARTIFACTS_DIR, 'popular_destination_routed_to_explore.png'), fullPage: false });
  console.log('📸 Captured popular_destination_routed_to_explore.png');

  // 2. Cabs Guest Vehicle Details Modal Verification
  console.log('2. Verifying Cabs Catalog & Guest Detail Modal...');
  const pageCabs = await browser.newPage();
  await pageCabs.setViewport({ width: 1440, height: 950 });
  await pageCabs.goto('http://localhost:5173/cabs', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await pageCabs.screenshot({ path: path.join(ARTIFACTS_DIR, 'cabs_catalog_live_verified.png'), fullPage: false });
  console.log('📸 Captured cabs_catalog_live_verified.png');

  // Click on cab card or inspect button if present
  const openedModal = await pageCabs.evaluate(() => {
    const card = document.querySelector('.grid > div');
    if (card) {
      card.click();
      return true;
    }
    return false;
  });
  console.log('Opened cab detail modal:', openedModal);
  await new Promise(r => setTimeout(r, 1500));
  await pageCabs.screenshot({ path: path.join(ARTIFACTS_DIR, 'guest_cab_detail_inspection_modal.png'), fullPage: false });
  console.log('📸 Captured guest_cab_detail_inspection_modal.png');

  await browser.close();
})();
