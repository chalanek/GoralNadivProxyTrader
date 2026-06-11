export interface BuyCryptoRequest {
  symbol: string;
  amount: number;
  quoteAsset: string;
}

export interface SellCryptoRequest {
  symbol: string;
  amount: number;
  baseAsset: string;
}

export interface TradeResponse {
  success: boolean;
  orderId?: string;
  tradeId?: string;
  id?: string;
  message?: string;
}
