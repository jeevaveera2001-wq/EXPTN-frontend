import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(msg.text()));

  await page.goto('https://frontend-blond-iota-kzel6q4tzd.vercel.app/cabs', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 4000));

  const pageDetails = await page.evaluate(() => {
    return {
      allHeadings: Array.from(document.querySelectorAll('h2, h3, h4')).map(h => h.innerText),
      allButtons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean),
      allParagraphs: Array.from(document.querySelectorAll('p')).map(p => p.innerText.trim()).filter(Boolean).slice(0, 10),
      bodyHtmlSnippet: document.querySelector('section.max-w-7xl')?.innerHTML?.slice(0, 1000)
    };
  });

  console.log('Console Logs:', consoleLogs);
  console.log('Page Details:', pageDetails);

  await browser.close();
})();
