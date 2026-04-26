import React, { useEffect, useRef, useState } from 'react';
import {
  toggleReaction,
  type ReactionCounts,
  type ReactionType,
  type UserReactions,
} from '../../services/communityReactions';
import { logger } from '../../utils/logger';
import { REACTIONS } from './types';

interface Props {
  intentionId: string;
  counts: ReactionCounts;
  active: UserReactions;
  size?: 'sm' | 'md';
  onChange?: (next: { counts: ReactionCounts; active: UserReactions }) => void;
}

const TOOLTIP_MS = 1500;

export const ReactionBar: React.FC<Props> = ({ intentionId, counts, active, size = 'sm', onChange }) => {
  const [bloomKey, setBloomKey] = useState<Record<ReactionType, number>>({
    love: 0, hug: 0, accompany: 0, reverence: 0,
  });
  const [busy, setBusy] = useState<Record<ReactionType, boolean>>({
    love: false, hug: false, accompany: false, reverence: false,
  });
  const [tooltip, setTooltip] = useState<ReactionType | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
  }, []);

  const showTooltip = (type: ReactionType) => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setTooltip(type);
    tooltipTimerRef.current = setTimeout(() => setTooltip(null), TOOLTIP_MS);
  };

  const iconSize = size === 'md' ? 22 : 18;
  const fontSize = size === 'md' ? 13 : 12;
  const gap = size === 'md' ? 22 : 16;

  const handle = async (e: React.MouseEvent, type: ReactionType) => {
    e.stopPropagation();
    if (busy[type]) return;

    showTooltip(type);

    const prevActive = active[type];
    const prevCount = counts[type];
    const nextActive = !prevActive;
    const nextCount = prevCount + (nextActive ? 1 : -1);

    setBloomKey((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    setBusy((prev) => ({ ...prev, [type]: true }));

    // Optimistic
    const optimisticCounts = { ...counts, [type]: Math.max(0, nextCount) };
    const optimisticActive = { ...active, [type]: nextActive };
    onChange?.({ counts: optimisticCounts, active: optimisticActive });

    try {
      const result = await toggleReaction(intentionId, type);
      onChange?.({
        counts: { ...optimisticCounts, [type]: result.totalCount },
        active: { ...optimisticActive, [type]: result.active },
      });
    } catch (err) {
      logger.error('Reaction toggle failed:', err);
      onChange?.({
        counts: { ...counts, [type]: prevCount },
        active: { ...active, [type]: prevActive },
      });
    } finally {
      setBusy((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div style={{ display: 'flex', gap, alignItems: 'center', flexWrap: 'wrap' }}>
      {REACTIONS.map((r) => {
        const isActive = active[r.type];
        const c = counts[r.type] || 0;
        const showThisTooltip = tooltip === r.type;
        return (
          <span key={r.type} style={{ position: 'relative', display: 'inline-flex' }}>
            <button
              onClick={(e) => handle(e, r.type)}
              aria-label={r.label}
              title={r.label}
              disabled={busy[r.type]}
              style={{
                background: 'none',
                border: 'none',
                cursor: busy[r.type] ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: 0,
                fontFamily: '"Outfit", sans-serif',
                fontSize,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? r.color : 'rgba(255,255,255,0.35)',
                transition: 'color 0.2s',
              }}
            >
              <span
                key={`bloom-${bloomKey[r.type]}`}
                className="material-symbols-outlined"
                style={{
                  fontSize: iconSize,
                  fontVariationSettings: isActive ? "'wght' 400, 'FILL' 1" : "'wght' 300",
                  color: isActive ? r.color : 'rgba(255,255,255,0.35)',
                  filter: isActive ? `drop-shadow(0 0 6px rgba(${r.rgb},0.5))` : 'none',
                  animation: bloomKey[r.type] > 0 ? 'community-reaction-bloom 300ms ease-out' : undefined,
                  lineHeight: 1,
                }}
              >
                {r.icon}
              </span>
              {c > 0 && <span>{c}</span>}
            </button>

            {showThisTooltip && (
              <span
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '4px 10px',
                  borderRadius: 8,
                  background: 'rgba(6,13,27,0.95)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: 11,
                  color: '#E8E0D0',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 5,
                  animation: 'community-tooltip-in 200ms ease-out',
                }}
              >
                {r.label}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};
