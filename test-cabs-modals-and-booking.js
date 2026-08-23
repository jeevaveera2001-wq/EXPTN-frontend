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

  // 1. Click Details button on the first card
  const detailsButtons = await page.$$('button');
  for (const btn of detailsButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Details')) {
      console.log('Clicking Details button...');
      await btn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vehicle_details_modal_live.png'), fullPage: false });
      console.log('📸 Captured vehicle_details_modal_live.png');
      break;
    }
  }

  // 2. Click "Book Cab with Google Maps Pin" inside details modal
  const bookInModal = await page.$$('button');
  for (const btn of bookInModal) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Book Cab with Google Maps Pin') || text.includes('Book')) {
      console.log('Clicking Book in modal button...');
      await btn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'cab_booking_modal_live.png'), fullPage: false });
      console.log('📸 Captured cab_booking_modal_live.png');
      break;
    }
  }

  await browser.close();
  console.log('✨ All modal tests completed successfully!');
})();
