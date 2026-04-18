import { z } from 'zod';

// --- Gemini API ---
const messageSchema = z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1, 'Empty message content').max(4000, 'Message too long')
});

export const geminiRequestSchema = z.object({
    messages: z.array(messageSchema).min(1, 'No messages').max(20, 'Too many messages'),
    jsonMode: z.boolean().default(false)
}).strict();

// --- Webhook Lemon Squeezy ---
export const webhookPayloadSchema = z.object({
    meta: z.object({
        event_name: z.string().min(1),
        created_at: z.string().optional()
    }),
    data: z.object({
        attributes: z.object({
            user_email: z.string().email()
        }).passthrough()
    }).passthrough()
}).passthrough();

// --- Account Delete ---
export const accountDeleteSchema = z.object({
    confirmPhrase: z.literal('DELETE_MY_ACCOUNT')
});

// --- Validation helper ---
export const validateBody = (schema, body) => {
    const result = schema.safeParse(body);
    if (!result.success) {
        const firstError = (result.error.issues ?? result.error.errors ?? [])[0];
        return { ok: false, error: firstError?.message || 'Invalid input', data: null };
    }
    return { ok: true, error: null, data: result.data };
};
