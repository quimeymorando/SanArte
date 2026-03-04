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
            <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-8 pt-32">

                {/* Main Title (The Hook) */}
                <h1 className="animate-in fade-in zoom-in duration-1000 delay-200 text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight text-gray-900 dark:text-white drop-shadow-2xl max-w-5xl">
                    Cómo Entender lo que tu Cuerpo te <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">"Grita"</span> y Eliminar el Dolor Crónico desde la <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary animate-shimmer bg-[size:200%_auto]">Raíz Emocional</span>...
                </h1>

                {/* Subtitle (The Promise) */}
                <p className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed font-medium">
                    Sin Fármacos Costosos ni Años de Terapia. La app <span className="text-primary font-bold">SanArte</span> te da el mapa exacto para descodificar el lenguaje oculto de tu cuerpo y dejar de sobrevivir al dolor.
                </p>

                {/* Magnetic CTA Button */}
                <div className="animate-in fade-in zoom-in duration-1000 delay-500 mt-8 group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                    <button
                        onClick={onStart}
                        className="relative px-12 py-6 bg-white dark:bg-black text-gray-900 dark:text-white text-xl md:text-2xl font-black rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.02] active:scale-95 shadow-2xl"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">¡SÍ! Quiero Descodificar Mis Síntomas</span>
                        <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform text-3xl">arrow_forward</span>
                    </button>
                    <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest opacity-80">Empieza Gratis · Sin Tarjeta de Crédito</p>
                </div>

                {/* Proof / Stats */}
                <div className="animate-in fade-in duration-1000 delay-700 mt-12 flex items-center gap-6 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                    <div className="flex -space-x-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-gradient-to-br from-gray-200 to-gray-400"></div>
                        ))}
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">+2.400 personas sanando</div>
                        <div className="text-xs text-primary">★★★★★ 4.9/5 Valoración</div>
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
