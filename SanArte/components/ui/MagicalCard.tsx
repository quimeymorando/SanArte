import React, { useState } from 'react';

interface MagicalCardProps {
    id: string;
    isOpen: boolean;
    onToggle: (id: string) => void;
    title: string;
    subtitle?: string;
    icon: string;
    gradientTheme: string;
    iconColor: string;
    children: React.ReactNode;
}

export const MagicalCard: React.FC<MagicalCardProps> = ({
    id, isOpen, onToggle, title, subtitle, icon, gradientTheme, iconColor, children
}) => {
    return (
        <div className={`group relative overflow-hidden transition-all duration-700 ease-in-out border rounded-[2rem] mb-4 shadow-lg ${isOpen
            ? 'bg-white/10 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]'
            : 'bg-white/5 border-white/5 hover:border-white/10 backdrop-blur-md'
            }`}>
            {/* Background Ambience */}
            <div className={`absolute top-0 right-0 w-full h-full opacity-0 transition-opacity duration-700 pointer-events-none ${isOpen ? 'opacity-100' : ''}`}>
                <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] -mr-10 -mt-10 ${gradientTheme} opacity-10`}></div>
            </div>

            <button
                onClick={() => onToggle(id)}
                className="relative z-10 w-full p-5 flex items-center justify-between text-left outline-none"
            >
                <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-transform duration-500 group-hover:scale-110 ${isOpen ? `${gradientTheme} text-white` : `bg-black/20 border border-white/5 ${iconColor}`
                        }`}>
                        <span className="material-symbols-outlined text-[24px]">{icon}</span>
                    </div>
                    <div>
                        <h3 className={`text-base md:text-lg font-black tracking-tight transition-colors ${isOpen ? 'text-white' : 'text-white/70 group-hover:text-white'
                            }`}>
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                <div className={`size-8 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 shadow-md ${isOpen ? 'rotate-180 bg-white text-black' : 'bg-white/5 text-white/40 group-hover:bg-white/10'
                    }`}>
                    <span className="material-symbols-outlined text-lg font-bold">keyboard_arrow_down</span>
                </div>
            </button>

            <div className={`relative z-10 grid transition-[grid-template-rows] duration-700 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-5 pt-0 space-y-4">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5"></div>
                        <div className="text-white/80">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
