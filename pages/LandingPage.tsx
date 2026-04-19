import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { HeroSection } from '../components/HeroSection';
import { TheShift } from '../components/TheShift';
import { OpportunitySection } from '../components/OpportunitySection';
import { FinalCTA } from '../components/FinalCTA';
import { logger } from '../utils/logger';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash?.includes('error_description')) {
      const params = new URLSearchParams(hash.substring(1));
      const desc = params.get('error_description');
      if (desc) {
        setAuthError(decodeURIComponent(desc).replace(/\+/g, ' '));
        setShowAuthModal(true);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email.includes('@') || password.length < 6) { setAuthError('Verificá el correo y la contraseña (min. 6 caracteres).'); return; }
    if (authMode === 'register' && name.length < 2) { setAuthError('Ingresá un nombre válido.'); return; }
    if (authMode === 'register' && password !== confirmPassword) { setAuthError('Las contraseñas no coinciden.'); return; }

    setIsLoggingIn(true);
    try {
      const user = authMode === 'login'
        ? await authService.login(email, password)
        : await authService.register(name, email, password);
      if (user) { setShowAuthModal(false); navigate('/home'); }
    } catch (e: any) {
      let msg = e.message || 'Error al conectar.';
      if (msg.includes('Invalid login credentials')) msg = 'Correo o contraseña incorrectos.';
      if (msg.includes('User already registered')) msg = 'Correo registrado. Intentá iniciar sesión.';
      setAuthError(msg);
    } finally { setIsLoggingIn(false); }
  };

  const openAuth = async () => {
    try {
      if (await authService.isAuthenticated()) { navigate('/home'); }
      else { setShowAuthModal(true); }
    } catch { setShowAuthModal(true); }
  };

  return (
    <div style={{ background: '#060D1B', color: '#F0EBE0', width: '100%', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-200 ${
        scrolled ? 'bg-sanarte-night/90 backdrop-blur-xl border-b border-sanarte-gold/10' : 'bg-transparent'
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <span className="material-symbols-outlined text-sanarte-gold text-xl" style={{fontVariationSettings: "'wght' 300"}}>spa</span>
            <span className="text-lg font-medium text-[#F0EBE0] tracking-tight">
              San<em className="text-sanarte-gold font-light">Arte</em>
            </span>
          </div>
          <button
            onClick={openAuth}
            className="px-5 py-2 rounded-full border border-sanarte-gold/30 text-sanarte-gold text-sm font-medium hover:bg-sanarte-gold/10 transition-all duration-200"
          >
            Entrar
          </button>
        </div>
      </nav>

      {/* Sections */}
      <HeroSection onStart={openAuth} />
      <TheShift />
      <OpportunitySection />
      <FinalCTA onStart={openAuth} />

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 dark:text-gray-600 text-xs border-t border-gray-100 dark:border-white/[0.06]">
        <p>&copy; {new Date().getFullYear()} SanArte</p>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6, 13, 27, 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowAuthModal(false)}
        >
          <style>{`.sa-input::placeholder{color:#4A5280}.sa-input:focus{border-color:rgba(201,168,76,0.5)!important;outline:none}`}</style>
          <div
            style={{ position: 'relative', background: '#0D1526', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '20px', padding: '36px 32px', maxWidth: '420px', width: '90%', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 300, fontSize: '26px', color: '#F0EBE0', margin: 0 }}>
                {authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </h3>
              <button onClick={() => setShowAuthModal(false)} style={{ color: '#4A5280', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {authMode === 'register' && (
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre" required
                  className="sa-input"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '14px 18px', color: '#F0EBE0', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' }}
                />
              )}
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico" required
                className="sa-input"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '14px 18px', color: '#F0EBE0', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' }}
              />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña" required minLength={6}
                className="sa-input"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '14px 18px', color: '#F0EBE0', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' }}
              />
              {authMode === 'register' && (
                <input
                  type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir contraseña" required
                  className="sa-input"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '14px 18px', color: '#F0EBE0', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' }}
                />
              )}

              {authError && (
                <div style={{ color: '#F87171', fontSize: '12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '10px 14px' }}>
                  {authError}
                </div>
              )}

              <button
                type="submit" disabled={isLoggingIn}
                style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080, #C9A84C)', color: '#060D1B', borderRadius: '999px', padding: '15px', fontSize: '14px', fontWeight: 700, border: 'none', width: '100%', cursor: isLoggingIn ? 'not-allowed' : 'pointer', letterSpacing: '0.05em', opacity: isLoggingIn ? 0.5 : 1 }}
              >
                {isLoggingIn ? 'Cargando...' : authMode === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(42,48,80,0.8)' }} />
              <span style={{ color: '#2A3050', fontSize: '12px' }}>o</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(42,48,80,0.8)' }} />
            </div>

            {/* Google */}
            <button
              onClick={async () => {
                try { setAuthError(''); setIsLoggingIn(true); await authService.loginWithGoogle(); }
                catch (err: any) { setAuthError(err.message || 'Error con Google'); setIsLoggingIn(false); }
              }}
              disabled={isLoggingIn}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', color: '#F0EBE0', fontSize: '14px', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar con Google
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
                style={{ color: '#C9A84C', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {authMode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
