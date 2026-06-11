import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});

/**
 * Logs an info-level message.
 * @param message - Message to log
 */
export function logInfo(message: string): void {
  logger.info(message);
}

/**
 * Logs an error-level message.
 * @param message - Message to log
 */
export function logError(message: string): void {
  logger.error(message);
}
