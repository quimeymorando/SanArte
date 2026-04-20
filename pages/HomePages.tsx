
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
    <div className="min-h-screen pb-28" style={{ background: '#060D1B' }}>
      <style>{`.sa-search::placeholder{color:#4A5280}.sa-search:focus{border-color:rgba(201,168,76,0.5)!important;outline:none}`}</style>

      {/* Search Bar */}
      <div
        className="sticky top-0 z-20 backdrop-blur-xl pt-20 md:pt-24 pb-4 px-5"
        style={{ background: 'rgba(6,13,27,0.92)', borderBottom: '1px solid rgba(201,168,76,0.12)' }}
      >
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="size-10 rounded-xl flex items-center justify-center transition-all md:hidden flex-shrink-0"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>

          <div className="relative flex-1">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl pointer-events-none"
              style={{ color: 'rgba(201,168,76,0.4)' }}
            >search</span>
            <input
              className="sa-search w-full h-12 pl-12 pr-4 rounded-xl text-[15px] transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.15)', color: '#F0EBE0', outline: 'none' }}
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
            className="h-12 px-5 flex-shrink-0 font-semibold text-sm transition-all active:scale-95 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)', color: '#060D1B', borderRadius: '12px', border: 'none', cursor: query.trim() ? 'pointer' : 'not-allowed' }}
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
              <div className="absolute inset-0 rounded-full border-2 animate-[spin_8s_linear_infinite]" style={{ borderColor: 'rgba(201,168,76,0.2)' }} />
              <div className="absolute inset-2 rounded-full border animate-[spin_5s_linear_infinite_reverse]" style={{ borderColor: 'rgba(201,168,76,0.1)' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl animate-pulse" style={{ color: '#C9A84C' }}>self_improvement</span>
              </div>
            </div>
            <p className="text-sm italic" style={{ color: '#4A5280' }}>{loadingPhrases[phraseIndex]}</p>
          </div>
        )}

        {/* No results */}
        {!isLoading && results.length === 0 && hasSearched && (
          <div className="text-center py-20">
            <div className="size-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.05)' }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: 'rgba(201,168,76,0.3)' }}>search_off</span>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#8B7355' }}>Sin resultados</h3>
            <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: '#4A5280' }}>
              Intentá con palabras más simples como "cabeza", "estómago" o "ansiedad".
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => {
              if (!result) return null;
              return (
                <button
                  key={index}
                  onClick={() => navigate(`/symptom-detail?q=${encodeURIComponent(result.name || '')}`)}
                  className="w-full text-left transition-all duration-200 active:scale-[0.98] group"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid #C9A84C', borderRadius: '14px', padding: '16px 18px' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'rgba(201,168,76,0.6)' }}>
                        {result.category || 'General'}
                      </span>
                      <h3 className="text-base capitalize leading-tight mb-1.5" style={{ fontFamily: 'Playfair Display, serif', color: '#F0EBE0' }}>
                        {result.name || 'Sin nombre'}
                      </h3>
                      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#4A5280', fontStyle: 'italic' }}>
                        {result.emotionalMeaning || 'Explorá el significado emocional detrás de este síntoma.'}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-lg mt-1 flex-shrink-0" style={{ color: 'rgba(201,168,76,0.3)' }}>
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
            <div className="size-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.04)' }}>
              <span className="material-symbols-outlined text-4xl" style={{ color: 'rgba(201,168,76,0.2)' }}>spa</span>
            </div>
            <p className="text-sm" style={{ color: '#4A5280' }}>
              Escribí lo que sentís y descubrí<br />el mensaje de tu cuerpo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
