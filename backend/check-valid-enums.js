import fetch from 'node-fetch';

const RENDER_URL = 'https://exptn-backend.onrender.com/api';

const typesToTest = [
  'Cab SUV',
  'Tempo Traveller',
  'Rental Bike',
  'Luxury Bus',
  'Sedan',
  'Innova',
  'Traveller',
  'Mini Bus',
  'Hatchback',
  'Cab',
  'SUV',
  'Self Drive'
];

async function findValidEnums() {
  for (const t of typesToTest) {
    const veh = {
      title: `Test Vehicle ${t}`,
      type: t,
      registrationNumber: 'TN-43-TEST-1',
      location: 'Ooty, Tamil Nadu',
      status: 'Pending Approval'
    };
    try {
      const res = await fetch(`${RENDER_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veh)
      });
      const data = await res.json();
      if (res.status === 201) {
        console.log(`✅ SUCCESS for type: "${t}" -> ID: ${data._id || data.id}`);
        // Delete test vehicle
        if (data._id || data.id) {
          await fetch(`${RENDER_URL}/vehicles/${data._id || data.id}`, { method: 'DELETE' }).catch(() => {});
        }
      } else {
        console.log(`❌ FAILED for type: "${t}" -> ${data.message}`);
      }
    } catch (e) {
      console.log(`Error testing ${t}:`, e.message);
    }
  }
}

findValidEnums();
