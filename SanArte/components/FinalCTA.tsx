import React from 'react';

interface FinalCTAProps {
    onStart: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStart }) => {
    return (
        <section className="py-32 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/5"></div>
            <div className="absolute top-[-50%] left-[-20%] w-[1000px] h-[1000px] bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-[150px] animate-pulse-slow"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-12 md:p-24 rounded-[3rem] border border-white/50 dark:border-white/10 shadow-2xl">
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
                    ¿Listo para dejar de sobrevivir<br />y empezar a <span className="text-primary text-neon-cyan">Vivir</span>?
                </h2>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto font-medium">
                    Tu cuerpo ya te está gritando la respuesta. SanArte es el traductor que estabas esperando.
                </p>

                <div className="relative inline-block group">
                    {/* Shadow/Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>

                    <button
                        onClick={onStart}
                        className="group relative inline-flex items-center justify-center gap-4 px-12 py-6 bg-gradient-to-r from-primary to-purple-600 hover:scale-105 text-white text-xl md:text-2xl font-black rounded-2xl shadow-2xl transition-all w-full md:w-auto overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10">¡SÍ! Quiero Descodificar Mis Síntomas Ahora</span>
                        <span className="material-symbols-outlined text-3xl relative z-10">lock_open</span>
                    </button>
                </div>

                <div className="mt-10 flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold opacity-70 tracking-widest uppercase">
                        Únete a +2,400 almas sanando hoy
                    </p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <span key={i} className="text-yellow-500 text-lg">★</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
