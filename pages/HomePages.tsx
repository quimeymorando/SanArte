
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchCatalog } from '../services/geminiService';
import { authService } from '../services/authService';
import { OnboardingTour } from '../components/OnboardingTour';
import { SearchResult, UserProfile } from '../types';
import { logger } from '../utils/logger';

// HomePage is now handled entirely by BentoGrid — keeping this export
// for backward compatibility (lazy import in App.tsx still references it)
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/home', { replace: true }); }, [navigate]);
  return null;
};

// ═══════════════════════════════════════════════════════
// ─── SEARCH PAGE ────────────────────────────────────
// ═══════════════════════════════════════════════════════

const loadingPhrases = [
  "Conectando con la sabiduría de tu cuerpo...",
  "Buscando la luz en tus síntomas...",
  "Interpretando el lenguaje de tu alma...",
];

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('initial') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLoading) {
      interval = setInterval(() => setPhraseIndex(p => (p + 1) % loadingPhrases.length), 3000);
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
    <div className="min-h-screen bg-[#080c0f] pb-28">
      {/* Search Bar */}
      <div className="sticky top-0 z-20 bg-[#080c0f]/90 backdrop-blur-xl pt-20 md:pt-24 pb-4 px-5 border-b border-white/[0.06]">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="size-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all md:hidden flex-shrink-0"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>

          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 text-xl pointer-events-none">search</span>
            <input
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[15px] placeholder-white/20 focus:border-teal-500/40 outline-none transition-colors"
              placeholder="Describí tu síntoma..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              autoFocus={!initialQuery}
              autoComplete="off"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={!query.trim()}
            className="h-12 px-5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:bg-white/[0.06] disabled:text-white/20 text-black font-semibold text-sm transition-all active:scale-95 flex-shrink-0"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 mt-6">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative size-16 mb-8">
              <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 animate-[spin_8s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-white/10 animate-[spin_5s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-400 text-2xl animate-pulse">self_improvement</span>
              </div>
            </div>
            <p className="text-white/30 text-sm italic">{loadingPhrases[phraseIndex]}</p>
          </div>
        )}

        {/* No results */}
        {!isLoading && results.length === 0 && hasSearched && (
          <div className="text-center py-20">
            <div className="size-16 rounded-full bg-white/[0.03] mx-auto mb-5 flex items-center justify-center">
              <span className="material-symbols-outlined text-white/20 text-3xl">search_off</span>
            </div>
            <h3 className="text-lg font-semibold text-white/60 mb-2">Sin resultados</h3>
            <p className="text-white/25 text-sm max-w-sm mx-auto leading-relaxed">
              Intentá con palabras más simples como "cabeza", "estómago" o "ansiedad".
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-3">
            {/* Fallback warning */}
            {results[0]?.isFallback && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/10 mb-4">
                <span className="material-symbols-outlined text-amber-400/60 text-xl mt-0.5">cloud_off</span>
                <div>
                  <p className="text-amber-300/70 text-sm font-medium">Conexión limitada</p>
                  <p className="text-amber-200/30 text-xs mt-0.5">
                    Mostrando resultados básicos. La IA se reconectará pronto.
                  </p>
                </div>
              </div>
            )}

            {results.map((result, index) => {
              if (!result) return null;
              return (
                <button
                  key={index}
                  onClick={() => navigate(`/symptom-detail?q=${encodeURIComponent(result.name || '')}`)}
                  className="w-full text-left p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-teal-500/20 transition-all duration-200 active:scale-[0.98] group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400/60 mb-1 block">
                        {result.category || 'General'}
                      </span>
                      <h3 className="font-semibold text-white text-base capitalize leading-tight mb-1.5 group-hover:text-teal-300 transition-colors">
                        {result.name || 'Sin nombre'}
                      </h3>
                      <p className="text-white/30 text-sm leading-relaxed line-clamp-2">
                        {result.emotionalMeaning || 'Explorá el significado emocional detrás de este síntoma.'}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-white/10 group-hover:text-teal-400/40 text-lg mt-1 transition-colors flex-shrink-0">
                      chevron_right
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Initial state - no search yet */}
        {!isLoading && !hasSearched && (
          <div className="text-center py-24">
            <div className="size-20 rounded-full bg-white/[0.02] mx-auto mb-6 flex items-center justify-center">
              <span className="material-symbols-outlined text-white/10 text-4xl">spa</span>
            </div>
            <p className="text-white/20 text-sm">
              Escribí lo que sentís y descubrí<br />el mensaje de tu cuerpo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
