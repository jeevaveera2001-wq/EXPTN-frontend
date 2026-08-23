import puppeteer from 'puppeteer-core';
import path from 'path';
import { spawn } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Devil\\.gemini\\antigravity\\brain\\9d5f9338-ad35-4283-9212-8d12764608fe';

(async () => {
  console.log('🚀 Starting Vite preview server for local testing...');
  const preview = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    cwd: 'C:\\Users\\Devil\\.gemini\\antigravity\\scratch\\explore-tamilnadu\\frontend',
    shell: true
  });

  // Wait 2s for server to start
  await new Promise(r => setTimeout(r, 2000));

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log('1. Testing Vendor Dashboard modal...');
    await page.goto('http://localhost:4173/vendor/dashboard', { waitUntil: 'networkidle0', timeout: 15000 });

    // Set local storage for vendor user so Vendor Dashboard renders fully
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        name: 'Kodaikanal Valley Resorts Host',
        email: 'host.kodai@gmail.com',
        role: 'owner_and_vendor',
        phone: '+91 98401 54321'
      }));
      localStorage.setItem('token', 'mock-token');
    });

    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('button', { timeout: 5000 });

    // Click "+ List New Stay / Resort" button
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Add Property') || text.includes('List New Stay') || text.includes('Add Stay'))) {
        await btn.click();
        break;
      }
    }

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_stays_location_picker.png'), fullPage: false });
    console.log('📸 Captured vendor_stays_location_picker.png');

    // Click "+ Add Vehicle" button
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Add Vehicle') || text.includes('List Vehicle'))) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_add_vehicle_modal.png'), fullPage: false });
    console.log('📸 Captured vendor_add_vehicle_modal.png');

    // 2. Test Super Admin Control Center
    console.log('2. Testing Super Admin Control Center...');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        name: 'Jeeva Veeramani',
        email: 'exploretamizhagam@gmail.com',
        role: 'super_admin',
        phone: '+91 78717 79134'
      }));
    });

    await page.goto('http://localhost:4173/admin/control-center', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_overview_tab.png'), fullPage: false });
    console.log('📸 Captured superadmin_overview_tab.png');

    // Click "Owner Requests" tab
    const adminNavButtons = await page.$$('nav button');
    for (const btn of adminNavButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Owner Requests')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_owner_requests_stays_and_vehicles.png'), fullPage: false });
    console.log('📸 Captured superadmin_owner_requests_stays_and_vehicles.png');

    // Click "Properties" tab
    for (const btn of adminNavButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Properties')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_properties_and_vehicles_fleet.png'), fullPage: false });
    console.log('📸 Captured superadmin_properties_and_vehicles_fleet.png');

  } catch (err) {
    console.error('Audit error:', err);
  } finally {
    await browser.close();
    preview.kill();
    console.log('✨ All browser tests and captures complete.');
  }
})();
