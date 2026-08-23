import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:/Users/Devil/.gemini/antigravity/brain/9d5f9338-ad35-4283-9212-8d12764608fe';

(async () => {
  console.log('🚀 Starting Puppeteer to capture interactive map...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  // Pre-seed ETN_USER
  await page.evaluateOnNewDocument(() => {
    const vendorUser = {
      name: 'Kodaikanal Valley Resorts Host',
      email: 'host.kodai@gmail.com',
      role: 'owner_and_vendor',
      phone: '+91 98401 54321'
    };
    localStorage.setItem('ETN_USER', JSON.stringify(vendorUser));
    localStorage.setItem('token', 'mock-vendor-token');
  });

  try {
    console.log('1. Navigating to /dashboard/vendor...');
    await page.goto('http://localhost:5173/dashboard/vendor', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));

    // Click "+ Add New Property"
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Add New Property')) {
        await btn.click();
        break;
      }
    }

    await new Promise(r => setTimeout(r, 1500));

    // Scroll window to show map
    await page.evaluate(() => {
      window.scrollTo(0, 650);
    });

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_interactive_map_form.png'), fullPage: false });
    console.log('📸 Captured vendor_interactive_map_form.png');

    // 2. Click on the Leaflet map container to drop/move the pin!
    console.log('2. Clicking on map to move pin...');
    const mapElement = await page.$('.leaflet-container');
    if (mapElement) {
      const box = await mapElement.boundingBox();
      if (box) {
        // Click at custom point on the map to drop the pin
        await page.mouse.click(box.x + 180, box.y + 120);
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_map_pin_moved_by_click.png'), fullPage: false });
        console.log('📸 Captured vendor_map_pin_moved_by_click.png');
      }
    }

    // 3. Type in destination search bar
    console.log('3. Searching destination...');
    const searchInputs = await page.$$('input[placeholder*="Search any destination"]');
    if (searchInputs.length > 0) {
      await searchInputs[0].type('Dolphin Nose Kodaikanal', { delay: 40 });
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_map_live_search_autocomplete.png'), fullPage: false });
      console.log('📸 Captured vendor_map_live_search_autocomplete.png');

      // Click first search result item
      const resultBtns = await page.$$('.z-50 button');
      if (resultBtns.length > 0) {
        await resultBtns[0].click();
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_map_pin_after_search_selection.png'), fullPage: false });
        console.log('📸 Captured vendor_map_pin_after_search_selection.png');
      }
    }

    // 4. Test Super Admin Control Center modal
    console.log('4. Navigating to /dashboard/super-admin...');
    const pageAdmin = await browser.newPage();
    await pageAdmin.setViewport({ width: 1440, height: 1100 });
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

    await pageAdmin.goto('http://localhost:5173/dashboard/super-admin', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));

    // Click "+ Add Stay / Resort" button
    const adminButtons = await pageAdmin.$$('button');
    for (const btn of adminButtons) {
      const text = await pageAdmin.evaluate(el => el.textContent, btn);
      if (text && text.includes('Add Stay / Resort')) {
        await btn.click();
        break;
      }
    }

    await new Promise(r => setTimeout(r, 1500));

    // Scroll inside modal to map
    await pageAdmin.evaluate(() => {
      const modal = document.querySelector('.overflow-y-auto');
      if (modal) modal.scrollTop = 320;
    });

    await new Promise(r => setTimeout(r, 1000));
    await pageAdmin.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_add_stay_interactive_map.png'), fullPage: false });
    console.log('📸 Captured superadmin_add_stay_interactive_map.png');

  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    await browser.close();
    console.log('✨ Capture completed.');
  }
})();
