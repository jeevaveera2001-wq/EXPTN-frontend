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

  // 1. Test Super Admin Maintenance Controls & Activation
  console.log('1. Testing Super Admin Maintenance Toggle in Control Center...');
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
  });

  await pageAdmin.goto('http://localhost:5173/dashboard/super-admin', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  await pageAdmin.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_maintenance_toggle_active.png'), fullPage: false });
  console.log('📸 Captured superadmin_maintenance_toggle_active.png');

  // 2. Test Public Maintenance & Upgrade Screen
  console.log('2. Testing Public Visitor Maintenance & Upgrade Screen...');
  const pagePublic = await browser.newPage();
  await pagePublic.setViewport({ width: 1440, height: 950 });

  // Simulate maintenance state in page
  await pagePublic.evaluateOnNewDocument(() => {
    // Intercept maintenance endpoint to return active maintenance
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

  await pagePublic.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  await pagePublic.screenshot({ path: path.join(ARTIFACTS_DIR, 'maintenance_upgrade_screen_active.png'), fullPage: false });
  console.log('📸 Captured maintenance_upgrade_screen_active.png');

  // 3. Test Offline / Network Error Alert Simulation
  console.log('3. Testing Network Error & Offline Alert...');
  const pageOffline = await browser.newPage();
  await pageOffline.setViewport({ width: 1440, height: 950 });
  await pageOffline.goto('http://localhost:5173/explore', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // Trigger offline event
  await pageOffline.evaluate(() => {
    window.dispatchEvent(new Event('offline'));
  });
  await new Promise(r => setTimeout(r, 1000));

  await pageOffline.screenshot({ path: path.join(ARTIFACTS_DIR, 'network_error_offline_overlay.png'), fullPage: false });
  console.log('📸 Captured network_error_offline_overlay.png');

  // 4. Test SWR Fast Caching & Skeleton Shimmer View
  console.log('4. Testing SWR Fast Caching on /explore and /cabs...');
  const pageFast = await browser.newPage();
  await pageFast.setViewport({ width: 1440, height: 950 });
  await pageFast.goto('http://localhost:5173/cabs', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await pageFast.screenshot({ path: path.join(ARTIFACTS_DIR, 'cabs_swr_fast_render.png'), fullPage: false });
  console.log('📸 Captured cabs_swr_fast_render.png');

  await browser.close();
  console.log('✨ All tests completed successfully!');
})();
