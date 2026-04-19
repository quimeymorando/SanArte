import React from 'react';

const demo = {
  symptom: 'Dolor de cabeza tensional',
  dimensions: [
    {
      icon: 'psychology',
      label: 'Lectura emocional',
      color: '#C9A84C',
      title: 'Autoexigencia y desvalorización',
      content: 'Tu mente lleva demasiado tiempo juzgándote. Hay un pensamiento recurrente de "no soy suficiente" o una presión intelectual que se acumula como presión literal en tu cabeza. El dolor de cabeza aparece cuando la mente trabaja contra vos.',
    },
    {
      icon: 'spa',
      label: 'Medicina natural',
      color: '#8BA888',
      title: 'Lavanda · Menta · Magnesio',
      content: 'Aplicá 2 gotas de aceite esencial de lavanda en las sienes con un suave masaje circular. Infusión de menta piperita 3 veces al día. El magnesio glicianato (400mg nocturno) reduce la frecuencia hasta un 50% en casos crónicos.',
    },
    {
      icon: 'self_improvement',
      label: 'Movilidad y cuerpo',
      color: '#7B9BB5',
      title: 'Liberación cráneo-cervical',
      content: 'Inclinación lateral suave: llevá la oreja al hombro, sostené 30 segundos. Rotación lenta de cuello en medios círculos frontales. Masaje en los puntos de presión: base del cráneo, sienes y entre las cejas. 5 minutos, dos veces al día.',
    },
    {
      icon: 'flare',
      label: 'Arcángel protector',
      color: '#A78BFA',
      title: 'Metatrón — Claridad mental',
      content: 'Metatrón es el arcángel de la claridad mental y la transmutación de pensamientos. Invocalo diciendo: "Metatrón, ayúdame a soltar los pensamientos que me pesan y a confiar en mi propia sabiduría." Visualizá una luz blanca purificando tu mente.',
    },
    {
      icon: 'headphones',
      label: 'Meditación guiada',
      color: '#F472B6',
      title: 'Respiración 4-7-8 liberadora',
      content: 'Sentate cómoda, cerrá los ojos. Inhalá por la nariz 4 segundos — sentí cómo el aire llega a tu frente. Retené 7 segundos visualizando que el dolor se disuelve. Exhalá por la boca 8 segundos soltando la autoexigencia. Repetí 4 ciclos.',
    },
    {
      icon: 'hub',
      label: 'Conflicto biológico',
      color: '#34D399',
      title: 'La pregunta que libera',
      content: 'Cerrá los ojos y preguntate: "¿Qué situación de mi vida siento que no puedo controlar?" y "¿A quién o qué estoy intentando complacer a costa de mí misma?" El cerebro registró un conflicto de desvalorización intelectual. Reconocerlo ya inicia la sanación.',
    },
  ]
};

export const OpportunitySection: React.FC = () => (
  <section style={{ padding: '80px 24px', background: '#060D1B' }}>
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A5280', display: 'block', marginBottom: '16px' }}>Así se ve por dentro</span>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 300, color: '#F0EBE0', lineHeight: 1.25, marginBottom: '12px' }}>
          No solo una lectura.<br />
          <em style={{ background: 'linear-gradient(135deg, #F5E4B3, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Un plan de sanación completo.</em>
        </h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '999px', padding: '8px 20px' }}>
          <span className="material-symbols-outlined" style={{ color: '#C9A84C', fontSize: '16px', fontVariationSettings: "'wght' 300" }}>search</span>
          <span style={{ fontSize: '13px', color: '#8B7355', fontStyle: 'italic' }}>Búsqueda: "{demo.symptom}"</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {demo.dimensions.map((d) => (
          <div key={d.label} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '22px',
            border: '1px solid rgba(255,255,255,0.06)',
            borderTop: `2px solid ${d.color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${d.color}18`, border: `1px solid ${d.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1 }}>
                <span className="material-symbols-outlined" style={{ color: d.color, fontSize: '18px', fontVariationSettings: "'wght' 300", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: d.color, marginBottom: '2px' }}>{d.label}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#F0EBE0' }}>{d.title}</p>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#6A6875', lineHeight: 1.7 }}>{d.content}</p>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '13px', color: '#4A5280', lineHeight: 1.7 }}>
        Gratis para empezar · Sin límites para quien quiere <em style={{ color: '#C9A84C' }}>ir más profundo</em>
      </p>
    </div>
  </section>
);
