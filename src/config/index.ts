import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT ?? '3000',
  JWT_SECRET: process.env.JWT_SECRET ?? 'change-this-secret-in-production',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;

export default config;
