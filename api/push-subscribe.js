/**
 * POST /api/push-subscribe
 *
 * Stores a Web Push subscription for a user.
 * The subscription is used to send re-engagement notifications
 * to users who have been inactive for 3+ days.
 *
 * Body: PushSubscription JSON (endpoint, keys.p256dh, keys.auth)
 * Auth: Bearer token (Supabase JWT) required
 */

import { createClient } from '@supabase/supabase-js';
import { logger, logRequest } from './lib/logger.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  logRequest(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate user
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Validate subscription payload
  const { endpoint, keys } = req.body ?? {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Invalid push subscription payload' });
  }

  // Upsert push subscription in profiles table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      push_endpoint: endpoint,
      push_p256dh: keys.p256dh,
      push_auth: keys.auth,
      push_subscribed_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    logger.error('push-subscribe: DB update failed', { error: updateError.message, userId: user.id });
    return res.status(500).json({ error: 'Failed to store subscription' });
  }

  logger.info('push-subscribe: stored subscription', { userId: user.id });
  return res.status(200).json({ ok: true });
}
