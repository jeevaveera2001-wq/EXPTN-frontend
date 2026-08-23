import fetch from 'node-fetch';

async function testVehicles() {
  const res = await fetch('https://exptn-backend.onrender.com/api/vehicles');
  console.log('GET /vehicles status:', res.status);
  const data = await res.json();
  console.log('Vehicles array length:', data.length);
  console.log('Vehicles data:', JSON.stringify(data, null, 2));
}

testVehicles();
