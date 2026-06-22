import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Absolutní cesta k .env souboru
const envPath = path.resolve(__dirname, '../../.env');

console.log('Hledám .env soubor na cestě:', envPath);
console.log('Soubor existuje:', fs.existsSync(envPath));

// Načtení .env souboru z explicitní cesty
dotenv.config({ path: envPath });

console.log('\nKontrola Binance API klíčů:');
console.log('API Key definován:', !!process.env.BINANCE_API_KEY);
console.log('API Key délka:', process.env.BINANCE_API_KEY ? process.env.BINANCE_API_KEY.length : 0);
console.log('API Secret definován:', !!process.env.BINANCE_API_SECRET);
console.log('API Secret délka:', process.env.BINANCE_API_SECRET ? process.env.BINANCE_API_SECRET.length : 0);

// Vypsat názvy všech proměnných prostředí z .env
console.log('\nVšechny proměnné z .env:');
const envVars = Object.keys(process.env).filter(key =>
    key.includes('BINANCE') || key.includes('API') || key.includes('SECRET')
);
console.log(envVars);