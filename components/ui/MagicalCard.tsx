import React from 'react';
import { DimensionAccentProvider } from './MarkdownRenderer';

interface MagicalCardProps {
    id: string;
    isOpen: boolean;
    onToggle: (id: string) => void;
    title: string;
    subtitle?: string;
    icon: string;
    gradientTheme: string; // accent color for this dimension
    iconColor: string;     // kept for API compatibility
    children: React.ReactNode;
}

export const MagicalCard = React.memo(function MagicalCard({
    id, isOpen, onToggle, title, subtitle, icon, gradientTheme, children
}: MagicalCardProps) {
    const accent = gradientTheme;

    return (
        <div
            style={{
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.025)',
                border: `1px solid ${accent}26`,
                borderLeft: `3px solid ${accent}`,
                padding: '18px',
                transition: 'all 0.4s',
            }}
        >
            <button
                onClick={() => onToggle(id)}
                className="w-full"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    outline: 'none',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: `${accent}1F`,
                            border: `1px solid ${accent}40`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            lineHeight: 1,
                        }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{
                                color: accent,
                                fontSize: '20px',
                                fontVariationSettings: "'wght' 300",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >{icon}</span>
                    </div>
                    <div>
                        <h3
                            style={{
                                fontFamily: '"Outfit", "Inter", sans-serif',
                                fontSize: '15px',
                                fontWeight: 500,
                                color: '#F0EBE0',
                                margin: 0,
                                lineHeight: 1.2,
                            }}
                        >{title}</h3>
                        {subtitle && (
                            <p
                                style={{
                                    fontFamily: '"Outfit", "Inter", sans-serif',
                                    fontSize: '11px',
                                    fontStyle: 'italic',
                                    color: `${accent}99`,
                                    margin: '3px 0 0',
                                }}
                            >{subtitle}</p>
                        )}
                    </div>
                </div>
                <span
                    className="material-symbols-outlined"
                    style={{
                        fontSize: '22px',
                        color: `${accent}66`,
                        transition: 'transform 0.3s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                        fontVariationSettings: "'wght' 300",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >expand_more</span>
            </button>

            <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div style={{ overflow: 'hidden' }}>
                    <div
                        style={{
                            marginTop: '18px',
                            paddingTop: '20px',
                            borderTop: `1px solid ${accent}1A`,
                        }}
                    >
                        <DimensionAccentProvider value={accent}>
                            {children}
                        </DimensionAccentProvider>
                    </div>
                </div>
            </div>
        </div>
    );
});
