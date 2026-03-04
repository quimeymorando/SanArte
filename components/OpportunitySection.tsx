import React from 'react';
import { OpportunityCard } from './ui/OpportunityCard';

export const OpportunitySection: React.FC = () => {
    const opportunities = [
        {
            icon: '📘',
            title: 'Descubre el "Diccionario Oculto"',
            description: 'Olvida los diagnósticos difusos. Traduce al instante qué emoción (miedo, ira, soledad) está encendiendo tu dolor. Ataca el problema donde nace, no solo donde duele.'
        },
        {
            icon: '🤖',
            title: 'Tecnología Guiada (Sin Esfuerzo)',
            description: 'Tu Asistente IA hace el trabajo pesado. Solo dile qué sientes y SanArte trazará la ruta emocional exacta. Claridad total y control en minutos, no en meses de terapia.'
        },
        {
            icon: '🔋',
            title: 'Sanar es Recuperar tu Futuro',
            description: 'Al liberar la carga emocional, desbloqueas una vitalidad renovada. Deja de permitir que tu pasado dicte tu salud y recupera la energía para tus proyectos y familia.'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-6 pb-24 relative z-10">
            <div className="grid gap-4">
                {opportunities.map((opt, idx) => (
                    <OpportunityCard
                        key={idx}
                        icon={opt.icon}
                        title={opt.title}
                        description={opt.description}
                        delay={idx * 200}
                    />
                ))}
            </div>
        </div>
    );
};
