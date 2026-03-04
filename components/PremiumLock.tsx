
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

    const blurClasses: Record<string, string> = {
        sm: 'blur-sm',
        md: 'blur-md',
        lg: 'blur-lg',
        xl: 'blur-xl',
    };
    const blurClass = blurClasses[blurAmount] || 'blur-md';

    return (
        <div className="relative group overflow-hidden rounded-2xl">
            {/* Blurred Content */}
            <div className={`filter ${blurClass} select-none pointer-events-none opacity-50 transition-all duration-500`}>
                {children}
            </div>

            {/* Verification Overlay with Holo-Glass Effect */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-transparent">

                {/* Glass Card */}
                <div className="relative overflow-hidden bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-[2rem] p-8 max-w-sm w-full transform transition-all hover:scale-[1.02] group-hover:border-amber-400/50">

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                    {/* Floating Lock Icon */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-amber-400/30 blur-2xl rounded-full animate-pulse-slow"></div>
                        <div className="relative size-16 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 text-white z-10">
                            <span className="material-symbols-outlined text-3xl">lock</span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-600 dark:from-amber-200 dark:to-orange-400 mb-2">
                        {title}
                    </h3>

                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                        {description}
                    </p>

                    <button
                        onClick={() => navigate('/profile?upgrade=true')}
                        className="relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-orange-600 text-white font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 overflow-hidden group/btn hover:shadow-orange-500/40 transition-all active:scale-95"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 ease-in-out"></div>
                        <span className="relative flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">workspace_premium</span>
                            Desbloquear
                        </span>
                    </button>

                    {/* Security Badge */}
                    <div className="mt-4 flex items-center justify-center gap-1.5 opacity-60">
                        <span className="material-symbols-outlined text-[10px] text-gray-500 dark:text-gray-400">verified_user</span>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contenido Exclusivo</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
