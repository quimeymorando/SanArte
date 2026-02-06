
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { HeroSection } from '../components/HeroSection';
import { FuturisticCard } from '../components/ui/FuturisticCard';

const LandingPage: React.FC = () => {
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check for errors in URL (Supabase redirect)
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

    // Validation
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
      console.error(e);
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
      console.error("Error checking auth:", error);
      // Fallback: Si falla la verificación (ej. problemas de conexión), mostramos el modal igual
      setShowAuthModal(true);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-surface-light dark:bg-[#0a0f12] text-gray-900 dark:text-gray-100 font-sans selection:bg-primary/30">

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            {/* Logo Vectorial Premium - Sin fondo, puro CSS/SVG */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <span className="material-symbols-outlined text-5xl text-transparent bg-clip-text bg-gradient-to-br from-primary to-cyan-300 relative z-10 animate-float-slow drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">
                spa
              </span>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-2xl font-black font-heading tracking-tight text-white neo-glow group-hover:text-primary-hover transition-colors">
                San<span className="text-primary italic">Arte</span>
              </span>
            </div>
          </div>
          <button
            onClick={openAuth}
            className="px-6 py-2 rounded-full glass-panel border border-white/20 font-black text-sm hover:scale-105 transition-all text-white hover:shadow-glow-primary"
          >
            Entrar
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <HeroSection onStart={openAuth} />

      {/* --- THE SHIFT (BREAKING FALSE BELIEFS) --- */}
      <section className="py-24 bg-surface-light dark:bg-transparent relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[3rem] blur-3xl -z-10 group-hover:blur-xl transition-all duration-700"></div>
            <div className="glass-panel rounded-[3rem] h-auto min-h-[500px] flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-500">
              <div className="absolute w-[120%] h-[120%] bg-[url('https://images.unsplash.com/photo-1512411516006-218206105f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover opacity-10 dark:opacity-20 mix-blend-overlay"></div>
              <div className="relative z-10 text-center space-y-6">
                <span className="text-8xl block animate-float">🗝️</span>
                <h3 className="text-4xl font-black mb-2 dark:text-gray-100 leading-tight">Tu Cuerpo tiene un <br /><span className="text-primary">Diccionario Oculto</span></h3>
                <p className="text-gray-500 font-medium max-w-sm mx-auto">No es "mala suerte" ni "genética". Es un código que nadie te enseñó a leer... hasta ahora.</p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <h2 className="text-4xl md:text-5xl font-black leading-tight text-gray-900 dark:text-white">
              No necesitas ser médico ni gurú para <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent decoration-wavy decoration-2">Sanar de Raíz</span>.
            </h2>

            <div className="space-y-8">
              {/* OPORTUNIDAD 1 */}
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">📘</div>
                <div>
                  <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Descubre el "Diccionario Oculto"</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Olvida los diagnósticos difusos. Traduce al instante qué emoción (miedo, ira, soledad) está encendiendo tu dolor. Ataca el problema donde nace, no solo donde duele.
                  </p>
                </div>
              </div>

              {/* OPORTUNIDAD 2 */}
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-2xl">🤖</div>
                <div>
                  <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Tecnología Guiada (Sin Esfuerzo)</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Tu Asistente IA hace el trabajo pesado. Solo dile qué sientes y SanArte trazará la ruta emocional exacta. Claridad total y control en minutos, no en meses de terapia.
                  </p>
                </div>
              </div>

              {/* OPORTUNIDAD 3 */}
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl">🔋</div>
                <div>
                  <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Sanar es Recuperar tu Futuro</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Al liberar la carga emocional, desbloqueas una vitalidad renovada. Deja de permitir que tu pasado dicte tu salud y recupera la energía para tus proyectos y familia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA FINAL (MAGNETIC) --- */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/5"></div>
        <div className="absolute top-[-50%] left-[-20%] w-[1000px] h-[1000px] bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-[150px] animate-pulse-slow"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-12 md:p-24 rounded-[3rem] border border-white/50 dark:border-white/10 shadow-2xl">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">
            ¿Listo para dejar de sobrevivir<br />y empezar a <span className="text-primary">Vivir</span>?
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto font-medium">
            Tu cuerpo ya te está gritando la respuesta. SanArte es el traductor que estabas esperando.
          </p>
          <button
            onClick={openAuth}
            className="group relative inline-flex items-center justify-center gap-4 px-12 py-6 bg-gradient-to-r from-primary to-purple-600 hover:scale-105 text-white text-xl md:text-2xl font-black rounded-2xl shadow-2xl shadow-primary/40 transition-all w-full md:w-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10">¡SÍ! Quiero Descodificar Mis Síntomas Ahora</span>
            <span className="material-symbols-outlined text-3xl relative z-10">lock_open</span>
          </button>
          <p className="mt-8 text-sm text-gray-500 font-bold opacity-70 tracking-widest uppercase">
            Únete a +2,400 almas sanando hoy
          </p>
        </div>
      </section>

      <footer className="py-12 text-center text-gray-400 text-sm">
        <p>© 2025 SanArte. Hecho con ❤️ y conciencia.</p>
      </footer>

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
              <p className="text-white/80 font-medium mt-2 relative z-10">
                {authMode === 'login' ? 'Tu espacio de sanación te espera' : 'Tu viaje de sanación comienza aquí'}
              </p>
            </div>

            <div className="p-8">
              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">

                {/* NAME FIELD - REGISTER ONLY */}
                {authMode === 'register' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Nombre</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="¿Cómo te gusta que te llamen?"
                      className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      required
                    />
                  </div>
                )}

                {/* EMAIL FIELD */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    required
                  />
                </div>

                {/* PASSWORD FIELD */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    required
                    minLength={6}
                  />
                </div>

                {/* CONFIRM PASSWORD - REGISTER ONLY */}
                {authMode === 'register' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Repetir Contraseña</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-gray-50 dark:bg-black/20 border rounded-2xl px-5 py-3 focus:ring-4 outline-none transition-all font-medium ${confirmPassword && password !== confirmPassword
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20 focus:border-primary'
                        }`}
                      required
                      minLength={6}
                    />
                  </div>
                )}

                {authMode === 'register' && (
                  <div className="flex items-start gap-3 mt-2 px-1">
                    <input type="checkbox" required className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-normal">
                      Acepto guardar mi progreso y recibir actualizaciones.
                    </p>
                  </div>
                )}

                {authError && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
                    <p className="text-red-500 text-sm font-bold mb-2">{authError}</p>
                    {(authError.includes("revisa tu correo") || authError.includes("no confirmado")) && (
                      <button
                        type="button"
                        onClick={async () => {
                          const sent = await authService.resendConfirmationEmail(email);
                          if (sent) setAuthError("¡Correo reenviado!");
                          else setAuthError("Error al reenviar.");
                        }}
                        className="text-xs text-primary hover:underline font-black"
                      >
                        Reenviar correo
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`mt-2 w-full bg-gradient-to-r hover:scale-[1.02] text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 ${isLoggingIn ? 'opacity-70 cursor-wait' : ''
                    } ${authMode === 'login' ? 'from-indigo-600 to-blue-600' : 'from-primary to-purple-600'}`}
                >
                  {isLoggingIn ? (
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  ) : (
                    <>
                      <span>{authMode === 'login' ? 'Ingresar' : 'Crear Cuenta'}</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await authService.loginAsGuest();
                    navigate('/home');
                  }}
                  className="mt-3 w-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-primary font-bold py-3 rounded-2xl text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors"
                >
                  Ingresar como Invitado (Modo Demo)
                </button>
              </form>

              {/* TOGGLE MODE */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="group relative inline-block"
                >
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent font-black tracking-wide text-sm group-hover:opacity-80 transition-opacity">
                    {authMode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Ingresa aquí'}
                  </span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 transition-all group-hover:w-full"></span>
                </button>
              </div>

              <button
                onClick={() => !isLoggingIn && setShowAuthModal(false)}
                className="w-full text-center mt-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold uppercase tracking-widest"
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