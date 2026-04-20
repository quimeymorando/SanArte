import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getStoredRoutines, toggleRoutine, deleteRoutine } from '../services/routineService';
import { historyService } from '../services/dataService';
import { Routine, SymptomLogEntry, Favorite, UserProfile } from '../types';
import { authService } from '../services/authService';
import ManageSubscription from '../components/ManageSubscription';
import { accountService } from '../services/accountService';
import { clearConsent } from '../utils/consent';

// ─── Paleta Sacred Noir ────────────────────────────
const GOLD = '#C9A84C';
const GOLD_GRAD = 'linear-gradient(135deg, #C9A84C, #F0D080)';
const VIOLET = '#A78BFA';
const SAGE = '#8BA888';
const ROSE = '#F472B6';
const SLATE = '#7B9BB5';
const X_RED = 'rgba(232,100,100,0.5)';

// ─── Sticky Header común ───────────────────────────
const StickyHeader: React.FC<{ kicker: string; title: string; subtitle?: React.ReactNode }> = ({ kicker, title, subtitle }) => (
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
    >{kicker}</p>
    <h1
      style={{
        fontFamily: '"Playfair Display", serif',
        fontSize: 28,
        fontWeight: 300,
        color: '#F0EBE0',
        margin: subtitle ? '0 0 6px' : 0,
      }}
    >{title}</h1>
    {subtitle && (
      <p
        style={{
          fontFamily: '"Outfit", sans-serif',
          fontSize: 12,
          margin: 0,
        }}
      >{subtitle}</p>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════
// ─── FAVORITES PAGE ─────────────────────────────────
// ═══════════════════════════════════════════════════════

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => { historyService.getFavorites().then(d => d && setFavorites(d)); }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar de favoritos?")) return;
    try {
      await historyService.deleteFavoriteById(id);
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch (error) { logger.error(error); }
  };

  return (
    <div style={{ background: '#060D1B', minHeight: '100dvh', paddingBottom: 100 }}>
      <StickyHeader kicker="Tus sanaciones guardadas" title="Favoritos" />

      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(167,139,250,0.08)',
                border: '1px solid rgba(167,139,250,0.15)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 28,
                  color: 'rgba(167,139,250,0.5)',
                  fontVariationSettings: "'wght' 300",
                }}
              >favorite_border</span>
            </div>
            <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 14, color: '#4A4840', margin: '0 0 6px' }}>
              Aún no guardaste ningún síntoma
            </p>
            <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 12, color: '#3A3830', margin: 0 }}>
              Tocá el ♥ en cualquier resultado para guardarlo
            </p>
          </div>
        ) : (
          <div>
            {favorites.map((fav) => (
              <div
                key={fav.id}
                onClick={() => navigate(`/symptom-detail?q=${encodeURIComponent(fav.symptom_name)}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 18,
                    color: VIOLET,
                    fontVariationSettings: "'wght' 400, 'FILL' 1",
                    flexShrink: 0,
                  }}
                >favorite</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#C8BFB0',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >{fav.symptom_name}</p>
                  {fav.description && (
                    <p
                      style={{
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: 12,
                        color: '#4A4840',
                        margin: '3px 0 0',
                        fontStyle: 'italic',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >{fav.description}</p>
                  )}
                </div>
                <button
                  onClick={(e) => handleDelete(fav.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 6,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 18,
                      color: X_RED,
                      fontVariationSettings: "'wght' 300",
                    }}
                  >close</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ─── ROUTINE ITEM ───────────────────────────────────
// ═══════════════════════════════════════════════════════

const RoutineItem: React.FC<{
  routine: Routine;
  onToggle: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  faded?: boolean;
}> = ({ routine, onToggle, onDelete, faded = false }) => (
  <div
    onClick={() => onToggle(routine.id)}
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: '16px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      cursor: 'pointer',
      opacity: faded ? 0.4 : (routine.completed ? 0.55 : 1),
      transition: 'opacity 0.2s',
    }}
  >
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        flexShrink: 0,
        marginTop: 0,
        border: routine.completed ? `2px solid ${SAGE}` : '2px solid rgba(255,255,255,0.2)',
        background: routine.completed ? 'rgba(139,168,136,0.15)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
      }}
    >
      {routine.completed && (
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 18,
            color: SAGE,
            fontVariationSettings: "'wght' 500",
            lineHeight: 1,
          }}
        >check</span>
      )}
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontFamily: '"Outfit", sans-serif',
          fontSize: 14,
          fontWeight: 500,
          color: routine.completed ? '#4A4840' : '#C8BFB0',
          textDecoration: routine.completed ? 'line-through' : 'none',
          margin: 0,
        }}
      >{routine.text}</p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 6,
          flexWrap: 'wrap',
        }}
      >
        {routine.time && (
          <span style={{ fontFamily: '"Outfit", sans-serif', fontSize: 11, color: '#4A4840' }}>
            {routine.time}
          </span>
        )}
        {routine.category && (
          <span
            style={{
              display: 'inline-block',
              fontFamily: '"Outfit", sans-serif',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: GOLD,
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 999,
              padding: '2px 8px',
            }}
          >{routine.category}</span>
        )}
        {routine.source && (
          <span style={{ fontFamily: '"Outfit", sans-serif', fontSize: 10, color: 'rgba(201,168,76,0.45)' }}>
            {routine.source}
          </span>
        )}
      </div>
    </div>

    <button
      onClick={(e) => onDelete(routine.id, e)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 6,
        flexShrink: 0,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: 18,
          color: X_RED,
          fontVariationSettings: "'wght' 300",
        }}
      >close</span>
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════
// ─── ROUTINES PAGE ──────────────────────────────────
// ═══════════════════════════════════════════════════════

export const RoutinesPage: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [xpAdded, setXpAdded] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => { getStoredRoutines().then(setRoutines); }, []);

  const handleToggle = async (id: string) => {
    const routine = routines.find(r => r.id === id);
    if (!routine) return;
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    const { success, xpEarned } = await toggleRoutine(id, routine.completed);
    if (!success) {
      setRoutines(prev => prev.map(r => r.id === id ? { ...r, completed: routine.completed } : r));
    } else if (xpEarned > 0) {
      authService.addXP(xpEarned);
      setXpAdded(xpEarned);
      setTimeout(() => setXpAdded(null), 2000);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar esta rutina?")) return;
    const success = await deleteRoutine(id);
    if (success) setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const pendingRoutines = routines.filter(r => !r.completed);
  const completedRoutines = routines.filter(r => r.completed);
  const total = routines.length;
  const completedCount = completedRoutines.length;

  const subtitle = total === 0
    ? <span style={{ color: '#4A4840' }}>Construí tu bienestar día a día</span>
    : completedCount === total
      ? <span style={{ color: SAGE }}>✓ {total} completadas hoy</span>
      : <span style={{ color: SAGE }}>{completedCount} de {total} completadas hoy</span>;

  return (
    <div style={{ background: '#060D1B', minHeight: '100dvh', paddingBottom: 100 }}>
      {xpAdded && (
        <div
          style={{
            position: 'fixed',
            top: 96,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            background: GOLD_GRAD,
            color: '#060D1B',
            padding: '8px 16px',
            borderRadius: 999,
            fontFamily: '"Outfit", sans-serif',
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(201,168,76,0.25)',
          }}
        >
          +{xpAdded} XP
        </div>
      )}

      <StickyHeader kicker="Tus hábitos diarios" title="Rutinas" subtitle={subtitle} />

      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {routines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(139,168,136,0.08)',
                border: '1px solid rgba(139,168,136,0.15)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 28,
                  color: 'rgba(139,168,136,0.5)',
                  fontVariationSettings: "'wght' 300",
                }}
              >routine</span>
            </div>
            <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 14, color: '#4A4840', margin: '0 0 6px' }}>
              Aún no tenés rutinas
            </p>
            <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 12, color: '#3A3830', margin: 0 }}>
              Cuando explorés un síntoma, podés añadir su ritual diario
            </p>
          </div>
        ) : (
          <div>
            {pendingRoutines.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(139,168,136,0.1)',
                    border: '1px solid rgba(139,168,136,0.2)',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 24, color: SAGE, fontVariationSettings: "'wght' 300" }}
                  >check_circle</span>
                </div>
                <p
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontStyle: 'italic',
                    fontSize: 16,
                    color: SAGE,
                    margin: 0,
                  }}
                >Todo completado hoy</p>
              </div>
            )}

            {pendingRoutines.map(routine => (
              <RoutineItem
                key={routine.id}
                routine={routine}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}

            {completedRoutines.length > 0 && (
              <div style={{ padding: '0 20px' }}>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '14px 20px',
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    margin: '16px 0 8px',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 18,
                      color: '#4A4840',
                      fontVariationSettings: "'wght' 300",
                    }}
                  >{showCompleted ? 'expand_less' : 'expand_more'}</span>
                  <span
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 12,
                      color: '#4A4840',
                    }}
                  >Ver completadas ({completedRoutines.length})</span>
                </button>
              </div>
            )}

            {showCompleted && completedRoutines.map(routine => (
              <RoutineItem
                key={routine.id}
                routine={routine}
                onToggle={handleToggle}
                onDelete={handleDelete}
                faded
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ─── HISTORY PAGE ───────────────────────────────────
// ═══════════════════════════════════════════════════════

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<SymptomLogEntry[]>([]);

  useEffect(() => { historyService.getHistory().then(d => d && setItems(d)).catch(logger.error); }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar?")) return;
    try { await historyService.deleteLog(id); setItems(prev => prev.filter(i => i.id !== id)); } catch (err) { logger.error(err); }
  };

  return (
    <div style={{ background: '#060D1B', minHeight: '100dvh', paddingBottom: 100 }}>
      <StickyHeader kicker="Tus consultas" title="Historial" />
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '80px 20px', color: '#4A4840', fontFamily: '"Outfit", sans-serif', fontSize: 14 }}>
            Sin registros.
          </p>
        ) : (
          <div>
            {items.map((item) => {
              const name = item.notes?.replace('Consulta: ', '').trim();
              return (
                <div
                  key={item.id}
                  onClick={() => name ? navigate(`/symptom-detail?q=${encodeURIComponent(name)}`) : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: name ? 'pointer' : 'default',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18, color: 'rgba(201,168,76,0.4)', fontVariationSettings: "'wght' 300", flexShrink: 0 }}
                  >history</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#C8BFB0',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >{name || item.notes}</p>
                    <p
                      style={{
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: 11,
                        color: '#4A4840',
                        margin: '3px 0 0',
                      }}
                    >{new Date(item.date).toLocaleDateString('es-AR')}</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, flexShrink: 0 }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18, color: X_RED, fontVariationSettings: "'wght' 300" }}
                    >close</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ─── PROFILE HELPERS ────────────────────────────────
// ═══════════════════════════════════════════════════════

const SectionLabel: React.FC<{ children: React.ReactNode; faint?: boolean }> = ({ children, faint = false }) => (
  <p
    style={{
      fontFamily: '"Outfit", sans-serif',
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: faint ? '#3A3830' : GOLD,
      margin: '0 0 12px',
    }}
  >{children}</p>
);

const StatCard: React.FC<{ icon: string; iconColor: string; value: number | string; label: string }> = ({ icon, iconColor, value, label }) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(201,168,76,0.12)',
      borderRadius: 14,
      padding: '16px 14px',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 4,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: 20,
          color: iconColor,
          fontVariationSettings: "'wght' 300",
          display: 'block',
          lineHeight: 1,
          textAlign: 'center',
        }}
      >{icon}</span>
    </div>
    <p
      style={{
        fontFamily: '"Playfair Display", serif',
        fontSize: 24,
        fontWeight: 300,
        color: GOLD,
        margin: '4px 0',
        lineHeight: 1,
      }}
    >{value}</p>
    <p
      style={{
        fontFamily: '"Outfit", sans-serif',
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#4A4840',
        margin: 0,
      }}
    >{label}</p>
  </div>
);

const ActionCard: React.FC<{ icon: string; accent: string; title: string; desc: string; onClick: () => void }> = ({ icon, accent, title, desc, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 18px',
      marginBottom: 10,
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderLeft: `3px solid ${accent}`,
      borderRadius: 14,
      cursor: 'pointer',
      textAlign: 'left',
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: `${accent}1F`,
        border: `1px solid ${accent}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: 20,
          color: accent,
          fontVariationSettings: "'wght' 300",
          display: 'block',
          lineHeight: 1,
          textAlign: 'center',
        }}
      >{icon}</span>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 14, fontWeight: 500, color: '#C8BFB0', margin: 0 }}>{title}</p>
      <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 11, color: '#4A4840', margin: '2px 0 0' }}>{desc}</p>
    </div>
    <span
      className="material-symbols-outlined"
      style={{ fontSize: 18, color: 'rgba(255,255,255,0.25)', fontVariationSettings: "'wght' 300" }}
    >chevron_right</span>
  </button>
);

