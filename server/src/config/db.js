import mongoose from 'mongoose';

let isConnected = false;
let useInMemory = false;

/**
 * Connect to MongoDB if MONGODB_URI is configured.
 * Falls back to in-memory data store for local development.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.log('[AEGIS-DB] No MONGODB_URI configured — running with IN-MEMORY data store.');
    console.log('[AEGIS-DB] Set MONGODB_URI in .env to enable persistence.');
    useInMemory = true;
    return;
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('[AEGIS-DB] MongoDB connected successfully.');
  } catch (err) {
    console.error('[AEGIS-DB] MongoDB connection failed:', err.message);
    console.log('[AEGIS-DB] Falling back to IN-MEMORY data store.');
    useInMemory = true;
  }
}

export function isUsingInMemory() {
  return useInMemory;
}

export function isDBConnected() {
  return isConnected;
}
