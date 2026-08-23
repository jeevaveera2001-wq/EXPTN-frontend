import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:/Users/Devil/.gemini/antigravity/brain/9d5f9338-ad35-4283-9212-8d12764608fe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. Test Property Cards on Explore Stays
  console.log('1. Testing Stays Catalog Vendor Base Pricing...');
  const pageExplore = await browser.newPage();
  await pageExplore.setViewport({ width: 1440, height: 950 });
  await pageExplore.goto('http://localhost:5173/explore', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await pageExplore.screenshot({ path: path.join(ARTIFACTS_DIR, 'property_card_vendor_base_pricing.png'), fullPage: false });
  console.log('📸 Captured property_card_vendor_base_pricing.png');

  // Test opening Stay Booking Modal
  const stayBookButtons = await pageExplore.$$('button');
  for (const btn of stayBookButtons) {
    const txt = await pageExplore.evaluate(el => el.textContent, btn);
    if (txt.includes('Book Stay')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 800));
      await pageExplore.screenshot({ path: path.join(ARTIFACTS_DIR, 'stay_booking_checkout_breakdown_modal.png'), fullPage: false });
      console.log('📸 Captured stay_booking_checkout_breakdown_modal.png');
      break;
    }
  }

  // 2. Test Cab Cards & Cab Booking Modal
  console.log('2. Testing Cabs Catalog Vendor Base Pricing & Booking Modal...');
  const pageCabs = await browser.newPage();
  await pageCabs.setViewport({ width: 1440, height: 950 });
  await pageCabs.goto('http://localhost:5173/cabs', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await pageCabs.screenshot({ path: path.join(ARTIFACTS_DIR, 'cab_card_vendor_base_pricing.png'), fullPage: false });
  console.log('📸 Captured cab_card_vendor_base_pricing.png');

  // Test opening Cab Booking Modal
  const cabButtons = await pageCabs.$$('button');
  for (const btn of cabButtons) {
    const txt = await pageCabs.evaluate(el => el.textContent, btn);
    if (txt.includes('Book') && !txt.includes('Google Maps')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 800));
      await pageCabs.screenshot({ path: path.join(ARTIFACTS_DIR, 'cab_booking_checkout_breakdown_modal.png'), fullPage: false });
      console.log('📸 Captured cab_booking_checkout_breakdown_modal.png');
      break;
    }
  }

  await browser.close();
  console.log('✨ All tests completed successfully!');
})();
