
import React, { useEffect, useState } from 'react';

export const XPToast: React.FC = () => {
    const [show, setShow] = useState(false);
    const [xp, setXp] = useState(0);
    const [levelUp, setLevelUp] = useState(false);

    useEffect(() => {
        const handleXP = (e: CustomEvent) => {
            setXp(e.detail.amount);
            setLevelUp(e.detail.levelUp);
            setShow(true);
            setTimeout(() => setShow(false), 3000); // 3s display
        };

        window.addEventListener('xp-gained', handleXP as EventListener);
        return () => window.removeEventListener('xp-gained', handleXP as EventListener);
    }, []);

    if (!show) return null;

    return (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-900 overflow-hidden animate-slide-in-right">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />

            {/* Icon */}
            <div className={`relative flex items-center justify-center size-12 rounded-full ${levelUp ? 'bg-yellow-400 text-white' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'}`}>
                <span className="material-symbols-outlined text-2xl animate-bounce">
                    {levelUp ? 'military_tech' : 'auto_awesome'}
                </span>
            </div>

            {/* Text */}
            <div className="relative">
                <p className="font-bold text-gray-800 dark:text-white text-sm">
                    {levelUp ? '¡SUBISTE DE NIVEL!' : '¡Experiencia Divina!'}
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold">
                    +{xp} XP
                </p>
            </div>

            {/* Progress Bar Line (Decoration) */}
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 animate-[width_3s_linear_forwards]" style={{ width: '100%' }} />
        </div>
    );
};
