import React from 'react';
import { GOLD, GOLD_GRAD, NAVY } from './types';

interface Props {
  onCompose: () => void;
}

export const EmptyState: React.FC<Props> = ({ onCompose }) => (
  <div style={{ textAlign: 'center', padding: '80px 24px 40px' }}>
    {/* Loto/mandala SVG sutil */}
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      style={{ margin: '0 auto 24px', display: 'block', opacity: 0.6 }}
    >
      <g stroke={GOLD} strokeWidth="0.8" fill="none" opacity="0.7">
        <circle cx="48" cy="48" r="36" />
        <circle cx="48" cy="48" r="24" />
        <ellipse cx="48" cy="32" rx="6" ry="14" />
        <ellipse cx="48" cy="64" rx="6" ry="14" />
        <ellipse cx="32" cy="48" rx="14" ry="6" />
        <ellipse cx="64" cy="48" rx="14" ry="6" />
        <ellipse cx="36" cy="36" rx="6" ry="14" transform="rotate(-45 36 36)" />
        <ellipse cx="60" cy="36" rx="6" ry="14" transform="rotate(45 60 36)" />
        <ellipse cx="36" cy="60" rx="6" ry="14" transform="rotate(45 36 60)" />
        <ellipse cx="60" cy="60" rx="6" ry="14" transform="rotate(-45 60 60)" />
      </g>
      <circle cx="48" cy="48" r="3" fill={GOLD} opacity="0.8" />
    </svg>

    <p
      style={{
        fontFamily: '"Playfair Display", serif',
        fontSize: 20,
        fontStyle: 'italic',
        fontWeight: 300,
        color: '#E8E0D0',
        margin: '0 0 6px',
      }}
    >
      Sé la primera chispa.
    </p>
    <p
      style={{
        fontFamily: '"Outfit", sans-serif',
        fontSize: 13,
        color: '#6A6460',
        margin: '0 0 28px',
      }}
    >
      Compartí lo que llega.
    </p>

    <button
      onClick={onCompose}
      style={{
        background: GOLD_GRAD,
        color: NAVY,
        border: 'none',
        borderRadius: 999,
        padding: '12px 24px',
        fontFamily: '"Outfit", sans-serif',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(201,168,76,0.2)',
      }}
    >
      Compartir mi intención
    </button>
  </div>
);
