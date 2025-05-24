import { config } from 'dotenv';

config();

export const environment = {
  PORT: process.env.PORT || 3000,
  BINANCE_API_KEY: process.env.BINANCE_API_KEY,
  BINANCE_API_SECRET: process.env.BINANCE_API_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development',
};