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

  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      .home__glow, .home__glow--secondary { display: none !important; }
      .home::before {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(45deg, #ff3366 0 20px, #3366ff 20px 40px, #33ff99 40px 60px, #ffcc00 60px 80px);
        z-index: 0;
      }
    `;
    document.head.appendChild(style);
  });

  await page.type('#channel-input', 'coringa');
  await new Promise((r) => setTimeout(r, 300));
  const favBtn = await page.$('.home__fav-btn');
  if (favBtn) { await favBtn.click(); await new Promise((r) => setTimeout(r, 300)); }

  await page.screenshot({ path: '/tmp/liquid-glass-pattern.png' });

  const btn = await page.$('.home__fav-btn');
  const box = await btn.boundingBox();
  await page.screenshot({
    path: '/tmp/liquid-glass-zoom.png',
    clip: { x: box.x - 40, y: box.y - 40, width: box.width + 80, height: box.height + 80 },
  });

  await browser.close();
  console.log('done');
})();
