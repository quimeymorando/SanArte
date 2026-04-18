import React from 'react';

interface HeroSectionProps {
    onStart: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => {
    return (
        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-sanarte-night">
            {/* Ambient dorado sutil */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-sanarte-gold/[0.05] blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto px-6 flex flex-col items-center text-center pt-24 pb-20">

                {/* Pill */}
                <div className="flex items-center gap-2 border border-sanarte-gold/20 rounded-full px-4 py-1.5 mb-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-sanarte-gold" />
                    <span className="text-[10px] font-medium tracking-widest uppercase text-sanarte-gold">Nueva oportunidad</span>
                </div>

                {/* Título */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.15] text-[#F0EBE0] mb-6">
                    Tu cuerpo te habla.{' '}
                    <br />
                    Es hora de{' '}
                    <em className="font-normal">escucharlo.</em>
                </h1>

                {/* Subtítulo */}
                <p className="text-base md:text-lg text-[#4A4840] max-w-md leading-relaxed mb-10">
                    Descubrí el mensaje emocional detrás de cada síntoma. Sin fármacos, sin años de terapia.
                </p>

                {/* CTA */}
                <button
                    onClick={onStart}
                    className="px-8 py-4 bg-sanarte-gold hover:opacity-90 text-sanarte-night text-base font-medium rounded-full transition-opacity duration-200 mb-4"
                >
                    Comenzar ahora →
                </button>
                <p className="text-xs text-[#3A3830]">Sin tarjeta de crédito</p>

                {/* Social proof */}
                <div className="mt-14 flex items-center gap-3 opacity-50">
                    <div className="w-16 h-px bg-sanarte-gold/30" />
                    <p className="text-xs tracking-widest uppercase text-[#4A4840]">+2.400 almas sanando hoy</p>
                    <div className="w-16 h-px bg-sanarte-gold/30" />
                </div>
            </div>

            {/* Scroll hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
                <span className="material-symbols-outlined text-[#4A4840]">expand_more</span>
            </div>
        </section>
    );
};
