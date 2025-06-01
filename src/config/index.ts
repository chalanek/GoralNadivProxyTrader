import { config } from 'dotenv';

config();

const useTestnet = process.env.USE_BINANCE_TESTNET === 'true';

const environment = {
  // Základní konfigurace
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Binance konfigurace
  binance: {
    useTestnet,
    apiKey: useTestnet ? process.env.BINANCE_TESTNET_API_KEY : process.env.BINANCE_API_KEY,
    apiSecret: useTestnet ? process.env.BINANCE_TESTNET_API_SECRET : process.env.BINANCE_API_SECRET,
    baseUrl: useTestnet ? 'https://testnet.binance.vision' : 'https://api.binance.com'
  }
};

export default environment;