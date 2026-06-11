import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { JwtPayload } from '../types/auth';

/**
 * Express middleware that verifies a Bearer JWT and attaches Binance credentials to the request.
 * Returns 401 if the token is missing, malformed, or expired.
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    req.binanceCredentials = {
      apiKey: decoded.apiKey,
      secretKey: decoded.secretKey,
    };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
