import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'dev_super_secret_jwt_key_credit_risk_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ML_SERVICE_URL: (process.env.ML_SERVICE_URL || 'https://ml-service-2ne2.onrender.com').replace(/\/+$/, ''),
  ML_SERVICE_MODE: process.env.ML_SERVICE_MODE || 'http',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};
