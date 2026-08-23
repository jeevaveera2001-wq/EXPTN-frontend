import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/admin/super-control', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  const result = await page.evaluate(async () => {
    try {
      const res = await fetch('https://exptn-backend.onrender.com/api/admin/dashboard-data');
      const data = await res.json();
      return {
        status: res.status,
        propertiesCount: data.properties?.length,
        vehiclesCount: data.vehicles?.length,
        vehicles: data.vehicles?.map(v => ({ id: v._id || v.id, title: v.title, status: v.status }))
      };
    } catch (e) {
      return { error: e.message };
    }
  });

  console.log('In-browser dashboard data result:', result);
  await browser.close();
})();
