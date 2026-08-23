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

  await page.evaluateOnNewDocument(() => {
    const vendorUser = {
      name: 'Jeeva Fleet & Transport',
      email: 'jeeva.transport@gmail.com',
      role: 'vendor',
      phone: '+91 78717 79134'
    };
    localStorage.setItem('ETN_USER', JSON.stringify(vendorUser));
    localStorage.setItem('token', 'mock-vendor-token');
  });

  console.log('Navigating to Vendor Dashboard vehicles view...');
  await page.goto('http://localhost:5173/dashboard/vendor?tab=vehicles&action=add_vehicle', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'owner_vendor_add_vehicle_prominent_view.png'), fullPage: false });
  console.log('📸 Captured owner_vendor_add_vehicle_prominent_view.png');

  await browser.close();
})();
