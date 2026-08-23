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

  const pageAdmin = await browser.newPage();
  await pageAdmin.setViewport({ width: 1440, height: 950 });

  await pageAdmin.evaluateOnNewDocument(() => {
    const adminUser = {
      name: 'Jeeva Veeramani',
      email: 'exploretamizhagam@gmail.com',
      role: 'super_admin',
      phone: '+91 78717 79134'
    };
    localStorage.setItem('ETN_USER', JSON.stringify(adminUser));
    localStorage.setItem('token', 'mock-admin-token');
  });

  await pageAdmin.goto('http://localhost:5173/admin/super-control', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 1500));

  // Click tab 4: Owner Requests
  await pageAdmin.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside nav button, aside button'));
    const target = buttons.find(b => b.textContent && b.textContent.includes('Owner Requests'));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await pageAdmin.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_tab4_owner_requests_active.png'), fullPage: false });
  console.log('📸 Captured superadmin_tab4_owner_requests_active.png');

  // Also click tab 5: Properties & Transport
  await pageAdmin.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside nav button, aside button'));
    const target = buttons.find(b => b.textContent && b.textContent.includes('Properties'));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Click on "🚖 Transport Vehicles" subtab
  await pageAdmin.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const target = buttons.find(b => b.textContent && b.textContent.includes('Transport Vehicles'));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await pageAdmin.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_tab5_vehicles_fleet_active.png'), fullPage: false });
  console.log('📸 Captured superadmin_tab5_vehicles_fleet_active.png');

  await browser.close();
})();
