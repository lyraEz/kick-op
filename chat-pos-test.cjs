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

  await page.type('#channel-input', 'teste');
  await page.type('#stream-url', 'https://example.com/fake.m3u8');
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1000));

  // Abre o chat
  const chatBtn = await page.$('.chat-toggle');
  await chatBtn.click();
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({ path: '/tmp/chat-open-header.png' });
  await browser.close();
  console.log('done');
})();
