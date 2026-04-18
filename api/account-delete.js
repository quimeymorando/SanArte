import {
    isProductionEnvironment,
    parseAllowedOrigins,
    validateOriginRequest,
} from './securityPolicy.js';
import { accountDeleteSchema, validateBody } from './lib/schemas.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const REQUIRED_CONFIRMATION = 'DELETE_MY_ACCOUNT';

const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
const isProduction = isProductionEnvironment();

const getHeaderValue = (headerValue) => {
    if (Array.isArray(headerValue)) return headerValue[0] || '';
    return typeof headerValue === 'string' ? headerValue : '';
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
        return typeof user?.id === 'string' ? user : null;
    } catch {
        return null;
    }
};

const parseBody = (body) => {
    if (body && typeof body === 'object') return body;

    if (typeof body === 'string') {
        try {
            return JSON.parse(body);
        } catch {
            return {};
        }
    }

    return {};
};

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ message: 'Server misconfigured' });
    }

    const origin = getHeaderValue(req.headers.origin);
    const originValidation = validateOriginRequest({ origin, allowedOrigins, isProduction });
    if (!originValidation.ok) {
        return res.status(originValidation.status).json({ message: originValidation.message });
    }

    const authHeader = getHeaderValue(req.headers.authorization);
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
    const authUser = await validateSupabaseToken(token);

    if (!authUser?.id) {
        return res.status(401).json({ message: 'Unauthorized request' });
    }

    const parsedBody = parseBody(req.body);
    const validation = validateBody(accountDeleteSchema, parsedBody);
    if (!validation.ok) {
        return res.status(400).json({ message: 'Missing account deletion confirmation' });
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${authUser.id}`, {
            method: 'DELETE',
            headers: {
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            }
        });

        if (!response.ok) {
            return res.status(500).json({ message: 'No se pudo eliminar tu cuenta.' });
        }

        return res.status(200).json({ deleted: true });
    } catch {
        return res.status(500).json({ message: 'No se pudo eliminar tu cuenta.' });
    }
}
