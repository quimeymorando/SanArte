import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

const PREMIUM_ON_EVENTS = new Set([
    'order_created',
    'subscription_created',
    'subscription_updated'
]);

const PREMIUM_OFF_EVENTS = new Set([
    'subscription_expired',
    'subscription_cancelled',
    'subscription_paused'
]);

const getHeaderValue = (headerValue) => {
    if (Array.isArray(headerValue)) return headerValue[0] || '';
    return typeof headerValue === 'string' ? headerValue : '';
};

const verifyWebhookSignature = (signatureHeader, payload) => {
    if (!signatureHeader || !WEBHOOK_SECRET) return false;

    const normalized = signatureHeader.startsWith('sha256=')
        ? signatureHeader.slice('sha256='.length)
        : signatureHeader;

    if (!/^[a-fA-F0-9]+$/.test(normalized)) return false;

    const expected = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

    const expectedBuffer = Buffer.from(expected, 'hex');
    const receivedBuffer = Buffer.from(normalized, 'hex');

    if (expectedBuffer.length !== receivedBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

const parsePayload = (rawPayload, bodyValue) => {
    if (bodyValue && typeof bodyValue === 'object' && !Buffer.isBuffer(bodyValue)) {
        return bodyValue;
    }

    try {
        return JSON.parse(rawPayload);
    } catch {
        return null;
    }
};

const updatePremiumStatus = async (supabase, email, isPremium) => {
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (profileError) {
        return { ok: false, status: 500, message: 'Failed to resolve user profile' };
    }

    if (!profile?.id) {
        return { ok: false, status: 404, message: 'User profile not found' };
    }

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_premium: isPremium })
        .eq('id', profile.id);

    if (updateError) {
        return { ok: false, status: 500, message: 'Failed to update user premium status' };
    }

    return { ok: true, status: 200, message: 'Updated' };
};

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !WEBHOOK_SECRET) {
        return res.status(500).json({ message: 'Server misconfigured' });
    }

    try {
        const signature = getHeaderValue(req.headers['x-signature']) || getHeaderValue(req.headers['x-signature-sha256']);

        const rawPayload = typeof req.body === 'string'
            ? req.body
            : Buffer.isBuffer(req.body)
                ? req.body.toString('utf8')
                : Buffer.isBuffer(req.rawBody)
                    ? req.rawBody.toString('utf8')
                    : JSON.stringify(req.body || {});

        if (!verifyWebhookSignature(signature, rawPayload)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const body = parsePayload(rawPayload, req.body);
        if (!body) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        const eventName = String(body?.meta?.event_name || '');
        const email = String(body?.data?.attributes?.user_email || '').trim().toLowerCase();

        if (!eventName) {
            return res.status(400).json({ message: 'Invalid event name' });
        }

        if (!PREMIUM_ON_EVENTS.has(eventName) && !PREMIUM_OFF_EVENTS.has(eventName)) {
            return res.status(200).json({ received: true, ignored: true });
        }

        if (!email) {
            return res.status(400).json({ message: 'No email in payload' });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const shouldBePremium = PREMIUM_ON_EVENTS.has(eventName);

        const result = await updatePremiumStatus(supabase, email, shouldBePremium);
        if (!result.ok) {
            return res.status(result.status).json({ message: result.message });
        }

        return res.status(200).json({ received: true });
    } catch {
        return res.status(500).json({ message: 'Webhook processing failed' });
    }
}
