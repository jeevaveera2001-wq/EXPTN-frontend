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

  page.on('console', msg => console.log('LOG:', msg.text()));

  await page.evaluateOnNewDocument(() => {
    const adminUser = {
      name: 'Jeeva Veeramani',
      email: 'exploretamizhagam@gmail.com',
      role: 'super_admin',
      phone: '+91 78717 79134'
    };
    localStorage.setItem('ETN_USER', JSON.stringify(adminUser));
  });

  console.log('Navigating to Super Admin Control Center...');
  await page.goto('http://localhost:5173/admin/super-control?tab=owner_requests', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));

  // Switch to Tab 4 (Owner Requests)
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const reqTab = tabs.find(b => b.textContent && b.textContent.includes('Owner Requests'));
    if (reqTab) reqTab.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_tab4_owner_requests_active.png'), fullPage: false });
  console.log('📸 Captured superadmin_tab4_owner_requests_active.png');

  // Click Inspect Details button on the first pending request
  const inspected = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const inspectBtn = btns.find(b => b.textContent && b.textContent.includes('Inspect Details'));
    if (inspectBtn) {
      inspectBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked inspect button:', inspected);
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_vehicle_inspection_dossier_modal.png'), fullPage: false });
  console.log('📸 Captured superadmin_vehicle_inspection_dossier_modal.png');

  await browser.close();
})();
