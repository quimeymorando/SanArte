import React, { useEffect } from 'react';
import type { ReactionCounts, UserReactions } from '../../services/communityReactions';
import { CommentThread, type ThreadComment } from './CommentThread';
import { ReactionBar } from './ReactionBar';
import { CREMA, PANEL, formatRelativeTime, themeConfig, type ThemeKey } from './types';

export interface DetailIntention {
  id: string;
  text: string;
  authorName?: string;
  theme: ThemeKey;
  timestamp: Date;
  reactionCounts: ReactionCounts;
  userReactions: UserReactions;
  comments: ThreadComment[];
  isUser: boolean;
  user_id?: string;
}

interface Props {
  intention: DetailIntention | null;
  currentUserId?: string;
  isAdmin?: boolean;
  onClose: () => void;
  onReactionChange: (id: string, next: { counts: ReactionCounts; active: UserReactions }) => void;
  onAddComment: (intentionId: string, text: string) => Promise<void>;
  onDeleteComment: (intentionId: string, commentId: string) => Promise<void>;
  onDeleteIntention?: (intentionId: string) => Promise<void>;
}

export const IntentionDetailModal: React.FC<Props> = ({
  intention, currentUserId, isAdmin, onClose, onReactionChange,
  onAddComment, onDeleteComment, onDeleteIntention,
}) => {
  useEffect(() => {
    if (!intention) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [intention, onClose]);

  if (!intention) return null;
  const cfg = themeConfig(intention.theme);
  const initial = (intention.authorName || '?').trim().charAt(0).toUpperCase();
  const isAnon = !intention.authorName || intention.authorName === 'Anónimo';
  const canDeletePost = isAdmin || intention.isUser || (currentUserId ? intention.user_id === currentUserId : false);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(6,13,27,0.85)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: PANEL,
          borderRadius: 20,
          width: '100%', maxWidth: 480, maxHeight: '90vh',
          boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'community-modal-enter 250ms ease-out',
          border: `1px solid rgba(${cfg.rgb},0.15)`,
        }}
      >
        {/* Header */}
        <div style={{
          flexShrink: 0, padding: '20px 22px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: isAnon
              ? `linear-gradient(135deg, rgba(${cfg.rgb},0.25), rgba(${cfg.rgb},0.08))`
              : `rgba(${cfg.rgb},0.15)`,
            border: `1px solid rgba(${cfg.rgb},0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {isAnon ? (
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: cfg.color, fontVariationSettings: "'wght' 300" }}>spa</span>
            ) : (
              <span style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 600, color: cfg.color }}>{initial}</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 600, color: '#C8BFB0', margin: 0 }}>
              {intention.authorName || 'Alma anónima'}
            </p>
            <p style={{ fontFamily: 'Outfit', fontSize: 11, color: '#4A4840', margin: 0 }}>
              {formatRelativeTime(intention.timestamp)} · {cfg.label}
            </p>
          </div>
          {canDeletePost && onDeleteIntention && (
            <button
              onClick={() => {
                if (window.confirm('¿Eliminar esta intención?')) {
                  onDeleteIntention(intention.id).then(onClose).catch(() => {});
                }
              }}
              aria-label="Borrar intención"
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '50%', width: 32, height: 32, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'rgba(232,100,100,0.5)', fontVariationSettings: "'wght' 300" }}>delete</span>
            </button>
          )}
          <button
            onClick={onClose} aria-label="Cerrar"
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '50%', width: 32, height: 32, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(232,100,100,0.5)', fontVariationSettings: "'wght' 300" }}>close</span>
          </button>
        </div>

        {/* Scroll: texto + reactions + comments */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px 22px 24px', WebkitOverflowScrolling: 'touch', boxSizing: 'border-box' }}>
          <p style={{
            fontFamily: '"Outfit", sans-serif', fontSize: 15, color: CREMA,
            lineHeight: 1.7, margin: '0 0 24px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>{intention.text}</p>

          <ReactionBar
            intentionId={intention.id}
            counts={intention.reactionCounts}
            active={intention.userReactions}
            size="md"
            onChange={(next) => onReactionChange(intention.id, next)}
          />

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '20px 0 16px' }} />

          <p style={{
            fontFamily: 'Outfit', fontSize: 10, fontWeight: 500,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#4A4840', margin: '0 0 8px',
          }}>Acompañar con palabras</p>

          <CommentThread
            comments={intention.comments}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onAdd={(t) => onAddComment(intention.id, t)}
            onDelete={(cid) => onDeleteComment(intention.id, cid)}
          />
        </div>
      </div>
    </div>
  );
};
