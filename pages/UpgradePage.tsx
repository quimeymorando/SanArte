import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackMonetizationEvent } from '../services/monetizationService';

const CHECKOUT_URLS = {
    monthly: import.meta.env.VITE_LS_CHECKOUT_MONTHLY || 'https://sanarte.lemonsqueezy.com/checkout/buy/cdc04c6b-be2e-4486-88e6-bbf61cfc945e',
    annual: import.meta.env.VITE_LS_CHECKOUT_ANNUAL || '',
    mecenas: import.meta.env.VITE_LS_CHECKOUT_MECENAS || '',
};

const isValidCheckout = (url: string): boolean => /^https:\/\/.+\.lemonsqueezy\.com\/checkout\/buy\/.+/.test(url);

const UpgradePage: React.FC = () => {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    React.useEffect(() => {
        trackMonetizationEvent('paywall_view', { source: 'upgrade_page' });
    }, []);

    const pricing = {
        monthly: { price: '$3', period: '/mes', total: '$36/año', savings: '' },
        annual: { price: '$2.50', period: '/mes', total: '$30/año', savings: '17%' },
    };
    const current = pricing[billingCycle];
    const annualEnabled = isValidCheckout(CHECKOUT_URLS.annual);
    const mecenasEnabled = isValidCheckout(CHECKOUT_URLS.mecenas);

    const handleSubscribe = () => {
        const url = CHECKOUT_URLS[billingCycle];
        if (!isValidCheckout(url)) { alert('Este plan aún no está configurado.'); return; }
        trackMonetizationEvent('checkout_click', { source: 'upgrade_page', billing_cycle: billingCycle });
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleMecenas = () => {
        if (!isValidCheckout(CHECKOUT_URLS.mecenas)) { alert('La opción Mecenas aún no está configurada.'); return; }
        trackMonetizationEvent('donation_click', { source: 'upgrade_page' });
        window.open(CHECKOUT_URLS.mecenas, '_blank', 'noopener,noreferrer');
    };

    const features = [
        { icon: 'auto_awesome', text: 'Búsquedas Ilimitadas' },
        { icon: 'spa', text: 'Remedios Naturales y Hierbas' },
        { icon: 'record_voice_over', text: 'Meditaciones Guiadas (Audio)' },
        { icon: 'flight', text: 'Guía de Arcángeles' },
        { icon: 'favorite', text: 'Favoritos Ilimitados' },
        { icon: 'block', text: 'Sin Publicidad' },
    ];

    return (
        <div className="min-h-screen bg-[#080c0f] pb-28 pt-20 px-5">
            <div className="max-w-md mx-auto">
                {/* Back */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white/25 hover:text-white/50 text-sm mb-8 transition-colors">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Volver
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-400/60 mb-2">SanArte Premium</p>
                    <h1 className="text-3xl font-bold text-white mb-3">Desbloqueá todo</h1>
                    <p className="text-white/30 text-sm leading-relaxed">
                        Remedios ancestrales, meditaciones guiadas, guía de arcángeles y más.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl mb-8 border border-white/[0.06]">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            billingCycle === 'monthly' ? 'bg-white/[0.08] text-white' : 'text-white/25'
                        }`}
                    >
                        Mensual
                    </button>
                    <button
                        onClick={() => setBillingCycle('annual')}
                        disabled={!annualEnabled}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                            billingCycle === 'annual' ? 'bg-white/[0.08] text-white' : 'text-white/25'
                        } disabled:opacity-30`}
                    >
                        Anual
                        {annualEnabled && (
                            <span className="absolute -top-1.5 -right-1 bg-emerald-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                -17%
                            </span>
                        )}
                    </button>
                </div>

                {/* Premium Card */}
                <div className="rounded-2xl border border-teal-500/20 bg-white/[0.03] p-6 mb-4">
                    {/* Trial badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/15 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">timer</span>
                            7 días gratis
                        </span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-4xl font-bold text-white">{current.price}</span>
                        <span className="text-white/30 text-sm">{current.period}</span>
                    </div>
                    {billingCycle === 'annual' && (
                        <p className="text-xs text-emerald-400/70 mb-4">Ahorrás {current.savings} → {current.total}</p>
                    )}

                    {/* Features */}
                    <ul className="space-y-3 my-6">
                        {features.map(f => (
                            <li key={f.icon} className="flex items-center gap-3 text-sm text-white/50">
                                <span className="material-symbols-outlined text-teal-400/60 text-lg">{f.icon}</span>
                                {f.text}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={handleSubscribe}
                        className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold text-sm transition-all active:scale-[0.98]"
                    >
                        Probar 7 días gratis
                    </button>
                    <p className="text-center text-[11px] text-white/15 mt-3">Cancelás cuando quieras. Sin compromiso.</p>
                </div>

                {/* Free Plan */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-sm font-medium text-white/50">Plan Gratuito</h3>
                            <p className="text-xs text-white/20 mt-0.5">Búsqueda básica con 5 consultas diarias</p>
                        </div>
                        <span className="text-[10px] text-white/15 font-medium bg-white/[0.04] px-2.5 py-1 rounded-lg">Actual</span>
                    </div>
                </div>

                {/* Mecenas */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-white/50">Mecenas — $15 único</h3>
                            <p className="text-xs text-white/20 mt-0.5">1 mes premium + insignia en perfil</p>
                        </div>
                        <button
                            disabled={!mecenasEnabled}
                            onClick={handleMecenas}
                            className="text-xs text-violet-400/60 hover:text-violet-400 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Donar
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[11px] text-white/15 space-y-1">
                    <p className="flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-xs">lock</span>
                        Pagos seguros via Lemon Squeezy
                    </p>
                    <p>
                        Al suscribirte aceptás los{' '}
                        <span className="underline cursor-pointer hover:text-teal-400 transition-colors" onClick={() => navigate('/terms')}>
                            Términos de Servicio
                        </span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradePage;
