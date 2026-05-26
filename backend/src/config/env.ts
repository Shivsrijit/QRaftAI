import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  WS_PORT: parseInt(process.env.WS_PORT || '5002', 10),
  MONGODB_URI: process.env.MONGODB_URI || '',
  REDIS_URL: process.env.REDIS_URL || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  IS_DEV: process.env.NODE_ENV !== 'production',
};