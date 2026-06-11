import { Request, Response } from 'express';
import { BinanceService } from '../services/binanceService';
import { BuyCryptoRequest, SellCryptoRequest, TradeResponse } from '../types/trade';

/**
 * POST /trade/buy-crypto
 * Places a market BUY order on Binance using the quote-asset amount.
 * @param req - Request with body `{ symbol, amount, quoteAsset }` and `binanceCredentials` set by `requireAuth`
 * @param res - `{ success, orderId, tradeId }` or `{ success, message }` on error
 */
export async function buyCrypto(req: Request, res: Response): Promise<void> {
  const { symbol, amount } = req.body as BuyCryptoRequest;
  const { apiKey, secretKey } = req.binanceCredentials!;

  if (!symbol || !amount) {
    const body: TradeResponse = { success: false, message: 'symbol and amount are required' };
    res.status(400).json(body);
    return;
  }

  try {
    const binance = new BinanceService(apiKey, secretKey);
    const order = await binance.marketBuy(symbol, amount);
    const body: TradeResponse = {
      success: true,
      orderId: String(order.orderId),
      tradeId: order.clientOrderId,
    };
    res.json(body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Buy order failed';
    res.status(500).json({ success: false, message } as TradeResponse);
  }
}

/**
 * POST /trade/sell-crypto
 * Places a market SELL order on Binance using the base-asset quantity.
 * @param req - Request with body `{ symbol, amount, baseAsset }` and `binanceCredentials` set by `requireAuth`
 * @param res - `{ success, orderId, tradeId }` or `{ success, message }` on error
 */
export async function sellCrypto(req: Request, res: Response): Promise<void> {
  const { symbol, amount } = req.body as SellCryptoRequest;
  const { apiKey, secretKey } = req.binanceCredentials!;

  if (!symbol || !amount) {
    const body: TradeResponse = { success: false, message: 'symbol and amount are required' };
    res.status(400).json(body);
    return;
  }

  try {
    const binance = new BinanceService(apiKey, secretKey);
    const order = await binance.marketSell(symbol, amount);
    const body: TradeResponse = {
      success: true,
      orderId: String(order.orderId),
      tradeId: order.clientOrderId,
    };
    res.json(body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sell order failed';
    res.status(500).json({ success: false, message } as TradeResponse);
  }
}
