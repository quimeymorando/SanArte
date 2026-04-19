import React from 'react';

interface HeroSectionProps { onStart: () => void; }

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => (
  <section style={{
    minHeight: '100dvh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#060D1B', position: 'relative',
    overflow: 'hidden', padding: '0 24px'
  }}>
    <div style={{
      position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
      width: '600px', height: '600px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
      pointerEvents: 'none'
    }} />
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', width: '100%', textAlign: 'center', paddingTop: '96px', paddingBottom: '80px' }}>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '999px', padding: '6px 16px', marginBottom: '40px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C' }} />
        <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 500 }}>Tu cuerpo tiene un mensaje</span>
      </div>

      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 300, color: '#F0EBE0', lineHeight: 1.15, marginBottom: '12px' }}>
        Tu cuerpo lleva años
      </h1>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 400, fontStyle: 'italic', background: 'linear-gradient(135deg, #F5E4B3 0%, #C9A84C 50%, #F0D080 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.15, marginBottom: '24px' }}>
        hablándote.
      </h1>
      <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 300, color: '#F0EBE0', marginBottom: '12px' }}>
        Hoy aprendés a <em style={{ color: '#C9A84C' }}>escucharlo.</em>
      </p>

      <p style={{ fontSize: '16px', color: '#6A6460', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 40px' }}>
        Cada síntoma es un mensaje emocional que nadie te enseñó a leer. SanArte lo traduce al instante — sin fármacos, sin años de terapia.
      </p>

      <button onClick={onStart} style={{
        background: 'linear-gradient(135deg, #C9A84C, #F0D080, #C9A84C)', color: '#060D1B',
        border: 'none', borderRadius: '999px', padding: '16px 40px',
        fontSize: '15px', fontWeight: 600, cursor: 'pointer',
        letterSpacing: '0.04em', marginBottom: '16px', display: 'inline-block'
      }}>
        Descubrí el mensaje →
      </button>
      <p style={{ fontSize: '11px', color: '#3A3830', letterSpacing: '0.08em' }}>GRATIS PARA EMPEZAR · SIN TARJETA DE CRÉDITO</p>

      <div style={{ marginTop: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.5 }}>
        <div style={{ width: '40px', height: '1px', background: 'rgba(201,168,76,0.4)' }} />
        <span style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A4840' }}>+2.400 almas sanando hoy</span>
        <div style={{ width: '40px', height: '1px', background: 'rgba(201,168,76,0.4)' }} />
      </div>
    </div>
  </section>
);
