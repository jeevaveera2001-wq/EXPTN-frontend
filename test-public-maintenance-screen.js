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

  // Clear all local storage so user is not logged in as admin
  await page.evaluateOnNewDocument(() => {
    localStorage.clear();
    const origFetch = window.fetch;
    window.fetch = async function(url, ...args) {
      if (typeof url === 'string' && url.includes('/system/maintenance')) {
        return new Response(JSON.stringify({
          success: true,
          isMaintenance: true,
          message: 'Explore Tamil Nadu is undergoing scheduled system upgrades for high-speed performance, live database caching, and enhanced reservation security.',
          estimatedTime: '30 Minutes',
          upgradeTitle: 'Platform Upgrade & Performance Optimization in Progress'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return origFetch.apply(this, [url, ...args]);
    };
  });

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'maintenance_upgrade_screen_verified.png'), fullPage: false });
  console.log('📸 Captured maintenance_upgrade_screen_verified.png');

  // Also test clicking Admin Access button on maintenance screen
  await page.click('header button');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'maintenance_admin_bypass_modal.png'), fullPage: false });
  console.log('📸 Captured maintenance_admin_bypass_modal.png');

  await browser.close();
})();
