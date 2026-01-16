
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PremiumLockProps {
    isLocked: boolean;
    title: string;
    description: string;
    children: React.ReactNode;
    blurAmount?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PremiumLock: React.FC<PremiumLockProps> = ({
    isLocked,
    title,
    description,
    children,
    blurAmount = 'md'
}) => {
    const navigate = useNavigate();

    if (!isLocked) {
        return <>{children}</>;
    }

    return (
        <div className="relative group overflow-hidden rounded-2xl">
            {/* Blurred Content */}
            <div className={`filter blur-${blurAmount} select-none pointer-events-none opacity-50 transition-all duration-500`}>
                {children}
            </div>

            {/* Verification Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-white/10 to-white/60 dark:from-black/10 dark:to-black/60 backdrop-blur-[2px]">

                <div className="bg-white dark:bg-surface-dark border border-purple-100 dark:border-purple-900 shadow-2xl rounded-3xl p-6 max-w-sm transform transition-all hover:scale-105">
                    <div className="size-12 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 text-white">
                        <span className="material-symbols-outlined text-2xl">lock</span>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        {description}
                    </p>

                    <button
                        onClick={() => navigate('/profile?upgrade=true')}
                        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all active:scale-95 flex items-center justify-center gap-2 group-hover:animate-pulse"
                    >
                        <span className="material-symbols-outlined">workspace_premium</span>
                        Desbloquear Ahora
                    </button>
                </div>
            </div>
        </div>
    );
};
