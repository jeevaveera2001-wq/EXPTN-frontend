const BACKEND = 'https://exptn-backend.onrender.com/api';

(async () => {
  try {
    const res = await fetch(`${BACKEND}/vehicles`);
    const data = await res.json();
    console.log(`Total vehicles in DB: ${data.length}`);
    data.forEach((v, idx) => {
      console.log(`[${idx + 1}] Title: "${v.title}" | Status: "${v.status}" | Reg: "${v.registrationNumber || v.regNo}" | Owner: "${v.ownerEmail}" | Price: ₹${v.price || v.pricePerDay}`);
    });
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
