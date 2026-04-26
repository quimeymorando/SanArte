import React, { useEffect, useMemo, useState } from 'react';
import { COMPOSE_PROMPTS, GOLD, GOLD_GRAD, NAVY, PANEL, THEMES, type ThemeKey } from './types';

interface Props {
  open: boolean;
  initialText?: string;
  initialTheme?: ThemeKey;
  defaultAuthorName?: string;
  onClose: () => void;
  onSubmit: (args: { text: string; theme: ThemeKey; anonymous: boolean }) => Promise<void> | void;
}

export const ComposeModal: React.FC<Props> = ({
  open, initialText = '', initialTheme = 'gratitude', defaultAuthorName, onClose, onSubmit,
}) => {
  const [text, setText] = useState(initialText);
  const [theme, setTheme] = useState<ThemeKey>(initialTheme);
  const [anon, setAnon] = useState<boolean>(!defaultAuthorName);
  const [submitting, setSubmitting] = useState(false);

  const prompt = useMemo(
    () => COMPOSE_PROMPTS[Math.floor(Math.random() * COMPOSE_PROMPTS.length)],
    [open]
  );

  useEffect(() => {
    if (!open) return;
    setText(initialText);
    setTheme(initialTheme);
    setAnon(!defaultAuthorName);
  }, [open, initialText, initialTheme, defaultAuthorName]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    const t = text.trim();
    if (!t || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ text: t, theme, anonymous: anon });
    } finally {
      setSubmitting(false);
    }
  };

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
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'community-modal-enter 250ms ease-out',
          border: '1px solid rgba(201,168,76,0.08)',
        }}
      >
        {/* Header */}
        <div style={{
          flexShrink: 0, padding: '20px 22px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: '"Outfit", sans-serif', fontSize: 10, fontWeight: 500,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, margin: '0 0 6px',
            }}>Una pregunta</p>
            <p style={{
              fontFamily: '"Playfair Display", serif', fontSize: 18, fontStyle: 'italic',
              fontWeight: 300, color: '#F0EBE0', margin: 0, lineHeight: 1.4,
            }}>{prompt}</p>
          </div>
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

        {/* Scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px', WebkitOverflowScrolling: 'touch' }}>
          <p style={{
            fontFamily: '"Outfit", sans-serif', fontSize: 10, fontWeight: 500,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A4840', margin: '0 0 10px',
          }}>Elegí un tema</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {THEMES.map((t) => {
              const sel = theme === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 999,
                    border: sel ? `1px solid ${t.color}66` : '1px solid rgba(255,255,255,0.08)',
                    background: sel ? `rgba(${t.rgb},0.15)` : 'rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                    fontFamily: '"Outfit", sans-serif', fontSize: 12, fontWeight: 500,
                    color: sel ? t.color : '#5A6170',
                    transition: 'all 0.2s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{
                    fontSize: 16, color: sel ? t.color : '#5A6170',
                    fontVariationSettings: "'wght' 300", lineHeight: 1,
                  }}>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Compartí lo que sentís..."
            autoFocus
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)',
              borderRadius: 12, padding: '14px 16px',
              fontFamily: '"Outfit", sans-serif', fontSize: 14, color: '#F0EBE0',
              outline: 'none', resize: 'none', lineHeight: 1.6,
            }}
          />
        </div>

        {/* Footer */}
        <div style={{
          flexShrink: 0, padding: '16px 22px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)', background: PANEL,
        }}>
          <div
            onClick={() => setAnon((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 14, cursor: 'pointer', userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#6A6460' }}>
                {anon ? 'visibility_off' : 'person'}
              </span>
              <div>
                <p style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#C8BFB0', margin: 0 }}>
                  {anon ? 'Compartir como anónima' : (defaultAuthorName || 'Con mi nombre')}
                </p>
                <p style={{ fontFamily: 'Outfit', fontSize: 10, color: '#4A4840', margin: '1px 0 0' }}>
                  {anon ? 'Tu nombre no será visible' : 'Tu nombre aparecerá en el post'}
                </p>
              </div>
            </div>
            <div style={{
              width: 36, height: 20, borderRadius: 999,
              background: !anon ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)',
              border: !anon ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.1)',
              position: 'relative', flexShrink: 0, transition: 'all 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 2, left: !anon ? 18 : 2,
                width: 14, height: 14, borderRadius: '50%',
                background: !anon ? GOLD : 'rgba(255,255,255,0.3)',
                transition: 'left 0.2s',
              }} />
            </div>
          </div>

          <button
            onClick={submit}
            disabled={!text.trim() || submitting}
            style={{
              width: '100%',
              background: text.trim() ? GOLD_GRAD : 'rgba(255,255,255,0.06)',
              color: text.trim() ? NAVY : '#4A4840',
              border: 'none', borderRadius: 999, padding: '14px',
              fontFamily: 'Outfit', fontSize: 14, fontWeight: 600,
              cursor: text.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? 'Compartiendo...' : 'Compartir con la tribu'}
          </button>
        </div>
      </div>
    </div>
  );
};
