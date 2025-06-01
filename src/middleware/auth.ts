/* =========================
   AUTHENTICATION MIDDLEWARE
   =========================
*/

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../helpers/jwtHelper';

// Extend Express Request type to include user information
declare module 'express' {
    interface Request {
        user?: {
            userId: string;
            email?: string;
            role?: string;
        };
    }
}

/**
 * Express middleware to authenticate requests using JWT.
 * Checks for a valid Bearer token in the Authorization header.
 * If valid, attaches user info to req.user and calls next().
 * Otherwise, responds with an appropriate error message.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        // Check for Bearer token format
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ message: 'Invalid authorization format. Use: Bearer <token>' });
        }

        const token = parts[1];
        const payload = verifyToken(token);

        if (!payload) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Attach user info to the request object
        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role
        };

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error during authentication' });
    }
};