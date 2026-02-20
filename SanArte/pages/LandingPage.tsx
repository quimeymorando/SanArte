
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { HeroSection } from '../components/HeroSection';
import { TheShift } from '../components/TheShift';
import { OpportunitySection } from '../components/OpportunitySection';
import { FinalCTA } from '../components/FinalCTA';
import { logger } from '../utils/logger';

const LandingPage: React.FC = () => {
  logger.log("Rendering LandingPage...");

  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // Check if fonts are loaded to prevent icon text layout shift
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.body.classList.add('font-loaded');
      });
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('error_description')) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDesc = params.get('error_description');
      if (errorDesc) {
        setAuthError(decodeURIComponent(errorDesc).replace(/\+/g, ' '));
        setShowAuthModal(true);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!email.includes('@') || password.length < 6) {
      setAuthError('Por favor verifica el correo y la contraseña (mínimo 6 caracteres).');
      return;
    }

    if (authMode === 'register') {
      if (name.length < 2) {
        setAuthError('Por favor ingresa un nombre válido.');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Las contraseñas no coinciden.');
        return;
      }
    }

    setIsLoggingIn(true);
    try {
      let user;
      if (authMode === 'login') {
        user = await authService.login(email, password);
      } else {
        user = await authService.register(name, email, password);
      }
      if (user) {
        setShowAuthModal(false);
        navigate('/home');
      }
    } catch (e: any) {
      logger.error(e);
      let msg = e.message || 'Hubo un error al conectar.';
      if (msg.includes('Invalid login credentials')) msg = 'Correo o contraseña incorrectos.';
      if (msg.includes('User already registered')) msg = 'Este correo ya está registrado. Intenta iniciar sesión.';
      setAuthError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openAuth = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        navigate('/home');
      } else {
        setShowAuthModal(true);
      }
    } catch (error) {
      logger.error("Error checking auth:", error);
      setShowAuthModal(true);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-surface-light dark:bg-[#0a0f12] text-gray-900 dark:text-gray-100 font-sans selection:bg-primary/30">

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <span className="material-symbols-outlined text-5xl text-transparent bg-clip-text bg-gradient-to-br from-primary to-cyan-300 relative z-10 animate-float-slow drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">
                spa
              </span>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-2xl font-black font-heading tracking-tight text-gray-900 dark:text-white neo-glow group-hover:text-primary-hover transition-colors">
                San<span className="text-primary italic">Arte</span>
              </span>
            </div>
          </div>

          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md shadow-glow-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Nueva Oportunidad</span>
          </div>

          <button
            onClick={openAuth}
            className="px-6 py-2 rounded-full glass-panel border border-white/20 font-black text-sm hover:scale-105 transition-all text-white hover:shadow-glow-primary"
          >
            Entrar
          </button>
        </div>
      </nav>

      {/* --- SECTIONS --- */}
      <HeroSection onStart={openAuth} />

      <TheShift />

      <OpportunitySection />

      <FinalCTA onStart={openAuth} />

      <footer className="py-12 text-center text-gray-400 text-sm border-t border-white/5">
        <p>© {new Date().getFullYear()} SanArte. Hecho con ❤️ y conciencia.</p>
      </footer>

      {/* --- AUTH MODAL --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAuthModal(false)}></div>
          <div className="relative bg-white dark:bg-surface-dark w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transform">
            <div className={`px-8 py-8 text-center relative overflow-hidden transition-colors duration-500 ${authMode === 'login' ? 'bg-indigo-600' : 'bg-primary'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
              <h3 className="text-3xl font-black text-white relative z-10">
                {authMode === 'login' ? 'Te damos la bienvenida' : 'Únete a SanArte'}
              </h3>
            </div>
            <div className="p-8">
              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Nombre</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="¿Cómo te gusta que te llamen?"
                      className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 outline-none focus:border-primary transition-all font-medium"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 outline-none focus:border-primary transition-all font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 outline-none focus:border-primary transition-all font-medium"
                    required
                    minLength={6}
                  />
                </div>
                {authMode === 'register' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Repetir Contraseña</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 outline-none focus:border-primary transition-all font-medium"
                      required
                    />
                  </div>
                )}
                {authError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3 font-medium">
                    {authError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`mt-2 w-full text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${authMode === 'login' ? 'bg-indigo-600' : 'bg-primary'}`}
                >
                  {isLoggingIn ? 'Cargando...' : authMode === 'login' ? 'Ingresar' : 'Crear Cuenta'}
                </button>
              </form>

              {/* Separator */}
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">o continúa con</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {/* Google OAuth */}
              <button
                onClick={async () => {
                  try {
                    setAuthError('');
                    setIsLoggingIn(true);
                    await authService.loginWithGoogle();
                  } catch (err: any) {
                    setAuthError(err.message || 'Error al conectar con Google');
                    setIsLoggingIn(false);
                  }
                }}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-all font-bold text-gray-700 dark:text-gray-200 active:scale-[0.98]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar con Google
              </button>

              <div className="mt-6 text-center">
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-primary font-bold text-sm">
                  {authMode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Ingresa aquí'}
                </button>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-center mt-4 text-gray-400 text-xs font-bold uppercase tracking-widest"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;