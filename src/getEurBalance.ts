import { TradeService } from './services/tradeService';
import dotenv from 'dotenv';

// Načtení proměnných prostředí
dotenv.config();

console.log("Script started - getEurBalance.ts");

/**
 * Jednoduchý skript pro získání a zobrazení zůstatku EUR v Binance účtu
 */
async function checkEurBalance() {
    console.log('Spouštím kontrolu zůstatku EUR...');

    // Zobrazení informace o použitém prostředí
    const isTestnet = process.env.USE_BINANCE_TESTNET === 'true';
    console.log(`Používám ${isTestnet ? 'TESTNET' : 'PRODUKČNÍ'} Binance API`);

    try {
        // Vytvoření instance TradeService
        const tradeService = new TradeService();

        // Kontrola připojení k Binance
        console.log('Kontroluji připojení k Binance API...');
        const serverStatus = await tradeService.getBinanceStatus();
        console.log(`Binance API Status: OK (serverTime: ${new Date(serverStatus.serverTime).toISOString()})`);

        // Získání zůstatku EUR
        console.log('Získávám zůstatek EUR...');
        const eurBalance = await tradeService.getEurBalance();

        // Výpis zůstatku s formátováním
        console.log('\n=== VÝSLEDEK ===');
        console.log(`Aktuální zůstatek: ${eurBalance.toFixed(2)} EUR`);

        // Doplňující informace pro uživatele
        if (eurBalance < 10) {
            console.log('\n⚠️ Upozornění: Zůstatek je nižší než minimální částka pro obchodování (10 EUR)');
        }

        return eurBalance;
    } catch (error) {
        console.error('❌ Chyba při získávání zůstatku EUR:');
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        throw error;
    }
}

// Spuštění funkce
checkEurBalance()
    .then(balance => {
        console.log('\nSkript dokončen.');
        // Explicitně ukončit proces po dokončení
        setTimeout(() => process.exit(0), 100);
    })
    .catch(error => {
        console.error('Skript selhal s chybou.');
        process.exit(1);
    });