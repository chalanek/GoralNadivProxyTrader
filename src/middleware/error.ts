/* =========================
   ERROR HANDLING MIDDLEWARE  
   =========================
*/

import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware for Express.
 * Logs the error stack and sends a standardized JSON response.
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error stack:', err.stack);
    res.status(500).json({
        message: 'An unexpected error occurred.',
        error: err.message || 'Unknown error',
    });
};

export default errorHandler;