import React from 'react';

interface FinalCTAProps { onStart: () => void; }

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStart }) => (
  <section style={{ padding: '100px 24px', background: '#060D1B', position: 'relative', overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', bottom: '-200px', left: '50%', transform: 'translateX(-50%)',
      width: '800px', height: '400px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
      pointerEvents: 'none'
    }} />
    <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ width: '40px', height: '1px', background: 'rgba(201,168,76,0.3)', margin: '0 auto 40px' }} />

      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, color: '#F0EBE0', lineHeight: 1.25, marginBottom: '20px' }}>
        Tu cuerpo ya tiene<br />
        <em style={{ background: 'linear-gradient(135deg, #F5E4B3, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>todas las respuestas.</em>
      </h2>

      <p style={{ fontSize: '15px', color: '#6A6460', lineHeight: 1.7, marginBottom: '40px' }}>
        SanArte es el traductor que estabas esperando.<br />Empezá gratis. Transformá tu vida.
      </p>

      <button onClick={onStart} style={{
        background: 'linear-gradient(135deg, #C9A84C, #F0D080, #C9A84C)', color: '#060D1B',
        border: 'none', borderRadius: '999px', padding: '18px 48px',
        fontSize: '16px', fontWeight: 700, cursor: 'pointer',
        letterSpacing: '0.04em', marginBottom: '16px', display: 'inline-block',
        boxShadow: '0 8px 32px rgba(201,168,76,0.25)'
      }}>
        Comenzar ahora →
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px', opacity: 0.4 }}>
        <div style={{ width: '24px', height: '1px', background: 'rgba(201,168,76,0.5)' }} />
        <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A4840' }}>Únete a +2.400 almas sanando hoy</span>
        <div style={{ width: '24px', height: '1px', background: 'rgba(201,168,76,0.5)' }} />
      </div>

      <p style={{ marginTop: '12px', fontSize: '11px', color: '#3A3830', letterSpacing: '0.06em' }}>
        GRATIS PARA EMPEZAR · SIN TARJETA DE CRÉDITO
      </p>
    </div>
  </section>
);
