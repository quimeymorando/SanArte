import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { communityService } from '../services/dataService';
import { logger } from '../utils/logger';

interface Comment {
  id: string;
  authorName?: string;
  text: string;
  timestamp: Date;
  userId?: string;
}

interface Intention {
  id: string;
  text: string;
  authorName?: string;
  candles: number;
  loves: number;
  isUser: boolean;
  theme: 'healing' | 'gratitude' | 'release' | 'feedback';
  timestamp: Date;
  comments: Comment[];
  user_id?: string;
}

const GOLD = '#C9A84C';
const GOLD_GRAD = 'linear-gradient(135deg, #C9A84C, #F0D080)';
const VIOLET = '#A78BFA';
const SAGE = '#8BA888';
const SLATE = '#7B9BB5';

const THEMES = [
  { key: 'gratitude', label: 'Gratitud', icon: 'spa', color: SAGE, rgb: '139,168,136' },
  { key: 'healing', label: 'Sanación', icon: 'healing', color: GOLD, rgb: '201,168,76' },
  { key: 'release', label: 'Soltar', icon: 'air', color: SLATE, rgb: '123,155,181' },
  { key: 'feedback', label: 'Testimonio', icon: 'reviews', color: VIOLET, rgb: '167,139,250' },
] as const;

const TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'healing', label: 'Sanación' },
  { key: 'gratitude', label: 'Gratitud' },
  { key: 'release', label: 'Soltar' },
  { key: 'feedback', label: 'Testimonios' },
] as const;

const themeConfig = (theme: string) => THEMES.find(t => t.key === theme) || THEMES[0];

const formatRelativeTime = (date: Date): string => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7) return `hace ${days}d`;
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
};

