import { BinanceTradeResponse, MarketData, TradeExecutionResponse } from '../types/binance';
// Změněno z BinanceApiResponse na BinanceTradeResponse

export class BinanceService {
    private apiKey: string;
    private apiSecret: string;

    constructor() {
        this.apiKey = process.env.BINANCE_API_KEY || '';
        this.apiSecret = process.env.BINANCE_API_SECRET || '';

        if (!this.apiKey || !this.apiSecret) {
            console.warn('Binance API credentials not found in environment variables');
        }
    }

    public async executeTrade(trade: any): Promise<TradeExecutionResponse> {
        // Zde implementujte logiku pro provedení obchodu přes Binance API
        console.log(`Executing trade: ${JSON.stringify(trade)}`);
        return {
            success: true,
            orderId: `ord-${Date.now()}`,
            price: trade.price,
            quantity: trade.amount
        };
    }

    public async getServerTime(): Promise<any> {
        try {
            // Jednoduchý veřejný endpoint pro ověření dostupnosti
            const response = await fetch('https://api.binance.com/api/v3/time');
            if (!response.ok) {
                throw new Error(`Binance API vrátilo chybu: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Chyba při kontaktování Binance API:', error);
            throw error;
        }
    }

    public async fetchMarketData(symbol: string): Promise<MarketData> {
        // Zde implementujte logiku pro získání dat o trhu z Binance API
        console.log(`Fetching market data for: ${symbol}`);
        return {
            symbol: symbol,
            price: Math.random() * 50000, // Simulace ceny
            volume: Math.random() * 100000,
            timestamp: Date.now()
        };
    }

    public async getAccountBalance(): Promise<any> {
        try {
            // Pro dotazy vyžadující autentizaci je potřeba přidat podpis
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;

            // Vytvoření podpisu pomocí HMAC SHA256
            const signature = this.createSignature(queryString);

            const url = `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': this.apiKey
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Binance API error: ${response.status}, ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error retrieving account balance:', error);
            throw error;
        }
    }

    // Pomocná metoda pro vytvoření podpisu
    private createSignature(queryString: string): string {
        const crypto = require('crypto');
        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(queryString)
            .digest('hex');
    }
}