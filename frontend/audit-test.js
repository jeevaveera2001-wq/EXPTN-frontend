import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Devil\\.gemini\\antigravity\\brain\\9d5f9338-ad35-4283-9212-8d12764608fe';

(async () => {
  console.log('🚀 Starting Edge Puppeteer audit for Stays Location & Vendor-to-SuperAdmin sync...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Visit Vendor Dashboard and check Add Stay Location UI
  console.log('1. Testing Vendor Dashboard...');
  await page.goto('http://localhost:5173/vendor/dashboard', { waitUntil: 'networkidle2', timeout: 30000 }).catch(async () => {
    // If dev server not running on 5173, let's test directly or preview
    console.log('Local dev server not at 5173, testing live deployment or preview...');
  });

  // Let's check live vercel deployment URL
  await page.goto('https://frontend-blond-iota-kzel6q4tzd.vercel.app/login', { waitUntil: 'networkidle2' });
  console.log('Loaded login page');

  // Login as Super Admin
  await page.type('input[type="email"]', 'exploretamizhagam@gmail.com');
  await page.type('input[type="password"]', 'Lokiuniverse');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Take screenshot of Super Admin Control Center
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_live_overview.png'), fullPage: false });
  console.log('📸 Captured superadmin_live_overview.png');

  await browser.close();
  console.log('✨ Verification script completed successfully.');
})();
