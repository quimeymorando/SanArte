import React from 'react';

interface OpportunityCardProps {
    icon: string;
    title: string;
    description: string;
    className?: string;
    delay?: number;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ 
    icon, 
    title, 
    description, 
    className = '',
    delay = 0 
}) => {
    return (
        <div 
            className={`flex gap-4 p-6 rounded-3xl transition-all duration-300 hover:bg-white/5 group border border-transparent hover:border-primary/20 ${className}`}
            style={{ 
                animation: 'fade-in 0.8s ease-out forwards',
                animationDelay: `${delay}ms`,
                opacity: 0
            }}
        >
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shadow-glow-primary/20 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                    {title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
                    {description}
                </p>
            </div>
        </div>
    );
};
