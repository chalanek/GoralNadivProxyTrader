import { Application } from 'express';
import { requireAuth } from '../middleware/auth';
import { login } from '../controllers/authController';
import { getBalance } from '../controllers/balanceController';
import { buyCrypto, sellCrypto } from '../controllers/tradeController';
import { testBinance } from '../controllers/testController';
import { getKlines } from '../controllers/klinesController';

/**
 * Registers all application routes on the Express instance.
 * @param app - Express application
 */
export function registerRoutes(app: Application): void {
  // Public — no token required
  app.post('/auth/login', login);
  app.get('/test-binance', testBinance);
  app.get('/klines', getKlines);

  // Protected — Bearer JWT required
  app.get('/balance/:currency', requireAuth, getBalance);
  app.post('/trade/buy-crypto', requireAuth, buyCrypto);
  app.post('/trade/sell-crypto', requireAuth, sellCrypto);
}
