export interface BinanceTradeResponse {
    orderId: string;
    clientOrderId: string;
    transactTime: number;
    price: string;
    origQty: string;
    executedQty: string;
    status: string;
    type: string;
    side: string;
}

export interface TradeExecutionResponse {
    success: boolean;
    orderId: string;
    price: number;
    quantity: number;
}

export interface MarketData {
    symbol: string;
    price: number;
    volume: number;
    timestamp: number;
}

// Přidejte tento typ, pokud ho skutečně potřebujete
export interface BinanceApiResponse {
    code: number;
    message: string;
    data?: any;
}