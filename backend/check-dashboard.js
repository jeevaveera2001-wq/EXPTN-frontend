import fetch from 'node-fetch';

const RENDER_URL = 'https://exptn-backend.onrender.com/api';

async function checkDashboardAll() {
  try {
    const res = await fetch(`${RENDER_URL}/admin/dashboard-all`);
    console.log('Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Vehicles count in dashboard-all:', data.vehicles ? data.vehicles.length : 0);
      if (data.vehicles) {
        console.log('Vehicles:', data.vehicles.map(v => ({ title: v.title, status: v.status, reg: v.registrationNumber })));
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkDashboardAll();
