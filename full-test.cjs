const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 900 });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await page.type('#channel-input', 'teste');
  await page.type('#stream-url', 'https://example.com/fake.m3u8');
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1000));

  // Abre configurações
  const settingsBtn = await page.$('.settings-toggle');
  await settingsBtn.click();
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({ path: '/tmp/settings-full.png', fullPage: false });
  await browser.close();
  console.log('done');
})();
