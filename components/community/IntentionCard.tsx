import React from 'react';
import type { ReactionCounts, UserReactions } from '../../services/communityReactions';
import { ReactionBar } from './ReactionBar';
import { BORDER, CREMA, TEXT_MUTED, formatRelativeTime, themeConfig, type ThemeKey } from './types';

export interface CardIntention {
  id: string;
  text: string;
  authorName?: string;
  theme: ThemeKey;
  timestamp: Date;
  commentsCount: number;
  reactionCounts: ReactionCounts;
  userReactions: UserReactions;
}

interface Props {
  intention: CardIntention;
  index?: number;
  onOpen: (id: string) => void;
  onReactionChange: (id: string, next: { counts: ReactionCounts; active: UserReactions }) => void;
}

export const IntentionCard: React.FC<Props> = ({ intention, index = 0, onOpen, onReactionChange }) => {
  const cfg = themeConfig(intention.theme);
  const initial = (intention.authorName || '?').trim().charAt(0).toUpperCase();
  const isAnon = !intention.authorName || intention.authorName === 'Anónimo';

  const animationDelay = Math.min(index, 7) * 50;

  return (
    <div
      onClick={() => onOpen(intention.id)}
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        cursor: 'pointer',
        transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
        opacity: 0,
        animation: `community-card-enter 400ms ease-out ${animationDelay}ms forwards`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = BORDER;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: isAnon
              ? `linear-gradient(135deg, rgba(${cfg.rgb},0.25), rgba(${cfg.rgb},0.08))`
              : `rgba(${cfg.rgb},0.15)`,
            border: `1px solid rgba(${cfg.rgb},0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isAnon ? (
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: cfg.color, fontVariationSettings: "'wght' 300" }}>spa</span>
          ) : (
            <span style={{ fontFamily: '"Outfit", sans-serif', fontSize: 14, fontWeight: 600, color: cfg.color }}>{initial}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 14, fontWeight: 500, color: '#C8BFB0', margin: 0 }}>
            {intention.authorName || 'Alma Anónima'}
          </p>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 11, color: '#4A4840', margin: 0 }}>
            {formatRelativeTime(intention.timestamp)}
          </p>
        </div>
        <span style={{
          fontFamily: '"Outfit", sans-serif', fontSize: 9, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: cfg.color,
          flexShrink: 0,
        }}>{cfg.label}</span>
      </div>

      {/* Texto preview */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <p
          style={{
            fontFamily: '"Outfit", sans-serif', fontSize: 14, color: CREMA,
            lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >{intention.text}</p>
      </div>

      {/* ReactionBar + comments count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <ReactionBar
          intentionId={intention.id}
          counts={intention.reactionCounts}
          active={intention.userReactions}
          onChange={(next) => onReactionChange(intention.id, next)}
        />
        {intention.commentsCount > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: TEXT_MUTED, fontFamily: '"Outfit", sans-serif', fontSize: 12,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'wght' 300" }}>chat_bubble_outline</span>
            {intention.commentsCount}
          </span>
        )}
      </div>
    </div>
  );
};
