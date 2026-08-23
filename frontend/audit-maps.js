import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:/Users/Devil/.gemini/antigravity/brain/9d5f9338-ad35-4283-9212-8d12764608fe';

(async () => {
  console.log('🚀 Starting Puppeteer to test Google Maps location redirect...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  try {
    // 1. Visit Explore Stays Page
    console.log('1. Navigating to /explore...');
    await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));

    // Scroll to stays catalog
    await page.evaluate(() => {
      window.scrollTo(0, 450);
    });
    await new Promise(r => setTimeout(r, 800));

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'explore_stay_cards_with_maps_button.png'), fullPage: false });
    console.log('📸 Captured explore_stay_cards_with_maps_button.png');

    // Click on a stay card to open details modal
    const stayCards = await page.$$('.group');
    if (stayCards.length > 0) {
      await stayCards[0].click();
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'explore_modal_with_maps_button.png'), fullPage: false });
      console.log('📸 Captured explore_modal_with_maps_button.png');
    }

    // 2. Test User Dashboard My Bookings & Wishlist
    console.log('2. Testing User Dashboard...');
    const userPage = await browser.newPage();
    await userPage.setViewport({ width: 1440, height: 950 });

    // Seed mock booking and wishlist in localStorage
    await userPage.evaluateOnNewDocument(() => {
      const user = {
        name: 'Priya Raman',
        email: 'priya.tourist@gmail.com',
        role: 'user',
        phone: '+91 98401 22334'
      };
      localStorage.setItem('ETN_USER', JSON.stringify(user));
      localStorage.setItem('token', 'mock-user-token');
      localStorage.setItem('etn_wishlist_priya.tourist@gmail.com', JSON.stringify([
        {
          _id: 'fav-1',
          title: 'Kodai Pine Forest Heritage Villa',
          location: 'Pillar Rocks Road, Kodaikanal',
          district: 'Dindigul (Kodaikanal)',
          pricePerNight: 5500,
          rating: '4.95',
          images: ['https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80']
        }
      ]));
    });

    await userPage.goto('http://localhost:5173/dashboard/user?tab=wishlist', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));

    await userPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'user_wishlist_with_maps_button.png'), fullPage: false });
    console.log('📸 Captured user_wishlist_with_maps_button.png');

  } catch (err) {
    console.error('Audit maps error:', err);
  } finally {
    await browser.close();
    console.log('✨ Maps audit completed.');
  }
})();
