import axios from 'axios';
import crypto from 'crypto';
import {
  BinanceAccountResponse,
  BinanceKline,
  BinanceOrderResponse,
} from '../types/binance';

const BINANCE_BASE_URL = 'https://api.binance.com';

function sign(queryString: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}

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
   * Sends an authenticated GET request to a Binance signed endpoint.
   * @param path - API path, e.g. /api/v3/account
   * @param extraParams - Additional query params beyond `timestamp`
   * @returns Parsed response body
   */
  private async signedGet<T>(
    path: string,
    extraParams: Record<string, string | number> = {},
  ): Promise<T> {
    const params: Record<string, string | number> = { ...extraParams, timestamp: Date.now() };
    const qs = toQueryString(params);
    const signature = sign(qs, this.secretKey);

    const response = await axios.get<T>(`${BINANCE_BASE_URL}${path}`, {
      params: { ...params, signature },
      headers: { 'X-MBX-APIKEY': this.apiKey },
    });
    return response.data;
  }

  /**
   * Sends an authenticated POST request to a Binance signed endpoint.
   * @param path - API path, e.g. /api/v3/order
   * @param extraParams - Order params beyond `timestamp`
   * @returns Parsed response body
   */
  private async signedPost<T>(
    path: string,
    extraParams: Record<string, string | number>,
  ): Promise<T> {
    const params: Record<string, string | number> = { ...extraParams, timestamp: Date.now() };
    const qs = toQueryString(params);
    const signature = sign(qs, this.secretKey);

    const response = await axios.post<T>(`${BINANCE_BASE_URL}${path}`, null, {
      params: { ...params, signature },
      headers: { 'X-MBX-APIKEY': this.apiKey },
    });
    return response.data;
  }

  /**
   * Validates the provided credentials by calling the authenticated Binance account endpoint.
   * Throws an AxiosError if credentials are rejected by Binance (HTTP 401/403).
   */
  async validateCredentials(): Promise<void> {
    await this.signedGet<BinanceAccountResponse>('/api/v3/account');
  }

  /**
   * Returns the free balance for the given asset from the authenticated account.
   * @param currency - Asset symbol, case-insensitive (e.g. BTC, usdt)
   * @returns Free balance as a decimal string; '0' when the asset is not found
   */
  async getBalance(currency: string): Promise<string> {
    const data = await this.signedGet<BinanceAccountResponse>('/api/v3/account');
    const asset = data.balances.find((b) => b.asset === currency.toUpperCase());
    return asset?.free ?? '0';
  }

  /**
   * Places a MARKET BUY order using quote-asset quantity (quoteOrderQty).
   * @param symbol - Trading pair, e.g. BTCUSDT
   * @param quoteOrderQty - Amount of the quote asset to spend (e.g. 100 USDT)
   * @returns Binance order confirmation
   */
  async marketBuy(symbol: string, quoteOrderQty: number): Promise<BinanceOrderResponse> {
    return this.signedPost<BinanceOrderResponse>('/api/v3/order', {
      symbol,
      side: 'BUY',
      type: 'MARKET',
      quoteOrderQty,
    });
  }

  /**
   * Places a MARKET SELL order using base-asset quantity.
   * @param symbol - Trading pair, e.g. BTCUSDT
   * @param quantity - Amount of the base asset to sell (e.g. 0.001 BTC)
   * @returns Binance order confirmation
   */
  async marketSell(symbol: string, quantity: number): Promise<BinanceOrderResponse> {
    return this.signedPost<BinanceOrderResponse>('/api/v3/order', {
      symbol,
      side: 'SELL',
      type: 'MARKET',
      quantity,
    });
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