export const CommunityPage: React.FC = () => {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [newIntention, setNewIntention] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<Intention['theme']>('gratitude');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showName, setShowName] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<import('../types').UserProfile | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const u = await authService.getUser();
        setUser(u);
        const data = await communityService.getIntentions();
        const mapped: Intention[] = data.map(item => ({
          ...item,
          isUser: item.user_id === u?.id,
          comments: item.comments?.map((c: any) => ({
            id: c.id, text: c.text, authorName: c.author_name,
            userId: c.user_id, timestamp: new Date(c.created_at || Date.now()),
          })) || [],
        }));
        mapped.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setIntentions(mapped);
      } catch (error) { logger.error("Community load error:", error); }
      finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  const handlePost = async () => {
    if (!newIntention.trim()) return;
    const tempId = Date.now().toString();
    const optimistic: Intention = {
      id: tempId, text: newIntention, authorName: showName ? user?.name : undefined,
      candles: 0, loves: 0, isUser: true, theme: selectedTheme,
      timestamp: new Date(), comments: [],
    };
    setIntentions([optimistic, ...intentions]);
    setNewIntention('');
    setComposeOpen(false);
    try {
      await communityService.createIntention(newIntention, selectedTheme, showName ? (user?.name || 'Usuario') : 'Anónimo');
      const fresh = await communityService.getIntentions();
      setIntentions(fresh.map(item => ({
        ...item,
        comments: item.comments?.map((c: any) => ({
          id: c.id, text: c.text, authorName: c.author_name, timestamp: new Date(c.created_at || Date.now()),
        })) || [],
      })));
    } catch (err) {
      logger.error(err);
      alert("Error al publicar.");
      setIntentions(intentions.filter(i => i.id !== tempId));
    }
  };

  const handleComment = async (postId: string) => {
    if (!newComment.trim()) return;
    const comment: Comment = { id: Date.now().toString(), text: newComment, authorName: showName ? user?.name : undefined, userId: user?.id, timestamp: new Date() };
    setIntentions(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
    setNewComment('');
    try { await communityService.addComment(postId, newComment, showName ? (user?.name || 'Usuario') : 'Anónimo'); }
    catch (err) { logger.error(err); }
  };

  const handleDeleteComment = async (intentionId: string, commentId: string) => {
    if (!window.confirm("¿Borrar comentario?")) return;
    setIntentions(prev => prev.map(p => p.id === intentionId ? { ...p, comments: p.comments.filter(c => c.id !== commentId) } : p));
    try { await communityService.deleteComment(commentId); } catch (err) { logger.error(err); }
  };

  const lightCandle = async (id: string) => {
    setIntentions(prev => prev.map(i => i.id === id ? { ...i, candles: i.candles + 1 } : i));
    try { await communityService.lightCandle(id); } catch (err) { logger.error(err); }
  };

  const sendLove = async (id: string) => {
    setIntentions(prev => prev.map(i => i.id === id ? { ...i, loves: i.loves + 1 } : i));
    try { await communityService.sendLove(id); } catch (err) { logger.error(err); }
  };

  const filtered = activeTab === 'all' ? intentions : intentions.filter(i => i.theme === activeTab);

  const canDelete = (item: Intention) => user?.role === 'admin' || item.isUser || (user ? item.user_id === user.id : false);

  return (
    <div style={{ background: '#060D1B', minHeight: '100dvh', paddingBottom: 100 }}>
      {/* Sticky Header */}
      <div
        style={{
          padding: '64px 20px 20px',
          background: 'linear-gradient(to bottom, rgba(6,13,27,1) 0%, transparent 100%)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <p
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: GOLD,
            margin: '0 0 6px',
          }}
        >Sanando juntas</p>
        <h1
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 28,
            fontWeight: 300,
            color: '#F0EBE0',
            margin: '0 0 6px',
          }}
        >Comunidad</h1>
        <p
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 12,
            color: '#4A4840',
            margin: '0 0 16px',
          }}
        >Un espacio para compartir tu camino</p>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 12,
            padding: 4,
            overflowX: 'auto',
          }}
        >
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                flex: '1 0 auto',
                padding: '8px 14px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === t.key ? 'rgba(201,168,76,0.12)' : 'transparent',
                fontFamily: '"Outfit", sans-serif',
                fontSize: 12,
                fontWeight: 500,
                color: activeTab === t.key ? GOLD : '#5A6170',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 20px 0' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <span
              className="material-symbols-outlined animate-pulse"
              style={{ fontSize: 32, color: 'rgba(201,168,76,0.2)' }}
            >self_improvement</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.15)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 28, color: 'rgba(201,168,76,0.5)', fontVariationSettings: "'wght' 300" }}
              >diversity_1</span>
            </div>
            <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 14, color: '#4A4840', margin: '0 0 6px' }}>
              Sé la primera chispa
            </p>
            <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 12, color: '#3A3830', margin: 0 }}>
              Compartí tu intención, gratitud o testimonio
            </p>
          </div>
        ) : (
          filtered.map(item => {
            const cfg = themeConfig(item.theme);
            return (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: `3px solid ${cfg.color}`,
                  borderRadius: 16,
                  padding: '18px 20px',
                  marginBottom: 12,
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: `rgba(${cfg.rgb}, 0.12)`,
                      border: `1px solid rgba(${cfg.rgb}, 0.25)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16, color: cfg.color, fontVariationSettings: "'wght' 300" }}
                    >{cfg.icon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#C8BFB0',
                        margin: 0,
                      }}
                    >{item.authorName || 'Alma Anónima'}</p>
                    <p
                      style={{
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: 10,
                        color: '#4A4840',
                        margin: 0,
                      }}
                    >{formatRelativeTime(item.timestamp)}</p>
                  </div>
                  <span
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: cfg.color,
                      border: `1px solid rgba(${cfg.rgb}, 0.2)`,
                      borderRadius: 999,
                      padding: '2px 8px',
                      flexShrink: 0,
                    }}
                  >{cfg.label}</span>
                  {canDelete(item) && (
                    <button
                      onClick={() => { if (window.confirm('¿Eliminar?')) communityService.deleteIntention(item.id).then(() => setIntentions(prev => prev.filter(i => i.id !== item.id))).catch(() => alert('Error')); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16, color: 'rgba(255,255,255,0.2)', fontVariationSettings: "'wght' 300" }}
                      >close</span>
                    </button>
                  )}
                </div>

                {/* Texto */}
                <p
                  style={{
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: 13,
                    color: '#8B7A6A',
                    lineHeight: 1.75,
                    margin: '0 0 14px',
                    whiteSpace: 'pre-wrap',
                  }}
                >{item.text}</p>

                {/* Reacciones */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <button
                    onClick={() => lightCandle(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: 0,
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 12,
                      color: item.candles > 0 ? GOLD : 'rgba(201,168,76,0.5)',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16, fontVariationSettings: "'wght' 300" }}
                    >light_mode</span>
                    {item.candles || 0}
                  </button>
                  <button
                    onClick={() => sendLove(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: 0,
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 12,
                      color: item.loves > 0 ? '#F472B6' : 'rgba(244,114,182,0.5)',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16, fontVariationSettings: item.loves > 0 ? "'wght' 400, 'FILL' 1" : "'wght' 300" }}
                    >favorite</span>
                    {item.loves || 0}
                  </button>
                  <button
                    onClick={() => setActiveCommentId(activeCommentId === item.id ? null : item.id)}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: 0,
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 12,
                      color: activeCommentId === item.id ? GOLD : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16, fontVariationSettings: "'wght' 300" }}
                    >chat_bubble_outline</span>
                    {item.comments.length || 0}
                  </button>
                </div>

                {/* Comments */}
                {activeCommentId === item.id && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 14,
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {item.comments.map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontFamily: '"Outfit", sans-serif',
                              fontSize: 11,
                              fontWeight: 600,
                              color: GOLD,
                              margin: 0,
                              opacity: 0.8,
                            }}
                          >{c.authorName || 'Anónimo'}</p>
                          <p
                            style={{
                              fontFamily: '"Outfit", sans-serif',
                              fontSize: 12,
                              color: '#8B7A6A',
                              margin: '3px 0 0',
                              lineHeight: 1.6,
                            }}
                          >{c.text}</p>
                        </div>
                        {user && (user.role === 'admin' || c.userId === user.id) && (
                          <button
                            onClick={() => handleDeleteComment(item.id, c.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', fontVariationSettings: "'wght' 300" }}
                            >close</span>
                          </button>
                        )}
                      </div>
                    ))}

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleComment(item.id)}
                        placeholder="Escribí un mensaje de apoyo..."
                        style={{
                          flex: 1,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(201,168,76,0.1)',
                          borderRadius: 10,
                          padding: '8px 12px',
                          fontFamily: '"Outfit", sans-serif',
                          fontSize: 12,
                          color: '#F0EBE0',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => handleComment(item.id)}
                        disabled={!newComment.trim()}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: newComment.trim() ? GOLD_GRAD : 'rgba(255,255,255,0.05)',
                          color: newComment.trim() ? '#060D1B' : 'rgba(255,255,255,0.2)',
                          border: 'none',
                          cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 16, fontVariationSettings: "'wght' 400" }}
                        >send</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* FAB Compartir */}
      <button
        onClick={() => setComposeOpen(true)}
        style={{
          position: 'fixed',
          bottom: 90,
          right: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 24px',
          background: GOLD_GRAD,
          color: '#060D1B',
          border: 'none',
          borderRadius: 999,
          cursor: 'pointer',
          zIndex: 50,
          boxShadow: '0 8px 24px rgba(201,168,76,0.25)',
          fontFamily: '"Outfit", sans-serif',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 18, fontVariationSettings: "'wght' 400", lineHeight: 1 }}
        >edit</span>
        Compartir
      </button>

      {/* Modal Compose */}
      {composeOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
            onClick={() => setComposeOpen(false)}
          />
          <div
            style={{
              position: 'relative',
              background: '#0E1420',
              border: '1px solid rgba(201,168,76,0.12)',
              borderRadius: '24px 24px 0 0',
              width: '100%',
              maxWidth: 480,
              padding: '28px 24px 40px',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: 20,
                  fontWeight: 400,
                  color: '#F0EBE0',
                  margin: 0,
                }}
              >Compartir con la tribu</h2>
              <button
                onClick={() => setComposeOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontVariationSettings: "'wght' 300" }}
                >close</span>
              </button>
            </div>

            {/* Theme selector */}
            <p
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#4A4840',
                margin: '0 0 10px',
              }}
            >Elegí un tema</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {THEMES.map(t => (
                <button
                  key={t.key}
                  onClick={() => setSelectedTheme(t.key as Intention['theme'])}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: selectedTheme === t.key ? `1px solid rgba(${t.rgb},0.4)` : '1px solid rgba(255,255,255,0.06)',
                    background: selectedTheme === t.key ? `rgba(${t.rgb},0.12)` : 'transparent',
                    cursor: 'pointer',
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: 12,
                    fontWeight: 500,
                    color: selectedTheme === t.key ? t.color : '#5A6170',
                    transition: 'all 0.2s',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 14, fontVariationSettings: "'wght' 300" }}
                  >{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={newIntention}
              onChange={(e) => setNewIntention(e.target.value)}
              rows={4}
              placeholder={
                selectedTheme === 'feedback' ? '¿Cómo te ha ayudado SanArte?' :
                selectedTheme === 'gratitude' ? 'Hoy agradezco por...' :
                selectedTheme === 'release' ? 'Hoy suelto...' :
                'Compartí tu intención o mensaje...'
              }
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(201,168,76,0.1)',
                borderRadius: 12,
                padding: '12px 16px',
                fontFamily: '"Outfit", sans-serif',
                fontSize: 13,
                color: '#F0EBE0',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.6,
                boxSizing: 'border-box',
                marginBottom: 14,
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <button
                onClick={() => setShowName(!showName)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: 11,
                  color: '#8B7A6A',
                  padding: 0,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 14, fontVariationSettings: "'wght' 300" }}
                >{showName ? 'visibility' : 'visibility_off'}</span>
                {showName ? (user?.name || 'Con mi nombre') : 'Anónimo'}
              </button>

              <button
                onClick={handlePost}
                disabled={!newIntention.trim()}
                style={{
                  padding: '12px 24px',
                  borderRadius: 999,
                  background: newIntention.trim() ? GOLD_GRAD : 'rgba(255,255,255,0.06)',
                  color: newIntention.trim() ? '#060D1B' : 'rgba(255,255,255,0.2)',
                  border: 'none',
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.04em',
                  cursor: newIntention.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
