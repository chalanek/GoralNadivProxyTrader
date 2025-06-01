/* =================================
   API ROUTES FOR CRYPTO TRADING APP  
   =================================
*/

import { Router, Application, Request, Response } from 'express';
import { TradeController } from '../controllers/tradeController';
import { TradeService } from '../services/tradeService';
import { authenticate } from '../middleware/auth';
import { generateToken } from '../helpers/jwtHelper';
import dotenv from 'dotenv';

dotenv.config();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN
    ? parseInt(process.env.JWT_EXPIRES_IN)
    : 24 * 60 * 60; // Default to 24 hours

const router = Router();
const tradeService = new TradeService();
const tradeController = new TradeController(tradeService);

export function setRoutes(app: Application) {
    // Health check (no authentication)
    app.get('/health', (_req: Request, res: Response) => {
        res.status(200).json({
            status: 'UP',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        });
    });

    // Simple Binance connectivity test
    app.get('/test-binance', async (_req: Request, res: Response) => {
        try {
            const result = await tradeService.getBinanceStatus();
            res.status(200).json({
                binanceConnected: true,
                serverTime: result.serverTime,
                message: "Binance connection is working"
            });
        } catch (error) {
            res.status(500).json({
                binanceConnected: false,
                error: error instanceof Error ? error.message : String(error),
                message: "Binance connection failed"
            });
        }
    });

    // Debug endpoint for authentication variables
    app.get('/debug/auth', (_req: Request, res: Response) => {
        res.status(200).json({
            auth_api_key_defined: !!process.env.AUTH_API_KEY,
            auth_api_key_length: process.env.AUTH_API_KEY ? process.env.AUTH_API_KEY.length : 0,
            auth_api_key_value: process.env.AUTH_API_KEY || 'undefined',
            auth_secret_key_defined: !!process.env.AUTH_SECRET_KEY,
            default_values: {
                api_key: 'demo-api',
                secret_key: 'demo_secret'
            }
        });
    });

    // JWT login endpoint
    app.post('/auth/login', async (req: Request, res: Response) => {
        try {
            const { apiKey, secretKey } = req.body;
            if (!apiKey || !secretKey) {
                return res.status(400).json({
                    success: false,
                    message: 'API key and Secret key are required'
                });
            }

            const validApiKey = process.env.AUTH_API_KEY || 'demo-api';
            const validSecretKey = process.env.AUTH_SECRET_KEY || 'demo-secret';

            if (apiKey !== validApiKey || secretKey !== validSecretKey) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            const token = generateToken({
                userId: 'demo-user-id',
                role: 'api-user'
            });

            res.status(200).json({
                success: true,
                token,
                expiresIn: JWT_EXPIRES_IN,
                message: 'Authentication successful'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : String(error),
                message: 'Authentication error'
            });
        }
    });

    // Get account balance for a selected asset (e.g. EUR, BTC, USDT)
    app.get('/balance/:asset', authenticate, async (req: Request, res: Response) => {
        try {
            const asset = req.params.asset?.toUpperCase();
            if (!asset) {
                return res.status(400).json({
                    success: false,
                    message: 'You must provide an asset code (e.g. EUR, BTC, USDT)'
                });
            }
            const balance = await tradeService.getBalance(asset);
            res.status(200).json({
                success: true,
                asset,
                balance,
                message: `Available ${asset} balance on Binance account`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : String(error),
                message: "Failed to retrieve account balance"
            });
        }
    });

    // Buy crypto endpoint
    app.post('/trade/buy-crypto', authenticate, async (req: Request, res: Response) => {
        try {
            const { symbol, amount, quoteAsset } = req.body;

            if (!symbol || !amount || amount <= 0 || !quoteAsset) {
                return res.status(400).json({
                    success: false,
                    message: 'You must provide a crypto symbol, a positive amount, and a quote asset (e.g. EUR, USDT)'
                });
            }

            // Check balance of the selected quote asset
            const assetBalance = await tradeService.getBalance(quoteAsset.toUpperCase());
            if (amount > assetBalance) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient funds. Requested: ${amount} ${quoteAsset}, available: ${assetBalance} ${quoteAsset}`
                });
            }

            // Buy crypto for the selected quote asset
            const result = await tradeService.buyCrypto(symbol, amount, quoteAsset.toUpperCase());

            // Extract tradeId from the first fill if available
            const tradeId = result.fills && result.fills.length > 0 ? result.fills[0].tradeId : null;

            res.status(200).json({
                success: true,
                orderId: result.orderId,
                tradeId: tradeId,
                type: result.type,
                transaction: result,
                message: `Successfully bought ${result.executedQty} ${symbol} for ${amount} ${quoteAsset}`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : String(error),
                message: 'Error while buying crypto'
            });
        }
    });

    // Apply authentication only to /api/trade endpoints
    app.use('/api/trade', authenticate, router);

    router.post('/create', tradeController.createTrade.bind(tradeController));
    router.get('/status/:id', tradeController.getTradeStatus.bind(tradeController));
}