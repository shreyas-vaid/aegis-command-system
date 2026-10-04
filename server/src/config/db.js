/**
 * AEGIS Database Configuration
 * Reusable Mongoose connection with friendly error handling.
 */

import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.error('\n==================================================');
    console.error('AEGIS DATABASE CONFIGURATION ERROR');
    console.error('Missing MONGODB_URI in environment variables.');
    console.error('Please configure your MongoDB connection string in:');
    console.error('  server/.env');
    console.error('Example:');
    console.error('  MONGODB_URI=mongodb://127.0.0.1:27017/aegis');
    console.error('  or MongoDB Atlas URI');
    console.error('==================================================\n');
    throw new Error('MONGODB_URI is missing in server/.env');
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
