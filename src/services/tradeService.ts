import { BinanceService } from './binanceService';
import { Trade } from '../types/trade';

// Define AccountBalance type if not imported from elsewhere
type AccountBalance = {
    asset: string;
    free: string;
    locked?: string;
};


export class TradeService {
    private binanceService: BinanceService;

    constructor() {
        this.binanceService = new BinanceService();
    }

    public async getEurBalance(): Promise<number> {
        // Volá binanceService pro získání stavu účtu
        const accountInfo = await this.binanceService.getAccountBalance();

        // Najděte EUR mezi všemi měnami
        const eurBalance: AccountBalance | undefined = accountInfo.balances.find((b: AccountBalance) => b.asset === 'EUR');

        // Vrátí dostupnou částku jako číslo (free = dostupná částka)
        return eurBalance ? parseFloat(eurBalance.free) : 0;
    }

    public async createTrade(trade: Trade): Promise<any> {
        // Validate trade data
        this.validateTrade(trade);

        // Execute trade through Binance API
        const result = await this.binanceService.executeTrade(trade);
        return result;
    }

    public async getBinanceStatus(): Promise<any> {
        // Využívá binanceService k provedení jednoduchého dotazu na Binance API
        return await this.binanceService.getServerTime();
    }

    public async getTradeStatus(tradeId: string): Promise<any> {
        // Logic to get trade status
        return await this.binanceService.fetchMarketData(tradeId);
    }

    private validateTrade(trade: Trade): void {
        // Upravte validaci podle skutečné struktury Trade
        if (!trade.symbol || !trade.quantity || !trade.price) {
            throw new Error('Invalid trade data: Missing required fields');
        }
    }
}