import crypto from 'crypto';

export class TestnetBinanceService {
    private apiKey: string;
    private apiSecret: string;
    private baseUrl: string = 'https://testnet.binance.vision'; // Testnet URL

    constructor() {
        this.apiKey = process.env.BINANCE_TESTNET_API_KEY || '';
        this.apiSecret = process.env.BINANCE_TESTNET_API_SECRET || '';

        if (!this.apiKey || !this.apiSecret) {
            throw new Error('BINANCE_TESTNET_API_KEY a BINANCE_TESTNET_API_SECRET musí být nastaveny v .env souboru');
        }

        console.log(`Testnet API Key načten (${this.apiKey.substring(0, 4)}...${this.apiKey.substring(this.apiKey.length - 4)})`);
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Binance API error: ${response.status}, ${JSON.stringify(errorData)}`);
            }

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
            const response = await fetch(`${this.baseUrl}/api/v3/order?${queryString}&signature=${signature}`, {
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

            const response = await fetch(`${this.baseUrl}/api/v3/account?${queryString}&signature=${signature}`, {
                headers: {
                    'X-MBX-APIKEY': this.apiKey
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Testnet API odpověď:', response.status, errorText);
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
            const response = await fetch(`${this.baseUrl}/api/v3/time`);
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