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
    const CUSTOMER_PORTAL_URL = 'https://sanarte.lemonsqueezy.com/billing'; // ← REEMPLAZAR con tu URL real

    const handleManage = () => {
        window.open(CUSTOMER_PORTAL_URL, '_blank');
    };

    if (!isPremium) {
        return (
            <div className="w-full bg-[#0a1114]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 mt-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="size-10 rounded-xl bg-gray-500/10 flex items-center justify-center text-gray-500">
                        <span className="material-symbols-outlined">workspace_premium</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Plan Free</h4>
                        <p className="text-xs text-gray-500">5 búsquedas diarias · Con publicidad</p>
                    </div>
                </div>
                <a
                    href="/profile?upgrade=true"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-primary text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    Mejorar a Premium
                </a>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#0a1114]/60 backdrop-blur-md border border-amber-500/10 rounded-2xl p-5 mt-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                        <span className="material-symbols-outlined">diamond</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Plan Premium</h4>
                        <p className="text-xs text-emerald-400 font-medium">Activo · Todas las funciones desbloqueadas</p>
                    </div>
                </div>
                <span className="bg-amber-400/10 text-amber-400 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">
                    Premium
                </span>
            </div>

            {/* Features Summary */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white/5 rounded-xl px-3 py-2 text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Búsquedas</span>
                    <p className="text-sm font-black text-white">∞</p>
                </div>
                <div className="bg-white/5 rounded-xl px-3 py-2 text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Publicidad</span>
                    <p className="text-sm font-black text-emerald-400">Sin Ads</p>
                </div>
            </div>

            {/* Manage Subscription */}
            {!showConfirm ? (
                <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full py-3 text-gray-500 hover:text-gray-300 text-xs font-bold rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                    Gestionar Suscripción
                </button>
            ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <p className="text-xs text-amber-200 font-medium leading-relaxed">
                            Tu sanación es un proceso continuo. Si decides hacer una pausa, podrás volver a activar Premium en cualquier momento.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleManage}
                            className="flex-1 py-3 text-red-400 text-xs font-bold rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 transition-all"
                        >
                            Gestionar en Lemon Squeezy
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 py-3 text-gray-400 text-xs font-bold rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                        >
                            Mejor no
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSubscription;
