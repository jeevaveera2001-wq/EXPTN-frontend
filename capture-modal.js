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

  try {
    await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));

    // Scroll to cards
    await page.evaluate(() => {
      window.scrollTo(0, 480);
    });
    await new Promise(r => setTimeout(r, 800));

    // Click on stay title to open modal
    const titles = await page.$$('h3');
    for (const t of titles) {
      const text = await page.evaluate(el => el.textContent, t);
      if (text && (text.includes('Natham') || text.includes('Mount view') || text.includes('Jeeva'))) {
        await t.click();
        break;
      }
    }

    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'explore_stay_modal_with_maps_redirect.png'), fullPage: false });
    console.log('📸 Captured explore_stay_modal_with_maps_redirect.png');

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
