import dotenv from 'dotenv';
import fs from 'fs';

// Načteme .env
dotenv.config();

console.log('=== DIAGNOSTIKA KONFIGURACE ===');

// Zobrazení všech relevantních proměnných prostředí
console.log('USE_BINANCE_TESTNET:', process.env.USE_BINANCE_TESTNET);

console.log('\n--- TESTNET KLÍČE ---');
console.log('BINANCE_TESTNET_API_KEY:', maskString(process.env.BINANCE_TESTNET_API_KEY || ''));
console.log('BINANCE_TESTNET_API_SECRET:', maskString(process.env.BINANCE_TESTNET_API_SECRET || ''));

console.log('\n--- PRODUKČNÍ KLÍČE ---');
console.log('BINANCE_API_KEY:', maskString(process.env.BINANCE_API_KEY || ''));
console.log('BINANCE_API_SECRET:', maskString(process.env.BINANCE_API_SECRET || ''));

console.log('\n--- OBSAH .ENV SOUBORU ---');
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    // Bezpečné zobrazení - maskujeme klíče
    const maskedContent = envContent
        .replace(/([A-Z_]+_KEY=)([a-zA-Z0-9]+)/g, '$1' + '****')
        .replace(/([A-Z_]+_SECRET=)([a-zA-Z0-9]+)/g, '$1' + '****');
    console.log(maskedContent);
} catch (error) {
    console.error('Nepodařilo se přečíst .env soubor:', error);
}

// Zobrazení načtené konfigurace
console.log('\n--- KONFIGURACE Z CONFIG ---');
try {
    const environment = require('./config').default;
    console.log('environment.binance.useTestnet:', environment.binance.useTestnet);
    console.log('environment.binance.apiKey:', maskString(environment.binance.apiKey || ''));
    console.log('environment.binance.apiSecret:', maskString(environment.binance.apiSecret || ''));
    console.log('environment.binance.baseUrl:', environment.binance.baseUrl);
} catch (error) {
    console.error('Chyba při načítání konfigurace:', error);
}

function maskString(str: string): string {
    if (!str) return 'undefined/empty';
    if (str.length <= 8) return '****';
    return str.substring(0, 4) + '...' + str.substring(str.length - 4);
}

console.log('\n=== KONEC DIAGNOSTIKY ===');