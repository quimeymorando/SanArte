import React, { useEffect, useState } from 'react';

interface HeroSectionProps {
    onStart: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => {
    const [offsetY, setOffsetY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setOffsetY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden perspective-1000">

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="absolute inset-0 z-0 bg-background-light dark:bg-background-dark transition-colors duration-700">

                {/* Aurora / Nebula Effect */}
                <div
                    className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] opacity-40 dark:opacity-20 blur-[100px] pointer-events-none"
                    style={{
                        background: 'conic-gradient(from 0deg at 50% 50%, #00f2ff, #7000ff, #ff00d4, #00f2ff)',
                        transform: `translateY(${offsetY * 0.2}px) rotate(${offsetY * 0.02}deg)`,
                        transition: 'transform 0.1s linear'
                    }}
                />

                {/* Grid Overlay (Cyberpunk/Futuristic Texture) */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

                {/* Floating Particles (Motes) */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-float blur-[1px]"></div>
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-secondary rounded-full animate-float-slow blur-[2px]"></div>
                <div className="absolute top-1/2 right-10 w-1 h-1 bg-accent rounded-full animate-pulse-fast"></div>
            </div>

            {/* --- CONTENT --- */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-8">

                {/* Pill Badge */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100 inline-flex items-center gap-2 px-6 py-2 rounded-full border border-primary/20 bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-glow-primary">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-xs font-bold text-primary-hover dark:text-primary uppercase tracking-[0.2em]">Sanación Cuántica</span>
                </div>

                {/* Main Title */}
                <h1 className="animate-in fade-in zoom-in duration-1000 delay-200 text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-gray-900 dark:text-white drop-shadow-2xl">
                    Sanar es<br />
                    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary animate-shimmer bg-[size:200%_auto]">
                        Futuro.
                        {/* Glitch underline effect */}
                        <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" className="animate-pulse" />
                        </svg>
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed font-medium">
                    Decodifica el lenguaje de tus síntomas y accede a tu <span className="text-primary font-bold">Yo Cuántico</span>.
                </p>

                {/* Magnetic CTA Button */}
                <div className="animate-in fade-in zoom-in duration-1000 delay-500 mt-6 group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                    <button
                        onClick={onStart}
                        className="relative px-12 py-5 bg-white dark:bg-black text-gray-900 dark:text-white text-xl font-black rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.02] active:scale-95"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Iniciar Viaje</span>
                        <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </div>

                {/* Proof / Stats */}
                <div className="animate-in fade-in duration-1000 delay-700 mt-12 flex items-center gap-6 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                    <div className="flex -space-x-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-gradient-to-br from-gray-200 to-gray-400"></div>
                        ))}
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">Trusted by +2,400 souls</div>
                        <div className="text-xs text-primary">★★★★★ 4.9/5 Rating</div>
                    </div>
                </div>

            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
                <span className="text-[10px] uppercase tracking-widest text-primary">Descubre</span>
                <span className="material-symbols-outlined text-primary">keyboard_double_arrow_down</span>
            </div>

        </section>
    );
};
