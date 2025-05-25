import { Router } from 'express';
import { TradeController } from '../controllers/tradeController';
import { TradeService } from '../services/tradeService';
import { Application } from 'express';
import { authenticate } from '../middleware/auth';

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

    app.get('/test-binance', async (req, res) => {
        try {
            // Jednoduchý dotaz na Binance API, který nevyžaduje autentizaci
            const result = await tradeService.getBinanceStatus();
            res.status(200).json({
                binanceConnected: true,
                serverTime: result.serverTime,
                message: "Připojení k Binance je funkční"
            });
        } catch (error) {
            res.status(500).json({
                binanceConnected: false,
                error: error instanceof Error ? error.message : String(error),
                message: "Připojení k Binance selhalo"
            });
        }
    });

    // Aplikujte autentizaci POUZE na /api/trade endpointy
    app.use('/api/trade', authenticate, router);

    router.post('/create', tradeController.createTrade.bind(tradeController));
    router.get('/status/:id', tradeController.getTradeStatus.bind(tradeController));
}