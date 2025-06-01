export interface TradeStatusResponse {
    tradeId: string;
    status: string;
    [key: string]: any;
}

export interface Trade {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity?: number;
    price?: number;
    quoteOrderQty?: number;
}