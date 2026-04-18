import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { webhookPayloadSchema, validateBody } from './lib/schemas.js';
import { logRequest, logger } from './lib/logger.js';
import { emailService } from './lib/emailService.js';

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

// Grace period of 3 days for failed payments before revoking access
const PAYMENT_FAILED_EVENTS = new Set([
    'subscription_payment_failed'
]);

const TRIAL_STARTED_EVENTS = new Set([
    'subscription_trial_started'
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
    logRequest(req, res, { route: 'webhook' });

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

        const parsedPayload = parsePayload(rawPayload, req.body);
        if (!parsedPayload) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        const validation = validateBody(webhookPayloadSchema, parsedPayload);
        if (!validation.ok) {
            return res.status(400).json({ message: validation.error });
        }

        const body = validation.data;

        // Replay protection: reject events older than 5 minutes
        if (body.meta.created_at) {
            const eventTime = new Date(body.meta.created_at).getTime();
            if (!isNaN(eventTime) && Date.now() - eventTime > 5 * 60 * 1000) {
                return res.status(400).json({ message: 'Event too old (replay rejected)' });
            }
        }

        const eventName = body.meta.event_name;
        const email = body.data.attributes.user_email.trim().toLowerCase();

        const isKnownEvent = PREMIUM_ON_EVENTS.has(eventName)
            || PREMIUM_OFF_EVENTS.has(eventName)
            || PAYMENT_FAILED_EVENTS.has(eventName)
            || TRIAL_STARTED_EVENTS.has(eventName);

        if (!isKnownEvent) {
            return res.status(200).json({ received: true, ignored: true });
        }

        if (!email) {
            return res.status(400).json({ message: 'No email in payload' });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Handle payment failure: set grace period (3 days), keep premium active
        if (PAYMENT_FAILED_EVENTS.has(eventName)) {
            const gracePeriodEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, name')
                .eq('email', email)
                .maybeSingle();
            if (profile?.id) {
                await supabase
                    .from('profiles')
                    .update({ premium_grace_until: gracePeriodEnd })
                    .eq('id', profile.id);
                // Fire-and-forget: don't await to avoid delaying the response
                emailService.sendPaymentFailed(email, profile.name).catch(() => {});
            }
            logger.info('Payment failed — grace period set', { email });
            return res.status(200).json({ received: true, action: 'grace_period_set' });
        }

        // Handle trial start: record trial end date from Lemon Squeezy payload
        if (TRIAL_STARTED_EVENTS.has(eventName)) {
            const trialEndsAt = body.data.attributes.trial_ends_at || null;
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .maybeSingle();
            if (profile?.id && trialEndsAt) {
                await supabase
                    .from('profiles')
                    .update({ is_premium: true, trial_ends_at: trialEndsAt })
                    .eq('id', profile.id);
            }
            return res.status(200).json({ received: true, action: 'trial_started' });
        }

        const shouldBePremium = PREMIUM_ON_EVENTS.has(eventName);

        // Fetch name before updating for email personalization
        const { data: profileForEmail } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('email', email)
            .maybeSingle();

        const result = await updatePremiumStatus(supabase, email, shouldBePremium);
        if (!result.ok) {
            return res.status(result.status).json({ message: result.message });
        }

        // Trigger emails fire-and-forget
        const userName = profileForEmail?.name || undefined;
        if (eventName === 'subscription_created') {
            emailService.sendPremiumActivated(email, userName).catch(() => {});
        }

        logger.info('Webhook processed', { event: eventName, email, isPremium: shouldBePremium });
        return res.status(200).json({ received: true });
    } catch {
        return res.status(500).json({ message: 'Webhook processing failed' });
    }
}
