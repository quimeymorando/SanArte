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
        <div className={`group relative overflow-hidden transition-all duration-700 ease-in-out border rounded-[2rem] mb-3 shadow-sm ${isOpen
            ? 'bg-white dark:bg-[#1a2c32] border-primary/20 shadow-primary/5'
            : 'bg-white/60 dark:bg-surface-dark border-transparent hover:border-gray-200 dark:hover:border-gray-700'
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
                    <div className={`size-11 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-transform duration-500 group-hover:scale-105 ${isOpen ? `${gradientTheme} text-white` : `bg-gray-50 dark:bg-white/5 ${iconColor}`
                        }`}>
                        <span className="material-symbols-outlined text-[24px]">{icon}</span>
                    </div>
                    <div>
                        <h3 className={`text-base md:text-lg font-bold tracking-tight transition-colors ${isOpen ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                <div className={`size-8 rounded-full border border-gray-100 dark:border-gray-700 flex items-center justify-center transition-all duration-500 ${isOpen ? 'rotate-180 bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-transparent text-gray-400'
                    }`}>
                    <span className="material-symbols-outlined text-lg">keyboard_arrow_down</span>
                </div>
            </button>

            <div className={`relative z-10 grid transition-[grid-template-rows] duration-700 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-5 pt-0 space-y-4">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-4"></div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
