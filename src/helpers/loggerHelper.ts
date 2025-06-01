/* =============
   LOGGER HELPER
   =============
*/


import { createLogger, format, transports } from 'winston';

// Winston logger configuration
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(), // Output logs to the console
        new transports.File({ filename: 'error.log', level: 'error' }), // Log errors to error.log
        new transports.File({ filename: 'combined.log' }) // Log all messages to combined.log
    ],
});

/**
 * Log an informational message.
 * @param message - The message to log.
 */
export const logInfo = (message: string) => {
    logger.info(message);
};

/**
 * Log an error message.
 * @param message - The error message to log.
 */
export const logError = (message: string) => {
    logger.error(message);
};