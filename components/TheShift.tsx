import React from 'react';

export const TheShift: React.FC = () => {
    return (
        <section className="py-24 bg-surface-light dark:bg-transparent relative z-10 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                {/* Visual Side */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[3rem] blur-3xl -z-10 group-hover:blur-xl transition-all duration-700"></div>
                    <div className="glass-panel rounded-[3rem] h-auto min-h-[500px] flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-500 border border-white/20">
                        <div className="absolute w-[120%] h-[120%] bg-[url('https://images.unsplash.com/photo-1512411516006-218206105f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover opacity-10 dark:opacity-20 mix-blend-overlay"></div>
                        <div className="relative z-10 text-center space-y-6">
                            <span className="text-8xl block animate-float">🗝️</span>
                            <h3 className="text-4xl font-black mb-2 dark:text-gray-100 leading-tight">Tu Cuerpo tiene un <br /><span className="text-primary text-neon-cyan">Diccionario Oculto</span></h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto italic">
                                "No es 'mala suerte' ni 'genética'. Es un código que nadie te enseñó a leer... hasta ahora."
                            </p>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                </div>

                {/* Content Side */}
                <div className="space-y-10">
                    <h2 className="text-4xl md:text-5xl font-black leading-tight text-gray-900 dark:text-white">
                        No necesitas ser médico ni gurú para <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent decoration-wavy decoration-2">Sanar de Raíz</span>.
                    </h2>

                    <div className="space-y-4">
                        <p className="text-lg text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                            Aprende a escuchar lo que tus síntomas intentan decirte. SanArte es la herramienta que decodifica el lenguaje de tu alma manifestado en tu cuerpo.
                        </p>
                        <div className="h-1 w-20 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};
