const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_MAX_OUTPUT_TOKENS = Math.min(
    4096,
    Math.max(128, Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 2048))
);
const GEMINI_TEMPERATURE = Math.min(
    1,
    Math.max(0, Number(process.env.GEMINI_TEMPERATURE || 0.7))
);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 25;
const MAX_REQUEST_BYTES = 60_000;
const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 4000;
const MAX_TOTAL_CHARS = 15000;

const rateLimitStore = new Map();

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

const getClientIp = (req) => {
    const forwarded = getHeaderValue(req.headers['x-forwarded-for']);
    if (forwarded) return forwarded.split(',')[0].trim();

    const realIp = getHeaderValue(req.headers['x-real-ip']);
    if (realIp) return realIp.trim();

    return req.socket?.remoteAddress || 'unknown';
};

const checkRateLimit = (key) => {
    const now = Date.now();
    const current = rateLimitStore.get(key);

    if (!current || now - current.start > WINDOW_MS) {
        rateLimitStore.set(key, { start: now, count: 1 });
        return true;
    }

    if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
    current.count += 1;

    if (rateLimitStore.size > 2000) {
        for (const [storedKey, value] of rateLimitStore.entries()) {
            if (now - value.start > WINDOW_MS * 2) {
                rateLimitStore.delete(storedKey);
            }
        }
    }

    return true;
};

const isValidRole = (role) => role === 'user' || role === 'assistant' || role === 'system';

const validateSupabaseToken = async (token) => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !token) return null;

    try {
        const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            method: 'GET',
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${token}`
            }
        });

        if (!resp.ok) return null;

        const user = await resp.json();
        return typeof user?.id === 'string' ? user.id : null;
    } catch {
        return null;
    }
};

const isAllowedOrigin = (origin) => {
    if (allowedOrigins.size === 0) return true;
    if (!origin) return true;
    return allowedOrigins.has(origin);
};

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ message: 'Gemini API key is not configured' });
    }

    const origin = getHeaderValue(req.headers.origin);
    if (!isAllowedOrigin(origin)) {
        return res.status(403).json({ message: 'Origin not allowed' });
    }

    const contentLength = Number(getHeaderValue(req.headers['content-length']) || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
        return res.status(413).json({ message: 'Payload too large' });
    }

    const authHeader = getHeaderValue(req.headers.authorization);
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';

    const authUserId = await validateSupabaseToken(token);
    if (!authUserId) {
        return res.status(401).json({ message: 'Unauthorized request' });
    }

    const ip = getClientIp(req);
    const rateLimitKey = `${authUserId}:${ip}`;
    if (!checkRateLimit(rateLimitKey)) {
        return res.status(429).json({ message: 'Too many requests. Try again in a minute.' });
    }

    const { messages, jsonMode = false } = req.body || {};

    if (typeof jsonMode !== 'boolean') {
        return res.status(400).json({ message: 'Invalid jsonMode value' });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: 'Invalid messages payload' });
    }

    if (messages.length > MAX_MESSAGES) {
        return res.status(400).json({ message: `Too many messages. Max allowed: ${MAX_MESSAGES}` });
    }

    let totalChars = 0;
    for (const item of messages) {
        if (!item || typeof item !== 'object' || !isValidRole(item.role)) {
            return res.status(400).json({ message: 'Invalid message format' });
        }

        const content = String(item.content || '');
        if (!content.trim()) {
            return res.status(400).json({ message: 'Empty message content' });
        }

        if (content.length > MAX_CHARS_PER_MESSAGE) {
            return res.status(400).json({ message: `Message too long. Max chars per message: ${MAX_CHARS_PER_MESSAGE}` });
        }

        totalChars += content.length;
        if (totalChars > MAX_TOTAL_CHARS) {
            return res.status(400).json({ message: `Conversation too long. Max total chars: ${MAX_TOTAL_CHARS}` });
        }
    }

    const systemMessage = messages.find((m) => m?.role === 'system');
    const conversationMessages = messages.filter((m) => m?.role !== 'system');

    const contents = conversationMessages.map((m) => ({
        role: m?.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m?.content || '') }]
    }));

    const requestBody = {
        contents,
        generationConfig: {
            temperature: GEMINI_TEMPERATURE,
            maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
            response_mime_type: jsonMode ? 'application/json' : 'text/plain'
        }
    };

    if (systemMessage?.content) {
        requestBody.systemInstruction = {
            parts: [{ text: systemMessage.content }]
        };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            if (response.status === 429) {
                return res.status(429).json({
                    message: 'La IA esta temporalmente sin cupo. Intenta mas tarde.'
                });
            }

            return res.status(502).json({ message: 'No pudimos procesar la consulta en este momento.' });
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            return res.status(502).json({ message: 'Invalid response from Gemini' });
        }

        return res.status(200).json({ text });
    } catch {
        return res.status(500).json({ message: 'Unexpected server error' });
    }
}
