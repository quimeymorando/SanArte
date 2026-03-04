import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useTheme } from '../context/ThemeContext';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { getStoredRoutines, toggleRoutine, deleteRoutine } from '../services/routineService';
import { historyService } from '../services/dataService';
import { Routine, SymptomLogEntry, Favorite, UserProfile } from '../types';
import { authService } from '../services/authService';
import { supabase } from '../supabaseClient';
import ManageSubscription from '../components/ManageSubscription';
import { accountService } from '../services/accountService';
import { clearConsent } from '../utils/consent';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const data = await historyService.getFavorites();
    if (data) setFavorites(data);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar de favoritos?")) return;
    try {
      await historyService.deleteFavoriteById(id);
      setFavorites((prev: Favorite[]) => prev.filter(f => f.id !== id));
    } catch (error) {
      logger.error(error);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 pt-32 pb-24">
      <h2 className="text-3xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
        <span className="text-3xl drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">💖</span> Mis Favoritos
      </h2>
      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-[#0a1114]/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 border-dashed">
          <p className="text-white/40 font-bold">Aún no tienes síntomas en tus favoritos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav: Favorite, index: number) => (
            <div key={index} onClick={() => navigate(`/symptom-detail?q=${encodeURIComponent(fav.symptom_name)}`)} className="relative bg-[#0a1114]/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 cursor-pointer hover:border-primary/30 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
              <h3 className="text-xl font-black text-white mb-2 pr-10 relative z-10">{fav.symptom_name}</h3>
              <p className="text-sm text-white/50 line-clamp-3 relative z-10">{fav.description}</p>
              <button
                onClick={(e: React.MouseEvent) => handleDelete(fav.id, e)}
                className="absolute top-4 right-4 z-50 p-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300"
                title="Eliminar de favoritos"
              >
                <span className="material-symbols-outlined text-[20px] font-bold">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const RoutinesPage: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [xpAdded, setXpAdded] = useState<number | null>(null);

  useEffect(() => {
    getStoredRoutines().then(setRoutines);
  }, []);

  const handleToggle = async (id: string) => {
    const routine = routines.find(r => r.id === id);
    if (!routine) return;

    // Optimistic update
    setRoutines((prev: Routine[]) => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));

    const { success, xpEarned } = await toggleRoutine(id, routine.completed);

    if (!success) {
      // Revert if failed
      setRoutines((prev: Routine[]) => prev.map(r => r.id === id ? { ...r, completed: routine.completed } : r));
    } else if (xpEarned > 0) {
      authService.addXP(xpEarned);
      setXpAdded(xpEarned);
      setTimeout(() => setXpAdded(null), 2000);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Confirmación amigable antes de eliminar
    if (!window.confirm("¿Estás segura/o de que quieres eliminar esta rutina de tu lista?")) {
      return;
    }

    const success = await deleteRoutine(id);
    if (success) {
      setRoutines((prev: Routine[]) => prev.filter(r => r.id !== id));
    }
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
    <div className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 pt-32 pb-24">
      {xpAdded && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 animate-bounce">
          <span>+{xpAdded} XP</span>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-3xl font-black text-white flex items-center gap-3"><span className="text-3xl drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">📅</span> Mis Rutinas Diarias</h1>
        <p className="text-white/50 mt-2 font-medium">Pequeños pasos para grandes cambios.</p>
      </div>

      <div className="space-y-4">
        {routines.map((routine: Routine) => (
          <div
            key={routine.id}
            onClick={() => handleToggle(routine.id)}
            className={`group relative overflow-hidden flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-300 cursor-pointer border ${routine.completed
              ? 'bg-white/5 border-white/5 opacity-50 grayscale'
              : 'bg-[#0a1114]/80 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:border-primary/30 hover:-translate-y-1'
              }`}
          >
            {/* Subtle highlight */}
            {!routine.completed && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[30px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors duration-500"></div>}

            <div className={`relative z-10 size-14 rounded-[1.2rem] flex items-center justify-center text-2xl transition-all duration-300 ${routine.completed
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
              : 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
              }`}>
              <span className="material-symbols-outlined font-black">{routine.completed ? 'check_circle' : getIcon(routine.category)}</span>
            </div>

            <div className="flex-1 relative z-10">
              <h3 className={`font-black tracking-wide text-lg transition-colors ${routine.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                {routine.text}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-xs font-bold px-2.5 py-1 ${routine.completed ? 'bg-white/5 text-white/30' : 'bg-white/10 text-white/60'} rounded-lg`}>{routine.time}</span>
                {routine.source && (
                  <span className={`text-[9px] font-black px-2.5 py-1 uppercase tracking-widest ${routine.completed ? 'bg-white/5 text-white/30' : 'bg-primary/10 text-primary'} rounded-lg`}>
                    {routine.source}
                  </span>
                )}
              </div>
            </div>

            <button onClick={(e: React.MouseEvent) => handleDelete(routine.id, e)} className="relative z-10 p-3 text-white/20 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all duration-300">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}

        {routines.length === 0 && (
          <div className="text-center py-12 text-white/40 font-bold bg-[#0a1114]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] border-dashed">
            No tienes rutinas activas. Busca un síntoma para agregar recomendaciones.
          </div>
        )}
      </div>
    </div>
  )
}

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState<SymptomLogEntry[]>([]);
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await historyService.getHistory();
      if (data) setHistoryItems(data);
    } catch (err) {
      logger.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar este registro?")) return;
    try {
      await historyService.deleteLog(id);
      setHistoryItems((prev: SymptomLogEntry[]) => prev.filter(i => i.id !== id));
    } catch (err) {
      logger.error(err);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 pt-32 pb-24">
      <h1 className="text-3xl font-black text-white mb-10 flex items-center gap-3"><span className="text-3xl drop-shadow-[0_0_15px_rgba(156,163,175,0.5)]">🕰️</span> Tu Historial</h1>
      <div className="space-y-4">
        {historyItems.length === 0 ? <p className="text-center py-20 bg-[#0a1114]/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 border-dashed text-white/40 font-bold">Aún no hay registros en tu historial.</p> : historyItems.map((item: SymptomLogEntry) => {
          const symptomName = item.notes?.replace('Síntoma: ', '').replace('Búsqueda: ', '').trim();
          return (
            <div
              key={item.id}
              onClick={() => symptomName ? navigate(`/symptom-detail?q=${encodeURIComponent(symptomName)}`) : null}
              className={`relative overflow-hidden bg-[#0a1114]/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 transition-all duration-300 group ${symptomName ? 'cursor-pointer hover:border-primary/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] active:scale-[0.98]' : ''}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
              <div className="flex justify-between mb-3 relative z-10">
                <span className="text-xs font-bold text-white/40 tracking-wider">{new Date(item.date).toLocaleDateString()}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${item.intensity > 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/5 text-white/50 border border-white/10'}`}>
                    {item.intensity > 0 ? `Intensidad ${item.intensity}` : '👁️ Visualizado'}
                  </span>
                  <button onClick={(e: React.MouseEvent) => handleDelete(item.id, e)} className="text-white/20 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition-all duration-300">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
              <p className="text-white font-medium text-lg relative z-10">
                {item.notes}
                {symptomName && <span className="material-symbols-outlined inline-block align-middle ml-2 text-primary opacity-50 text-sm group-hover:translate-x-1 group-hover:opacity-100 transition-all">arrow_forward</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subscriptionRef = React.useRef<HTMLDivElement>(null);

  // HOOKS MUST BE AT THE TOP LEVEL
  // const { theme, toggleTheme } = useTheme();

  // Handle Upgrade Redirect
  useEffect(() => {
    if (searchParams.get('upgrade') === 'true' && subscriptionRef.current) {
      setTimeout(() => {
        subscriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: Highlight effect
        subscriptionRef.current?.classList.add('ring-4', 'ring-amber-400');
        setTimeout(() => subscriptionRef.current?.classList.remove('ring-4', 'ring-amber-400'), 2000);
      }, 500); // Small delay to allow rendering
    }
  }, [searchParams, user]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      try {
        const newAvatarUrl = await authService.updateAvatar(file);
        if (newAvatarUrl) {
          setUser((prev: UserProfile | null) => prev ? ({ ...prev, avatar: newAvatarUrl }) : null);
        } else {
          alert('Error al subir imagen. Asegúrate de tener el bucket "avatars" creado en Supabase con acceso público.');
        }
      } catch (error) {
        logger.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleExportData = async () => {
    setIsExportingData(true);
    try {
      await accountService.downloadMyDataExport();
    } catch (error: any) {
      logger.error(error);
      alert(error?.message || 'No pudimos exportar tus datos en este momento.');
    } finally {
      setIsExportingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    const typedConfirmation = window.prompt('Para confirmar, escribe ELIMINAR. Esta accion es irreversible.');
    if (typedConfirmation !== 'ELIMINAR') return;

    const approved = window.confirm('Tu cuenta y sus datos asociados seran eliminados permanentemente. Deseas continuar?');
    if (!approved) return;

    setIsDeletingAccount(true);
    try {
      await accountService.deleteMyAccount();
      localStorage.removeItem('sanarte_favorites_cache');
      await authService.logout().catch(() => null);
      navigate('/', { replace: true });
      window.location.reload();
    } catch (error: any) {
      logger.error(error);
      alert(error?.message || 'No pudimos eliminar tu cuenta en este momento.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleConsentReset = () => {
    clearConsent();
    alert('Listo. Puedes ajustar tus preferencias desde el banner de privacidad.');
  };

  useEffect(() => {
    const loadUser = async () => {
      const userData = await authService.getUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  if (!user) {
    return <div className="flex-1 flex items-center justify-center"><span className="animate-spin material-symbols-outlined text-4xl text-primary">progress_activity</span></div>;
  }

  // --- HELPER LOGIC ---
  const getSoulTitle = (level: number) => {
    if (level < 3) return "Semilla Cósmica";
    if (level < 6) return "Brote de Luz";
    if (level < 10) return "Guerrero Espejo";
    return "Maestro del Loto";
  };

  const soulTitle = getSoulTitle(user.level || 1);
  const nextLevelXp = (user.level || 1) * 100; // Simplified logic
  const currentXp = user.xp || 0;
  const progressPercent = Math.min(100, (currentXp % 100) / 100 * 100);

  // Stats Reales
  const streak = user.currentStreak || 0;
  const healingMoments = user.healingMoments || 0;
  const xp = user.xp || 0;

  // Real Badges Logic
  const userBadges = user.badges || [];

  const allBadges = [
    { name: "Despertar", emoji: "👁️", color: "bg-cyan-900/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.4)]" },
    { name: "Constancia", emoji: "🔥", color: "bg-orange-900/30 text-orange-400 border border-orange-500/50 shadow-[0_0_20px_rgba(251,146,60,0.4)]" },
    { name: "Sabiduría", emoji: "🦉", color: "bg-purple-900/30 text-purple-400 border border-purple-500/50 shadow-[0_0_20px_rgba(192,132,252,0.4)]" },
    { name: "Alquimista", emoji: "⚗️", color: "bg-emerald-900/30 text-emerald-400 border border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.4)]" },
  ];

  const benefits = [
    { text: "Búsquedas de Síntomas", free: "3 al día", premium: "Ilimitadas" },
    { text: "Meditaciones IA", free: "Bloqueado", premium: "Acceso Total", highlight: true },
    { text: "Remedios Naturales", free: "Básico", premium: "Completo", highlight: true },
    { text: "Historial de Sanación", free: "7 días", premium: "Infinito" },
    { text: "Publicidad", free: "Con Anuncios", premium: "Sin Anuncios", highlight: true },
    { text: "Soporte", free: "Comunidad", premium: "Prioritario" },
  ];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 pt-32 pb-32">

      {/* 1. AURA HEADER */}
      <div className="relative mb-12 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

        <div className="relative inline-block mb-4">
          <svg className="size-32 -rotate-90">
            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-gray-800" />
            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-primary transition-all duration-1000 ease-out" strokeDasharray="377" strokeDashoffset={377 - (377 * progressPercent) / 100} strokeLinecap="round" />
          </svg>

          <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-white dark:border-surface-dark shadow-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center group">
            {/* Mensaje sutil si no hay foto */}
            {!user.avatar && (
              <div className="absolute bottom-6 left-0 right-0 text-center z-20 pointer-events-none">
                <span className="text-[10px] bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-md">Sube tu foto</span>
              </div>
            )}
            {user.avatar ? (
              <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-primary/50">{user.name.charAt(0).toUpperCase()}</span>
            )}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
            >
              {isUploading ? (
                <span className="material-symbols-outlined animate-spin text-white">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-surface-dark rounded-full p-2 shadow-lg text-primary text-xs font-black border border-gray-100 dark:border-gray-700">
            Lvl {user.level}
          </div>
        </div>

        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{user.name}</h2>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 animate-gradient">
          {soulTitle}
        </p>
      </div>

      {/* 2. MY PATH (STATS) */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-12">
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-lg flex flex-col items-center">
          <span className="text-2xl md:text-3xl mb-1">🔥</span>
          <span className="text-xl md:text-2xl font-black text-gray-800 dark:text-white">{streak}</span>
          <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider font-bold">Racha días</span>
          {streak > 0 && <span className="text-[9px] text-green-500 font-bold mt-1">¡Sigue así!</span>}
          {streak === 0 && <span className="text-[9px] text-orange-400 font-bold mt-1">¡Empieza hoy!</span>}
        </div>
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-lg flex flex-col items-center border-t-4 border-t-primary/50">
          <span className="text-2xl md:text-3xl mb-1">⚡</span>
          <span className="text-xl md:text-2xl font-black text-gray-800 dark:text-white">{xp}</span>
          <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider font-bold">XP Total</span>
        </div>
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-lg flex flex-col items-center">
          <span className="text-2xl md:text-3xl mb-1">✨</span>
          <span className="text-xl md:text-2xl font-black text-gray-800 dark:text-white">{healingMoments}</span>
          <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider font-bold">Sanaciones</span>
        </div>
      </div>

      {/* 3. CONSTELLATION (BADGES) */}
      <div className="mb-12">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
          <span className="text-2xl animate-pulse">🌌</span>
          Constelación de Logros
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x px-2 -mx-2">
          {allBadges.map((badge, idx) => {
            const isUnlocked = userBadges.includes(badge.name);
            return (
              <div key={idx} className={`snap-center min-w-[110px] flex flex-col items-center gap-3 transition-all duration-500 ${isUnlocked ? 'opacity-100 scale-100 hover:scale-105 hover:-translate-y-1' : 'opacity-30 grayscale scale-95'}`}>
                <div className={`relative size-20 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-xl transition-all duration-500 overflow-hidden border ${isUnlocked ? badge.color + ' animate-in fade-in zoom-in' : 'bg-white/5 border-white/10 text-white/20'}`}>
                  {isUnlocked && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-50"></div>}
                  <span className={`relative z-10 ${!isUnlocked && 'opacity-20'}`}>{badge.emoji}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-xs font-black tracking-wide text-center leading-tight ${isUnlocked ? 'text-white' : 'text-white/40'}`}>
                    {badge.name}
                  </span>
                  {!isUnlocked ? (
                    <span className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold bg-white/5 px-2 py-0.5 rounded-md">Locked</span>
                  ) : (
                    <span className="text-[9px] text-emerald-400 uppercase tracking-[0.2em] font-bold bg-emerald-400/10 px-2 py-0.5 rounded-md animate-pulse">Earned</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SUBSCRIPTION MANAGEMENT */}
      <div className="mb-12" ref={subscriptionRef}>
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <span className="text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">💳</span>
          Tu Suscripción
        </h3>
        <ManageSubscription isPremium={user.isPremium} userEmail={user.email} />
        {!user.isPremium && (
          <button
            onClick={() => navigate('/upgrade')}
            className="relative overflow-hidden w-full mt-4 h-14 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="text-lg relative z-10 transition-transform group-hover:scale-110">👑</span>
            <span className="relative z-10">Conocer Beneficios</span>
          </button>
        )}
      </div>

      <div className="mb-12">
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          Privacidad y Datos
        </h3>
        <div className="bg-[#0a1114]/60 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6">
          <p className="text-sm text-white/60 leading-relaxed mb-4">
            Descarga una copia de tus datos o elimina tu cuenta cuando quieras.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={handleExportData}
              disabled={isExportingData || isDeletingAccount}
              className="h-12 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-black uppercase tracking-wider hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
            >
              {isExportingData ? 'Generando archivo...' : 'Descargar mis datos'}
            </button>

            <button
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || isExportingData}
              className="h-12 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-black uppercase tracking-wider hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {isDeletingAccount ? 'Eliminando cuenta...' : 'Eliminar mi cuenta'}
            </button>
          </div>

          <p className="mt-3 text-[11px] text-white/40">
            La eliminacion es permanente e invalida tu acceso inmediatamente.
          </p>

          <button
            onClick={handleConsentReset}
            className="mt-3 h-10 rounded-xl border border-white/15 bg-white/5 px-4 text-[11px] font-black uppercase tracking-wider text-white/70 transition-colors hover:bg-white/10"
          >
            Revisar consentimiento de cookies
          </button>
        </div>
      </div>

      {/* 5. HARMONY MENU (SETTINGS) */}
      <div className="bg-[#0a1114]/60 backdrop-blur-xl rounded-[2.5rem] p-3 shadow-xl border border-white/5 mt-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[50px] rounded-full pointer-events-none"></div>

        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className="w-full flex items-center justify-between p-4 px-5 hover:bg-white/5 rounded-[1.5rem] transition-colors group relative z-10"
        >
          <div className="flex items-center gap-4">
            <div className={`size-12 rounded-[1rem] flex items-center justify-center text-2xl transition-colors border ${notificationsEnabled ? 'bg-primary/20 border-primary/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/10 grayscale opacity-50'}`}>
              {notificationsEnabled ? '🔔' : '🔕'}
            </div>
            <div className="text-left">
              <span className="block font-bold text-white text-base">Notificaciones</span>
              <span className="text-xs text-white/50">{notificationsEnabled ? 'Recordatorios diarios ON' : 'Pausadas'}</span>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-primary/50' : 'bg-white/10'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${notificationsEnabled ? 'translate-x-6 shadow-[0_0_10px_white]' : 'translate-x-0'}`}></div>
          </div>
        </button>

        <div className="h-px bg-white/10 mx-6 my-3 relative z-10"></div>

        <button
          onClick={() => { authService.logout(); navigate('/'); }}
          className="w-full flex items-center justify-between p-4 px-5 hover:bg-red-500/10 rounded-[1.5rem] transition-colors group relative z-10 border border-transparent hover:border-red-500/20"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-[1rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl group-hover:bg-red-500/20 group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              🚪
            </div>
            <div className="text-left">
              <span className="block font-bold text-red-500 text-base">Cerrar Sesión</span>
              <span className="text-xs text-red-400/50">Hasta la próxima sanación</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-red-500/50 group-hover:text-red-500 group-hover:translate-x-1 transition-all">chevron_right</span>
        </button>
      </div>



      <div className="mt-8 text-center pb-8">
        <a href="/community?theme=feedback" className="text-sm text-primary font-bold hover:underline opacity-80 decoration-dashed underline-offset-4">
          ¿Cómo podemos mejorar? Tu opinión nos sana.
        </a>
      </div>

    </div >
  );
};
