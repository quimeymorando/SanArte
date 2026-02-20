const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_MAX_OUTPUT_TOKENS = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 2048);
const GEMINI_TEMPERATURE = Number(process.env.GEMINI_TEMPERATURE || 0.7);

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 25;
const rateLimitStore = new Map();

const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }
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
    return true;
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ message: 'Gemini API key is not configured' });
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ message: 'Too many requests. Try again in a minute.' });
    }

    const { messages, jsonMode = false } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: 'Invalid messages payload' });
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
            const errorData = await response.json().catch(() => ({}));
            const upstream = String(errorData?.error?.message || response.statusText || 'Gemini API error');

            if (response.status === 429) {
                return res.status(429).json({
                    message: 'La IA esta temporalmente sin cupo. Intenta mas tarde.',
                    upstream
                });
            }

            return res.status(response.status).json({ message: upstream });
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            return res.status(502).json({ message: 'Invalid response from Gemini' });
        }

        return res.status(200).json({ text });
    } catch (error) {
        return res.status(500).json({ message: error?.message || 'Unexpected server error' });
    }
}
