import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { BinanceService } from '../services/binanceService';
import config from '../config';
import { LoginRequest, LoginResponse } from '../types/auth';
import { getErrorMessage } from '../utils/errors';

/** JWT lifetime in seconds (24 h). */
const JWT_EXPIRES_IN = 86400;

/**
 * POST /auth/login
 * Validates Binance API credentials against the live Binance account endpoint,
 * then issues a signed JWT containing the credentials for use in subsequent requests.
 * @param req - Request with body `{ apiKey, secretKey }`
 * @param res - `{ success, token, expiresIn }` on success or `{ success, message }` on failure
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { apiKey, secretKey } = req.body as LoginRequest;

  if (!apiKey || !secretKey) {
    const body: LoginResponse = { success: false, message: 'apiKey and secretKey are required' };
    res.status(400).json(body);
    return;
  }

  try {
    const binance = new BinanceService(apiKey, secretKey);
    await binance.validateCredentials();

    const token = jwt.sign({ apiKey, secretKey }, config.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const body: LoginResponse = { success: true, token, expiresIn: JWT_EXPIRES_IN };
    res.json(body);
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Authentication failed');
    res.status(401).json({ success: false, message } as LoginResponse);
  }
}
