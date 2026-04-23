import {
    getServerSystemInstruction,
    hasPromptInjectionAttempt,
    isProductionEnvironment,
    parseAllowedOrigins,
    validateOriginRequest,
} from './securityPolicy.js';
import { geminiRequestSchema, validateBody } from './lib/schemas.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_KEY_2 = process.env.GEMINI_API_KEY_2;
const GEMINI_API_KEY_3 = process.env.GEMINI_API_KEY_3;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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
const MAX_REQUESTS_PER_WINDOW = 200;
const MAX_REQUEST_BYTES = 60_000;
const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 4000;
const MAX_TOTAL_CHARS = 15000;

const rateLimitStore = new Map();

const rawOrigins = process.env.ALLOWED_ORIGINS ||
  'https://sanarte.vercel.app,https://sanarte-two.vercel.app';
const allowedOrigins = parseAllowedOrigins(rawOrigins);
const isProduction = isProductionEnvironment();

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

// ═══════════════════════════════════════════════════════
// Provider helpers — cascada de fallback
// ═══════════════════════════════════════════════════════

const buildOpenAIStyleMessages = (messages, systemInstruction) => {
    const out = [];
    if (systemInstruction) {
        out.push({ role: 'system', content: systemInstruction });
    }
    for (const m of messages) {
        if (!m || !isValidRole(m.role)) continue;
        if (m.role === 'system') continue;
        out.push({ role: m.role, content: String(m.content || '') });
    }
    return out;
};

async function callGemini({ messages, jsonMode, systemInstruction, model, apiKey }) {
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
        },
        systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const err = new Error(`${model} returned ${response.status}`);
        err.status = response.status;
        err.provider = model;
        throw err;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error(`${model} returned empty response`);
    return text;
}

async function callGroq({ messages, jsonMode, systemInstruction, apiKey }) {
    const body = {
        model: 'llama-3.3-70b-versatile',
        messages: buildOpenAIStyleMessages(messages, systemInstruction),
        temperature: GEMINI_TEMPERATURE,
        max_tokens: GEMINI_MAX_OUTPUT_TOKENS,
    };
    if (jsonMode) body.response_format = { type: 'json_object' };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const err = new Error(`Groq returned ${response.status}`);
        err.status = response.status;
        err.provider = 'groq';
        throw err;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Groq returned empty response');
    return text;
}

async function callOpenRouter({ messages, jsonMode, systemInstruction, apiKey }) {
    const body = {
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: buildOpenAIStyleMessages(messages, systemInstruction),
        temperature: GEMINI_TEMPERATURE,
        max_tokens: GEMINI_MAX_OUTPUT_TOKENS,
    };
    if (jsonMode) body.response_format = { type: 'json_object' };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://sanarte.vercel.app',
            'X-Title': 'SanArte',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const err = new Error(`OpenRouter returned ${response.status}`);
        err.status = response.status;
        err.provider = 'openrouter';
        throw err;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenRouter returned empty response');
    return text;
}

const PROVIDERS = [
    {
        name: 'gemini-2.0-flash-key1',
        enabled: !!GEMINI_API_KEY,
        run: (ctx) => callGemini({ ...ctx, model: 'gemini-2.0-flash', apiKey: GEMINI_API_KEY }),
    },
    {
        name: 'gemini-2.0-flash-key2',
        enabled: !!GEMINI_API_KEY_2,
        run: (ctx) => callGemini({ ...ctx, model: 'gemini-2.0-flash', apiKey: GEMINI_API_KEY_2 }),
    },
    {
        name: 'gemini-2.0-flash-key3',
        enabled: !!GEMINI_API_KEY_3,
        run: (ctx) => callGemini({ ...ctx, model: 'gemini-2.0-flash', apiKey: GEMINI_API_KEY_3 }),
    },
    {
        name: 'gemini-1.5-flash',
        enabled: !!GEMINI_API_KEY,
        run: (ctx) => callGemini({ ...ctx, model: 'gemini-1.5-flash', apiKey: GEMINI_API_KEY }),
    },
    {
        name: 'groq-llama-3.3-70b',
        enabled: !!GROQ_API_KEY,
        run: (ctx) => callGroq({ ...ctx, apiKey: GROQ_API_KEY }),
    },
    {
        name: 'openrouter-llama-3.3',
        enabled: !!OPENROUTER_API_KEY,
        run: (ctx) => callOpenRouter({ ...ctx, apiKey: OPENROUTER_API_KEY }),
    },
];

async function generateWithFallback(ctx) {
    const enabledProviders = PROVIDERS.filter((p) => p.enabled);

    if (enabledProviders.length === 0) {
        const err = new Error('No AI providers configured');
        err.status = 500;
        throw err;
    }

    const errors = [];

    for (const provider of enabledProviders) {
        try {
            console.log(`[SanArte] Trying provider: ${provider.name}`);
            const text = await provider.run(ctx);
            console.log(`[SanArte] Success with: ${provider.name}`);
            return { text, provider: provider.name };
        } catch (err) {
            console.warn(`[SanArte] Provider ${provider.name} failed:`, err?.message);
            errors.push({ provider: provider.name, error: err?.message });
            continue;
        }
    }

    const err = new Error('All AI providers failed');
    err.status = 503;
    err.details = errors;
    throw err;
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const origin = getHeaderValue(req.headers.origin);
    const originValidation = validateOriginRequest({ origin, allowedOrigins, isProduction });
    if (!originValidation.ok) {
        return res.status(originValidation.status).json({ message: originValidation.message });
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

    const validation = validateBody(geminiRequestSchema, req.body || {});
    if (!validation.ok) {
        return res.status(400).json({ message: validation.error });
    }

    const { messages, jsonMode } = validation.data;

    if (hasPromptInjectionAttempt(messages)) {
        return res.status(400).json({ message: 'La solicitud incluye instrucciones no permitidas.' });
    }

    let totalChars = 0;
    for (const item of messages) {
        totalChars += item.content.length;
        if (totalChars > MAX_TOTAL_CHARS) {
            return res.status(400).json({ message: `Conversation too long. Max total chars: ${MAX_TOTAL_CHARS}` });
        }
    }

    const systemInstruction = getServerSystemInstruction(jsonMode);

    try {
        const { text, provider } = await generateWithFallback({ messages, jsonMode, systemInstruction });
        return res.status(200).json({ text, provider });
    } catch (err) {
        if (err?.status === 503) {
            return res.status(503).json({
                message: 'Todos los proveedores de IA estan temporalmente no disponibles. Intenta de nuevo en 1 minuto.',
                details: err.details,
            });
        }
        if (err?.status === 500 && err?.message === 'No AI providers configured') {
            return res.status(500).json({ message: 'AI providers are not configured' });
        }
        return res.status(500).json({ message: 'Unexpected server error' });
    }
}
