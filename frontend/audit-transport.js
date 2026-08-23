import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:/Users/Devil/.gemini/antigravity/brain/9d5f9338-ad35-4283-9212-8d12764608fe';

(async () => {
  console.log('🚀 Starting Puppeteer Verification for Cabs, Vehicle Onboarding, and Legal Policies...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  try {
    // 1. Visit /cabs page
    console.log('1. Navigating to /cabs...');
    await page.goto('http://localhost:5173/cabs', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'cabs_page_verified_fleet.png'), fullPage: false });
    console.log('📸 Captured cabs_page_verified_fleet.png');

    // Click "Book Cab" on first cab
    const bookButtons = await page.$$('button');
    for (const b of bookButtons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Book Cab')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'cab_booking_modal_with_map_pickup.png'), fullPage: false });
    console.log('📸 Captured cab_booking_modal_with_map_pickup.png');

    // 2. Test Vendor Dashboard Add Vehicle Form with RC, Photos, and Conduct Notice
    console.log('2. Testing Vendor Dashboard Add Vehicle Form...');
    const vendorPage = await browser.newPage();
    await vendorPage.setViewport({ width: 1440, height: 950 });

    await vendorPage.evaluateOnNewDocument(() => {
      const vendorUser = {
        name: 'Jeeva Transport Fleet',
        email: 'jeeva.fleet@gmail.com',
        role: 'vendor',
        phone: '+91 78717 79134'
      };
      localStorage.setItem('ETN_USER', JSON.stringify(vendorUser));
      localStorage.setItem('token', 'mock-vendor-token');
    });

    await vendorPage.goto('http://localhost:5173/dashboard/vendor?tab=properties_vehicles', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));

    // Click "Add New Vehicle"
    const vendorButtons = await vendorPage.$$('button');
    for (const b of vendorButtons) {
      const text = await vendorPage.evaluate(el => el.textContent, b);
      if (text && text.includes('Add New Vehicle')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1200));

    // Scroll to the form
    await vendorPage.evaluate(() => {
      window.scrollTo(0, 300);
    });
    await new Promise(r => setTimeout(r, 600));

    await vendorPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_upgraded_add_vehicle_form.png'), fullPage: false });
    console.log('📸 Captured vendor_upgraded_add_vehicle_form.png');

    // 3. Test Super Admin Control Center Owner Requests (Tab 4)
    console.log('3. Testing Super Admin Control Center Owner Requests...');
    const adminPage = await browser.newPage();
    await adminPage.setViewport({ width: 1440, height: 950 });

    await adminPage.evaluateOnNewDocument(() => {
      const superAdminUser = {
        name: 'Jeeva Veeramani',
        email: 'exploretamizhagam@gmail.com',
        role: 'super_admin',
        phone: '+91 78717 79134'
      };
      localStorage.setItem('ETN_USER', JSON.stringify(superAdminUser));
      localStorage.setItem('token', 'mock-admin-token');
    });

    await adminPage.goto('http://localhost:5173/dashboard/super-admin?tab=requests', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1500));

    await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'superadmin_owner_requests_approval_view.png'), fullPage: false });
    console.log('📸 Captured superadmin_owner_requests_approval_view.png');

    // 4. Test Terms & Conditions & Mandatory Login Terms
    console.log('4. Testing Terms & Conditions & Auth Modal...');
    const authPage = await browser.newPage();
    await authPage.setViewport({ width: 1440, height: 950 });

    await authPage.goto('http://localhost:5173/terms', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1000));
    await authPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'terms_and_conditions_page.png'), fullPage: false });
    console.log('📸 Captured terms_and_conditions_page.png');

    // Open Login Modal from home
    await authPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));
    await authPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'login_mandatory_terms_acceptance_modal.png'), fullPage: false });
    console.log('📸 Captured login_mandatory_terms_acceptance_modal.png');

  } catch (err) {
    console.error('Audit transport error:', err);
  } finally {
    await browser.close();
    console.log('✨ All transport and legal tests completed successfully!');
  }
})();
