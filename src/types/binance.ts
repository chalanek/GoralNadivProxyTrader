/**
 * Raw kline (candlestick) tuple returned by Binance GET /api/v3/klines.
 * Index order: openTime, open, high, low, close, volume, closeTime,
 * quoteAssetVolume, numberOfTrades, takerBuyBaseAssetVolume, takerBuyQuoteAssetVolume, ignore.
 */
export type BinanceKline = [
  number, // openTime
  string, // open
  string, // high
  string, // low
  string, // close
  string, // volume
  number, // closeTime
  string, // quoteAssetVolume
  number, // numberOfTrades
  string, // takerBuyBaseAssetVolume
  string, // takerBuyQuoteAssetVolume
  string, // ignore
];

export interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface BinanceAccountResponse {
  balances: BinanceBalance[];
}

export interface BinanceOrderResponse {
  orderId: number;
  clientOrderId: string;
  symbol: string;
  status: string;
  side: string;
  type: string;
  transactTime: number;
}
