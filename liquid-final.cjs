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

  await page.type('#channel-input', 'coringa');
  await new Promise((r) => setTimeout(r, 300));
  const favBtn = await page.$('.home__fav-btn');
  await favBtn.click();
  await new Promise((r) => setTimeout(r, 300));

  const btn = await page.$('.home__fav-btn');
  const box = await btn.boundingBox();
  await page.screenshot({
    path: '/tmp/liquid-final-zoom.png',
    clip: { x: box.x - 30, y: box.y - 30, width: box.width + 60, height: box.height + 60 },
  });

  await browser.close();
  console.log('done');
})();
