import React from 'react';

interface MagicalCardProps {
    id: string;
    isOpen: boolean;
    onToggle: (id: string) => void;
    title: string;
    subtitle?: string;
    icon: string;
    gradientTheme: string; // now treated as a CSS color string
    iconColor: string;     // now treated as a CSS color string
    children: React.ReactNode;
}

export const MagicalCard = React.memo(function MagicalCard({
    id, isOpen, onToggle, title, subtitle, icon, gradientTheme, iconColor, children
}: MagicalCardProps) {
    return (
        <div
            style={{
                borderRadius: '16px',
                border: isOpen
                    ? '1px solid rgba(201,168,76,0.18)'
                    : '1px solid rgba(201,168,76,0.12)',
                background: isOpen
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.04)',
                transition: 'all 0.5s',
            }}
        >
            <button
                onClick={() => onToggle(id)}
                className="w-full p-5 flex items-center justify-between text-left outline-none"
            >
                <div className="flex items-center gap-3.5">
                    <div
                        className="size-10 rounded-xl flex items-center justify-center transition-all duration-300"
                        style={isOpen
                            ? { background: gradientTheme, color: '#fff' }
                            : { background: 'rgba(255,255,255,0.06)', color: iconColor }
                        }
                    >
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                    </div>
                    <div>
                        <h3
                            className="text-sm font-semibold transition-colors"
                            style={{ color: isOpen ? '#F0EBE0' : '#4A5280' }}
                        >
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-[11px] mt-0.5" style={{ color: '#4A5280' }}>{subtitle}</p>
                        )}
                    </div>
                </div>
                <div
                    className="size-7 rounded-lg flex items-center justify-center transition-all duration-300"
                    style={isOpen
                        ? { transform: 'rotate(180deg)', background: 'rgba(255,255,255,0.08)', color: 'rgba(201,168,76,0.6)' }
                        : { background: 'rgba(255,255,255,0.04)', color: 'rgba(201,168,76,0.4)' }
                    }
                >
                    <span className="material-symbols-outlined text-base">expand_more</span>
                </div>
            </button>

            <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}>
                <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-0">
                        <div className="w-full h-px mb-5" style={{ background: 'rgba(201,168,76,0.1)' }} />
                        <div className="text-sm leading-relaxed" style={{ color: '#8B7A6A' }}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
