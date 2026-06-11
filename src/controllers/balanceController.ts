import { Request, Response } from 'express';
import { BinanceService } from '../services/binanceService';

/**
 * GET /balance/:currency
 * Returns the free balance of the requested asset from the authenticated Binance account.
 * @param req - Request with `:currency` route param and `binanceCredentials` set by `requireAuth`
 * @param res - `{ success, balance }` or `{ success, message }` on error
 */
export async function getBalance(req: Request, res: Response): Promise<void> {
  const { currency } = req.params;
  // requireAuth guarantees binanceCredentials is present on this route
  const { apiKey, secretKey } = req.binanceCredentials!;

  try {
    const binance = new BinanceService(apiKey, secretKey);
    const balance = await binance.getBalance(currency);
    res.json({ success: true, balance });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch balance';
    res.status(500).json({ success: false, message });
  }
}
