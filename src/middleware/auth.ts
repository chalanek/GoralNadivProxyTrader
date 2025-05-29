import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Rozšířený Request typ s uživatelskými informacemi
declare module 'express' {
    interface Request {
        user?: {
            userId: string;
            email?: string;
            role?: string;
        };
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Získat authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        // Zkontrolovat formát (Bearer token)
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ message: 'Invalid authorization format. Use: Bearer token' });
        }

        const token = parts[1];
        const payload = verifyToken(token);

        if (!payload) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Přidání informací o uživateli do Request
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