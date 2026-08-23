import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));

  console.log('Navigating to Cabs page...');
  await page.goto('http://localhost:5173/cabs', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));

  const result = await page.evaluate(async () => {
    try {
      const res = await fetch('https://exptn-backend.onrender.com/api/vehicles');
      const data = await res.json();
      return { status: res.status, count: data.length, sample: data[0]?.title };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('In-page fetch result:', result);

  await browser.close();
})();
