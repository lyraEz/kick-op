const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 850 });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Assistir 2 lives')) { await btn.click(); break; }
  }
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: '/tmp/ms-header-fs.png' });
  await browser.close();
  console.log('done');
})();
