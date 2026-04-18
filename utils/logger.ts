/**
 * Smart Logger — Only outputs in development mode.
 * In production, log/warn/info/debug are silenced.
 * logger.error() reports to Sentry in production for observability.
 *
 * Usage:
 *   import { logger } from '../utils/logger';
 *   logger.log('Something happened');
 *   logger.warn('Warning!');
 *   logger.error('Error:', err);
 */

import * as Sentry from '@sentry/react';

const isDev = import.meta.env.DEV;

const noop = (..._args: unknown[]) => { };

const prodError = (...args: unknown[]) => {
    const message = args.map(a => a instanceof Error ? a.message : String(a)).join(' ');
    const error = args.find(a => a instanceof Error) as Error | undefined;
    if (error) {
        Sentry.captureException(error);
    } else {
        Sentry.captureMessage(message, 'error');
    }
};

export const logger = {
    log: isDev ? console.log.bind(console) : noop,
    warn: isDev ? console.warn.bind(console) : noop,
    error: isDev ? console.error.bind(console) : prodError,
    info: isDev ? console.info.bind(console) : noop,
    debug: isDev ? console.debug.bind(console) : noop,
};
