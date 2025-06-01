// src/services/binanceService.ts
import crypto from 'crypto';
import dotenv from 'dotenv';
import environment from '../config'; // Importujte upravenou konfiguraci

export class BinanceService {
    private apiKey: string;
    private apiSecret: string;
    private baseUrl: string;

    constructor() {
        // Ujistěte se, že .env je načtený
        if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_TESTNET_API_KEY) {
            dotenv.config();
        }

        // Načtení přímo z prostředí pro diagnostiku
        const useTestnet = process.env.USE_BINANCE_TESTNET === 'true';
        console.log(`USE_BINANCE_TESTNET přímo z process.env: ${process.env.USE_BINANCE_TESTNET}`);

        this.apiKey = useTestnet
            ? process.env.BINANCE_TESTNET_API_KEY || ''
            : process.env.BINANCE_API_KEY || '';

        this.apiSecret = useTestnet
            ? process.env.BINANCE_TESTNET_API_SECRET || ''
            : process.env.BINANCE_API_SECRET || '';

        this.baseUrl = useTestnet
            ? 'https://testnet.binance.vision'
            : 'https://api.binance.com';

        // Debug výpis klíčů (bezpečné - zobrazují se pouze části klíčů)
        console.log(`API Key (${useTestnet ? 'TESTNET' : 'PROD'}): ${this.maskKey(this.apiKey)}`);
        console.log(`API Secret (${useTestnet ? 'TESTNET' : 'PROD'}): ${this.maskKey(this.apiSecret)}`);
        console.log(`Base URL: ${this.baseUrl}`);

        if (!this.apiKey || !this.apiSecret) {
            throw new Error('API klíče pro Binance nejsou správně nastaveny v konfiguraci');
        }
    }

    // Pomocná metoda pro maskování klíčů
    private maskKey(key: string): string {
        if (!key) return 'undefined';
        if (key.length <= 8) return '****';
        return key.substring(0, 4) + '...' + key.substring(key.length - 4);
    }

    public async getMinNotional(symbol: string): Promise<number> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v3/exchangeInfo?symbol=${symbol}`);
            if (!response.ok) {
                throw new Error(`Failed to get exchange info: ${response.status}`);
            }
            const data = await response.json();
            const symbolInfo = data.symbols && data.symbols[0];
            if (!symbolInfo) {
                throw new Error(`Symbol ${symbol} not found in exchange info`);
            }
            // Nejprve zkus NOTIONAL, pak MIN_NOTIONAL
            let filter = symbolInfo.filters.find((f: any) => f.filterType === 'NOTIONAL');
            if (!filter) {
                filter = symbolInfo.filters.find((f: any) => f.filterType === 'MIN_NOTIONAL');
            }
            if (!filter) {
                throw new Error(`MIN_NOTIONAL/NOTIONAL filter not found for symbol ${symbol}`);
            }
            return parseFloat(filter.minNotional);
        } catch (error) {
            console.error('Error getting min notional:', error);
            throw error;
        }
    }

    public async getOrderStatus(orderId: string): Promise<any> {
        try {
            const timestamp = Date.now();
            const queryString = `orderId=${orderId}&timestamp=${timestamp}`;
            const signature = this.createSignature(queryString);

            const response = await fetch(`${this.baseUrl}/api/v3/order?${queryString}&signature=${signature}`, {
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': this.apiKey
                }
            });


            return await response.json();
        } catch (error) {
            console.error('Error getting order status:', error);
            throw error;
        }
    }

    public async executeTrade(tradeParams: any): Promise<any> {
        try {
            const timestamp = Date.now();

            // Základní parametry
            let params: Record<string, any> = {
                symbol: tradeParams.symbol,
                side: tradeParams.side,
                type: tradeParams.type,
                timestamp: timestamp
            };

            // Přidání parametrů podle typu objednávky
            if (tradeParams.type === 'MARKET') {
                if (tradeParams.quoteOrderQty) {
                    params.quoteOrderQty = tradeParams.quoteOrderQty;
                } else if (tradeParams.quantity) {
                    params.quantity = tradeParams.quantity;
                }
            } else if (tradeParams.type === 'LIMIT') {
                params.quantity = tradeParams.quantity;
                params.price = tradeParams.price;
                params.timeInForce = 'GTC';
            }

            // Převést na query string
            const queryString = Object.entries(params)
                .map(([key, value]) => `${key}=${value}`)
                .join('&');

            // Podepsat požadavek
            const signature = this.createSignature(queryString);

            // Odeslat požadavek
            const response = await fetch(`${this.baseUrl}/api/v3/order?${queryString}&signature=${signature}`, { // Použít this.baseUrl
                method: 'POST',
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
            console.error('Error executing trade:', error);
            throw error;
        }
    }

    public async getAccountBalance(): Promise<any> {
        try {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = this.createSignature(queryString);

            const response = await fetch(`${this.baseUrl}/api/v3/account?${queryString}&signature=${signature}`, { // Použít this.baseUrl
                headers: {
                    'X-MBX-APIKEY': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get account balance: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting account balance:', error);
            throw error;
        }
    }

    public async getServerTime(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v3/time`); // Použít this.baseUrl
            if (!response.ok) {
                throw new Error(`Failed to get server time: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting server time:', error);
            throw error;
        }
    }

    private createSignature(queryString: string): string {
        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(queryString)
            .digest('hex');
    }
}