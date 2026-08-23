import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const LIVE_URL = 'https://frontend-blond-iota-kzel6q4tzd.vercel.app/';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  const requests = [];
  page.on('request', req => {
    requests.push({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      startTime: Date.now()
    });
  });

  page.on('requestfinished', req => {
    const r = requests.find(item => item.url === req.url());
    if (r) {
      r.duration = Date.now() - r.startTime;
      r.status = req.response()?.status();
    }
  });

  page.on('requestfailed', req => {
    const r = requests.find(item => item.url === req.url());
    if (r) {
      r.failed = true;
      r.error = req.failure()?.errorText;
      r.duration = Date.now() - r.startTime;
    }
  });

  console.log('Navigating to Live Production Web App:', LIVE_URL);
  const startNav = Date.now();
  await page.goto(LIVE_URL, { waitUntil: 'load', timeout: 25000 });
  const totalLoadTime = Date.now() - startNav;
  console.log(`⚡ LIVE PRODUCTION PAGE LOAD TIME: ${totalLoadTime}ms`);

  // Wait 1.5s to verify zero pending requests
  await new Promise(r => setTimeout(r, 1500));

  console.log('\n--- NETWORK REQUEST SUMMARY ---');
  let pendingCount = 0;
  requests.forEach(r => {
    if (!r.status && !r.failed) pendingCount++;
    console.log(`[${r.resourceType}] ${r.status || (r.failed ? 'FAILED: ' + r.error : 'PENDING')} (${r.duration || 'STILL PENDING'}ms): ${r.url.slice(0, 100)}`);
  });

  console.log(`\n✅ Total Requests: ${requests.length} | Pending Requests: ${pendingCount}`);

  await browser.close();
})();
