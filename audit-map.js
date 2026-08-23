import puppeteer from 'puppeteer-core';
import path from 'path';
import { spawn } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Devil\\.gemini\\antigravity\\brain\\9d5f9338-ad35-4283-9212-8d12764608fe';

(async () => {
  console.log('🚀 Starting Vite dev server on port 5179...');
  const devServer = spawn('npx.cmd', ['vite', '--port', '5179', '--strictPort'], {
    cwd: 'C:\\Users\\Devil\\.gemini\\antigravity\\scratch\\explore-tamilnadu\\frontend',
    shell: true
  });

  // Wait 4s for server to start
  await new Promise(r => setTimeout(r, 4000));

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  try {
    console.log('1. Loading Vendor Dashboard with interactive map...');
    await page.goto('http://localhost:5179/vendor/dashboard', { waitUntil: 'networkidle0', timeout: 25000 });

    // Set vendor credentials in localStorage
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        name: 'Kodaikanal Valley Resorts Host',
        email: 'host.kodai@gmail.com',
        role: 'owner_and_vendor',
        phone: '+91 98401 54321'
      }));
      localStorage.setItem('token', 'mock-vendor-token');
    });

    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    // Click "+ List New Stay / Resort" button
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('List New Stay') || text.includes('Add Property') || text.includes('Add Stay'))) {
        await btn.click();
        break;
      }
    }

    await new Promise(r => setTimeout(r, 1500));

    // Scroll down to the map inside the modal
    await page.evaluate(() => {
      const modals = document.querySelectorAll('div');
      for (const m of modals) {
        if (m.scrollHeight > m.clientHeight && m.clientHeight > 300) {
          m.scrollTop = 400;
        }
      }
    });

    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'interactive_map_initial.png'), fullPage: false });
    console.log('📸 Captured interactive_map_initial.png');

    // 2. Click on the map container to move the pin!
    console.log('2. Clicking on the map to move the pin...');
    const mapElement = await page.$('.leaflet-container');
    if (mapElement) {
      const box = await mapElement.boundingBox();
      if (box) {
        // Click at offset inside the map
        await page.mouse.click(box.x + 100, box.y + 80);
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'interactive_map_pin_moved_by_click.png'), fullPage: false });
        console.log('📸 Captured interactive_map_pin_moved_by_click.png');
      }
    }

    // 3. Search for "Dolphin Nose" in the live search bar
    console.log('3. Typing in live destination search bar...');
    const searchInputs = await page.$$('input[placeholder*="Search any destination"]');
    if (searchInputs.length > 0) {
      await searchInputs[0].type('Dolphin Nose', { delay: 60 });
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'interactive_map_live_search_autocomplete.png'), fullPage: false });
      console.log('📸 Captured interactive_map_live_search_autocomplete.png');

      // Click the first search result if available
      const searchResultButtons = await page.$$('.z-50 button');
      if (searchResultButtons.length > 0) {
        await searchResultButtons[0].click();
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'interactive_map_pin_after_search_selection.png'), fullPage: false });
        console.log('📸 Captured interactive_map_pin_after_search_selection.png');
      }
    }

    // 4. Test Super Admin Add Stay modal
    console.log('4. Testing Super Admin Control Center modal...');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        name: 'Jeeva Veeramani',
        email: 'exploretamizhagam@gmail.com',
        role: 'super_admin',
        phone: '+91 78717 79134'
      }));
    });

    await page.goto('http://localhost:5179/admin/control-center', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    // Click "+ Add Stay / Resort" button
    const adminButtons = await page.$$('button');
    for (const btn of adminButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Add Stay / Resort')) {
        await btn.click();
        break;
      }
    }

    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_add_stay_interactive_map.png'), fullPage: false });
    console.log('📸 Captured superadmin_add_stay_interactive_map.png');

  } catch (err) {
    console.error('Map audit error:', err);
  } finally {
    await browser.close();
    devServer.kill();
    console.log('✨ All map audit tests finished.');
  }
})();
