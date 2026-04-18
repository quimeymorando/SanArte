import { createClient } from '@supabase/supabase-js';
import { logRequest } from './lib/logger.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_API_SECRET;

/**
 * Admin Metrics endpoint — /api/admin-metrics
 * Protected by ADMIN_API_SECRET header.
 * Returns aggregate stats for the admin dashboard.
 */
export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    logRequest(req, res, { route: 'admin-metrics' });

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ message: 'Server misconfigured' });
    }

    // Admin-only: require secret header
    const providedSecret = req.headers['x-admin-secret'] || '';
    if (!ADMIN_SECRET || providedSecret !== ADMIN_SECRET) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Run all queries in parallel for speed
        const [
            totalUsersRes,
            premiumUsersRes,
            newUsersRes,
            activeUsersRes,
            topLevelsRes,
        ] = await Promise.all([
            // Total users
            supabase.from('profiles').select('id', { count: 'exact', head: true }),

            // Premium users
            supabase.from('profiles')
                .select('id', { count: 'exact', head: true })
                .eq('is_premium', true),

            // New users (last 7 days)
            supabase.from('profiles')
                .select('id', { count: 'exact', head: true })
                .gte('join_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

            // Active users (last 24 hours)
            supabase.from('profiles')
                .select('id', { count: 'exact', head: true })
                .gte('last_active_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),

            // Top 5 levels distribution
            supabase.from('profiles')
                .select('level')
                .order('level', { ascending: false })
                .limit(100),
        ]);

        // Compute level distribution from last query
        const levelDist = {};
        for (const row of (topLevelsRes.data || [])) {
            const lvl = row.level || 1;
            levelDist[lvl] = (levelDist[lvl] || 0) + 1;
        }

        const totalUsers   = totalUsersRes.count   ?? 0;
        const premiumUsers = premiumUsersRes.count  ?? 0;
        const newUsers7d   = newUsersRes.count      ?? 0;
        const activeUsers  = activeUsersRes.count   ?? 0;

        return res.status(200).json({
            timestamp: new Date().toISOString(),
            users: {
                total:         totalUsers,
                premium:       premiumUsers,
                free:          totalUsers - premiumUsers,
                conversionRate: totalUsers > 0
                    ? `${((premiumUsers / totalUsers) * 100).toFixed(1)}%`
                    : '0%',
                newLast7d:     newUsers7d,
                activeLast24h: activeUsers,
            },
            levels: levelDist,
        });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch metrics' });
    }
}
