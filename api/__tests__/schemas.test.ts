import { describe, it, expect } from 'vitest';
import {
  geminiRequestSchema,
  webhookPayloadSchema,
  accountDeleteSchema,
  validateBody,
} from '../lib/schemas.js';

describe('geminiRequestSchema', () => {
  it('acepta un request válido con un mensaje de usuario', () => {
    const input = {
      messages: [{ role: 'user', content: 'hola' }],
    };
    const result = geminiRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('acepta múltiples mensajes con roles válidos', () => {
    const input = {
      messages: [
        { role: 'system', content: 'Eres un sanador.' },
        { role: 'user', content: '¿Qué significa el dolor de cabeza?' },
        { role: 'assistant', content: 'El dolor de cabeza puede reflejar...' },
      ],
    };
    const result = geminiRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('acepta jsonMode como campo opcional (default false)', () => {
    const input = {
      messages: [{ role: 'user', content: 'hola' }],
      jsonMode: true,
    };
    const result = geminiRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jsonMode).toBe(true);
    }
  });

  it('rechaza messages vacíos', () => {
    const input = { messages: [] };
    const result = geminiRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rechaza content mayor a 4000 caracteres', () => {
    const input = {
      messages: [{ role: 'user', content: 'a'.repeat(4001) }],
    };
    const result = geminiRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rechaza content vacío', () => {
    const input = {
      messages: [{ role: 'user', content: '' }],
    };
    const result = geminiRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rechaza roles inválidos', () => {
    const input = {
      messages: [{ role: 'hacker', content: 'intrusión' }],
    };
    const result = geminiRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rechaza campos extra gracias a strict()', () => {
    const input = {
      messages: [{ role: 'user', content: 'hola' }],
      extraField: 'no debería estar',
    };
    const result = geminiRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rechaza más de 20 mensajes', () => {
    const messages = Array.from({ length: 21 }, (_, i) => ({
      role: 'user' as const,
      content: `mensaje ${i}`,
    }));
    const input = { messages };
    const result = geminiRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe('webhookPayloadSchema', () => {
  const validPayload = {
    meta: { event_name: 'order_created' },
    data: {
      attributes: { user_email: 'sanador@sanarte.app' },
    },
  };

  it('acepta un payload válido con meta.event_name y data.attributes.user_email', () => {
    const result = webhookPayloadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('acepta payload con campos extra gracias a passthrough()', () => {
    const payload = {
      ...validPayload,
      meta: { ...validPayload.meta, created_at: '2025-01-01' },
      data: {
        attributes: {
          user_email: 'test@test.com',
          order_number: 12345,
        },
      },
    };
    const result = webhookPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rechaza payload sin user_email', () => {
    const payload = {
      meta: { event_name: 'order_created' },
      data: { attributes: {} },
    };
    const result = webhookPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('rechaza payload con email inválido', () => {
    const payload = {
      meta: { event_name: 'order_created' },
      data: { attributes: { user_email: 'no-es-email' } },
    };
    const result = webhookPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('rechaza payload sin meta.event_name', () => {
    const payload = {
      meta: {},
      data: { attributes: { user_email: 'test@test.com' } },
    };
    const result = webhookPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe('accountDeleteSchema', () => {
  it('acepta { confirmPhrase: "DELETE_MY_ACCOUNT" }', () => {
    const result = accountDeleteSchema.safeParse({ confirmPhrase: 'DELETE_MY_ACCOUNT' });
    expect(result.success).toBe(true);
  });

  it('rechaza una frase de confirmación diferente', () => {
    const result = accountDeleteSchema.safeParse({ confirmPhrase: 'delete my account' });
    expect(result.success).toBe(false);
  });

  it('rechaza un string vacío', () => {
    const result = accountDeleteSchema.safeParse({ confirmPhrase: '' });
    expect(result.success).toBe(false);
  });

  it('rechaza objeto sin confirmPhrase', () => {
    const result = accountDeleteSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('validateBody', () => {
  it('retorna { ok: true, data } para input válido', () => {
    const input = { confirmPhrase: 'DELETE_MY_ACCOUNT' };
    const result = validateBody(accountDeleteSchema, input);

    expect(result.ok).toBe(true);
    expect(result.error).toBeNull();
    expect(result.data).toEqual(input);
  });

  it('retorna { ok: false, error } para input inválido', () => {
    const input = { confirmPhrase: 'wrong' };
    const result = validateBody(accountDeleteSchema, input);

    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.data).toBeNull();
  });

  it('funciona con geminiRequestSchema — valida mensajes correctamente', () => {
    const validInput = { messages: [{ role: 'user', content: 'hola' }] };
    const result = validateBody(geminiRequestSchema, validInput);

    expect(result.ok).toBe(true);
    expect(result.data.messages).toHaveLength(1);
  });

  it('retorna el primer mensaje de error de Zod', () => {
    const invalidInput = { messages: [] };
    const result = validateBody(geminiRequestSchema, invalidInput);

    expect(result.ok).toBe(false);
    expect(typeof result.error).toBe('string');
    expect(result.error.length).toBeGreaterThan(0);
  });
});
