/**
 * AEGIS Database Configuration
 * Reusable Mongoose connection with friendly error handling.
 */

import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!uri || uri.trim() === '') {
    const errorMsg = 'Missing MONGODB_URI in environment variables.';
    console.error('\n==================================================');
    console.error('AEGIS DATABASE CONFIGURATION DIAGNOSTIC');
    console.error(errorMsg);
    console.error('Persistence is offline. Only demo/fallback operations available.');
    console.error('==================================================\n');
    if (isProduction) {
      throw new Error(`Production database configuration error: ${errorMsg}`);
    }
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`AEGIS DATABASE CONNECTED: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('\n==================================================');
    console.error('AEGIS DATABASE CONNECTION FAILED');
    console.error('Reason:', err.message);
    console.error('==================================================\n');
    throw err;
  }
}

export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

export async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}
