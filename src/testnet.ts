import { TestTradeService } from './services/testnetTradeService';
import dotenv from 'dotenv';

// Načíst proměnné prostředí
dotenv.config();

/**
 * Testovací funkce pro testnet
 */
async function testTestnet() {
    console.log('Zahajuji test Binance Testnet...');

    // Vytvoření instance TestTradeService
    const testTradeService = new TestTradeService();

    try {
        // 1. Nejdříve zkontrolovat připojení k Binance Testnet
        console.log('Kontroluji připojení k Binance Testnet API...');
        const serverStatus = await testTradeService.getBinanceStatus();
        console.log('Binance Testnet API status:', serverStatus);

        // 2. Ověřit dostupný zůstatek EUR
        console.log('Kontroluji dostupný zůstatek EUR na testnet účtu...');
        const eurBalance = await testTradeService.getEurBalance();
        console.log(`Aktuální zůstatek: ${eurBalance} EUR`);

        // 3. Pokud chceme otestovat nákup, odkomentujeme následující kód

        // Definovat parametry pro nákup
        const symbol = 'BTCEUR';
        const eurAmount = 15; // Nákup za 15 EUR

        // Kontrola, zda máme dostatek prostředků
        if (eurBalance < eurAmount) {
            console.error(`Nedostatek prostředků! Požadováno ${eurAmount} EUR, k dispozici: ${eurBalance} EUR`);
            return;
        }

        // Pokračovat s nákupem pouze pokud je dostatek prostředků
        console.log(`Provádím nákup ${symbol} za ${eurAmount} EUR...`);

        // Výkonat buyCrypto funkci
        const result = await testTradeService.buyCrypto(symbol, eurAmount);

        // Zobrazit výsledek
        console.log('Výsledek nákupu:');
        console.log(JSON.stringify(result, null, 2));

        // Ověřit aktualizovaný zůstatek po nákupu
        const updatedEurBalance = await testTradeService.getEurBalance();
        console.log(`Aktualizovaný zůstatek: ${updatedEurBalance} EUR`);


        console.log('Test dokončen úspěšně!');
    } catch (error) {
        console.error('Chyba během testu:', error);
        if (error instanceof Error) {
            console.error('Detaily chyby:', error.message);
        }
    }
}

// Spustit test
testTestnet()
    .then(() => console.log('Test dokončen.'))
    .catch(err => console.error('Test selhal s neošetřenou chybou:', err));