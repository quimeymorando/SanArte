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
    <div className="relative w-full overflow-hidden bg-white dark:bg-[#080c0f] text-gray-900 dark:text-gray-100">
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
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
          <div className="relative bg-white dark:bg-[#0e1317] w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:fade-in sm:zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </h3>
                <button onClick={() => setShowAuthModal(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authMode === 'register' && (
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre" required
                    className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-colors dark:text-white dark:placeholder-white/20"
                  />
                )}
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico" required
                  className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-colors dark:text-white dark:placeholder-white/20"
                />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña" required minLength={6}
                  className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-colors dark:text-white dark:placeholder-white/20"
                />
                {authMode === 'register' && (
                  <input
                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repetir contraseña" required
                    className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-colors dark:text-white dark:placeholder-white/20"
                  />
                )}

                {authError && (
                  <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-3">
                    {authError}
                  </div>
                )}

                <button
                  type="submit" disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoggingIn ? 'Cargando...' : authMode === 'login' ? 'Ingresar' : 'Crear cuenta'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]" />
                <span className="text-[11px] text-gray-400 dark:text-gray-500">o</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]" />
              </div>

              {/* Google */}
              <button
                onClick={async () => {
                  try { setAuthError(''); setIsLoggingIn(true); await authService.loginWithGoogle(); }
                  catch (err: any) { setAuthError(err.message || 'Error con Google'); setIsLoggingIn(false); }
                }}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-all text-sm font-medium text-gray-700 dark:text-gray-200 active:scale-[0.98]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar con Google
              </button>

              <div className="mt-5 mb-2 text-center">
                <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-teal-500 text-sm font-medium">
                  {authMode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
