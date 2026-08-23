import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  await page.goto('https://frontend-blond-iota-kzel6q4tzd.vercel.app/cabs', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 4000));

  const evaluation = await page.evaluate(async () => {
    const res = await fetch('https://exptn-backend.onrender.com/api/vehicles');
    const raw = await res.json();
    const approved = raw.filter(v => {
      const st = String(v.status || '').toLowerCase().trim();
      return st === 'approved' || st === 'active' || (!st && v.title);
    });
    return {
      rawLength: raw.length,
      approvedLength: approved.length,
      approvedSample: approved[0]
    };
  });

  console.log('Evaluation:', evaluation);
  await browser.close();
})();
