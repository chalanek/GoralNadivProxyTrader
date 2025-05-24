import { Router } from 'express';
import { TradeController } from '../controllers/tradeController';
import { TradeService } from '../services/tradeService';

const router = Router({});

const tradeService = new TradeService();

const tradeController = new TradeController(tradeService);

import { Application } from 'express';

export function setRoutes(app: Application) {
    app.use('/api/trade', router);
    router.post('/create', tradeController.createTrade.bind(tradeController));
    router.get('/status/:id', tradeController.getTradeStatus.bind(tradeController));
}