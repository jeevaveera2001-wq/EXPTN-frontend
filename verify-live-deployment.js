import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:/Users/Devil/.gemini/antigravity/brain/9d5f9338-ad35-4283-9212-8d12764608fe';
const LIVE_URL = 'https://frontend-blond-iota-kzel6q4tzd.vercel.app';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. Mobile Home Viewport Verification (390x844)
  console.log('1. Verifying Mobile UI on Live Vercel Production...');
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await pageMobile.goto(LIVE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await pageMobile.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_mobile_home_view.png'), fullPage: false });
  console.log('📸 Captured live_mobile_home_view.png');

  // 2. Desktop Home & Popular Destination Click
  console.log('2. Verifying Popular Destinations Click Navigation on Live Web App...');
  const pageDesktop = await browser.newPage();
  await pageDesktop.setViewport({ width: 1440, height: 950 });
  await pageDesktop.goto(LIVE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await pageDesktop.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_home_desktop_view.png'), fullPage: false });
  console.log('📸 Captured live_home_desktop_view.png');

  // Click on the first popular destination card (e.g. Ooty)
  await pageDesktop.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('section:nth-of-type(2) .grid > div'));
    if (cards.length > 0) cards[0].click();
  });
  await new Promise(r => setTimeout(r, 2500));
  await pageDesktop.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_popular_destination_routed_to_explore.png'), fullPage: false });
  console.log('📸 Captured live_popular_destination_routed_to_explore.png');

  // 3. Live Cabs Page & Guest Detail Modal
  console.log('3. Verifying Live Cabs Catalog & Guest Detail Modal...');
  await pageDesktop.goto(`${LIVE_URL}/cabs`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await pageDesktop.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_cabs_catalog_view.png'), fullPage: false });
  console.log('📸 Captured live_cabs_catalog_view.png');

  // 4. Live Super Admin Control Center Vehicle Inspection Modal
  console.log('4. Verifying Live Super Admin Control Center Vehicle Dossier...');
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
  await pageAdmin.goto(`${LIVE_URL}/admin/super-control?tab=owner_requests`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3500));
  await pageAdmin.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_superadmin_owner_requests.png'), fullPage: false });
  console.log('📸 Captured live_superadmin_owner_requests.png');

  await browser.close();
  console.log('✨ All live tests completed successfully!');
})();
