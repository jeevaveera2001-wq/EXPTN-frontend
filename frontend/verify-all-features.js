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

  // 1. Test Desktop Cabs Page & Guest Vehicle Detail Modal
  console.log('1. Testing Cabs Page Guest Vehicle Detail & Safety Modal...');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:5173/cabs', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'cabs_catalog_with_gst_fee_pricing.png'), fullPage: false });
  console.log('📸 Captured cabs_catalog_with_gst_fee_pricing.png');

  // Click on the first cab card to open Guest Detail Modal
  const cabCard = await page.$('.grid .cursor-pointer');
  if (cabCard) {
    await cabCard.click();
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'guest_cab_detail_inspection_modal.png'), fullPage: false });
    console.log('📸 Captured guest_cab_detail_inspection_modal.png');
  }

  // 2. Test Mobile UI Alignment (iPhone 14 / 390x844)
  console.log('2. Testing Mobile UI alignment on Home and Cabs...');
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  
  // Home Page Mobile
  await pageMobile.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await pageMobile.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile_home_popular_destinations.png'), fullPage: false });
  console.log('📸 Captured mobile_home_popular_destinations.png');

  // Cabs Page Mobile
  await pageMobile.goto('http://localhost:5173/cabs', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await pageMobile.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile_cabs_fleet_view.png'), fullPage: false });
  console.log('📸 Captured mobile_cabs_fleet_view.png');

  // 3. Test Vendor Dashboard Vehicle Details View
  console.log('3. Testing Vendor Dashboard View Details...');
  const pageVendor = await browser.newPage();
  await pageVendor.setViewport({ width: 1440, height: 950 });
  await pageVendor.evaluateOnNewDocument(() => {
    const vendorUser = {
      name: 'Jeeva Fleet & Transport',
      email: 'jeeva.transport@gmail.com',
      role: 'vendor',
      phone: '+91 78717 79134'
    };
    localStorage.setItem('ETN_USER', JSON.stringify(vendorUser));
    localStorage.setItem('token', 'mock-vendor-token');
  });
  await pageVendor.goto('http://localhost:5173/dashboard/vendor?tab=vehicles', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));
  
  // Click View Details button on the first vehicle
  await pageVendor.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const detailsBtn = btns.find(b => b.textContent && b.textContent.includes('View Details'));
    if (detailsBtn) detailsBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await pageVendor.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_vehicle_detail_inspection_modal.png'), fullPage: false });
  console.log('📸 Captured vendor_vehicle_detail_inspection_modal.png');

  // 4. Test Super Admin Control Center Vehicle Dossier Modal
  console.log('4. Testing Super Admin Vehicle Dossier Modal...');
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
  await pageAdmin.goto('http://localhost:5173/admin/super-control?tab=owner_requests', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));

  // Click Inspect Details button
  await pageAdmin.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const inspectBtn = btns.find(b => b.textContent && b.textContent.includes('Inspect Details'));
    if (inspectBtn) inspectBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await pageAdmin.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_vehicle_inspection_dossier_modal.png'), fullPage: false });
  console.log('📸 Captured superadmin_vehicle_inspection_dossier_modal.png');

  await browser.close();
})();
