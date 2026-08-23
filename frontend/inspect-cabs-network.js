import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  page.on('request', req => {
    if (req.url().includes('api')) {
      console.log('HTTP REQUEST:', req.method(), req.url());
    }
  });

  page.on('response', res => {
    if (res.url().includes('api')) {
      console.log('HTTP RESPONSE:', res.status(), res.url());
    }
  });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  console.log('Opening /cabs and waiting 20s for Render response...');
  await page.goto('https://frontend-blond-iota-kzel6q4tzd.vercel.app/cabs', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 20000));

  const pageCards = await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('h3')).map(e => e.textContent.trim());
    return { titles, heading: document.querySelector('h2')?.textContent };
  });

  console.log('Page Result after response:', pageCards);
  await browser.close();
})();
