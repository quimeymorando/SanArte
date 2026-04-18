/**
 * ReEngagementBanner — shown to users who haven't opened the app in 3+ days.
 *
 * Displays a motivational prompt to continue their healing journey.
 * Dismissible for the current session.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEngagementSnapshot } from '../utils/engagement';

interface ReEngagementBannerProps {
  /** Minimum days inactive to show banner. Defaults to 3. */
  inactiveDaysThreshold?: number;
}

export const ReEngagementBanner: React.FC<ReEngagementBannerProps> = ({
  inactiveDaysThreshold = 3,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  const { lastActiveDaysAgo, streakDays } = getEngagementSnapshot();

  if (dismissed) return null;
  if (lastActiveDaysAgo < inactiveDaysThreshold) return null;

  const messages = [
    {
      icon: '🌿',
      title: '¡Te extrañamos!',
      body: `Llevás ${lastActiveDaysAgo} días sin explorar tu bienestar. Cada pequeño paso cuenta.`,
    },
    {
      icon: '✨',
      title: 'Tu camino te espera',
      body: 'Retomá tu práctica de sanación. Tu cuerpo tiene mensajes esperando ser escuchados.',
    },
    {
      icon: '💜',
      title: 'Un momento para vos',
      body: `Tenías ${streakDays > 0 ? `una racha de ${streakDays} días` : 'un gran inicio'}. ¡Dale una nueva oportunidad!`,
    },
  ];

  // Pick a message deterministically based on days inactive
  const msg = messages[lastActiveDaysAgo % messages.length];

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:max-w-sm"
    >
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900/40 p-4 flex items-start gap-3">
        {/* Icon */}
        <span className="text-3xl flex-shrink-0 leading-none mt-0.5" aria-hidden="true">
          {msg.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight">
            {msg.title}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 leading-snug">
            {msg.body}
          </p>

          <button
            onClick={() => {
              setDismissed(true);
              navigate('/search');
            }}
            className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Explorar síntomas →
          </button>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Cerrar notificación"
          className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
        </button>
      </div>
    </div>
  );
};
