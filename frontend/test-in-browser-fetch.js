import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://frontend-blond-iota-kzel6q4tzd.vercel.app/cabs', { waitUntil: 'load' });

  const result = await page.evaluate(async () => {
    try {
      const res = await fetch('https://exptn-backend.onrender.com/api/vehicles');
      const data = await res.json();
      return { ok: res.ok, status: res.status, count: data.length, sample: data[0] };
    } catch (e) {
      return { error: e.message };
    }
  });

  console.log('In-Browser Fetch Result:', result);
  await browser.close();
})();
