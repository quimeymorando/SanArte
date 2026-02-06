import React from 'react';

interface FuturisticCardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: 'primary' | 'secondary' | 'accent';
    delay?: number;
}

export const FuturisticCard: React.FC<FuturisticCardProps> = ({
    children,
    className = '',
    glowColor = 'primary',
    delay = 0
}) => {
    const glowMap = {
        primary: 'hover:shadow-glow-primary hover:border-primary/50',
        secondary: 'hover:shadow-glow-secondary hover:border-secondary/50',
        accent: 'hover:shadow-glow-accent hover:border-accent/50',
    };

    return (
        <div
            className={`
        glass-card relative overflow-hidden rounded-[2.5rem] p-8 border border-white/10 bg-white/5 backdrop-blur-md 
        transition-all duration-500 hover:-translate-y-2 group
        ${glowMap[glowColor]} 
        ${className}
      `}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Neon Line Animation on Hover */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-full transition-all duration-700 ease-in-out"></div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
