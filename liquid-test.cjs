const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 850 });

  page.on('console', (msg) => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await page.type('#channel-input', 'coringa');
  await new Promise((r) => setTimeout(r, 300));

  // Clica na estrela pra favoritar (isso cria o chip com refração real)
  const favBtn = await page.$('.home__fav-btn');
  if (favBtn) {
    await favBtn.click();
    await new Promise((r) => setTimeout(r, 300));
  }

  await page.screenshot({ path: '/tmp/liquid-glass-1.png' });
  await browser.close();
  console.log('done');
})();
