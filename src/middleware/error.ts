import { Request, Response, NextFunction } from 'express';

/** Global Express error handler for uncaught errors passed via next(err). */
const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  console.error(err);
  res.status(500).json({ success: false, message });
};

export default errorHandler;
