import React from 'react';

const symptoms = [
  {
    symptom: 'Dolor de espalda baja',
    color: '#7B9BB5',
    emotional: 'Sentís que cargás el peso del mundo solo. Hay una responsabilidad, una carga económica o emocional que creés que nadie más puede sostener. Tu columna literalmente refleja lo que tu mente no puede soltar.',
    question: '¿Qué estás sosteniendo que en realidad no te pertenece?'
  },
  {
    symptom: 'Contractura en el cuello',
    color: '#C9A84C',
    emotional: 'Hay algo que no querés ver, una situación que evitás mirar de frente. También puede ser rigidez mental — la dificultad de girar hacia otro punto de vista. Tu cuello se tensiona donde tu mente se niega a flexibilizarse.',
    question: '¿Qué verdad estás evitando mirar?'
  }
];

export const TheShift: React.FC = () => (
  <section style={{ padding: '80px 24px', background: '#F3EDE0' }}>
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', display: 'block', marginBottom: '16px' }}>El diccionario oculto</span>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 300, color: '#1C1814', lineHeight: 1.25, marginBottom: '16px' }}>
          El dolor no es tu enemigo.<br />
          <em style={{ color: '#8B6E3A' }}>Es tu maestro más honesto.</em>
        </h2>
        <p style={{ fontSize: '15px', color: '#7A6A5A', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          Cada síntoma tiene una causa emocional. Estos son solo dos ejemplos de lo que SanArte revela.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {symptoms.map((s) => (
          <div key={s.symptom} style={{
            background: '#FFFFFF', borderRadius: '20px', padding: '28px',
            borderLeft: `4px solid ${s.color}`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
          }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.color, marginBottom: '12px' }}>Síntoma</p>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 400, color: '#1C1814', marginBottom: '16px' }}>{s.symptom}</h3>
            <p style={{ fontSize: '14px', color: '#7A6A5A', lineHeight: 1.75, marginBottom: '20px', fontStyle: 'italic' }}>"{s.emotional}"</p>
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B0A090', marginBottom: '8px' }}>La pregunta que libera</p>
              <p style={{ fontSize: '14px', color: '#1C1814', fontWeight: 500, fontStyle: 'italic' }}>{s.question}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
