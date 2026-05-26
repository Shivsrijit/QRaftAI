import mongoose from 'mongoose';
import { config } from './env';
import dns from 'dns';
dns.setServers(["1.1.1.1", "8.8.8.8"]);


export async function connectDB() {
  const uri = config.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not provided in env.');
    process.exit(1);
  }

  try {
    console.log(`Connecting directly to remote MongoDB Database...`);
    await mongoose.connect(uri);
    console.log('Connected to remote MongoDB successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}


