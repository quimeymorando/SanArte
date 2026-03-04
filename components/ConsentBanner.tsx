import React from 'react';
import { Link } from 'react-router-dom';
import { useConsent } from '../hooks/useConsent';

export const ConsentBanner: React.FC = () => {
  const { hasDecision, acceptAll, rejectOptional } = useConsent();

  if (hasDecision) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0a1114]/95 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Privacidad</p>
            <p className="mt-1 text-sm font-medium text-white/80">
              Usamos cookies para analitica y anuncios. Puedes aceptar todo o mantener solo las esenciales.
            </p>
            <Link to="/privacy" className="mt-2 inline-block text-xs font-bold text-cyan-300 underline decoration-dotted underline-offset-4">
              Ver politica de privacidad
            </Link>
          </div>

          <div className="flex gap-2">
            <button
              onClick={rejectOptional}
              className="rounded-xl border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-wider text-white/70 transition-colors hover:bg-white/10"
            >
              Solo esenciales
            </button>
            <button
              onClick={acceptAll}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-cyan-500/30 transition-transform active:scale-95"
            >
              Aceptar todo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
