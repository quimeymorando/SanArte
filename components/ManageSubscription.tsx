import React, { useState } from 'react';

interface ManageSubscriptionProps {
    isPremium: boolean;
    userEmail?: string;
}

/**
 * Subscription management component for the profile page.
 * Shows subscription status and provides a way to manage/cancel.
 */
const ManageSubscription: React.FC<ManageSubscriptionProps> = ({ isPremium, userEmail }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    // Lemon Squeezy Customer Portal — users can manage billing here
    const CUSTOMER_PORTAL_URL = 'https://sanarte.lemonsqueezy.com/billing';

    const handleManage = () => {
        window.open(CUSTOMER_PORTAL_URL, '_blank', 'noopener,noreferrer');
    };

    if (!isPremium) {
        return (
            <div className="w-full bg-[#0a1114]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 mt-4 transition-all duration-300 hover:border-white/10 relative overflow-hidden group">
                {/* Subtle gradient background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-700"></div>

                <div className="flex items-center gap-4 mb-5 relative z-10">
                    <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl border border-white/10">
                        🌱
                    </div>
                    <div>
                        <h4 className="text-base font-black text-white leading-none mb-1">Plan Semilla</h4>
                        <p className="text-[11px] text-white/50 font-semibold uppercase tracking-wider">Versión Gratuita</p>
                    </div>
                </div>

                {/* Limitations to show what they are missing */}
                <div className="space-y-3 mb-6 relative z-10">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60 font-medium flex items-center gap-2"><span className="text-lg">🔍</span> Búsquedas</span>
                        <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-lg text-xs">5 por día</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60 font-medium flex items-center gap-2"><span className="text-lg">📢</span> Publicidad</span>
                        <span className="text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-lg text-xs">Activada</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60 font-medium flex items-center gap-2"><span className="text-lg">✨</span> Funciones Pro</span>
                        <span className="text-white/30 font-bold text-xs flex items-center gap-1">Bloqueadas 🔒</span>
                    </div>
                </div>

                <a
                    href="/profile?upgrade=true"
                    className="relative z-10 w-full h-12 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300 active:scale-[0.98] uppercase tracking-widest text-xs"
                >
                    <span className="text-lg">💎</span>
                    Mejorar a Premium
                </a>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#0a1114]/60 backdrop-blur-xl border border-amber-500/20 rounded-[2rem] p-6 mt-4 relative overflow-hidden transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.05)] hover:shadow-[0_0_40px_rgba(245,158,11,0.1)] group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-50 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-500/30">
                        💎
                    </div>
                    <div>
                        <h4 className="text-base font-black text-white leading-none mb-1">Loto Brillante</h4>
                        <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Premium Activo
                        </p>
                    </div>
                </div>
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl shadow-lg">
                    PRO
                </span>
            </div>

            {/* Features Summary */}
            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center flex flex-col items-center gap-1">
                    <span className="text-xl">♾️</span>
                    <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Búsquedas</span>
                    <p className="text-sm font-black text-emerald-400">Ilimitadas</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center flex flex-col items-center gap-1">
                    <span className="text-xl">✨</span>
                    <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Publicidad</span>
                    <p className="text-sm font-black text-emerald-400">Sin Ads</p>
                </div>
            </div>

            {/* Manage Subscription */}
            <div className="relative z-10">
                {!showConfirm ? (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="w-full h-12 text-white/50 hover:text-white/80 text-xs font-bold rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300"
                    >
                        Gestionar Suscripción
                    </button>
                ) : (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                            <p className="text-xs text-amber-200/80 font-medium leading-relaxed">
                                Tu sanación es un proceso continuo. Si decides hacer una pausa, podrás volver a activar Premium en cualquier momento.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleManage}
                                className="flex-1 h-12 text-red-400 text-xs font-bold rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 transition-all duration-300"
                            >
                                Pausar Plan
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 h-12 text-white/60 text-xs font-bold rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300"
                            >
                                Mantener
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageSubscription;
