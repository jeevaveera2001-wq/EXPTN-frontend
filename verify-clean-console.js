import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:/Users/Devil/.gemini/antigravity/brain/9d5f9338-ad35-4283-9212-8d12764608fe';
const LIVE_URL = 'https://frontend-blond-iota-kzel6q4tzd.vercel.app/dashboard/super-admin';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    errors.push(err.message);
  });

  await page.evaluateOnNewDocument(() => {
    const adminUser = {
      name: 'Jeeva Veeramani',
      email: 'exploretamizhagam@gmail.com',
      role: 'super_admin',
      phone: '+91 78717 79134'
    };
    localStorage.setItem('ETN_USER', JSON.stringify(adminUser));
  });

  console.log('Navigating to Live Super Admin Console:', LIVE_URL);
  await page.goto(LIVE_URL, { waitUntil: 'load', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('\n--- BROWSER CONSOLE LOGS ---');
  consoleLogs.forEach(l => console.log(l));

  console.log('\n--- PAGE ERRORS ---');
  if (errors.length === 0) {
    console.log('✅ ZERO PAGE ERRORS DETECTED!');
  } else {
    errors.forEach(e => console.log('❌ ' + e));
  }

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'clean_console_verified.png'), fullPage: false });
  console.log('📸 Captured clean_console_verified.png');

  await browser.close();
})();
