export interface Trade {
    id: string;
    symbol: string;
    quantity: number;
    price: number;
    side: 'buy' | 'sell';
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

export interface TradeRequest {
    symbol: string;
    quantity: number;
    price: number;
    side: 'buy' | 'sell';
}

export interface TradeResponse {
    trade: Trade;
    message: string;
}