import React, { useState } from 'react';
import { GOLD, GOLD_GRAD, NAVY, formatRelativeTime } from './types';

export interface ThreadComment {
  id: string;
  authorName?: string;
  text: string;
  timestamp: Date;
  userId?: string;
}

interface Props {
  comments: ThreadComment[];
  currentUserId?: string;
  isAdmin?: boolean;
  onAdd: (text: string) => Promise<void> | void;
  onDelete: (commentId: string) => Promise<void> | void;
  inputPlaceholder?: string;
}

export const CommentThread: React.FC<Props> = ({
  comments, currentUserId, isAdmin, onAdd, onDelete,
  inputPlaceholder = 'Escribí un mensaje de apoyo...',
}) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      await onAdd(t);
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {comments.length === 0 && (
        <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 12, color: '#4A4840', textAlign: 'center', padding: '8px 0 12px', margin: 0 }}>
          Sé la primera voz que acompaña.
        </p>
      )}

      {comments.map((c) => {
        const canDelete = !!currentUserId && (isAdmin || c.userId === currentUserId);
        return (
          <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 11, fontWeight: 600, color: GOLD, margin: 0, opacity: 0.85 }}>
                  {c.authorName || 'Anónimo'}
                </p>
                <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 10, color: '#4A4840', margin: 0 }}>
                  {formatRelativeTime(c.timestamp)}
                </p>
              </div>
              <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 13, color: '#8B7A6A', margin: '4px 0 0', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {c.text}
              </p>
            </div>
            {canDelete && (
              <button
                onClick={() => onDelete(c.id)}
                aria-label="Borrar comentario"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'rgba(232,100,100,0.5)', fontVariationSettings: "'wght' 300" }}>close</span>
              </button>
            )}
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 14, minWidth: 0 }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={inputPlaceholder}
          style={{
            flex: 1,
            minWidth: 0,
            boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(201,168,76,0.1)',
            borderRadius: 10,
            padding: '10px 14px',
            fontFamily: '"Outfit", sans-serif',
            fontSize: 13,
            color: '#F0EBE0',
            outline: 'none',
          }}
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: text.trim() ? GOLD_GRAD : 'rgba(255,255,255,0.05)',
            color: text.trim() ? NAVY : 'rgba(255,255,255,0.2)',
            border: 'none',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'wght' 400" }}>send</span>
        </button>
      </div>
    </div>
  );
};
