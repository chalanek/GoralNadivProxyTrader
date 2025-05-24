import { Router } from 'express';
import { TradeController } from '../controllers/tradeController';
import { TradeService } from '../services/tradeService';
import { Application } from 'express';

const router = Router();
const tradeService = new TradeService();
const tradeController = new TradeController(tradeService);

export function setRoutes(app: Application) {
    // Health check endpoint - bez autentizace
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'UP',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        });
    });

    // Zde začíná autentizace pro API
    // app.use('/api', authMiddleware);  // Odkomentujte, pokud máte authMiddleware

    app.use('/api/trade', router);
    router.post('/create', tradeController.createTrade.bind(tradeController));
    router.get('/status/:id', tradeController.getTradeStatus.bind(tradeController));
}