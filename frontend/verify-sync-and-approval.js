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

  // 1. Verify Vendor Dashboard shows the vehicle in "My Vehicle Fleet"
  console.log('1. Verifying Vendor Dashboard for jeeva.transport@gmail.com...');
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

  await page.goto('http://localhost:5173/dashboard/vendor?tab=vehicles', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_my_vehicles_synced_view.png'), fullPage: false });
  console.log('📸 Captured vendor_my_vehicles_synced_view.png');

  // 2. Verify Super Admin sees the pending vehicle in Tab 4 (Owner Requests)
  console.log('2. Verifying Super Admin Tab 4 Owner Requests...');
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

  await pageAdmin.goto('http://localhost:5173/admin/super-control?tab=owner_requests', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));
  await pageAdmin.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_pending_vehicle_request_view.png'), fullPage: false });
  console.log('📸 Captured superadmin_pending_vehicle_request_view.png');

  await browser.close();
})();
