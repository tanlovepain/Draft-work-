import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

// This flag is only for Chromium behind the managed environment's TLS proxy.
const browser = await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--ignore-certificate-errors']});
try {
  const page = await browser.newPage({viewport:{width:1280,height:900}});
  const apiHosts = new Set();
  page.on('request', request => {
    try { const host = new URL(request.url()).hostname; if (host.endsWith('whop.com') && host.includes('api.')) apiHosts.add(host); } catch {}
  });
  await page.goto('http://127.0.0.1:5175');
  await page.getByRole('button',{name:'Book Project deposit'}).click();
  let checkout, branding;
  for (let attempt=0; attempt<40; attempt++) {
    checkout = page.frames().find(frame => frame.url().includes('/checkout/checkout/'));
    branding = page.frames().find(frame => frame.url().includes('/payments/branding/'));
    if (checkout && branding) break;
    await page.waitForTimeout(250);
  }
  assert(checkout && branding, 'Whop checkout and branding frames must mount');
  await checkout.getByText('Momentum Lab').first().waitFor({timeout:15000});
  const checkoutText = await checkout.locator('body').innerText();
  assert.match(checkoutText, /Momentum Lab/);
  assert.match(checkoutText, /Ridgeline Roofing Project Deposit/);
  assert.match(await branding.locator('body').innerText(), /Powered by\s+Whop/);
  assert(apiHosts.has('sandbox-api.whop.com'), 'Checkout must call the sandbox API');
  assert(!apiHosts.has('api.whop.com'), 'Checkout must not call the production API');
  console.log('PASS: sandbox deposit checkout and Whop branding loaded; payment not submitted.');
} finally {
  await browser.close();
}
