/**
 * Transactional email service via Resend (https://resend.com).
 * Falls back gracefully if RESEND_API_KEY is not configured —
 * emails are logged in dev but silently skipped in prod.
 *
 * Setup: add RESEND_API_KEY to your Vercel environment variables.
 * Domain: configure your sending domain in Resend dashboard.
 */

import { logger } from './logger.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'SanArte <hola@sanarte.app>';
const BASE_URL   = process.env.APP_URL    || 'https://sanarte-two.vercel.app';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Core send function using Resend REST API (no SDK dependency needed).
 */
const sendEmail = async ({ to, subject, html }) => {
    if (!RESEND_API_KEY) {
        logger.warn('Email skipped — RESEND_API_KEY not configured', { to, subject });
        return { ok: false, reason: 'not_configured' };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
        });

        if (!response.ok) {
            const error = await response.text();
            logger.error('Resend API error', { to, subject, status: response.status, error });
            return { ok: false, reason: 'api_error' };
        }

        const data = await response.json();
        logger.info('Email sent', { to, subject, id: data.id });
        return { ok: true, id: data.id };
    } catch (err) {
        logger.error('Email send failed', { to, subject, error: err?.message });
        return { ok: false, reason: 'network_error' };
    }
};

// ── Email Templates ──────────────────────────────────────────────────────────

const baseWrapper = (content) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SanArte</title>
  <style>
    body { margin: 0; padding: 0; background: #050b0d; font-family: system-ui, sans-serif; }
    .wrap { max-width: 560px; margin: 40px auto; background: #0a1114; border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.07); overflow: hidden; }
    .header { background: linear-gradient(135deg, #00c6e0 0%, #6c00ff 100%);
              padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #fff; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
    .header p  { margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 13px; }
    .body { padding: 40px; color: #d1d5db; line-height: 1.7; font-size: 15px; }
    .body h2 { color: #fff; font-size: 20px; margin: 0 0 12px; }
    .cta { display: inline-block; margin: 24px 0; padding: 16px 40px;
           background: linear-gradient(135deg, #00f2ff, #7c3aed);
           color: #fff; font-weight: 900; font-size: 15px; text-decoration: none;
           border-radius: 14px; letter-spacing: 0.5px; }
    .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.05);
              text-align: center; color: #4b5563; font-size: 11px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,242,255,0.08);
             border: 1px solid rgba(0,242,255,0.2); color: #00f2ff; font-size: 11px;
             font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
             padding: 6px 14px; border-radius: 100px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>✨ SanArte</h1>
      <p>Tu guía de autosanación emocional</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} SanArte · <a href="${BASE_URL}/privacy" style="color:#4b5563">Privacidad</a> ·
      <a href="${BASE_URL}/terms" style="color:#4b5563">Términos</a>
    </div>
  </div>
</body>
</html>`;

// ── Public API ────────────────────────────────────────────────────────────────

export const emailService = {
    /**
     * Welcome email sent when a new user registers.
     */
    sendWelcome: (to, name = 'Sanador') =>
        sendEmail({
            to,
            subject: '✨ Bienvenido a SanArte — Tu viaje de autosanación comienza',
            html: baseWrapper(`
              <div class="badge">✨ Nuevo miembro</div>
              <h2>Hola, ${name}!</h2>
              <p>Estamos felices de que te hayas unido a nuestra comunidad de sanadores. SanArte es tu espacio seguro para explorar el mensaje emocional detrás de tus síntomas.</p>
              <p>Empieza buscando un síntoma que estés experimentando hoy:</p>
              <a href="${BASE_URL}/home" class="cta">Comenzar mi sanación →</a>
              <p style="font-size:13px;color:#6b7280">Consejo: Agrega SanArte a tu pantalla de inicio para tener acceso rápido cada día. 🌿</p>
            `),
        }),

    /**
     * Premium activation — sent when subscription_created webhook fires.
     */
    sendPremiumActivated: (to, name = 'Sanador') =>
        sendEmail({
            to,
            subject: '🌟 ¡Tu membresía Premium está activa!',
            html: baseWrapper(`
              <div class="badge">🌟 Loto Dorado</div>
              <h2>¡Bienvenido al camino premium, ${name}!</h2>
              <p>Tu membresía <strong>Sanador Premium</strong> está activa. Ahora tenés acceso completo a:</p>
              <ul style="color:#9ca3af;margin:16px 0;padding-left:20px">
                <li style="margin-bottom:8px">Búsquedas y mensajes <strong style="color:#fff">ilimitados</strong></li>
                <li style="margin-bottom:8px">Meditaciones guiadas con voz de IA</li>
                <li style="margin-bottom:8px">Guía de Arcángeles y remedios naturales</li>
                <li style="margin-bottom:8px">Sin publicidad</li>
              </ul>
              <a href="${BASE_URL}/home" class="cta">Explorar mi premium →</a>
            `),
        }),

    /**
     * Streak milestone — sent at 7, 30, 100 days.
     */
    sendStreakMilestone: (to, name = 'Sanador', streakDays) =>
        sendEmail({
            to,
            subject: `🔥 ¡${streakDays} días de racha! Eres imparable, ${name}`,
            html: baseWrapper(`
              <div class="badge">🔥 ${streakDays} días de racha</div>
              <h2>¡Increíble constancia, ${name}!</h2>
              <p>Llevas <strong style="color:#00f2ff">${streakDays} días consecutivos</strong> en tu camino de autosanación. Eso es una transformación real.</p>
              <p>Tu cuerpo y tu alma están respondiendo. Sigue escuchando sus mensajes.</p>
              <a href="${BASE_URL}/home" class="cta">Continuar mi racha →</a>
            `),
        }),

    /**
     * Subscription expiring soon — sent 3 days before renewal.
     */
    sendSubscriptionExpiringSoon: (to, name = 'Sanador', expiresAt) => {
        const date = expiresAt ? new Date(expiresAt).toLocaleDateString('es-AR', {
            day: 'numeric', month: 'long', year: 'numeric'
        }) : 'pronto';
        return sendEmail({
            to,
            subject: `⏰ Tu membresía Premium vence el ${date}`,
            html: baseWrapper(`
              <div class="badge">⏰ Renovación próxima</div>
              <h2>Tu premium vence pronto, ${name}</h2>
              <p>Tu membresía <strong>Sanador Premium</strong> se renueva el <strong style="color:#fff">${date}</strong>.</p>
              <p>Si querés continuar con acceso ilimitado asegurate de que tu método de pago esté actualizado.</p>
              <a href="${BASE_URL}/upgrade" class="cta">Revisar mi suscripción →</a>
            `),
        });
    },

    /**
     * Payment failed — sent when subscription_payment_failed fires.
     */
    sendPaymentFailed: (to, name = 'Sanador') =>
        sendEmail({
            to,
            subject: '⚠️ Problema con tu pago — Acción requerida',
            html: baseWrapper(`
              <div class="badge" style="color:#f59e0b;border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.08)">⚠️ Pago fallido</div>
              <h2>Tuvimos un problema con tu pago, ${name}</h2>
              <p>No pudimos procesar el pago de tu membresía Premium. Tenés <strong style="color:#fff">3 días</strong> de gracia antes de que tu acceso sea suspendido.</p>
              <p>Por favor actualizá tu método de pago para mantener tu acceso sin interrupciones:</p>
              <a href="${BASE_URL}/upgrade" class="cta">Actualizar mi pago →</a>
              <p style="font-size:13px;color:#6b7280">Si creés que esto es un error, respondé este email y te ayudamos.</p>
            `),
        }),
};
