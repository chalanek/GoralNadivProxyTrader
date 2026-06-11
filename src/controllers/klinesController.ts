import { Request, Response } from 'express';
import axios from 'axios';
import { getErrorMessage } from '../utils/errors';

const BINANCE_KLINES_URL = 'https://api.binance.com/api/v3/klines';

/**
 * GET /klines
 * Passes kline (candlestick) requests through to the Binance public API.
 * Exists because FluxiONE runs on Vercel (US datacenter) and receives HTTP 451
 * from api.binance.com; this Render-hosted proxy does not have that geo-block.
 * All query params (symbol, interval, limit, startTime, endTime, …) are forwarded as-is.
 * No authentication required.
 * @param req - Request with query params forwarded directly to Binance
 * @param res - Raw Binance kline array, or Binance error status + message on failure
 */
export async function getKlines(req: Request, res: Response): Promise<void> {
  if (!req.query.symbol) {
    res.status(400).json({ success: false, message: 'symbol query param is required' });
    return;
  }

  try {
    const response = await axios.get(BINANCE_KLINES_URL, { params: req.query });
    res.json(response.data);
  } catch (error: unknown) {
    const status = axios.isAxiosError(error) ? (error.response?.status ?? 500) : 500;
    const message = getErrorMessage(error, 'Klines fetch failed');
    res.status(status).json({ success: false, message });
  }
}
