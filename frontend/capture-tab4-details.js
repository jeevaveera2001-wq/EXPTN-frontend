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

  await pageAdmin.goto('http://localhost:5173/admin/super-control?tab=owner_requests', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 1500));
  
  // Click on the Owner Requests tab button in the sidebar to ensure it is active
  const ownerReqBtn = await pageAdmin.$('button[title*="Owner Requests"]');
  if (ownerReqBtn) {
    await ownerReqBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  await pageAdmin.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_tab4_vehicle_approval_details.png'), fullPage: false });
  console.log('📸 Captured superadmin_tab4_vehicle_approval_details.png');

  await browser.close();
})();
