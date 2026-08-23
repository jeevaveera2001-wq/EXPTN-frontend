import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  const networkLogs = [];
  page.on('response', res => {
    if (res.url().includes('/vehicles')) {
      networkLogs.push({ url: res.url(), status: res.status() });
    }
  });

  page.on('console', msg => console.log('LOG:', msg.text()));

  await page.goto('https://frontend-blond-iota-kzel6q4tzd.vercel.app/cabs', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const debugInfo = await page.evaluate(async () => {
    const res = await fetch('https://exptn-backend.onrender.com/api/vehicles');
    const data = await res.json();
    return {
      fetchVehiclesLength: data.length,
      firstVehicle: data[0],
      renderedText: document.body.innerText.slice(0, 500)
    };
  });

  console.log('Network logs for /vehicles:', networkLogs);
  console.log('Debug Info:', debugInfo);

  await browser.close();
})();
