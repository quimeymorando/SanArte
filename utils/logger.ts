/**
 * Smart Logger — Only outputs in development mode.
 * In production, all logs are silenced to keep the console clean
 * and avoid leaking sensitive information.
 *
 * Usage:
 *   import { logger } from '../utils/logger';
 *   logger.log('Something happened');
 *   logger.warn('Warning!');
 *   logger.error('Error:', err);
 */

const isDev = import.meta.env.DEV;

const noop = (..._args: unknown[]) => { };

export const logger = {
    log: isDev ? console.log.bind(console) : noop,
    warn: isDev ? console.warn.bind(console) : noop,
    error: isDev ? console.error.bind(console) : noop,
    info: isDev ? console.info.bind(console) : noop,
    debug: isDev ? console.debug.bind(console) : noop,
};
