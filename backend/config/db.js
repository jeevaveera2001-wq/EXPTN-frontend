import mongoose from 'mongoose';

// Disable command buffering to prevent requests from hanging indefinitely if MongoDB is unavailable
mongoose.set('bufferCommands', false);

let isConnected = false;

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('✅ [MONGODB] Connection established successfully.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('❌ [MONGODB] Runtime connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ [MONGODB] Connection disconnected.');
});

export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ [MONGODB] Missing MONGODB_URI / MONGO_URI in environment variables.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'explore_tamilnadu_db',
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 1
    });
    isConnected = true;
    console.log(`🚀 [MONGODB ATLAS CONNECTED] Host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error(`❌ [MONGODB CONNECTION FAILED]: ${error.message}`);
    return null;
  }
};
