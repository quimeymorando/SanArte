import React from 'react';

const items = [
    { icon: 'psychology', title: 'Decodificá tus síntomas', desc: 'Traducí al instante qué emoción está detrás de tu dolor. Atacá el problema donde nace, no solo donde duele.' },
    { icon: 'auto_awesome', title: 'IA que te guía', desc: 'Decile qué sentís y SanArte traza la ruta emocional. Claridad en minutos, no en meses de terapia.' },
    { icon: 'favorite', title: 'Recuperá tu energía', desc: 'Al liberar la carga emocional, desbloqueás vitalidad para tu vida, proyectos y familia.' },
];

export const OpportunitySection: React.FC = () => {
    return (
        <section className="py-16 md:py-24 bg-[#10142A]">
            <div className="max-w-2xl mx-auto px-6">
                <span className="text-[10px] font-medium tracking-widest uppercase text-[#4A5280] block mb-3">Tecnología con alma</span>
                <h2 className="text-2xl md:text-3xl font-light text-[#F0EBE0] mb-12 leading-snug">
                    Sin esfuerzo.<br/><em>Con intención.</em>
                </h2>
                <div className="space-y-8">
                    {items.map((item) => (
                        <div key={item.title} className="flex items-start gap-5">
                            <div className="size-10 rounded-xl bg-sanarte-gold/15 border border-sanarte-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-sanarte-gold text-lg" style={{fontVariationSettings: "'wght' 300"}}>{item.icon}</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-[#F0EBE0] mb-1">{item.title}</h3>
                                <p className="text-sm text-[#4A5280] leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
