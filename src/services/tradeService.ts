import { BinanceService } from './binanceService';
import { Trade } from '../types/trade';


export class TradeService {
    private binanceService: BinanceService;

    constructor() {
        this.binanceService = new BinanceService();
    }

    public async createTrade(trade: Trade): Promise<any> {
        // Validate trade data
        this.validateTrade(trade);

        // Execute trade through Binance API
        const result = await this.binanceService.executeTrade(trade);
        return result;
    }

    public async getTradeStatus(tradeId: string): Promise<any> {
        // Logic to get trade status
        return await this.binanceService.fetchMarketData(tradeId);
    }

    private validateTrade(trade: Trade): void {
        // Upravte validaci podle skutečné struktury Trade
        if (!trade.symbol || !trade.quantity || !trade.price) {  // Změněno z amount na quantity, pokud Trade má quantity místo amount
            throw new Error('Invalid trade data');
        }
    }
}