import React from 'react';

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

export const MagicalCard = React.memo(function MagicalCard({
    id, isOpen, onToggle, title, subtitle, icon, gradientTheme, iconColor, children
}: MagicalCardProps) {
    return (
        <div className={`rounded-2xl border transition-all duration-500 ${
            isOpen
                ? 'bg-white/[0.03] border-white/[0.08]'
                : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
        }`}>
            <button
                onClick={() => onToggle(id)}
                className="w-full p-5 flex items-center justify-between text-left outline-none"
            >
                <div className="flex items-center gap-3.5">
                    <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isOpen
                            ? `${gradientTheme} text-white`
                            : `bg-white/[0.05] ${iconColor}`
                    }`}>
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                    </div>
                    <div>
                        <h3 className={`text-sm font-semibold transition-colors ${
                            isOpen ? 'text-white' : 'text-white/60'
                        }`}>
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-[11px] text-white/25 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>
                <div className={`size-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isOpen
                        ? 'rotate-180 bg-white/10 text-white/60'
                        : 'bg-white/[0.04] text-white/20'
                }`}>
                    <span className="material-symbols-outlined text-base">expand_more</span>
                </div>
            </button>

            <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}>
                <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-0">
                        <div className="w-full h-px bg-white/[0.06] mb-5" />
                        <div className="text-white/60 text-sm leading-relaxed">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
