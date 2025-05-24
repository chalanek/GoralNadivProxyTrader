export function validateTradeRequest(request: any): boolean {
    const { symbol, quantity, price } = request;
    if (!symbol || typeof symbol !== 'string') {
        return false;
    }
    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
        return false;
    }
    if (!price || typeof price !== 'number' || price <= 0) {
        return false;
    }
    return true;
}

export function validateSymbol(symbol: string): boolean {
    const validSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']; // Add more valid symbols as needed
    return validSymbols.includes(symbol);
}