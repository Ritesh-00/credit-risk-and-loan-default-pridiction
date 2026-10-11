import dns from 'node:dns';
import mongoose from 'mongoose';
import { ENV } from './env.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if DNS override is not permitted
}

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || ENV.MONGO_URI;


  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

export const getDbStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[state] || 'unknown';
};

export const checkDbConnection = () => {
  return mongoose.connection.readyState === 1;
};
