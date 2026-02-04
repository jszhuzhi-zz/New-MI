const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
  });

  const pages = [
    { url: 'http://localhost:3004/stamp', name: '02-customer-stamps', desc: 'Stamps Page' },
    { url: 'http://localhost:3004/mall', name: '08-customer-directory', desc: 'Mall Directory' },
  ];

  for (const p of pages) {
    try {
      const page = await ctx.newPage();
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: `/home/user/New-MI/screenshots/${p.name}.png`,
        fullPage: true,
      });
      console.log(`  ✓ ${p.desc}: ${p.name}.png`);
      await page.close();
    } catch (e) {
      console.log(`  ✗ ${p.desc}: ${e.message}`);
    }
  }

  await ctx.close();
  await browser.close();
  console.log('Done!');
})();
