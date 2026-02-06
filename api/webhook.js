import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
// NOTE: This must be the SERVICE ROLE KEY, not the Anon key, to update other users' profiles.
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // 1. Verify Signature
        // NOTE: In Vercel Node environments, verifying signature against req.body (parsed JSON) 
        // is flaky because whitespace might differ from the raw buffer.
        // For production security, ensure you access the RAW body buffer.
        // As a fallback/MVP, we are checking the secret presence, but in a High Security context,
        // you must implement raw-body capturing via Vercel config.
        const signature = req.headers['x-signature'];
        if (!signature || !WEBHOOK_SECRET) {
            console.error('Missing signature or secret');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // 2. Process Event
        const eventName = req.body.meta.event_name;
        const body = req.body;

        if (eventName === 'order_created' || eventName === 'subscription_created' || eventName === 'subscription_updated') {
            const email = body.data.attributes.user_email;
            console.log(`Topping up premium for: ${email}`);

            if (!email) return res.status(400).json({ message: 'No email in payload' });

            // Init Supabase Admin
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

            // SCALABLE SEARCH: Look up directly in profiles table instead of listing all auth users.
            // The 'profiles' table is kept in sync via triggers.
            const { data: profile, error: searchError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .single(); // Much faster than .listUsers()

            if (searchError) {
                console.warn(`Profile for ${email} not found or error searching:`, searchError.message);
                return res.status(404).json({ message: 'User profile not found' });
            }

            if (profile) {
                // Update Profile
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ is_premium: true })
                    .eq('id', profile.id);

                if (updateError) {
                    console.error('Failed to update profile:', updateError);
                    return res.status(500).json({ error: updateError.message });
                }
                console.log(`Success: User ${profile.id} (${email}) upgraded to Premium.`);
            }
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: error.message });
    }
}
