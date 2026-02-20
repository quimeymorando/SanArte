import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsPremium } from './useIsPremium';
import AdSenseSlot from './AdSenseSlot';

interface SmartAdProps {
    /** AdSense slot ID for real ads */
    slotId?: string;
    /** Show house ad every N impressions (default: 3 = every 3rd is house ad) */
    houseAdFrequency?: number;
    /** Visual format */
    format?: 'banner' | 'rectangle';
    className?: string;
}

/**
 * Intelligent ad component that alternates between:
 * - Real AdSense ads (revenue generating)
 * - House ads (upsell to Premium)
 * 
 * Auto-hides entirely for Premium users.
 */
const SmartAd: React.FC<SmartAdProps> = ({
    slotId = '',
    houseAdFrequency = 3,
    format = 'banner',
    className = '',
}) => {
    const isPremium = useIsPremium();
    const navigate = useNavigate();
    const [showHouseAd, setShowHouseAd] = useState(false);

    useEffect(() => {
        // Randomly decide if this impression shows a house ad
        const impression = Math.floor(Math.random() * houseAdFrequency);
        setShowHouseAd(impression === 0 || !slotId);
    }, [houseAdFrequency, slotId]);

    // Premium users don't see ads at all
    if (isPremium) return null;

    // House Ad (upsell to Premium)
    if (showHouseAd) {
        return (
            <div
                className={`w-full bg-[#0a1114]/60 backdrop-blur-md border border-white/5 hover:border-amber-500/20 rounded-2xl p-4 my-4 relative overflow-hidden group cursor-pointer transition-all ${className}`}
                onClick={() => navigate('/profile?upgrade=true')}
            >
                {/* Subtle shimmer */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

                <div className="absolute top-0 right-0 bg-white/5 text-[8px] font-bold px-2 py-0.5 rounded-bl-lg text-gray-500 uppercase tracking-widest">
                    Publicidad
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="size-12 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-2xl flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                        <span className="material-symbols-outlined text-2xl">diamond</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                            Desbloquea tu Sanación Completa
                        </h4>
                        <p className="text-xs text-gray-400 leading-tight mt-0.5 truncate">
                            Elimina anuncios y accede a todo con Premium
                        </p>
                    </div>
                    <button className="text-xs font-black text-amber-400 bg-amber-400/10 px-3 py-2 rounded-xl group-hover:bg-amber-400 group-hover:text-black transition-colors shrink-0">
                        VER
                    </button>
                </div>
            </div>
        );
    }

    // Real AdSense Ad
    return (
        <div className={`my-4 ${className}`}>
            <div className="relative">
                <div className="absolute top-0 right-0 text-[8px] font-bold px-2 py-0.5 text-gray-600 uppercase tracking-widest z-10">
                    Publicidad
                </div>
                <AdSenseSlot
                    slotId={slotId}
                    format={format === 'banner' ? 'horizontal' : 'rectangle'}
                    className="rounded-xl overflow-hidden"
                />
            </div>
        </div>
    );
};

export default SmartAd;
