
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchCatalog, getSymptomDetails, searchLocalSymptoms } from '../services/geminiService';
import { updateStreak } from '../services/routineService';
import { authService } from '../services/authService';
import { OnboardingTour } from '../components/OnboardingTour';
import AdBanner from '../components/AdBanner';
import { SearchResult, UserProfile } from '../types';
import { logger } from '../utils/logger';


export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('');
  const [showBreathing, setShowBreathing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Breathing State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(4);

  useEffect(() => {
    const checkOnboarding = () => {
      const completed = localStorage.getItem('sanarte_onboarding_completed');
      if (!completed) {
        setShowOnboarding(true);
      }
    };

    const loadData = async () => {
      const s = updateStreak();
      setStreak(s);
      const u = await authService.getUser();
      setUser(u);
      checkOnboarding();
    };
    loadData();

    // Greeting logic
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 19) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
    // Gender Neutrality: Welcome message is handled in the render
  }, [],);

  const completeOnboarding = () => {
    localStorage.setItem('sanarte_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const toggleBreathing = () => setShowBreathing(!showBreathing);

  // 4-7-8 Breathing Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathCount((prev) => {
          if (prev > 1) return prev - 1;
          if (breathPhase === 'inhale') {
            setBreathPhase('hold');
            return 7;
          } else if (breathPhase === 'hold') {
            setBreathPhase('exhale');
            return 8;
          } else {
            setBreathPhase('inhale');
            return 4;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathing, breathPhase]);

  const getBreathInstructions = () => {
    switch (breathPhase) {
      case 'inhale': return { text: "Inhala Paz", sub: "Llena tus pulmones", color: "text-white" };
      case 'hold': return { text: "Retén", sub: "Siente la calma", color: "text-blue-100" };
      case 'exhale': return { text: "Exhala", sub: "Suelta la ansiedad", color: "text-emerald-100" };
    }
  };

  const getCircleStyle = () => {
    const base = "w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all ease-in-out border-4 border-white/30 relative z-20";
    if (breathPhase === 'inhale') return `${base} bg-white/20 scale-125 duration-[4000ms]`;
    if (breathPhase === 'hold') return `${base} bg-white/30 scale-125 duration-0 animate-pulse`;
    if (breathPhase === 'exhale') return `${base} bg-white/10 scale-90 duration-[8000ms]`;
    return base;
  };

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearchQuery.trim()) {
      authService.addXP(20);
      navigate(`/search?initial=${encodeURIComponent(homeSearchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  const levelProgress = ((user?.xp || 0) % 500) / 500 * 100;
  const levelTitle = user?.level === 1 ? "Semilla Despierta" : user?.level === 2 ? "Brote de Luz" : "Loto en Expansión";

  return (
    <div className="relative flex min-h-screen w-full flex-col pb-32 bg-[#0a1114]">
      {/* Onboarding Tour */}
      {showOnboarding && <OnboardingTour onComplete={completeOnboarding} />}

      {/* Floating Action Button (FAB) for Quick Community Access */}
      <button
        onClick={() => navigate('/community')}
        className="fixed bottom-24 right-6 size-14 bg-gradient-to-tr from-pink-500 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center animate-in zoom-in duration-300 hover:scale-105 active:scale-95 z-40 md:hidden"
      >
        <span className="material-symbols-outlined text-2xl">diversity_1</span>
      </button>

      {/* Mobile Navigation Bar (TOP HEADER) */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-[#0a1114]/80 backdrop-blur-xl border-b border-white/5 z-50 shadow-sm transition-all duration-300">
        <div className="flex flex-col max-w-[1200px] mx-auto w-full">
          <div className="flex items-center justify-between px-5 py-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="size-9 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center text-primary shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <span className="material-symbols-outlined text-xl">spa</span>
              </div>
              <div>
                <h2 className="text-white text-base font-black tracking-tight leading-none">SanArte</h2>
                <p className="text-[8px] uppercase tracking-[0.2em] font-black text-primary/80 mt-0.5">{levelTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end gap-1 mr-2">
                <div className="flex items-center gap-1 text-[10px] font-black text-orange-400 uppercase">
                  <span className="material-symbols-outlined text-sm">local_fire_department</span>
                  <span>{streak} días</span>
                </div>
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${levelProgress}%` }}></div>
                </div>
              </div>
              <div
                onClick={() => navigate('/profile')}
                className="relative cursor-pointer group"
              >
                {user?.avatar ? (
                  <div className="size-10 rounded-2xl bg-cover bg-center border-2 border-white dark:border-gray-800 shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundImage: `url('${user.avatar}')` }}></div>
                ) : (
                  <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-lg group-hover:scale-110 transition-transform text-primary font-black text-xl">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 size-4 bg-primary text-white text-[8px] font-black rounded-lg flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-md">
                  {user?.level}
                </div>
              </div>
            </div>
          </div>
          {/* Mobile Level Progress Bar */}
          <div className="sm:hidden h-1 w-full bg-white/5 relative z-10">
            <div className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${levelProgress}%` }}></div>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-5 py-6 pt-32 md:pt-36">
        <div className="mb-6 flex justify-between items-end relative z-10">
          <div className="flex flex-col gap-1">

            <h1 className="text-white text-2xl md:text-3xl font-black leading-tight tracking-tight drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Hola, {user?.name ? user.name.split(' ')[0] : 'Sanador/a'} 🌿
            </h1>
            <p className="text-white/60 text-sm font-medium">
              ¿Qué parte de tu alma desea expresarse hoy?
            </p>
          </div>
        </div>

        {/* AD BANNER */}
        <div className="relative z-10">
          <AdBanner />
        </div>

        <form onSubmit={handleHomeSearch} className="mb-10 group relative w-full z-10">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-white/40 group-focus-within:text-primary transition-colors text-xl">search</span>
          </div>
          <input
            type="text"
            value={homeSearchQuery}
            onChange={(e) => setHomeSearchQuery(e.target.value)}
            placeholder="Ej: Ansiedad, Dolor de cabeza, Miedo..."
            className="w-full h-14 pl-12 pr-28 rounded-[1.5rem] bg-[#0a1114]/60 backdrop-blur-xl border border-white/5 shadow-lg shadow-black/20 text-base text-white placeholder-white/20 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none font-medium"
          />
          <button type="submit" className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-primary to-cyan-500 text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm transition-all duration-300 flex items-center justify-center active:scale-95 group/btn">
            Buscar
          </button>
        </form>

        {/* BREATHE SOS - Moved Below Search */}
        <div className={`mb-10 w-full rounded-[2rem] p-6 shadow-2xl transition-all duration-700 relative overflow-hidden group border border-white/5 backdrop-blur-xl ${isBreathing ? 'bg-[#0a1114]/90 h-[280px]' : 'bg-[#0a1114]/60 h-auto hover:border-white/10'}`}>
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none transition-all duration-1000 ${isBreathing ? 'bg-indigo-500/20 scale-150 relative z-0' : 'bg-emerald-500/10 group-hover:bg-emerald-500/20'}`}></div>

          {!isBreathing ? (
            <div className="flex items-center justify-between relative z-10">
              <div className="flex gap-4 items-center">
                <div className="size-14 bg-white/5 rounded-[1.2rem] border border-white/10 flex items-center justify-center backdrop-blur-md text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <span className="material-symbols-outlined text-[28px]">air</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white mb-0.5 drop-shadow-md">Pausa Sagrada</h3>
                  <p className="text-white/50 text-xs font-medium max-w-[200px] leading-tight">Técnica para la ansiedad. Toca el botón y reinicia tu centro.</p>
                </div>
              </div>
              <button
                onClick={() => { setIsBreathing(true); setBreathCount(4); setBreathPhase('inhale'); }}
                className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-400 px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
              >
                Respirar
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full relative z-10">
              <div className="relative mb-6">
                <div className={getCircleStyle().replace('w-32 h-32', 'size-24')}>
                  <span className="text-4xl font-black font-heading">{breathCount}</span>
                </div>
                <div className={`absolute inset-0 rounded-full border-4 border-white/10 ${breathPhase === 'exhale' ? 'scale-150 opacity-0 transition-transform duration-[8000ms]' : 'scale-100 opacity-100'}`}></div>
              </div>

              <div className="text-center space-y-1">
                <h3 className={`text-2xl font-black tracking-tighter uppercase ${getBreathInstructions().color} transition-colors duration-500`}>
                  {getBreathInstructions().text}
                </h3>
                <p className="text-indigo-200 text-sm font-bold animate-pulse">
                  {getBreathInstructions().sub}
                </p>
              </div>

              <button onClick={() => setIsBreathing(false)} className="absolute top-0 right-0 p-4 text-white/30 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
          )}
        </div>

        {/* 2x2 Grid - Polished */}
        <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
          {[
            { id: 'community', name: 'Comunidad', emoji: '🤝', badge: 'bg-primary/20 text-primary border-primary/30', xp: '+10 Luz' },
            { id: 'favorites', name: 'Favoritos', emoji: '💖', badge: 'bg-pink-500/20 text-pink-400 border-pink-500/30', xp: 'Ver listado' },
            { id: 'routines', name: 'Rutinas', emoji: '📅', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', xp: '+50 Luz' },
            { id: 'journal', name: 'Diario', emoji: '📖', badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', xp: 'Tu sanación' },
          ].map(item => (
            <div
              key={item.id}
              onClick={() => navigate(`/${item.id}`)}
              className={`bg-[#0a1114]/60 backdrop-blur-xl p-5 rounded-[2rem] shadow-lg border border-white/5 flex flex-col items-center justify-center gap-3 active:scale-95 transition-all duration-300 cursor-pointer hover:border-white/20 group relative overflow-hidden h-36`}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-[20px] -mr-8 -mt-8 pointer-events-none group-hover:bg-primary/10 transition-colors duration-500"></div>

              <div className={`size-12 rounded-[1.2rem] flex items-center justify-center text-2xl group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 border ${item.badge} shadow-lg`}>
                {item.emoji}
              </div>
              <div className="text-center">
                <span className="block text-sm font-black text-white group-hover:text-primary transition-colors duration-300">{item.name}</span>
                <span className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1 group-hover:text-white/60 transition-colors">{item.xp}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center px-8 py-6 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-xl relative z-10">
          <p className="text-sm font-serif italic text-white/60 drop-shadow-sm">"Toda sanación física comienza en la quietud de la mente."</p>
        </div>

      </main>
    </div>
  );
};

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('initial') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Ref for click outside logic
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  const phrases = [
    "Conectando con la sabiduría de tu cuerpo...",
    "Buscando la luz en tus síntomas...",
    "Preparando tu camino hacia la sanación...",
    "Interpretando el lenguaje sagrado de tu alma...",
    "Atrayendo las respuestas que necesitas..."
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLoading) {
      interval = setInterval(() => setPhraseIndex(p => (p + 1) % phrases.length), 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (initialQuery && !hasSearched) handleSearch(initialQuery);
  }, [initialQuery]);

  const handleSearch = async (searchTerm: string = query) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    setResults([]);
    try {
      const data = await searchCatalog(searchTerm);
      setResults(data);
    } catch (error) {
      logger.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full pb-24 min-h-screen bg-[#0a1114] md:pt-20">
      <div className="sticky top-0 z-20 bg-[#0a1114]/80 backdrop-blur-xl pt-4 pb-4 px-6 border-b border-white/5 md:static md:bg-transparent md:border-none md:p-0 md:mb-8 transition-all">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="size-12 rounded-[1.2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 md:hidden shadow-lg">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div ref={searchContainerRef} className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-white/30 group-focus-within:text-primary transition-colors text-xl">search</span>
            </div>
            <input
              className="w-full h-14 pl-12 pr-12 rounded-[1.5rem] bg-[#0a1114]/60 backdrop-blur-xl border border-white/5 shadow-lg shadow-black/20 text-white placeholder-white/20 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all outline-none font-medium"
              placeholder="Ej: Tristeza, Dolor lumbar, Ansiedad..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              autoFocus={!initialQuery}
              autoComplete="off"
              name="search_query_unique_id"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 mt-10">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative w-48 h-48 flex items-center justify-center mb-16">
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-6 border border-purple-400/20 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div>
              <div className="relative size-10 bg-primary/20 border border-primary/50 text-primary flex items-center justify-center rounded-full shadow-[0_0_30px_#0db9f2] animate-pulse">
                <span className="material-symbols-outlined text-2xl">magic_button</span>
              </div>
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Sintonizando...</h3>
            <p className="text-primary/80 font-bold italic h-8 tracking-wide drop-shadow-md">{phrases[phraseIndex]}</p>
          </div>
        )}


        {!isLoading && results.length === 0 && hasSearched && (
          <div className="text-center py-20 animate-in fade-in zoom-in duration-500 bg-[#0a1114]/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 border-dashed relative overflow-hidden group">
            <div className="text-6xl mb-6 opacity-80 group-hover:scale-110 transition-transform duration-500">🌪️</div>
            <h3 className="text-2xl font-black text-white mb-3">La energía está difusa...</h3>
            <p className="text-white/50 max-w-md mx-auto font-medium">
              No encontramos un síntoma exacto con ese nombre. <br />
              Intenta usar palabras simples como "Cabeza", "Estómago" o "Miedo".
            </p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="flex flex-col gap-6">



            {/* Fallback Warning - Only shows when offline/fallback data is used */}
            {results[0] && results[0].isFallback && (
              <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-[2rem] flex items-start gap-4 mb-4 animate-in fade-in slide-in-from-top-2 backdrop-blur-xl">
                <span className="material-symbols-outlined text-orange-400 text-2xl drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">wifi_off</span>
                <div className="flex-1">
                  <h4 className="font-black text-orange-400 text-sm tracking-wider uppercase mb-1">Conexión Débil</h4>
                  <p className="text-orange-200/60 text-xs font-medium leading-relaxed">
                    Mostrando resultados básicos de emergencia. La conexión con la Inteligencia Artificial está pausada.
                  </p>
                </div>
              </div>
            )}

            {results.map((result, index) => {
              if (!result) return null; // Safety check
              return (
                <div
                  key={index}
                  onClick={() => navigate(`/symptom-detail?q=${encodeURIComponent(result.name || '')}`)}
                  className="group bg-[#0a1114]/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/40 hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>

                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-4 group-hover:translate-x-0">
                    <span className="material-symbols-outlined text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] text-xl">arrow_forward</span>
                  </div>

                  <div className="mb-3 relative z-10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/80 mb-1 block">
                      {result.category || 'General'}
                    </span>
                    <h3 className="font-black text-xl text-white capitalize leading-tight group-hover:text-primary transition-colors">
                      {result.name || 'Sin nombre'}
                    </h3>
                  </div>

                  <p className="text-white/60 text-sm leading-relaxed line-clamp-2 md:line-clamp-3 relative z-10 font-medium h-10 md:h-14">
                    {result.emotionalMeaning || 'Explora el significado emocional oculto detrás de esto.'}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div >
  )
}
