// TEMPORARY DEBUG ENDPOINT — remove after provider diagnosis
// Auth: header "x-debug-key" must match DEBUG_KEY below

const DEBUG_KEY = 'sanarte-debug-2026';

const ALLOWED_ORIGIN = 'https://sanarte.vercel.app';

const envPresent = (name) => {
    const v = process.env[name];
    return typeof v === 'string' && v.trim().length > 0;
};

const envLength = (name) => {
    const v = process.env[name];
    return typeof v === 'string' ? v.length : 0;
};

async function pingGemini(model, apiKey) {
    if (!apiKey) return { ok: false, status: 0, error: 'no_api_key' };
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
            let errorBody = '';
            try {
                const j = await response.json();
                errorBody = j?.error?.status || j?.error?.message || '';
            } catch {
                errorBody = await response.text().catch(() => '');
            }
            return {
                ok: false,
                status: response.status,
                error: String(errorBody).slice(0, 200),
            };
        }
        return { ok: true, status: response.status, model };
    } catch (err) {
        return { ok: false, status: 0, error: err?.message || 'fetch_failed' };
    }
}

async function pingGroq(apiKey) {
    if (!apiKey) return { ok: false, status: 0, error: 'no_api_key' };
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'ping' }],
                max_tokens: 1,
            }),
        });
        if (!response.ok) {
            let errorBody = '';
            try {
                const j = await response.json();
                errorBody = j?.error?.code || j?.error?.type || j?.error?.message || '';
            } catch {
                errorBody = await response.text().catch(() => '');
            }
            return {
                ok: false,
                status: response.status,
                error: String(errorBody).slice(0, 200),
            };
        }
        return { ok: true, status: response.status, model: 'llama-3.3-70b-versatile' };
    } catch (err) {
        return { ok: false, status: 0, error: err?.message || 'fetch_failed' };
    }
}

async function pingOpenRouter(apiKey) {
    if (!apiKey) return { ok: false, status: 0, error: 'no_api_key' };
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'HTTP-Referer': ALLOWED_ORIGIN,
                'X-Title': 'SanArte Debug',
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [{ role: 'user', content: 'ping' }],
                max_tokens: 1,
            }),
        });
        if (!response.ok) {
            let errorBody = '';
            try {
                const j = await response.json();
                errorBody = j?.error?.code || j?.error?.message || '';
            } catch {
                errorBody = await response.text().catch(() => '');
            }
            return {
                ok: false,
                status: response.status,
                error: String(errorBody).slice(0, 200),
            };
        }
        return { ok: true, status: response.status, model: 'meta-llama/llama-3.3-70b-instruct:free' };
    } catch (err) {
        return { ok: false, status: 0, error: err?.message || 'fetch_failed' };
    }
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-debug-key');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const debugKey = req.headers['x-debug-key'];
    const providedKey = Array.isArray(debugKey) ? debugKey[0] : debugKey;
    if (providedKey !== DEBUG_KEY) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const envVars = {
        GEMINI_API_KEY: envPresent('GEMINI_API_KEY'),
        GEMINI_API_KEY_2: envPresent('GEMINI_API_KEY_2'),
        GEMINI_API_KEY_3: envPresent('GEMINI_API_KEY_3'),
        GROQ_API_KEY: envPresent('GROQ_API_KEY'),
        OPENROUTER_API_KEY: envPresent('OPENROUTER_API_KEY'),
    };

    const envVarLengths = {
        GEMINI_API_KEY: envLength('GEMINI_API_KEY'),
        GEMINI_API_KEY_2: envLength('GEMINI_API_KEY_2'),
        GEMINI_API_KEY_3: envLength('GEMINI_API_KEY_3'),
        GROQ_API_KEY: envLength('GROQ_API_KEY'),
        OPENROUTER_API_KEY: envLength('OPENROUTER_API_KEY'),
    };

    const [gemini_key_1, gemini_key_2, gemini_key_3, gemini_flash_latest, groq, openrouter] = await Promise.all([
        pingGemini('gemini-2.0-flash', process.env.GEMINI_API_KEY),
        pingGemini('gemini-2.0-flash', process.env.GEMINI_API_KEY_2),
        pingGemini('gemini-2.0-flash', process.env.GEMINI_API_KEY_3),
        pingGemini('gemini-flash-latest', process.env.GEMINI_API_KEY),
        pingGroq(process.env.GROQ_API_KEY),
        pingOpenRouter(process.env.OPENROUTER_API_KEY),
    ]);

    const providerTests = {
        gemini_key_1,
        gemini_key_2,
        gemini_key_3,
        gemini_flash_latest,
        groq,
        openrouter,
    };

    return res.status(200).json({ envVars, envVarLengths, providerTests });
}
