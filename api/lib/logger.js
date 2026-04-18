/**
 * Structured JSON logger for Vercel serverless functions.
 * In production, outputs structured JSON lines (compatible with Vercel Log Drains,
 * Datadog, Logtail, Axiom, etc.).
 * In development, uses console with readable formatting.
 */

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Core log emitter.
 * @param {'info'|'warn'|'error'|'debug'} level
 * @param {string} message
 * @param {Record<string, unknown>} [data]
 */
const emit = (level, message, data = {}) => {
    if (isDev) {
        const fn = level === 'error' ? console.error
            : level === 'warn' ? console.warn
            : console.log;
        fn(`[${level.toUpperCase()}]`, message, Object.keys(data).length ? data : '');
        return;
    }

    // Structured JSON for production log aggregators
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        service: 'sanarte-api',
    };

    // Merge extra data, but never overwrite reserved fields
    for (const [key, value] of Object.entries(data)) {
        if (!(key in entry)) entry[key] = value;
    }

    // Redact sensitive fields before logging
    const SENSITIVE_KEYS = new Set(['password', 'token', 'authorization', 'secret', 'key', 'email']);
    for (const key of SENSITIVE_KEYS) {
        if (key in entry) entry[key] = '[REDACTED]';
    }

    console.log(JSON.stringify(entry));
};

/**
 * Creates a child logger with pre-bound context fields (e.g. requestId, userId).
 * Useful for tracing a single request across multiple log lines.
 */
const createChild = (context = {}) => ({
    info:  (message, data = {}) => emit('info',  message, { ...context, ...data }),
    warn:  (message, data = {}) => emit('warn',  message, { ...context, ...data }),
    error: (message, data = {}) => emit('error', message, { ...context, ...data }),
    debug: (message, data = {}) => isDev && emit('debug', message, { ...context, ...data }),
});

export const logger = {
    info:  (message, data = {}) => emit('info',  message, data),
    warn:  (message, data = {}) => emit('warn',  message, data),
    error: (message, data = {}) => emit('error', message, data),
    debug: (message, data = {}) => isDev && emit('debug', message, data),

    /** Attach request context (requestId, userId, ip, route) for correlated logs */
    withContext: createChild,
};

/**
 * Express-style middleware that logs every request.
 * Usage: call logRequest(req, res, metadata) at the start of each handler.
 */
export const logRequest = (req, res, extra = {}) => {
    const start = Date.now();
    const method = req.method || 'UNKNOWN';
    const url = req.url || '';
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
        .split(',')[0].trim();

    logger.info('API request', { method, url, ip, ...extra });

    // Hook into response finish to log duration + status
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
        emit(level, 'API response', { method, url, status, duration_ms: duration, ip, ...extra });
    });
};
