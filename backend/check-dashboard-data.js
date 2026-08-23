import fetch from 'node-fetch';

const RENDER_URL = 'https://exptn-backend.onrender.com/api';

async function testDashboardData() {
  try {
    const res = await fetch(`${RENDER_URL}/admin/dashboard-data`);
    console.log('Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Success:', data.success);
      console.log('Properties:', data.properties ? data.properties.length : 0);
      console.log('Vehicles:', data.vehicles ? data.vehicles.length : 0);
      if (data.vehicles) {
        console.log('Vehicle details:', data.vehicles.map(v => ({ id: v._id || v.id, title: v.title, status: v.status, reg: v.registrationNumber })));
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testDashboardData();
