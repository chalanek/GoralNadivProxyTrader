import { BinanceService } from './binanceService';
import { TradeStatusResponse, Trade } from '../types/tradeTypes';

export class TradeService {
    private binanceService: BinanceService;

    constructor() {
        this.binanceService = new BinanceService();
    }

    public async getBalance(asset: string): Promise<number> {
        try {
            const accountInfo = await this.binanceService.getAccountBalance();
            const balanceObj = accountInfo.balances.find((b: any) => b.asset === asset);
            return balanceObj ? parseFloat(balanceObj.free) : 0;
        } catch (error) {
            console.error(`Error getting ${asset} balance:`, error);
            throw error;
        }
    }

    public async buyCrypto(symbol: string, amount: number, quoteAsset: string): Promise<any> {
        try {
            // Dynamically get min notional for the symbol
            const minNotional = await this.binanceService.getMinNotional(symbol);
            if (amount < minNotional) {
                throw new Error(`Minimum amount for purchase is ${minNotional} ${quoteAsset} (according to Binance rules)`);
            }

            // Create MARKET order for the given amount in quoteAsset
            const trade = {
                symbol: symbol,
                side: 'BUY',
                type: 'MARKET',
                quoteOrderQty: amount
            };

            // Send order to Binance
            const result = await this.binanceService.executeTrade(trade);
            return result;
        } catch (error) {
            console.error(`Error buying ${symbol} for ${amount} ${quoteAsset}:`, error);
            throw error;
        }
    }

    public async getBinanceStatus(): Promise<any> {
        return await this.binanceService.getServerTime();
    }

    /**
     * Vytvoří nový obchod
     * @param tradeData Data pro vytvoření obchodu
     * @returns Informace o vytvořeném obchodu
     */
    public async createTrade(tradeData: Trade): Promise<any> {
        try {
            // Implementace podle specifických požadavků
            // Pro jednoduchost zde předáváme data přímo do binanceService.executeTrade

            const result = await this.binanceService.executeTrade(tradeData);

            // Zde můžete přidat logiku pro ukládání obchodu do databáze,
            // sledování stavu, atd.

            return {
                tradeId: result.orderId.toString(), // Používáme orderId jako tradeId
                status: result.status,
                symbol: result.symbol,
                executedQty: result.executedQty,
                price: result.price,
                type: result.type,
                side: result.side,
                transactionTime: result.transactTime,
                // Další potřebná data...
            };
        } catch (error) {
            console.error('Error creating trade:', error);
            throw error;
        }
    }

    /**
     * Získá stav obchodu podle ID
     * @param tradeId ID obchodu
     * @returns Informace o stavu obchodu
     */
    public async getTradeStatus(tradeId: string): Promise<TradeStatusResponse> {
        try {
            // Zde by normálně byla logika pro získání stavu obchodu z vaší databáze
            // nebo volání Binance API pro kontrolu stavu objednávky

            // Pro Binance můžeme použít order API k získání stavu objednávky
            const orderStatus = await this.binanceService.getOrderStatus(tradeId);

            return {
                tradeId: tradeId,
                status: orderStatus.status,
                symbol: orderStatus.symbol,
                executedQty: orderStatus.executedQty,
                price: orderStatus.price,
                type: orderStatus.type,
                side: orderStatus.side,
                transactionTime: orderStatus.time,
                // Další potřebná data...
            };
        } catch (error) {
            console.error(`Error getting trade status for ID ${tradeId}:`, error);
            throw error;
        }
    }
}