
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Lemon Squeezy Checkout URLs — Replace with your real ones
const CHECKOUT_URLS = {
    monthly: 'https://sanarte.lemonsqueezy.com/checkout/buy/cdc04c6b-be2e-4486-88e6-bbf61cfc945e',
    annual: 'https://sanarte.lemonsqueezy.com/checkout/buy/ANNUAL_PRODUCT_ID',  // ← REEMPLAZAR
    mecenas: 'https://sanarte.lemonsqueezy.com/checkout/buy/MECENAS_PRODUCT_ID', // ← REEMPLAZAR
};

const UpgradePage: React.FC = () => {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    const pricing = {
        monthly: { price: '$3', period: '/mes', total: '$36/año', savings: '' },
        annual: { price: '$2.50', period: '/mes', total: '$30/año', savings: '17%' },
    };

    const current = pricing[billingCycle];

    const handleSubscribe = () => {
        window.open(CHECKOUT_URLS[billingCycle], '_blank');
    };

    const handleMecenas = () => {
        window.open(CHECKOUT_URLS.mecenas, '_blank');
    };

    return (
        <div className="relative min-h-screen bg-[#050b0d] text-gray-200 py-20 px-6 overflow-hidden">
            {/* --- PREMIUM BACKGROUND (Match Landing) --- */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-[#050b0d] to-[#050b0d] pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] opacity-20 blur-[100px] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(112, 0, 255, 0.4) 0%, transparent 60%)' }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] opacity-15 blur-[80px] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 80%, rgba(0, 242, 255, 0.3) 0%, transparent 60%)' }}></div>

            <div className="relative z-10 max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-gray-500 hover:text-cyan-400 font-bold transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span> Volver
                </button>

                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-gradient-to-r from-amber-300 to-orange-500 text-black text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-orange-500/20">
                        Membresía SanArte Premium
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                        Eleva tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Vibración</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Desbloquea todo el poder de las plantas maestras, meditaciones guiadas y la sabiduría ancestral completa.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white/10 text-white border border-white/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Mensual
                    </button>
                    <button
                        onClick={() => setBillingCycle('annual')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative ${billingCycle === 'annual' ? 'bg-white/10 text-white border border-white/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Anual
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full">
                            -17%
                        </span>
                    </button>
                </div>

                {/* Pricing Grid */}
                <div className="grid md:grid-cols-3 gap-6 items-center">

                    {/* FREE TIER */}
                    <div className="bg-[#0a1114]/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 order-2 md:order-1 opacity-60 hover:opacity-100 transition-all">
                        <h3 className="text-xl font-bold text-white mb-2">Buscador</h3>
                        <div className="text-4xl font-black text-white mb-6">Gratis</div>
                        <ul className="space-y-3 mb-8 text-gray-400 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500 text-lg">check</span>
                                Búsqueda de Síntomas
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500 text-lg">check</span>
                                Definición Emocional Básica
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500 text-lg">check</span>
                                5 Búsquedas Diarias
                            </li>
                        </ul>
                        <button className="w-full py-4 text-gray-600 font-bold rounded-2xl bg-white/5 border border-white/5 cursor-not-allowed">
                            Plan Actual
                        </button>
                    </div>

                    {/* PREMIUM TIER (Featured) */}
                    <div className="relative bg-[#0a1114]/80 backdrop-blur-xl p-8 rounded-[2.5rem] border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(0,242,255,0.1)] transform md:scale-110 z-10 order-1 md:order-2">
                        {/* Badge */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-primary text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 px-5 rounded-full shadow-lg shadow-cyan-500/20">
                            Más Popular
                        </div>

                        {/* Trial Badge */}
                        <div className="flex items-center gap-2 mb-4 mt-2">
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                                <span className="material-symbols-outlined text-xs">timer</span>
                                7 días gratis
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">Sanador</h3>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-5xl font-black text-white">{current.price}</span>
                            <span className="text-gray-400">{current.period}</span>
                        </div>
                        {billingCycle === 'annual' && (
                            <p className="text-xs text-emerald-400 font-bold mb-4">
                                Ahorrás {current.savings} → {current.total}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mb-6 italic">
                            {billingCycle === 'monthly'
                                ? 'Se renueva automáticamente cada mes.'
                                : 'Se renueva automáticamente cada año.'}
                        </p>

                        <ul className="space-y-3 mb-8 text-gray-200 font-medium text-sm">
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-cyan-400">auto_awesome</span>
                                Búsquedas Ilimitadas
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-cyan-400">spa</span>
                                Remedios Naturales y Hierbas
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-cyan-400">record_voice_over</span>
                                Meditaciones Guiadas (Audio)
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-cyan-400">flight</span>
                                Guía de Arcángeles
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-cyan-400">favorite</span>
                                Guardar Favoritos Ilimitados
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-cyan-400">block</span>
                                Sin Publicidad
                            </li>
                        </ul>

                        <button
                            className="relative w-full py-4 bg-gradient-to-r from-cyan-500 to-primary text-white font-black rounded-2xl shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-2 overflow-hidden group"
                            onClick={handleSubscribe}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                            <span className="relative flex items-center gap-2">
                                Prueba 7 Días Gratis
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </span>
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-3">Cancelas cuando quieras. Sin compromiso.</p>
                    </div>

                    {/* MECENAS TIER */}
                    <div className="bg-[#0a1114]/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 hover:border-purple-500/20 order-3 transition-all">
                        <h3 className="text-xl font-bold text-white mb-2">Mecenas</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-black text-white">$15</span>
                            <span className="text-gray-400">/único</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-4 mb-6">Apoyo puntual al proyecto.</p>

                        <ul className="space-y-3 mb-8 text-gray-400 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-400 text-lg">check</span>
                                1 mes de Premium incluido
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-400 text-lg">check</span>
                                Insignia "Mecenas" en Perfil
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-400 text-lg">favorite</span>
                                Karma instantáneo
                            </li>
                        </ul>
                        <button
                            className="w-full py-4 text-purple-400 font-bold rounded-2xl bg-purple-500/10 border border-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all active:scale-95"
                            onClick={handleMecenas}
                        >
                            Hacer Donación
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center text-sm text-gray-500 max-w-2xl mx-auto space-y-2">
                    <p className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        Pagos seguros procesados globalmente por Lemon Squeezy (Merchant of Record).
                    </p>
                    <p>Al suscribirte aceptas nuestros <span className="underline cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => navigate('/terms')}>Términos de Servicio</span>.</p>
                </div>
            </div>
        </div>
    );
};

export default UpgradePage;
