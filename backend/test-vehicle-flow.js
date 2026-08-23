import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:5000/api';
const RENDER_URL = 'https://exptn-backend.onrender.com/api';

async function testVehicleSubmission() {
  const newVehicle = {
    title: 'Force Tempo Traveller AC (12 Seater)',
    type: 'Tempo Traveller',
    registrationNumber: 'TN-43-BB-8888',
    regNo: 'TN-43-BB-8888',
    numberPlate: 'TN-43-AA-9999',
    numberPlateImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    rcBookImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    exteriorImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
    interiorImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800'
    ],
    location: 'Nilgiris (Ooty & Coonoor), Tamil Nadu',
    district: 'Nilgiris (Ooty & Coonoor)',
    coordinates: { lat: 11.4102, lng: 76.6950 },
    googleMapsUrl: 'https://www.google.com/maps?q=11.4102,76.695',
    fuelType: 'Diesel',
    acType: 'AC',
    seatingCapacity: 7,
    driverIncluded: true,
    driverName: 'Ramesh V. (Verified Driver)',
    driverPhone: '+91 78717 79134',
    driverLicense: 'TN43-2018-0091234',
    price: 3500,
    pricePerDay: 3500,
    perKmRate: 16,
    conductDeclared: true,
    status: 'Pending Approval',
    providerEmail: 'jeeva.transport@gmail.com',
    providerName: 'Jeeva Fleet & Transport',
    ownerEmail: 'jeeva.transport@gmail.com',
    ownerName: 'Jeeva Fleet & Transport'
  };

  console.log('Testing vehicle submission on Render backend...');
  try {
    const res = await fetch(`${RENDER_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVehicle)
    });
    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response body:', data);
  } catch (err) {
    console.error('Error submitting vehicle:', err.message);
  }

  console.log('\nFetching all vehicles from Render backend...');
  try {
    const listRes = await fetch(`${RENDER_URL}/vehicles`);
    const list = await listRes.json();
    console.log(`Found ${list.length} vehicles on backend:`);
    list.slice(0, 5).forEach((v, idx) => {
      console.log(`[${idx + 1}] Title: ${v.title} | Type: ${v.type} | Status: ${v.status} | Provider: ${v.providerEmail} | Reg: ${v.registrationNumber || v.regNo}`);
    });
  } catch (err) {
    console.error('Error listing vehicles:', err.message);
  }
}

testVehicleSubmission();
