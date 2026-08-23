const BACKEND = 'https://exptn-backend.onrender.com/api';

(async () => {
  try {
    const res = await fetch(`${BACKEND}/vehicles`);
    console.log('GET /vehicles status:', res.status);
    const data = await res.json();
    console.log('Vehicles count:', Array.isArray(data) ? data.length : 'Not array');
    console.log('Vehicles data:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
})();
