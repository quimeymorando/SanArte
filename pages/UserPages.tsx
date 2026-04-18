import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getStoredRoutines, toggleRoutine, deleteRoutine } from '../services/routineService';
import { historyService } from '../services/dataService';
import { Routine, SymptomLogEntry, Favorite, UserProfile } from '../types';
import { authService } from '../services/authService';
import { supabase } from '../supabaseClient';
import ManageSubscription from '../components/ManageSubscription';
import { accountService } from '../services/accountService';
import { clearConsent } from '../utils/consent';

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
    <div className="min-h-screen bg-[#080c0f] pb-28 pt-20 px-5">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-white mb-1">Favoritos</h1>
        <p className="text-white/25 text-sm mb-6">Tus síntomas guardados</p>

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="size-14 rounded-full bg-white/[0.03] mx-auto mb-4 flex items-center justify-center">
              <span className="material-symbols-outlined text-white/15 text-2xl">favorite</span>
            </div>
            <p className="text-white/25 text-sm">Aún no tenés favoritos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {favorites.map((fav, i) => (
              <button
                key={i}
                onClick={() => navigate(`/symptom-detail?q=${encodeURIComponent(fav.symptom_name)}`)}
                className="text-left p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all group relative"
              >
                <h3 className="text-sm font-medium text-white group-hover:text-teal-300 transition-colors pr-8">{fav.symptom_name}</h3>
                <p className="text-[12px] text-white/25 line-clamp-2 mt-1">{fav.description}</p>
                <div
                  onClick={(e) => handleDelete(fav.id, e)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-white/0 group-hover:text-white/20 hover:!text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ─── ROUTINES PAGE ──────────────────────────────────
// ═══════════════════════════════════════════════════════

export const RoutinesPage: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [xpAdded, setXpAdded] = useState<number | null>(null);

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

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'meditation': return 'self_improvement';
      case 'infusion': return 'local_cafe';
      case 'spiritual': return 'volunteer_activism';
      default: return 'check_circle';
    }
  };

  return (
    <div className="min-h-screen bg-[#080c0f] pb-28 pt-20 px-5">
      <div className="max-w-xl mx-auto">
        {xpAdded && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-teal-500 text-black px-4 py-2 rounded-full font-semibold text-sm animate-bounce">
            +{xpAdded} XP
          </div>
        )}

        <h1 className="text-xl font-bold text-white mb-1">Rutinas</h1>
        <p className="text-white/25 text-sm mb-6">Hábitos que transforman tu vida</p>

        <div className="space-y-2.5">
          {routines.map((routine) => (
            <div
              key={routine.id}
              onClick={() => handleToggle(routine.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer border group ${
                routine.completed
                  ? 'bg-white/[0.01] border-white/[0.04] opacity-40'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
              }`}
            >
              <div className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                routine.completed
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-white/[0.05] text-white/40'
              }`}>
                <span className="material-symbols-outlined text-xl">
                  {routine.completed ? 'check_circle' : getIcon(routine.category)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium ${routine.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                  {routine.text}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-white/20">{routine.time}</span>
                  {routine.source && (
                    <span className="text-[10px] text-teal-400/40 font-medium">{routine.source}</span>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(routine.id, e)}
                className="p-1.5 rounded-lg text-white/0 group-hover:text-white/20 hover:!text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          ))}

          {routines.length === 0 && (
            <div className="text-center py-20">
              <div className="size-14 rounded-full bg-white/[0.03] mx-auto mb-4 flex items-center justify-center">
                <span className="material-symbols-outlined text-white/15 text-2xl">routine</span>
              </div>
              <p className="text-white/25 text-sm">Sin rutinas activas.</p>
              <p className="text-white/15 text-xs mt-1">Buscá un síntoma para agregar recomendaciones.</p>
            </div>
          )}
        </div>
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
    <div className="min-h-screen bg-[#080c0f] pb-28 pt-20 px-5">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-bold text-white mb-6">Historial</h1>
        {items.length === 0 ? (
          <p className="text-center py-20 text-white/25 text-sm">Sin registros.</p>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => {
              const name = item.notes?.replace('Consulta: ', '').trim();
              return (
                <div
                  key={item.id}
                  onClick={() => name ? navigate(`/symptom-detail?q=${encodeURIComponent(name)}`) : null}
                  className={`p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] group transition-all ${name ? 'cursor-pointer hover:bg-white/[0.04]' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-white font-medium">{item.notes}</p>
                      <span className="text-[11px] text-white/20 mt-0.5 block">{new Date(item.date).toLocaleDateString('es-AR')}</span>
                    </div>
                    <button onClick={(e) => handleDelete(item.id, e)} className="p-1.5 text-white/0 group-hover:text-white/20 hover:!text-red-400 transition-all">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
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
// ─── PROFILE PAGE ───────────────────────────────────
// ═══════════════════════════════════════════════════════

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subscriptionRef = React.useRef<HTMLDivElement>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
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

  const handleExportData = async () => {
    setIsExportingData(true);
    try { await accountService.downloadMyDataExport(); }
    catch (error: any) { logger.error(error); alert(error?.message || 'Error al exportar.'); }
    finally { setIsExportingData(false); }
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
      <div className="min-h-screen bg-[#080c0f] flex items-center justify-center">
        <span className="material-symbols-outlined text-white/10 text-3xl animate-pulse">self_improvement</span>
      </div>
    );
  }

  const getSoulTitle = (level: number) => {
    if (level < 3) return "Semilla Cósmica";
    if (level < 6) return "Brote de Luz";
    if (level < 10) return "Guerrero Espejo";
    return "Maestro del Loto";
  };

  const progressPercent = Math.min(100, ((user.xp || 0) % 100));
  const allBadges = [
    { name: "Despertar", icon: "visibility", color: "text-teal-400" },
    { name: "Constancia", icon: "local_fire_department", color: "text-orange-400" },
    { name: "Sabiduría", icon: "psychology", color: "text-violet-400" },
    { name: "Alquimista", icon: "science", color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen bg-[#080c0f] pb-28 pt-20 px-5">
      <div className="max-w-md mx-auto">

        {/* Avatar + Name */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            {/* Progress ring */}
            <svg className="size-24 -rotate-90">
              <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/[0.06]" />
              <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-teal-500 transition-all duration-1000" strokeDasharray="276.5" strokeDashoffset={276.5 - (276.5 * progressPercent) / 100} strokeLinecap="round" />
            </svg>

            <div
              className="absolute inset-2 rounded-full overflow-hidden bg-white/[0.05] flex items-center justify-center cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white/30">{user.name.charAt(0).toUpperCase()}</span>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <span className="material-symbols-outlined animate-spin text-white text-xl">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
            </div>

            <div className="absolute -bottom-1 -right-1 bg-[#080c0f] text-teal-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/[0.08]">
              Lv{user.level}
            </div>
          </div>

          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-sm text-teal-400/50 mt-0.5">{getSoulTitle(user.level || 1)}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-8">
          {[
            { icon: 'local_fire_department', label: 'Racha', value: user.currentStreak || 0, color: 'text-orange-400' },
            { icon: 'diamond', label: 'XP', value: user.xp || 0, color: 'text-teal-400' },
            { icon: 'spa', label: 'Sanaciones', value: user.healingMoments || 0, color: 'text-violet-400' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <span className={`material-symbols-outlined text-xl ${s.color} opacity-60`}>{s.icon}</span>
              <p className="text-lg font-semibold text-white mt-1 tabular-nums">{s.value}</p>
              <p className="text-[10px] text-white/20 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="mb-8">
          <p className="text-sm font-medium text-white/40 mb-3">Logros</p>
          <div className="flex gap-3">
            {allBadges.map((badge) => {
              const unlocked = (user.badges || []).includes(badge.name);
              return (
                <div key={badge.name} className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                  unlocked
                    ? 'bg-white/[0.03] border-white/[0.08]'
                    : 'bg-white/[0.01] border-white/[0.04] opacity-30'
                }`}>
                  <span className={`material-symbols-outlined text-xl ${unlocked ? badge.color : 'text-white/20'}`}>{badge.icon}</span>
                  <p className="text-[10px] text-white/30 mt-1">{badge.name}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription */}
        <div className="mb-6" ref={subscriptionRef}>
          <p className="text-sm font-medium text-white/40 mb-3">Suscripción</p>
          <ManageSubscription isPremium={user.isPremium} userEmail={user.email} />
          {!user.isPremium && (
            <button
              onClick={() => navigate('/upgrade')}
              className="w-full mt-3 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold text-sm transition-all active:scale-[0.98]"
            >
              Conocer Premium
            </button>
          )}
        </div>

        {/* Privacy */}
        <div className="mb-6">
          <p className="text-sm font-medium text-white/40 mb-3">Privacidad</p>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.06]">
            <button
              onClick={handleExportData}
              disabled={isExportingData}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.03] transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg text-white/20">download</span>
              {isExportingData ? 'Generando...' : 'Descargar mis datos'}
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.04] transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              {isDeletingAccount ? 'Eliminando...' : 'Eliminar mi cuenta'}
            </button>
            <button
              onClick={() => { clearConsent(); alert('Preferencias de cookies reiniciadas.'); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm text-white/30 hover:text-white/50 hover:bg-white/[0.03] transition-all"
            >
              <span className="material-symbols-outlined text-lg text-white/15">cookie</span>
              Revisar consentimiento
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.06] mb-8">
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg text-white/20">notifications</span>
              <div className="text-left">
                <span className="text-sm text-white/60 block">Notificaciones</span>
                <span className="text-[11px] text-white/20">{notificationsEnabled ? 'Activadas' : 'Pausadas'}</span>
              </div>
            </div>
            <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${notificationsEnabled ? 'bg-teal-500/50' : 'bg-white/10'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${notificationsEnabled ? 'translate-x-5' : ''}`} />
            </div>
          </button>

          <button
            onClick={() => { authService.logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.04] transition-all"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Cerrar sesión
          </button>
        </div>

        {/* Feedback link */}
        <div className="text-center pb-8">
          <a href="/community?theme=feedback" className="text-xs text-white/20 hover:text-teal-400 transition-colors">
            ¿Cómo podemos mejorar?
          </a>
        </div>
      </div>
    </div>
  );
};
