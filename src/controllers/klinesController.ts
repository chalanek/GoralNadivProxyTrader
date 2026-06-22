import { Request, Response } from 'express';
import axios from 'axios';
import { getErrorMessage } from '../utils/errors';
import { logError } from '../utils/logger';

// data-api.binance.vision is Binance's dedicated public market-data host. It serves the
// same /api/v3/klines endpoint without auth but on a rate-limit budget separate from
// api.binance.com, so heavy candle polling is far less likely to trip an IP ban.
const BINANCE_KLINES_URL = 'https://data-api.binance.vision/api/v3/klines';

// Circuit breaker. When Binance signals rate-limiting (429) or an IP ban (418) it returns
// a Retry-After header. We record when that backoff window ends and short-circuit every
// request until then WITHOUT calling Binance — continuing to hit a flagged IP only extends
// the ban. State is per-instance (resets on Render restart); that's fine, the window we're
// honouring is Binance's, not ours.
let backoffUntil = 0;

// Fallback when Binance omits Retry-After. 418 bans start around 2 min; 429 is shorter.
const FALLBACK_BACKOFF_MS: Record<number, number> = { 418: 120_000, 429: 30_000 };

function parseBackoffMs(retryAfterHeader: unknown, status: number): number {
  const seconds = Number(retryAfterHeader);
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;
  return FALLBACK_BACKOFF_MS[status] ?? 60_000;
}

/**
 * GET /klines
 * Passes kline (candlestick) requests through to the Binance public market-data API.
 * Exists because FluxiONE runs on Vercel (US datacenter) and receives HTTP 451 from
 * Binance directly; this Render-hosted proxy does not have that geo-block.
 * All query params (symbol, interval, limit, startTime, endTime, …) are forwarded as-is.
 *
 * Includes a circuit breaker: once Binance returns 418/429, the proxy stops forwarding
 * requests for the Retry-After window and replies 418 immediately, so neither this proxy
 * nor its callers extend the ban. No authentication required.
 *
 * @param req - Request with query params forwarded directly to Binance
 * @param res - Raw Binance kline array, or an error status + message on failure
 */
export async function getKlines(req: Request, res: Response): Promise<void> {
  if (!req.query.symbol) {
    res.status(400).json({ success: false, message: 'symbol query param is required' });
    return;
  }

  // Inside an active backoff window — refuse without touching Binance. Reply 418 so the
  // FluxiONE caller's existing IP-ban handling aborts the run at once instead of retrying
  // through the whole window.
  const remainingMs = backoffUntil - Date.now();
  if (remainingMs > 0) {
    const retryAfter = Math.ceil(remainingMs / 1000);
    res.status(418).json({
      success: false,
      message: `Binance backoff active; retry in ~${retryAfter}s.`,
      retryAfter,
    });
    return;
  }

  try {
    const response = await axios.get(BINANCE_KLINES_URL, { params: req.query });
    res.json(response.data);
  } catch (error: unknown) {
    const status = axios.isAxiosError(error) ? error.response?.status ?? 500 : 500;

    // Open the circuit on rate-limit / ban responses so we stop hammering a flagged IP.
    if (status === 418 || status === 429) {
      const retryAfterHeader = axios.isAxiosError(error)
        ? error.response?.headers?.['retry-after']
        : undefined;
      const backoffMs = parseBackoffMs(retryAfterHeader, status);
      backoffUntil = Date.now() + backoffMs;
      logError(`Binance returned ${status}; backing off ${Math.round(backoffMs / 1000)}s before next request.`);
    }

    const message = getErrorMessage(error, 'Klines fetch failed');
    res.status(status).json({ success: false, message });
  }
}
