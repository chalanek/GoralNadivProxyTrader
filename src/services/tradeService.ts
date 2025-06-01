// src/services/tradeService.ts
import { BinanceService } from './binanceService';
import { TradeStatusResponse, Trade } from '../types/tradeTypes';

export class TradeService {
    private binanceService: BinanceService;

    constructor() {
        this.binanceService = new BinanceService();
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