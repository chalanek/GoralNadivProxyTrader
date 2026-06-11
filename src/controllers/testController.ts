import { Request, Response } from 'express';
import axios from 'axios';

/**
 * GET /test-binance
 * Tests connectivity to the Binance API using the public server-time endpoint.
 * No authentication required.
 * @param req - Express request
 * @param res - `{ success, serverTime }` or `{ success, message }` on error
 */
export async function testBinance(_req: Request, res: Response): Promise<void> {
  try {
    const response = await axios.get<{ serverTime: number }>(
      'https://api.binance.com/api/v3/time',
    );
    res.json({ success: true, ...response.data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Binance connectivity test failed';
    res.status(500).json({ success: false, message });
  }
}
