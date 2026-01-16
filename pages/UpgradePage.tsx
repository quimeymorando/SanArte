
import React from 'react';
import { useNavigate } from 'react-router-dom';


const UpgradePage: React.FC = () => {
    const navigate = useNavigate();


    const handleSubscribe = () => {
        window.open('https://sanarte.lemonsqueezy.com/checkout/buy/cdc04c6b-be2e-4486-88e6-bbf61cfc945e', '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark py-20 px-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] opacity-50"></div>

            <div className="relative z-10 max-w-5xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span> Cancelar
                </button>

                <div className="text-center mb-16 space-y-4">
                    <span className="inline-block py-1 px-3 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-xs font-black tracking-widest uppercase">
                        Membresía San Arte Premium
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white">
                        Eleva tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Vibración</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Desbloquea todo el poder de las plantas maestras, meditaciones guiadas y la sabiduría ancestral completa.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-center">
                    {/* FREE TIER */}
                    <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-lg order-2 md:order-1 opacity-70 hover:opacity-100 transition-opacity">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Buscador</h3>
                        <div className="text-4xl font-black mb-6">Gratis</div>
                        <ul className="space-y-4 mb-8 text-gray-600 dark:text-gray-400 font-medium text-sm">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500">check</span> Búsqueda de Síntomas</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500">check</span> Definición Emocional Básica</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500">check</span> 5 Búsquedas Diarias</li>
                        </ul>
                        <button className="w-full py-4 text-gray-500 font-bold rounded-2xl bg-gray-100 dark:bg-gray-800 cursor-not-allowed">
                            Plan Actual
                        </button>
                    </div>

                    {/* PREMIUM TIER (Featured) */}
                    <div className="bg-white dark:bg-[#1a2c32] p-8 rounded-[2.5rem] border-2 border-primary shadow-2xl relative transform md:scale-110 z-10 order-1 md:order-2">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-black uppercase tracking-widest py-2 px-4 rounded-full shadow-lg">
                            Más Popular
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sanador</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-5xl font-black">$3.00</span>
                            <span className="text-gray-400">/mes</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-4 mb-6 italic">Suscripción mensual simple. Se renueva automáticamente.</p>

                        <ul className="space-y-4 mb-8 text-gray-700 dark:text-gray-200 font-bold text-sm">
                            <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">auto_awesome</span> Búsquedas Ilimitadas</li>
                            <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">spa</span> Remedios Naturales y Hierbas</li>
                            <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">record_voice_over</span> Meditaciones Guiadas (Audio)</li>
                            <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">flight</span> Guía de Arcángeles</li>
                            <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">favorite</span> Guardar Favoritos Ilimitados</li>
                        </ul>

                        <button
                            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
                            onClick={handleSubscribe}
                        >
                            Suscribirme Ahora
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">Cancelas cuando quieras desde tu perfil.</p>
                    </div>

                    {/* DONATION TIER */}
                    <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-lg order-3">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mecenas</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-black">$15</span>
                            <span className="text-gray-400">/único</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-4 mb-6">Apoyo puntual al desarrollador.</p>

                        <ul className="space-y-4 mb-8 text-gray-600 dark:text-gray-400 font-medium text-sm">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-purple-500">check</span> 1 mes de Premium incluido</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-purple-500">check</span> Insignia "Mecenas" en Perfil</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-purple-500">favorite</span> Karma instantáneo</li>
                        </ul>
                        <button className="w-full py-4 text-primary font-bold rounded-2xl bg-primary/10 hover:bg-primary/20 transition-colors">
                            Hacer Donación
                        </button>
                    </div>
                </div>

                <div className="mt-16 text-center text-sm text-gray-400 max-w-2xl mx-auto">
                    <p className="mb-2">🔒 Pagos seguros procesados globalmente por Lemon Squeezy (Merchant of Record).</p>
                    <p>Al suscribirte aceptas nuestros <span className="underline cursor-pointer" onClick={() => navigate('/terms')}>Términos de Servicio</span>.</p>
                </div>
            </div>
        </div>
    );
};

export default UpgradePage;
