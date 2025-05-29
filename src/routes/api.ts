import { Router } from 'express';
import { TradeController } from '../controllers/tradeController';
import { TradeService } from '../services/tradeService';
import { Application } from 'express';
import { authenticate } from '../middleware/auth';
import { generateToken } from '../utils/jwt';
import dotenv from 'dotenv';

dotenv.config();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 24 * 60 * 60; // Default to 24 hours


const router = Router();
const tradeService = new TradeService();
const tradeController = new TradeController(tradeService);

export function setRoutes(app: Application) {
    // Health check endpoint - bez autentizace
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'UP',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        });
    });

    app.get('/test-binance', async (req, res) => {
        try {
            // Jednoduchý dotaz na Binance API, který nevyžaduje autentizaci
            const result = await tradeService.getBinanceStatus();
            res.status(200).json({
                binanceConnected: true,
                serverTime: result.serverTime,
                message: "Připojení k Binance je funkční"
            });
        } catch (error) {
            res.status(500).json({
                binanceConnected: false,
                error: error instanceof Error ? error.message : String(error),
                message: "Připojení k Binance selhalo"
            });
        }
    });

    app.get('/debug/auth', (req, res) => {
        res.status(200).json({
            auth_api_key_defined: !!process.env.AUTH_API_KEY,
            auth_api_key_length: process.env.AUTH_API_KEY ? process.env.AUTH_API_KEY.length : 0,
            auth_api_key_value: process.env.AUTH_API_KEY || 'undefined',
            auth_secret_key_defined: !!process.env.AUTH_SECRET_KEY,
            default_values: {
                api_key: 'demo-api',
                secret_key: 'demo-secret'
            }
        });
    });

    // Endpoint pro generování JWT tokenu
    app.post('/auth/login', async (req, res) => {
        try {
            const { apiKey, secretKey } = req.body;
            console.log(`Login attempt: apiKey=${apiKey}, secretKey=${secretKey}`);
            console.log(`Expected: apiKey=${process.env.AUTH_API_KEY || 'demo-api'}, secretKey=${process.env.AUTH_SECRET_KEY || 'demo-secret'}`);


            // V reálné aplikaci byste zde ověřili přihlášení s databází
            // Pro jednoduchost zkontrolujeme jen proti statickým hodnotám
            if (!apiKey || !secretKey) {
                return res.status(400).json({
                    success: false,
                    message: 'API key a Secret key jsou povinné'
                });
            }

            // Pro demonstraci použijeme statické porovnání
            // V produkci byste použili správné porovnání z databáze
            const validApiKey = process.env.AUTH_API_KEY || 'demo-api';
            const validSecretKey = process.env.AUTH_SECRET_KEY || 'demo-secret';

            if (apiKey !== validApiKey || secretKey !== validSecretKey) {
                return res.status(401).json({
                    success: false,
                    message: 'Neplatné přihlašovací údaje'
                });
            }

            // Generování tokenu
            const token = generateToken({
                userId: 'demo-user-id',
                role: 'api-user'
            });

            res.status(200).json({
                success: true,
                token: token,
                expiresIn: JWT_EXPIRES_IN,
                message: 'Autentizace úspěšná'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : String(error),
                message: 'Chyba při autentizaci'
            });
        }
    });

    // Vrátí zůstatku účtu v EUR
    app.get('/balance/eur', authenticate, async (req, res) => {
        try {
            const balance = await tradeService.getEurBalance();
            res.status(200).json({
                success: true,
                balance: balance,
                message: "Dostupná částka EUR na Binance účtu"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : String(error),
                message: "Nepodařilo se získat zůstatek účtu"
            });
        }
    });

    // Aplikujte autentizaci POUZE na /api/trade endpointy
    app.use('/api/trade', authenticate, router);

    router.post('/create', tradeController.createTrade.bind(tradeController));
    router.get('/status/:id', tradeController.getTradeStatus.bind(tradeController));
}