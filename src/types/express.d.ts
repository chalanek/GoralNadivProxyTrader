// Augments Express Request with Binance credentials attached by requireAuth middleware.
declare namespace Express {
  interface Request {
    binanceCredentials?: {
      apiKey: string;
      secretKey: string;
    };
  }
}
