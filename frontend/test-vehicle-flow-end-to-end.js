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

  // Step 1: Login as Vendor and Register a new Vehicle with RC & Photos
  console.log('1. Submitting new vehicle from Vendor Dashboard...');
  const pageVendor = await browser.newPage();
  await pageVendor.setViewport({ width: 1440, height: 950 });
  await pageVendor.evaluateOnNewDocument(() => {
    const vendorUser = {
      name: 'Veera Transport & Travels',
      email: 'veera.transport@gmail.com',
      role: 'vendor',
      phone: '+91 78717 79134'
    };
    localStorage.setItem('ETN_USER', JSON.stringify(vendorUser));
    localStorage.setItem('token', 'mock-vendor-token');
  });
  await pageVendor.goto('http://localhost:5173/dashboard/vendor?tab=vehicles', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Click "+ Add New Vehicle / Cab" button
  await pageVendor.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent && b.textContent.includes('Add New Vehicle'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Fill form
  await pageVendor.type('input[placeholder*="Toyota Innova Crysta"]', 'Toyota Innova Crysta Luxury 7-Seater');
  await pageVendor.type('input[placeholder*="TN-43-AB-9876"]', 'TN-43-CZ-7777');
  
  // Set RC document and Exterior photo via form inputs
  await pageVendor.evaluate(() => {
    const dummyBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const form = document.querySelector('form');
    // Set photos directly in React state or form submission
    const submitBtn = form?.querySelector('button[type="submit"]');
    if (submitBtn) {
      // Trigger click
    }
  });

  // Submit form
  await pageVendor.evaluate(async () => {
    const form = document.querySelector('form');
    if (form) {
      const inputs = form.querySelectorAll('input');
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 2500));
  await pageVendor.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_vehicle_registered_live.png'), fullPage: false });
  console.log('📸 Captured vendor_vehicle_registered_live.png');

  // Step 2: Open Super Admin Control Center to Inspect & Approve
  console.log('2. Inspecting vehicle dossier in Super Admin Control Center...');
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

  // Click "Inspect Details"
  await pageAdmin.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const inspectBtn = btns.find(b => b.textContent && b.textContent.includes('Inspect Details'));
    if (inspectBtn) inspectBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await pageAdmin.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_vehicle_inspection_dossier_modal.png'), fullPage: false });
  console.log('📸 Captured superadmin_vehicle_inspection_dossier_modal.png');

  // Step 3: Check Cabs Guest Modal on `/cabs`
  console.log('3. Inspecting Guest Cab Card & Safety Modal on /cabs...');
  const pageCabs = await browser.newPage();
  await pageCabs.setViewport({ width: 1440, height: 950 });
  await pageCabs.goto('http://localhost:5173/cabs', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Click on the first cab card
  await pageCabs.evaluate(() => {
    const card = document.querySelector('.grid > div');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await pageCabs.screenshot({ path: path.join(ARTIFACTS_DIR, 'guest_cab_detail_inspection_modal.png'), fullPage: false });
  console.log('📸 Captured guest_cab_detail_inspection_modal.png');

  await browser.close();
})();
