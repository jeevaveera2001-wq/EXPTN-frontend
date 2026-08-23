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

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to live /cabs...');
  await page.goto('https://frontend-blond-iota-kzel6q4tzd.vercel.app/cabs', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 8000));

  const info = await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('h3, h2')).map(e => e.textContent.trim());
    const cards = document.querySelectorAll('.grid > div');
    const images = Array.from(document.querySelectorAll('img')).map(i => i.src);
    return { titles, cardCount: cards.length, imagesCount: images.length };
  });

  console.log('Info on page after 8s:', info);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_cabs_verified_vehicles.png'), fullPage: false });
  console.log('📸 Saved live_cabs_verified_vehicles.png');

  await browser.close();
})();
