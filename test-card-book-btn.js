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

  await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // Find all buttons and click the one that says "Book"
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const txt = await page.evaluate(el => el.textContent.trim(), b);
    if (txt.startsWith('Book') && !txt.includes('Google Maps') && !txt.includes('Booking')) {
      console.log('Clicking card Book button:', txt);
      await b.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'cab_checkout_booking_modal_verified.png'), fullPage: false });
      console.log('📸 Captured cab_checkout_booking_modal_verified.png');
      break;
    }
  }

  await browser.close();
})();
