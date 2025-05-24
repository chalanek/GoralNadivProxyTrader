import { Request, Response } from 'express';
import { TradeService } from '../services/tradeService';
import { TradeStatusResponse } from '../types/tradeTypes';

export class TradeController {
    constructor(private tradeService: TradeService) { }

    async createTrade(req: Request, res: Response): Promise<void> {
        try {
            const tradeData = req.body;
            const result = await this.tradeService.createTrade(tradeData);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
        }
    }

    async getTradeStatus(req: Request, res: Response): Promise<void> {
        try {
            const { tradeId } = req.params;
            const status: TradeStatusResponse = await this.tradeService.getTradeStatus(tradeId);
            res.status(200).json(status);
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
        }
    }
}