import { Request, Response } from 'express';
import { fetchKlines } from '../services/binanceService';

/**
 * GET /klines
 * Passes kline (candlestick) requests through to the Binance public API.
 * Exists because FluxiONE runs on Vercel (US datacenter) and receives HTTP 451
 * from api.binance.com; this Render-hosted proxy does not have that geo-block.
 * No authentication required.
 * @param req - Request with query params `symbol`, `interval` (default: 1d), `limit` (default: 200)
 * @param res - Raw Binance kline array or `{ success, message }` on error
 */
export async function getKlines(req: Request, res: Response): Promise<void> {
  const {
    symbol,
    interval = '1d',
    limit = '200',
  } = req.query as { symbol?: string; interval?: string; limit?: string };

  if (!symbol) {
    res.status(400).json({ success: false, message: 'symbol query param is required' });
    return;
  }

  try {
    const klines = await fetchKlines(symbol, interval, Number(limit));
    res.json(klines);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch klines';
    res.status(500).json({ success: false, message });
  }
}
