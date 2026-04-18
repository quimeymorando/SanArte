import React from 'react';

export const TheShift: React.FC = () => {
    return (
        <section className="py-20 md:py-28 bg-sanarte-cream relative">
            <div className="max-w-3xl mx-auto px-6 text-center">
                <span className="text-[10px] font-medium tracking-widest uppercase text-sanarte-gold block mb-4">Lo que cambia</span>
                <h2 className="text-3xl md:text-4xl font-light text-sanarte-text-dark leading-tight mb-4">
                    Tu cuerpo tiene un{' '}
                    <em>diccionario oculto.</em>
                </h2>
                <p className="text-base text-sanarte-text-muted max-w-xl mx-auto mb-14">
                    Cada síntoma es un mensaje emocional que nadie te enseñó a leer. SanArte te da la herramienta para decodificarlo.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                    {[
                        { num: '01', title: 'Buscás tu síntoma', desc: 'Describís lo que sentís en tu cuerpo.' },
                        { num: '02', title: 'La IA lo decodifica', desc: 'Biodescodificación y sabiduría ancestral.' },
                        { num: '03', title: 'Sanás de raíz', desc: 'Remedios naturales, meditaciones y rutinas.' },
                    ].map((item) => (
                        <div key={item.num} className="p-6 rounded-2xl bg-white border border-sanarte-border-light text-left">
                            <span className="text-xs font-medium text-sanarte-gold tracking-widest">{item.num}</span>
                            <h3 className="text-sm font-medium text-sanarte-text-dark mt-3 mb-2">{item.title}</h3>
                            <p className="text-xs text-sanarte-text-muted leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
