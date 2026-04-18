import React from 'react';

interface FinalCTAProps {
    onStart: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStart }) => {
    return (
        <section className="py-20 md:py-32 bg-sanarte-night">
            <div className="max-w-xl mx-auto px-6 text-center">
                <div className="w-8 h-px bg-sanarte-gold/30 mx-auto mb-8" />
                <h2 className="text-3xl md:text-4xl font-light text-[#F0EBE0] mb-4 leading-tight">
                    Empezá tu camino<br/>de <em>sanación.</em>
                </h2>
                <p className="text-sm text-[#4A4840] mb-10 leading-relaxed">
                    Tu cuerpo ya te está dando las respuestas.<br/>SanArte te ayuda a escucharlas.
                </p>
                <button
                    onClick={onStart}
                    className="px-8 py-4 bg-sanarte-gold hover:opacity-90 text-sanarte-night text-base font-medium rounded-full transition-opacity duration-200 mb-6"
                >
                    Comenzar ahora →
                </button>
                <div className="flex items-center justify-center gap-2 opacity-40">
                    <div className="w-10 h-px bg-sanarte-gold/50" />
                    <p className="text-xs tracking-widest uppercase text-[#4A4840]">+2.400 almas sanando hoy</p>
                    <div className="w-10 h-px bg-sanarte-gold/50" />
                </div>
            </div>
        </section>
    );
};
