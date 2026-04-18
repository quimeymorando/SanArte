import { logRequest } from './lib/logger.js';

/**
 * Health check endpoint — /api/health
 * Used by uptime monitors (UptimeRobot, BetterStack, etc.) and CI smoke tests.
 *
 * Returns 200 if all required environment variables are present,
 * 503 if any critical service is misconfigured.
 */
export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    logRequest(req, res, { route: 'health' });

    if (req.method !== 'GET') {
        return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }

    const checks = {
        supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
        gemini:   !!(process.env.GEMINI_API_KEY),
        webhook:  !!(process.env.LEMON_SQUEEZY_WEBHOOK_SECRET),
    };

    const allHealthy = Object.values(checks).every(Boolean);

    const payload = {
        status:      allHealthy ? 'ok' : 'degraded',
        timestamp:   new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        version:     process.env.npm_package_version || '1.0.0',
        services:    checks,
    };

    return res.status(allHealthy ? 200 : 503).json(payload);
}
