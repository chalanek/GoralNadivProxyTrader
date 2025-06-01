export const config = {
  useTestnet: process.env.USE_BINANCE_TESTNET === 'true',
  apiBaseUrl: process.env.USE_BINANCE_TESTNET === 'true'
    ? 'https://testnet.binance.vision'
    : 'https://api.binance.com'
};