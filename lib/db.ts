// ============================================
// MONGODB CONNECTION (Serverless-safe)
// ============================================
// 
// DEPLOYMENT: Set DB_CONNECT_STRING in Vercel Environment Variables
// Examples:
//   - MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/dbname
//   - Local: mongodb://localhost:27017/stock
//
// This module caches the connection to avoid reconnecting on every serverless function call.
//
import mongoose from 'mongoose';

const MONGO_URI = process.env.DB_CONNECT_STRING ?? 
                  process.env.MONGO_URI ?? 
                  process.env.DATABASE_URL ?? 
                  'mongodb://localhost:27017/stock';

let cachedConnection: typeof mongoose | null = null;

export async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    cachedConnection = conn;
    console.log('✅ MongoDB connected');
    return conn;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err;
  }
}

export async function getDB() {
  if (!cachedConnection) {
    await connectDB();
  }
  return cachedConnection;
}
