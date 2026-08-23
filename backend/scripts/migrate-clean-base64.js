import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

const DEFAULT_HOTEL_IMG = 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80';
const DEFAULT_VEHICLE_IMG = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80';
const DEFAULT_AVATAR_IMG = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

const isBase64String = (str) => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.startsWith('data:image/') || trimmed.length > 1000;
};

async function runMigration() {
  console.log('🔄 Starting MongoDB Base64 Sanitization & Optimization Migration...');

  if (!uri) {
    console.error('❌ MONGODB_URI / MONGO_URI is missing in backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'explore_tamilnadu_db',
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });

    console.log('✅ Connected to MongoDB Atlas.');

    const db = mongoose.connection.db;

    // 1. Sanitize Properties
    console.log('\n--- 1. Sanitizing Properties Collection ---');
    const properties = await db.collection('properties').find({}).toArray();
    let propUpdatedCount = 0;

    for (const prop of properties) {
      let needsUpdate = false;
      const updateDoc = {};

      if (Array.isArray(prop.images)) {
        const cleanedImages = prop.images.map(img => {
          if (isBase64String(img)) {
            needsUpdate = true;
            return DEFAULT_HOTEL_IMG;
          }
          return img;
        });
        if (needsUpdate) updateDoc.images = cleanedImages;
      }

      if (isBase64String(prop.image)) {
        needsUpdate = true;
        updateDoc.image = DEFAULT_HOTEL_IMG;
      }
      if (isBase64String(prop.coverImage)) {
        needsUpdate = true;
        updateDoc.coverImage = DEFAULT_HOTEL_IMG;
      }

      if (needsUpdate) {
        await db.collection('properties').updateOne({ _id: prop._id }, { $set: updateDoc });
        propUpdatedCount++;
        console.log(`  Cleaned Property: "${prop.title || prop._id}"`);
      }
    }
    console.log(`✅ Properties Processed: ${properties.length} | Sanitized: ${propUpdatedCount}`);

    // 2. Sanitize Vehicles
    console.log('\n--- 2. Sanitizing Vehicles Collection ---');
    const vehicles = await db.collection('vehicles').find({}).toArray();
    let vehUpdatedCount = 0;

    for (const veh of vehicles) {
      let needsUpdate = false;
      const updateDoc = {};

      if (Array.isArray(veh.images)) {
        const cleanedImages = veh.images.map(img => {
          if (isBase64String(img)) {
            needsUpdate = true;
            return DEFAULT_VEHICLE_IMG;
          }
          return img;
        });
        if (needsUpdate) updateDoc.images = cleanedImages;
      }

      const singleFields = ['exteriorImage', 'interiorImage', 'rcBookImage', 'numberPlateImage', 'image'];
      for (const field of singleFields) {
        if (isBase64String(veh[field])) {
          needsUpdate = true;
          updateDoc[field] = DEFAULT_VEHICLE_IMG;
        }
      }

      if (needsUpdate) {
        await db.collection('vehicles').updateOne({ _id: veh._id }, { $set: updateDoc });
        vehUpdatedCount++;
        console.log(`  Cleaned Vehicle: "${veh.title || veh.registrationNumber || veh._id}"`);
      }
    }
    console.log(`✅ Vehicles Processed: ${vehicles.length} | Sanitized: ${vehUpdatedCount}`);

    // 3. Sanitize Users (Avatars)
    console.log('\n--- 3. Sanitizing Users Collection ---');
    const users = await db.collection('users').find({}).toArray();
    let userUpdatedCount = 0;

    for (const user of users) {
      if (isBase64String(user.avatar)) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { avatar: DEFAULT_AVATAR_IMG } }
        );
        userUpdatedCount++;
        console.log(`  Cleaned User Avatar: "${user.email}"`);
      }
    }
    console.log(`✅ Users Processed: ${users.length} | Sanitized: ${userUpdatedCount}`);

    console.log('\n🎉 [MIGRATION COMPLETED SUCCESSFULLY] All Base64 images replaced with high-res CDN assets.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  }
}

runMigration();
