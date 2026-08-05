const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 850 });

  // Loga erros de console para pegar qualquer exceção/warning do React
  page.on('console', (msg) => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Assistir 2 lives')) { await btn.click(); break; }
  }
  await new Promise((r) => setTimeout(r, 500));

  // Adiciona uma live fake no slot 1
  await page.click('.multistream__empty-slot');
  await new Promise((r) => setTimeout(r, 300));
  await page.type('#ms-channel', 'canal1');
  await page.type('#ms-stream', 'https://example.com/fake1.m3u8');
  await page.click('.multistream__modal button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: '/tmp/ms-flicker-1.png' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: '/tmp/ms-flicker-2.png' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: '/tmp/ms-flicker-3.png' });

  await browser.close();
  console.log('done');
})();
