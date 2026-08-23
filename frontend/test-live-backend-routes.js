const BACKEND = 'https://exptn-backend.onrender.com/api';

(async () => {
  const endpoints = [
    '/health',
    '/properties',
    '/vehicles',
    '/bookings',
    '/admin/dashboard-data',
    '/system/maintenance'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BACKEND}${ep}`);
      console.log(`Endpoint: ${ep} -> Status: ${res.status}`);
    } catch (e) {
      console.log(`Endpoint: ${ep} -> Error: ${e.message}`);
    }
  }
})();
