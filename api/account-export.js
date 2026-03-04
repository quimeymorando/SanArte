import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const allowedOrigins = new Set(
    String(process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
);

const getHeaderValue = (headerValue) => {
    if (Array.isArray(headerValue)) return headerValue[0] || '';
    return typeof headerValue === 'string' ? headerValue : '';
};

const isAllowedOrigin = (origin) => {
    if (allowedOrigins.size === 0) return true;
    if (!origin) return true;
    return allowedOrigins.has(origin);
};

const validateSupabaseToken = async (token) => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !token) return null;

    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            method: 'GET',
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) return null;
        const user = await response.json();
        if (!user?.id) return null;

        return {
            id: user.id,
            email: user.email || null
        };
    } catch {
        return null;
    }
};

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ message: 'Server misconfigured' });
    }

    const origin = getHeaderValue(req.headers.origin);
    if (!isAllowedOrigin(origin)) {
        return res.status(403).json({ message: 'Origin not allowed' });
    }

    const authHeader = getHeaderValue(req.headers.authorization);
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
    const authUser = await validateSupabaseToken(token);

    if (!authUser) {
        return res.status(401).json({ message: 'Unauthorized request' });
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const [
            profileResp,
            routinesResp,
            favoritesResp,
            symptomLogsResp,
            intentionsResp,
            commentsAuthoredResp
        ] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
            supabase.from('routines').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }),
            supabase.from('favorites').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }),
            supabase.from('symptom_logs').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }),
            supabase.from('intentions').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }),
            supabase.from('comments').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false })
        ]);

        const responses = [
            profileResp,
            routinesResp,
            favoritesResp,
            symptomLogsResp,
            intentionsResp,
            commentsAuthoredResp
        ];

        const failedResponse = responses.find((response) => !!response.error);
        if (failedResponse) {
            return res.status(500).json({ message: 'No se pudo generar tu exportacion.' });
        }

        const intentionIds = (intentionsResp.data || []).map((item) => item.id);
        let commentsOnIntentions = [];

        if (intentionIds.length > 0) {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .in('intention_id', intentionIds)
                .order('created_at', { ascending: false });

            if (error) {
                return res.status(500).json({ message: 'No se pudo generar tu exportacion.' });
            }

            commentsOnIntentions = data || [];
        }

        const payload = {
            exported_at: new Date().toISOString(),
            user: {
                id: authUser.id,
                email: authUser.email
            },
            profile: profileResp.data || null,
            routines: routinesResp.data || [],
            favorites: favoritesResp.data || [],
            symptom_logs: symptomLogsResp.data || [],
            intentions: intentionsResp.data || [],
            comments_authored: commentsAuthoredResp.data || [],
            comments_on_my_intentions: commentsOnIntentions
        };

        const fileDate = new Date().toISOString().slice(0, 10);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="sanarte-data-${fileDate}.json"`);

        return res.status(200).send(JSON.stringify(payload, null, 2));
    } catch {
        return res.status(500).json({ message: 'No se pudo generar tu exportacion.' });
    }
}
