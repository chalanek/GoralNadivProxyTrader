import { TestnetBinanceService } from './testnetBinanceService';

export class TestTradeService {
    private binanceService: TestnetBinanceService;

    constructor() {
        this.binanceService = new TestnetBinanceService();
    }

    public async getEurBalance(): Promise<number> {
        try {
            const accountInfo = await this.binanceService.getAccountBalance();
            const eurBalance = accountInfo.balances.find((b: any) => b.asset === 'EUR');
            return eurBalance ? parseFloat(eurBalance.free) : 0;
        } catch (error) {
            console.error('Error getting EUR balance:', error);
            throw error;
        }
    }

    public async buyCrypto(symbol: string, eurAmount: number): Promise<any> {
        try {
            // Minimální kontrola
            if (eurAmount < 10) {
                throw new Error("Minimální částka pro nákup je 10 EUR");
            }

            // Vytvoření objednávky pro MARKET nákup za eurAmount
            const trade = {
                symbol: symbol,
                side: 'BUY',
                type: 'MARKET',
                quoteOrderQty: eurAmount
            };

            // Poslat objednávku na Binance
            const result = await this.binanceService.executeTrade(trade);
            return result;
        } catch (error) {
            console.error(`Chyba při nákupu ${symbol} za ${eurAmount} EUR:`, error);
            throw error;
        }
    }

    public async getBinanceStatus(): Promise<any> {
        return await this.binanceService.getServerTime();
    }
}