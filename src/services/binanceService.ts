import axios from 'axios';
import crypto from 'crypto';
import {
  BinanceAccountResponse,
  BinanceKline,
  BinanceOrderResponse,
} from '../types/binance';

const BINANCE_BASE_URL = 'https://api.binance.com';

/**
 * Creates an HMAC-SHA256 signature for Binance signed endpoints.
 * @param queryString - URL-encoded query string to sign
 * @param secret - Binance API secret key
 * @returns Hex-encoded HMAC-SHA256 digest
 */
function sign(queryString: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}

/**
 * Serialises a params object to a URL query string (without leading '?').
 * @param params - Key/value pairs where values are strings or numbers
 * @returns Percent-encoded query string
 */
function toQueryString(params: Record<string, string | number>): string {
  return new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
}

export class BinanceService {
  constructor(
    private readonly apiKey: string,
    private readonly secretKey: string,
  ) {}

  /**
   * Validates the provided credentials by calling the authenticated Binance account endpoint.
   * Throws an AxiosError if credentials are rejected by Binance (HTTP 401/403).
   */
  async validateCredentials(): Promise<void> {
    const timestamp = Date.now();
    const qs = `timestamp=${timestamp}`;
    const signature = sign(qs, this.secretKey);

    await axios.get<BinanceAccountResponse>(`${BINANCE_BASE_URL}/api/v3/account`, {
      params: { timestamp, signature },
      headers: { 'X-MBX-APIKEY': this.apiKey },
    });
  }

  /**
   * Returns the free balance for the given asset from the authenticated account.
   * @param currency - Asset symbol, case-insensitive (e.g. BTC, usdt)
   * @returns Free balance as a decimal string; '0' when the asset is not found
   */
  async getBalance(currency: string): Promise<string> {
    const timestamp = Date.now();
    const qs = `timestamp=${timestamp}`;
    const signature = sign(qs, this.secretKey);

    const response = await axios.get<BinanceAccountResponse>(
      `${BINANCE_BASE_URL}/api/v3/account`,
      {
        params: { timestamp, signature },
        headers: { 'X-MBX-APIKEY': this.apiKey },
      },
    );

    const asset = response.data.balances.find(
      (b) => b.asset === currency.toUpperCase(),
    );
    return asset?.free ?? '0';
  }

  /**
   * Places a MARKET BUY order using quote-asset quantity (quoteOrderQty).
   * @param symbol - Trading pair, e.g. BTCUSDT
   * @param quoteOrderQty - Amount of the quote asset to spend (e.g. 100 USDT)
   * @returns Binance order confirmation
   */
  async marketBuy(symbol: string, quoteOrderQty: number): Promise<BinanceOrderResponse> {
    const timestamp = Date.now();
    const params: Record<string, string | number> = {
      symbol,
      side: 'BUY',
      type: 'MARKET',
      quoteOrderQty,
      timestamp,
    };
    const qs = toQueryString(params);
    const signature = sign(qs, this.secretKey);

    const response = await axios.post<BinanceOrderResponse>(
      `${BINANCE_BASE_URL}/api/v3/order`,
      null,
      {
        params: { ...params, signature },
        headers: { 'X-MBX-APIKEY': this.apiKey },
      },
    );
    return response.data;
  }

  /**
   * Places a MARKET SELL order using base-asset quantity.
   * @param symbol - Trading pair, e.g. BTCUSDT
   * @param quantity - Amount of the base asset to sell (e.g. 0.001 BTC)
   * @returns Binance order confirmation
   */
  async marketSell(symbol: string, quantity: number): Promise<BinanceOrderResponse> {
    const timestamp = Date.now();
    const params: Record<string, string | number> = {
      symbol,
      side: 'SELL',
      type: 'MARKET',
      quantity,
      timestamp,
    };
    const qs = toQueryString(params);
    const signature = sign(qs, this.secretKey);

    const response = await axios.post<BinanceOrderResponse>(
      `${BINANCE_BASE_URL}/api/v3/order`,
      null,
      {
        params: { ...params, signature },
        headers: { 'X-MBX-APIKEY': this.apiKey },
      },
    );
    return response.data;
  }
}

/**
 * Fetches public kline (candlestick) data from the Binance public API.
 * No API credentials required.
 * @param symbol - Trading pair symbol, e.g. BTCUSDT
 * @param interval - Kline interval, e.g. 1d, 4h, 15m
 * @param limit - Number of klines to return (max 1000)
 * @returns Array of raw Binance kline tuples
 */
export async function fetchKlines(
  symbol: string,
  interval: string,
  limit: number,
): Promise<BinanceKline[]> {
  const response = await axios.get<BinanceKline[]>(`${BINANCE_BASE_URL}/api/v3/klines`, {
    params: { symbol, interval, limit },
  });
  return response.data;
}