// ═══════════════════════════════════════════════════════
// ─── PROFILE PAGE ───────────────────────────────────
// ═══════════════════════════════════════════════════════

const HEALTH_DISCLAIMER_TEXT =
  'SanArte es una herramienta de bienestar emocional y no reemplaza el diagnóstico ni tratamiento médico profesional. Ante cualquier síntoma físico, consultá siempre a un profesional de la salud. El uso de esta app es responsabilidad exclusiva del usuario.';

const TERMS_TEXT =
  'Al usar SanArte aceptás las condiciones del servicio: uso personal y no comercial, respeto a la comunidad, y reconocimiento de que la app es una guía de exploración emocional. Podemos actualizar estas condiciones notificándote por email.';

const PRIVACY_TEXT =
  'Guardamos únicamente los datos necesarios para que tu experiencia funcione: perfil, favoritos, historial de consultas, rutinas y reflexiones. No vendemos tus datos. Podés exportar o eliminar tu información en cualquier momento desde este perfil.';

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subscriptionRef = React.useRef<HTMLDivElement>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get('upgrade') === 'true' && subscriptionRef.current) {
      setTimeout(() => {
        subscriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [searchParams, user]);

  useEffect(() => { authService.getUser().then(setUser); }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    try {
      const url = await authService.updateAvatar(e.target.files[0]);
      if (url) setUser(prev => prev ? { ...prev, avatar: url } : null);
    } catch (error) { logger.error(error); }
    finally { setIsUploading(false); }
  };

  const handleDeleteAccount = async () => {
    const typed = window.prompt('Escribí ELIMINAR para confirmar. Esta acción es irreversible.');
    if (typed !== 'ELIMINAR') return;
    if (!window.confirm('Tu cuenta será eliminada permanentemente.')) return;
    setIsDeletingAccount(true);
    try {
      await accountService.deleteMyAccount();
      await authService.logout().catch(() => null);
      navigate('/', { replace: true });
      window.location.reload();
    } catch (error: any) { logger.error(error); alert(error?.message || 'Error.'); }
    finally { setIsDeletingAccount(false); }
  };

  if (!user) {
    return (
      <div style={{ background: '#060D1B', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span
          className="material-symbols-outlined animate-pulse"
          style={{ fontSize: 32, color: 'rgba(201,168,76,0.2)' }}
        >self_improvement</span>
      </div>
    );
  }

  const level = user.level || 1;
  const soulTitle =
    level < 3 ? 'Semilla Despierta' :
    level < 6 ? 'Brote de Luz' :
    'Loto en Expansión';
  const soulColor =
    level < 3 ? SAGE :
    level < 6 ? GOLD :
    VIOLET;

  const allBadges = [
    { name: "Despertar", icon: "visibility", color: GOLD },
    { name: "Constancia", icon: "local_fire_department", color: ROSE },
    { name: "Sabiduría", icon: "psychology", color: VIOLET },
    { name: "Alquimista", icon: "science", color: SAGE },
  ];

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'S';

  return (
    <div style={{ background: '#060D1B', minHeight: '100dvh', paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '72px 20px 0' }}>

        {/* Avatar + Name */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: `2px solid ${GOLD}`,
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                background: 'rgba(201,168,76,0.08)',
              }}
            >
              {user.avatar ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url('${user.avatar}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'rgba(201,168,76,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 28,
                    color: GOLD,
                  }}
                >{initial}</div>
              )}
              {/* Overlay photo_camera */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0'; }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 20,
                    color: 'rgba(255,255,255,0.8)',
                    fontVariationSettings: "'wght' 300",
                  }}
                >photo_camera</span>
              </div>
              {isUploading && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    className="material-symbols-outlined animate-spin"
                    style={{ fontSize: 22, color: '#fff' }}
                  >progress_activity</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" />
          </div>
          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 22,
              fontWeight: 300,
              color: '#F0EBE0',
              margin: '0 0 4px',
            }}
          >{user.name}</h1>
          <p
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontStyle: 'italic',
              fontSize: 12,
              color: soulColor,
              margin: '0 0 4px',
            }}
          >{soulTitle}</p>
          <p
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: 11,
              color: '#4A4840',
              margin: 0,
            }}
          >{user.email}</p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10,
            marginBottom: 36,
          }}
        >
          <StatCard icon="local_fire_department" iconColor={ROSE} value={user.currentStreak || 0} label="Racha" />
          <StatCard icon="diamond" iconColor={GOLD} value={user.xp || 0} label="XP Total" />
          <StatCard icon="search" iconColor={SLATE} value={user.healingMoments || 0} label="Sanaciones" />
        </div>

        {/* Mi camino */}
        <div style={{ marginBottom: 36 }}>
          <SectionLabel>Mi camino</SectionLabel>
          <ActionCard icon="wb_sunny" accent={GOLD} title="Mis rutinas" desc="Hábitos que transforman" onClick={() => navigate('/routines')} />
          <ActionCard icon="edit_note" accent={VIOLET} title="Mis reflexiones" desc="Tu diario íntimo" onClick={() => navigate('/journal')} />
          <ActionCard icon="favorite" accent={ROSE} title="Mis favoritos" desc="Síntomas guardados" onClick={() => navigate('/favorites')} />
        </div>

        {/* Subscription */}
        <div ref={subscriptionRef} style={{ marginBottom: 36 }}>
          <SectionLabel>Suscripción</SectionLabel>
          {user.isPremium ? (
            <div
              style={{
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.2)',
                borderLeft: `3px solid ${GOLD}`,
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(201,168,76,0.12)',
                    border: '1px solid rgba(201,168,76,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 20,
                      color: GOLD,
                      fontVariationSettings: "'wght' 300",
                      display: 'block',
                      lineHeight: 1,
                    }}
                  >diamond</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: 16,
                      fontWeight: 400,
                      color: '#F0EBE0',
                      margin: 0,
                    }}
                  >Loto Brillante</p>
                  <p
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 11,
                      color: SAGE,
                      margin: '2px 0 0',
                      letterSpacing: '0.08em',
                    }}
                  >● PREMIUM ACTIVO</p>
                </div>
                <span
                  style={{
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: GOLD,
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: 999,
                    padding: '3px 10px',
                  }}
                >PRO</span>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    padding: 12,
                    textAlign: 'center',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 18,
                      color: GOLD,
                      display: 'block',
                      marginBottom: 4,
                      fontVariationSettings: "'wght' 300",
                      lineHeight: 1,
                    }}
                  >all_inclusive</span>
                  <p
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#6A6460',
                      margin: 0,
                    }}
                  >Búsquedas</p>
                  <p
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      color: SAGE,
                      margin: '2px 0 0',
                    }}
                  >Ilimitadas</p>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    padding: 12,
                    textAlign: 'center',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 18,
                      color: VIOLET,
                      display: 'block',
                      marginBottom: 4,
                      fontVariationSettings: "'wght' 300",
                      lineHeight: 1,
                    }}
                  >block</span>
                  <p
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#6A6460',
                      margin: 0,
                    }}
                  >Publicidad</p>
                  <p
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      color: VIOLET,
                      margin: '2px 0 0',
                    }}
                  >Sin Ads</p>
                </div>
              </div>

              <button
                onClick={() => setShowSubscriptionManager(v => !v)}
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: 13,
                  color: '#8B7A6A',
                }}
              >{showSubscriptionManager ? 'Cerrar' : 'Gestionar Suscripción'}</button>

              {showSubscriptionManager && (
                <div style={{ marginTop: 12 }}>
                  <ManageSubscription isPremium={user.isPremium} userEmail={user.email} />
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(240,208,128,0.05))',
                border: '1px solid rgba(201,168,76,0.25)',
                borderLeft: `3px solid ${GOLD}`,
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(201,168,76,0.15)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 20,
                      color: GOLD,
                      fontVariationSettings: "'wght' 300",
                      display: 'block',
                      lineHeight: 1,
                    }}
                  >auto_awesome</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: 16,
                      fontWeight: 400,
                      color: '#F0EBE0',
                      margin: 0,
                    }}
                  >Plan gratuito</p>
                  <p
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 11,
                      color: '#6A6460',
                      margin: '2px 0 0',
                      letterSpacing: '0.08em',
                    }}
                  >Accedé a funciones básicas</p>
                </div>
              </div>
              <p
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: 12,
                  color: '#8B7A6A',
                  lineHeight: 1.65,
                  margin: '0 0 14px',
                }}
              >Desbloqueá búsquedas ilimitadas, meditaciones guiadas, ritos premium y experiencia sin publicidad.</p>
              <button
                onClick={() => navigate('/upgrade')}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 999,
                  background: GOLD_GRAD,
                  color: '#060D1B',
                  border: 'none',
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(201,168,76,0.2)',
                }}
              >Desbloquear Premium →</button>
            </div>
          )}
        </div>

        {/* Logros */}
        <div style={{ marginBottom: 36 }}>
          <SectionLabel>Logros</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            {allBadges.map((badge) => {
              const unlocked = (user.badges || []).includes(badge.name);
              return (
                <div
                  key={badge.name}
                  style={{
                    padding: '12px 6px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'center',
                    opacity: unlocked ? 1 : 0.3,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 20,
                      color: unlocked ? badge.color : 'rgba(255,255,255,0.2)',
                      fontVariationSettings: "'wght' 300",
                      display: 'block',
                      lineHeight: 1,
                      textAlign: 'center',
                    }}
                  >{badge.icon}</span>
                  <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 10, color: '#4A4840', margin: '6px 0 0' }}>
                    {badge.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacidad (datos) */}
        <div style={{ marginBottom: 36 }}>
          <SectionLabel>Datos personales</SectionLabel>
          <div
            style={{
              borderRadius: 14,
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => { clearConsent(); alert('Preferencias de cookies reiniciadas.'); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: '"Outfit", sans-serif',
                fontSize: 13,
                color: '#8B7A6A',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', fontVariationSettings: "'wght' 300" }}
              >cookie</span>
              Revisar consentimiento
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        <div style={{ marginBottom: 36 }}>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', fontVariationSettings: "'wght' 300" }}
              >notifications</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 13, color: '#8B7A6A', margin: 0 }}>Notificaciones</p>
                <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 11, color: '#4A4840', margin: '2px 0 0' }}>
                  {notificationsEnabled ? 'Activadas' : 'Pausadas'}
                </p>
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 22,
                borderRadius: 999,
                padding: 2,
                background: notificationsEnabled ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  transform: notificationsEnabled ? 'translateX(18px)' : 'translateX(0)',
                  transition: 'transform 0.2s',
                }}
              />
            </div>
          </button>
        </div>

        {/* Información Legal */}
        <div style={{ marginBottom: 36 }}>
          <SectionLabel faint>Información legal</SectionLabel>
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {[
              { icon: 'gavel', label: 'Términos y condiciones', body: TERMS_TEXT },
              { icon: 'privacy_tip', label: 'Política de privacidad', body: PRIVACY_TEXT },
              { icon: 'health_and_safety', label: 'Aviso de salud', body: HEALTH_DISCLAIMER_TEXT },
            ].map((item, idx) => (
              <button
                key={item.label}
                onClick={() => alert(item.body)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 18,
                    color: '#4A4840',
                    fontVariationSettings: "'wght' 300",
                  }}
                >{item.icon}</span>
                <span
                  style={{
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: 13,
                    color: '#6A6460',
                    flex: 1,
                    textAlign: 'left',
                  }}
                >{item.label}</span>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.1)',
                    fontVariationSettings: "'wght' 300",
                  }}
                >chevron_right</span>
              </button>
            ))}
          </div>

          {/* Aviso de salud inline */}
          <div
            style={{
              marginTop: 12,
              background: 'rgba(232,168,124,0.05)',
              border: '1px solid rgba(232,168,124,0.15)',
              borderLeft: '3px solid #E8A87C',
              borderRadius: 12,
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 16,
                  color: '#E8A87C',
                  flexShrink: 0,
                  marginTop: 1,
                  fontVariationSettings: "'wght' 300",
                }}
              >warning</span>
              <p
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: 11,
                  color: '#A08570',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >{HEALTH_DISCLAIMER_TEXT}</p>
            </div>
          </div>
        </div>

        {/* CUENTA */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel faint>Cuenta</SectionLabel>
          <button
            onClick={() => { authService.logout(); navigate('/'); }}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 999,
              background: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#8B7A6A',
              fontFamily: '"Outfit", sans-serif',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, fontVariationSettings: "'wght' 300" }}
            >logout</span>
            Cerrar sesión
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeletingAccount}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 999,
              background: 'none',
              border: '1px solid rgba(232,100,100,0.2)',
              color: 'rgba(232,100,100,0.7)',
              fontFamily: '"Outfit", sans-serif',
              fontSize: 13,
              fontWeight: 500,
              cursor: isDeletingAccount ? 'not-allowed' : 'pointer',
              opacity: isDeletingAccount ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, fontVariationSettings: "'wght' 300" }}
            >delete</span>
            {isDeletingAccount ? 'Eliminando...' : 'Eliminar cuenta'}
          </button>
        </div>

        {/* Feedback link */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <a
            href="/community?theme=feedback"
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: 11,
              color: '#4A4840',
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >¿Cómo podemos mejorar?</a>
        </div>
      </div>
    </div>
  );
};
