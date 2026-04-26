import React from 'react';
import { BORDER } from './types';

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(201,168,76,0.06) 50%, rgba(255,255,255,0.03) 100%)',
  backgroundSize: '200% 100%',
  animation: 'community-skeleton-shimmer 1.8s linear infinite',
  borderRadius: 6,
};

export const SkeletonCard: React.FC = () => (
  <div
    style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${BORDER}`,
      borderRadius: 16,
      padding: '24px',
      marginBottom: 16,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ ...shimmerStyle, width: 36, height: 36, borderRadius: '50%' }} />
      <div style={{ flex: 1 }}>
        <div style={{ ...shimmerStyle, width: '40%', height: 12, marginBottom: 6 }} />
        <div style={{ ...shimmerStyle, width: '25%', height: 10 }} />
      </div>
    </div>
    <div style={{ ...shimmerStyle, width: '70%', height: 14, marginBottom: 10 }} />
    <div style={{ ...shimmerStyle, width: '95%', height: 12, marginBottom: 6 }} />
    <div style={{ ...shimmerStyle, width: '85%', height: 12, marginBottom: 6 }} />
    <div style={{ ...shimmerStyle, width: '60%', height: 12, marginBottom: 16 }} />
    <div style={{ display: 'flex', gap: 16 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ ...shimmerStyle, width: 40, height: 18 }} />
      ))}
    </div>
  </div>
);
