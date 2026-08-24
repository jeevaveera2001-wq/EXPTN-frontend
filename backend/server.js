import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, isDBConnected } from './config/db.js';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedOrigins = [
  'https://frontend-blond-iota-kzel6q4tzd.vercel.app',
  'https://www.frontend-blond-iota-kzel6q4tzd.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow client connection without blocking CORS
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-email', 'x-requested-with']
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 20000,
  pingInterval: 25000
});

// Attach socket.io instance to Express app for route emission
app.set('io', io);

const PORT = process.env.PORT || 5000;

// Security & Standard Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Fast Health Check Endpoints (Response time < 50ms)
const healthHandler = (req, res) => {
  const dbReady = isDBConnected();
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? 'healthy' : 'degraded',
    database: dbReady ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Root Ping
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Explore Tamil Nadu Live WebSocket Enterprise API',
    database: isDBConnected() ? 'connected' : 'disconnected',
    time: new Date()
  });
});

// API Router (mounted at both /api and root /)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Socket.io Real-time Connection & Rooms
io.on('connection', (socket) => {
  console.log(`⚡ [LIVE SOCKET CONNECTED] Client ID: ${socket.id}`);
  
  socket.on('join_room', (room) => {
    if (typeof room === 'string') socket.join(room);
  });

  socket.on('request_stats', async () => {
    try {
      socket.emit('stats_refreshed');
    } catch (e) {}
  });

  socket.on('disconnect', () => {
    // disconnected cleanly
  });
});

// Startup sequence: Connect MongoDB once, then bind HTTP/WS server
const startServer = async () => {
  console.log('⏳ Connecting to MongoDB Atlas...');
  await connectDB();

  if (!process.env.VERCEL) {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✨ Explore Tamil Nadu Backend running on http://0.0.0.0:${PORT}`);
      console.log(`🏥 Healthcheck available at http://0.0.0.0:${PORT}/api/health`);
    });
  }
};

startServer();

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 [${signal}] Graceful shutdown initiated...`);
  server.close(async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log('MongoDB connection closed.');
      }
    } catch (err) {
      console.error('Error during database disconnect:', err.message);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
