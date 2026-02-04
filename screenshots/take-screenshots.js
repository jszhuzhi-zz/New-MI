const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ===== 1. Customer Web H5 (Mobile viewport 430x932) =====
  const customerPages = [
    { url: 'http://localhost:3004/', name: '01-customer-home', desc: 'Customer Home' },
    { url: 'http://localhost:3004/stamps', name: '02-customer-stamps', desc: 'Customer Stamps' },
    { url: 'http://localhost:3004/scan', name: '03-customer-scan', desc: 'Customer Scan' },
    { url: 'http://localhost:3004/offers', name: '04-customer-offers', desc: 'Customer Offers' },
    { url: 'http://localhost:3004/profile', name: '05-customer-profile', desc: 'Customer Profile' },
    { url: 'http://localhost:3004/tier', name: '06-customer-tier', desc: 'Customer Tier' },
    { url: 'http://localhost:3004/settings', name: '07-customer-settings', desc: 'Customer Settings' },
    { url: 'http://localhost:3004/directory', name: '08-customer-directory', desc: 'Mall Directory' },
    { url: 'http://localhost:3004/merchant/m1', name: '09-customer-merchant', desc: 'Merchant Detail' },
  ];

  console.log('=== Taking Customer Web H5 Screenshots (Mobile 430x932) ===');
  const mobileCtx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
  });

  for (const p of customerPages) {
    try {
      const page = await mobileCtx.newPage();
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
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
  await mobileCtx.close();

  // ===== 2. Desktop Admin Portals (1440x900) =====
  const desktopPages = [
    { url: 'http://localhost:3001/', name: '10-group-admin-login', desc: 'Group Admin' },
    { url: 'http://localhost:3002/', name: '11-mall-admin-login', desc: 'Mall Admin' },
    { url: 'http://localhost:3003/', name: '12-merchant-portal-login', desc: 'Merchant Portal' },
  ];

  console.log('\n=== Taking Desktop Admin Screenshots (1440x900) ===');
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  for (const p of desktopPages) {
    try {
      const page = await desktopCtx.newPage();
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `/home/user/New-MI/screenshots/${p.name}.png`,
        fullPage: false,
      });
      console.log(`  ✓ ${p.desc}: ${p.name}.png`);
      await page.close();
    } catch (e) {
      console.log(`  ✗ ${p.desc}: ${e.message}`);
    }
  }

  // Try logging into group-admin to see dashboard
  try {
    const page = await desktopCtx.newPage();
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);
    // Try to fill login form
    const emailInput = await page.$('input[type="text"], input[placeholder*="email"], input[placeholder*="Email"], #email, #username');
    const pwInput = await page.$('input[type="password"]');
    if (emailInput && pwInput) {
      await emailInput.fill('admin@linkgroup.com');
      await pwInput.fill('admin123');
      const loginBtn = await page.$('button[type="submit"], button:has-text("登入"), button:has-text("Login")');
      if (loginBtn) {
        await loginBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({
          path: `/home/user/New-MI/screenshots/13-group-admin-dashboard.png`,
          fullPage: false,
        });
        console.log('  ✓ Group Admin Dashboard: 13-group-admin-dashboard.png');
      }
    }
    await page.close();
  } catch (e) {
    console.log(`  ✗ Group Admin Dashboard: ${e.message}`);
  }

  // Try logging into merchant portal
  try {
    const page = await desktopCtx.newPage();
    await page.goto('http://localhost:3003/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);
    const emailInput = await page.$('input[type="text"], input[placeholder*="email"], input[placeholder*="Email"], #email, #username');
    const pwInput = await page.$('input[type="password"]');
    if (emailInput && pwInput) {
      await emailInput.fill('merchant@starbucks.com');
      await pwInput.fill('merchant123');
      const loginBtn = await page.$('button[type="submit"], button:has-text("登入"), button:has-text("Login")');
      if (loginBtn) {
        await loginBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({
          path: `/home/user/New-MI/screenshots/14-merchant-portal-dashboard.png`,
          fullPage: false,
        });
        console.log('  ✓ Merchant Portal Dashboard: 14-merchant-portal-dashboard.png');
      }
    }
    await page.close();
  } catch (e) {
    console.log(`  ✗ Merchant Portal Dashboard: ${e.message}`);
  }

  await desktopCtx.close();

  // ===== 3. Backend API Docs =====
  console.log('\n=== Taking Backend API Docs Screenshot ===');
  const apiCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  try {
    const page = await apiCtx.newPage();
    await page.goto('http://localhost:3000/api/docs', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: `/home/user/New-MI/screenshots/15-backend-api-docs.png`,
      fullPage: false,
    });
    console.log('  ✓ Backend API Docs: 15-backend-api-docs.png');
    await page.close();
  } catch (e) {
    console.log(`  ✗ Backend API Docs: ${e.message}`);
  }
  await apiCtx.close();

  await browser.close();
  console.log('\nDone! All screenshots saved to /home/user/New-MI/screenshots/');
})();
