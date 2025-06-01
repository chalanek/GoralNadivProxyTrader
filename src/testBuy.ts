import dotenv from 'dotenv';
import { BinanceService } from './services/binanceService';
import environment from './config';

// Načtení proměnných prostředí
dotenv.config();

/**
 * Testovací funkce pro směnu EUR za BTC s možností okamžitého prodeje
 */
async function testBuyBtcWithEur(sellImmediately = false) {
    console.log('Spouštím test směny EUR za BTC');
    console.log(`Používám ${environment.binance.useTestnet ? 'TESTNET' : 'PRODUKČNÍ'} Binance API`);
    console.log(sellImmediately ? 'Režim okamžitého prodeje: AKTIVNÍ' : 'Režim okamžitého prodeje: NEAKTIVNÍ');

    try {
        // Vytvoření instance BinanceService
        const binanceService = new BinanceService();

        // 1. Kontrola času serveru
        const serverStatus = await binanceService.getServerTime();
        console.log('Binance API status:', new Date(serverStatus.serverTime).toISOString());

        // 2. Kontrola zůstatku EUR před směnou
        console.log('Kontroluji zůstatek EUR...');
        const accountInfoBefore = await binanceService.getAccountBalance();
        const eurBalanceBefore = accountInfoBefore.balances.find((b: any) => b.asset === 'EUR');
        const btcBalanceBefore = accountInfoBefore.balances.find((b: any) => b.asset === 'BTC');

        console.log(`Počáteční zůstatek EUR: ${eurBalanceBefore ? parseFloat(eurBalanceBefore.free) : 0}`);
        console.log(`Počáteční zůstatek BTC: ${btcBalanceBefore ? parseFloat(btcBalanceBefore.free) : 0}`);

        // 3. Parametry pro směnu
        const symbol = 'BTCEUR';
        const eurAmount = 0.1; // Směna 0.1 EUR

        // 4. Kontrola dostatečných prostředků
        if (eurBalanceBefore && parseFloat(eurBalanceBefore.free) < eurAmount) {
            console.error(`Nedostatek EUR pro směnu! Potřeba: ${eurAmount}, k dispozici: ${parseFloat(eurBalanceBefore.free)}`);
            return;
        }

        // 5. Provedení směny
        console.log(`\nProvádím směnu ${eurAmount} EUR za BTC...`);

        const buyTrade = {
            symbol: symbol,
            side: 'BUY',
            type: 'MARKET',
            quoteOrderQty: eurAmount
        };

        const buyResult = await binanceService.executeTrade(buyTrade);

        // 6. Výpis výsledku směny
        console.log('\nVýsledek směny (NÁKUP):');
        console.log(JSON.stringify(buyResult, null, 2));

        // Vypsat shrnutí nákupní transakce
        console.log('\nShrnutí transakce (NÁKUP):');
        console.log(`Symbol: ${buyResult.symbol}`);
        console.log(`Typ: ${buyResult.type}`);
        console.log(`Strana: ${buyResult.side}`);
        console.log(`Status: ${buyResult.status}`);
        console.log(`Získáno BTC: ${buyResult.executedQty}`);
        console.log(`Zaplaceno EUR: ${buyResult.cummulativeQuoteQty}`);

        // 7. Kontrola aktualizovaného zůstatku po nákupu
        console.log('\nKontroluji aktualizované zůstatky po nákupu...');
        const accountInfoAfterBuy = await binanceService.getAccountBalance();
        const eurBalanceAfterBuy = accountInfoAfterBuy.balances.find((b: any) => b.asset === 'EUR');
        const btcBalanceAfterBuy = accountInfoAfterBuy.balances.find((b: any) => b.asset === 'BTC');

        console.log(`Zůstatek EUR po nákupu: ${eurBalanceAfterBuy ? parseFloat(eurBalanceAfterBuy.free) : 0}`);
        console.log(`Zůstatek BTC po nákupu: ${btcBalanceAfterBuy ? parseFloat(btcBalanceAfterBuy.free) : 0}`);

        // Výpočet rozdílů po nákupu
        const eurDiffBuy = eurBalanceBefore && eurBalanceAfterBuy ?
            parseFloat(eurBalanceBefore.free) - parseFloat(eurBalanceAfterBuy.free) : 0;

        const btcDiffBuy = btcBalanceBefore && btcBalanceAfterBuy ?
            parseFloat(btcBalanceAfterBuy.free) - parseFloat(btcBalanceBefore.free) : 0;

        console.log(`\nZměna po nákupu: -${eurDiffBuy.toFixed(2)} EUR, +${btcDiffBuy.toFixed(8)} BTC`);

        // 8. Aktuální cena 1 BTC v EUR po nákupu
        if (btcDiffBuy > 0) {
            const pricePerBtc = eurDiffBuy / btcDiffBuy;
            console.log(`\nAktuální nákupní kurz: 1 BTC = ${pricePerBtc.toFixed(2)} EUR`);
        }

        // 9. OKAMŽITÝ PRODEJ - pokud je vyžádán
        if (sellImmediately && btcBalanceAfterBuy && parseFloat(btcBalanceAfterBuy.free) > 0) {
            // Počkat chvilku před prodejem (pozor na rate limiting API)
            console.log('\n---------------------------------');
            console.log('Čekám 2 sekundy před provedením prodeje...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Zjistíme množství BTC, které chceme prodat
            const btcAmountToSell = parseFloat(buyResult.executedQty);

            // Pro lepší šanci na úspěšné provedení odečteme malé množství (kvůli případným zaokrouhlovacím chybám)
            const btcAmountToSellSafe = Math.floor(btcAmountToSell * 0.9999 * 100000000) / 100000000;

            console.log(`\nProvádím zpětný prodej ${btcAmountToSellSafe} BTC za EUR...`);

            const sellTrade = {
                symbol: symbol,
                side: 'SELL',
                type: 'MARKET',
                quantity: btcAmountToSellSafe.toFixed(8) // přesné formátování počtu desetinných míst
            };

            const sellResult = await binanceService.executeTrade(sellTrade);

            // Výpis výsledku prodeje
            console.log('\nVýsledek směny (PRODEJ):');
            console.log(JSON.stringify(sellResult, null, 2));

            // Shrnutí prodejní transakce
            console.log('\nShrnutí transakce (PRODEJ):');
            console.log(`Symbol: ${sellResult.symbol}`);
            console.log(`Typ: ${sellResult.type}`);
            console.log(`Strana: ${sellResult.side}`);
            console.log(`Status: ${sellResult.status}`);
            console.log(`Prodáno BTC: ${sellResult.executedQty}`);
            console.log(`Získáno EUR: ${sellResult.cummulativeQuoteQty}`);

            // Kontrola konečného zůstatku po prodeji
            console.log('\nKontroluji finální zůstatky po prodeji...');
            const accountInfoAfterSell = await binanceService.getAccountBalance();
            const eurBalanceAfterSell = accountInfoAfterSell.balances.find((b: any) => b.asset === 'EUR');
            const btcBalanceAfterSell = accountInfoAfterSell.balances.find((b: any) => b.asset === 'BTC');

            console.log(`Konečný zůstatek EUR: ${eurBalanceAfterSell ? parseFloat(eurBalanceAfterSell.free) : 0}`);
            console.log(`Konečný zůstatek BTC: ${btcBalanceAfterSell ? parseFloat(btcBalanceAfterSell.free) : 0}`);

            // Výpočet celkového rozdílu
            const totalEurDiff = eurBalanceBefore && eurBalanceAfterSell ?
                parseFloat(eurBalanceAfterSell.free) - parseFloat(eurBalanceBefore.free) : 0;

            const totalBtcDiff = btcBalanceBefore && btcBalanceAfterSell ?
                parseFloat(btcBalanceAfterSell.free) - parseFloat(btcBalanceBefore.free) : 0;

            console.log(`\nCelková změna: ${totalEurDiff > 0 ? '+' : ''}${totalEurDiff.toFixed(2)} EUR, ${totalBtcDiff > 0 ? '+' : ''}${totalBtcDiff.toFixed(8)} BTC`);

            // Výpočet poplatků/ztráty
            const feesEur = totalEurDiff;
            console.log(`\nCelkové náklady/poplatky: ${feesEur.toFixed(2)} EUR (${(feesEur / eurAmount * 100).toFixed(2)}% z původní částky)`);
        }
        else {
            console.log('\nOkamžitý prodej není aktivovaný nebo není dostatek BTC.');
        }

    } catch (error) {
        console.error('Chyba během testu směny:', error);
        if (error instanceof Error) {
            console.error('Detaily chyby:', error.message);
        }
    }
}

/**
 * Pomocná funkce pro zaokrouhlení na daný počet desetinných míst
 * (užitečné pro formátování množství při obchodování s kryptoměnami)
 */
function roundToDecimalPlaces(value: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.floor(value * factor) / factor;
}

/**
 * Funkce pro okamžitý prodej BTC za EUR
 * 
 * @param amount množství BTC k prodeji, pokud není zadáno, prodá vše dostupné
 */
async function sellBtcForEur(amount?: number) {
    console.log('Spouštím okamžitý prodej BTC za EUR');
    console.log(`Používám ${environment.binance.useTestnet ? 'TESTNET' : 'PRODUKČNÍ'} Binance API`);

    try {
        const binanceService = new BinanceService();
        const symbol = 'BTCEUR';

        // Zjistit aktuální dostupné množství BTC
        console.log('Kontroluji dostupný zůstatek BTC...');
        const accountInfo = await binanceService.getAccountBalance();
        const btcBalance = accountInfo.balances.find((b: any) => b.asset === 'BTC');

        if (!btcBalance || parseFloat(btcBalance.free) <= 0) {
            console.error('Nedostatek BTC pro prodej!');
            return;
        }

        // Stanovit množství k prodeji
        const btcAmountToSell = amount || parseFloat(btcBalance.free);

        // Zaokrouhlení na 8 desetinných míst pro BTC
        const btcAmountToSellSafe = roundToDecimalPlaces(btcAmountToSell * 0.9999, 8);

        console.log(`Dostupný zůstatek BTC: ${parseFloat(btcBalance.free)}`);
        console.log(`Prodávám ${btcAmountToSellSafe} BTC za EUR...`);

        // Vytvoření prodejního příkazu
        const sellTrade = {
            symbol: symbol,
            side: 'SELL',
            type: 'MARKET',
            quantity: btcAmountToSellSafe.toFixed(8)
        };

        // Provedení prodeje
        const result = await binanceService.executeTrade(sellTrade);

        // Výpis výsledku prodeje
        console.log('\nVýsledek prodeje:');
        console.log(JSON.stringify(result, null, 2));

        // Shrnutí transakce
        console.log('\nShrnutí prodeje:');
        console.log(`Symbol: ${result.symbol}`);
        console.log(`Prodáno BTC: ${result.executedQty}`);
        console.log(`Získáno EUR: ${result.cummulativeQuoteQty}`);
        console.log(`Status: ${result.status}`);

        // Kontrola aktualizovaného zůstatku
        console.log('\nKontroluji aktualizovaný zůstatek...');
        const updatedAccount = await binanceService.getAccountBalance();
        const updatedBtcBalance = updatedAccount.balances.find((b: any) => b.asset === 'BTC');
        const updatedEurBalance = updatedAccount.balances.find((b: any) => b.asset === 'EUR');

        console.log(`Aktuální zůstatek BTC: ${updatedBtcBalance ? parseFloat(updatedBtcBalance.free) : 0}`);
        console.log(`Aktuální zůstatek EUR: ${updatedEurBalance ? parseFloat(updatedEurBalance.free) : 0}`);

    } catch (error) {
        console.error('Chyba během prodeje BTC:', error);
        if (error instanceof Error) {
            console.error('Detaily chyby:', error.message);
        }
    }
}

// Spuštění testu - nastavte druhý parametr na true pro okamžitý prodej po nákupu
const EXECUTE_IMMEDIATE_SELL = false; // Změňte na false, pokud nechcete okamžitě prodat

// Můžete spustit buď nákup s možností okamžitého prodeje
testBuyBtcWithEur(EXECUTE_IMMEDIATE_SELL)
    .then(() => console.log('\nTest směny dokončen.'))
    .catch(err => console.error('Neošetřená chyba v testu:', err));

// Nebo samostatný prodej vašeho BTC (odkomentujte pro použití)
// sellBtcForEur() // Prodá veškeré dostupné BTC
// sellBtcForEur(0.0001) // Prodá konkrétní množství BTC