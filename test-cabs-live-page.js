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

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  console.log('Navigating to Live Cabs Page:', LIVE_URL);
  await page.goto(LIVE_URL, { waitUntil: 'load', timeout: 35000 });
  await new Promise(r => setTimeout(r, 4000));

  const pageState = await page.evaluate(() => {
    const cards = document.querySelectorAll('.grid > div');
    const h2 = document.querySelector('h2')?.textContent;
    const bodyText = document.body.innerText;
    return {
      cardsCount: cards.length,
      heading: h2,
      hasNoActiveFleet: bodyText.includes('No Active Vehicles in Live Fleet'),
      rawVehiclesFromLocalStorage: localStorage.getItem('swr_vehicles_catalog')
    };
  });

  console.log('Page State:', pageState);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_cabs_page_inspection.png'), fullPage: false });
  console.log('📸 Captured live_cabs_page_inspection.png');

  await browser.close();
})();
