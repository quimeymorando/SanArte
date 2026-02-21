import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  // Don't show navigation on landing page
  if (location.pathname === '/') return null;

  const DesktopLink = ({ to, icon, label }: { to: string, icon: string, label: string }) => {
    const active = isActive(to);
    return (
      <Link to={to} className={`flex items-center gap-2 text-sm font-bold transition-all duration-300 ${active ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-gray-500 hover:text-cyan-300'}`}>
        <span className="material-symbols-outlined text-lg">{icon}</span>
        {label}
      </Link>
    );
  };

  const MobileLink = ({ to, emoji, label }: { to: string, emoji: string, label: string }) => {
    const active = isActive(to);
    return (
      <Link to={to} className="flex flex-col items-center gap-1 relative group w-16">
        <div className={`size-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${active ? 'bg-cyan-500/15 border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] -translate-y-1' : 'bg-white/5 border border-white/5 group-hover:bg-white/10'}`}>
          <span className={`text-xl transition-transform duration-300 ${active ? 'scale-110' : 'grayscale-[50%] opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>{emoji}</span>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${active ? 'text-cyan-400' : 'text-white/40 group-hover:text-white/70'}`}>{label}</span>
        {active && <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]"></div>}
      </Link>
    );
  };

  return (
    <>
      {/* Universal Top Header (Mobile & Desktop) */}
      <nav className="fixed top-0 w-full bg-[#050b0d]/70 backdrop-blur-xl border-b border-white/5 py-3 md:py-4 pt-[calc(0.75rem+env(safe-area-inset-top))] md:pt-[calc(1rem+env(safe-area-inset-top))] px-4 md:px-8 z-[90] flex justify-between items-center transition-all duration-300">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer relative z-10" onClick={() => navigate('/home')}>
          <span className="material-symbols-outlined text-2xl md:text-3xl text-cyan-400 animate-pulse-slow">spa</span>
          <span className="text-lg md:text-xl font-heading font-black text-white tracking-tight hidden sm:block">San<span className="text-cyan-400 italic">Arte</span></span>
        </div>

        {/* Center Emotional Badge */}
        <div className="absolute left-1/2 -translate-x-1/2 flex w-max">
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            <span className="text-[9px] md:text-[10px] font-black text-cyan-300 uppercase tracking-[0.15em] md:tracking-[0.2em]">Tu cuerpo habla, escúchalo ✨</span>
          </div>
        </div>

        {/* Desktop Links (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-8 relative z-10">
          <DesktopLink to="/home" icon="home" label="Inicio" />
          <DesktopLink to="/community" icon="diversity_1" label="Comunidad" />
          <DesktopLink to="/routines" icon="calendar_today" label="Rutinas" />
          <DesktopLink to="/journal" icon="book_2" label="Diario" />

          <Link to="/profile" className={`flex items-center gap-2 text-sm font-bold transition-all duration-300 ${isActive('/profile') ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-300'}`}>
            <div className={`size-8 rounded-full flex items-center justify-center transition-all ${isActive('/profile') ? 'bg-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.3)] border border-cyan-400/30' : 'bg-white/5 border border-white/5'}`}>
              <span className="material-symbols-outlined text-lg">person</span>
            </div>
            Perfil
          </Link>
        </div>

        {/* Mobile Profile Avatar (Visible only on very small screens if needed, but we have it in bottom nav) */}
        <div className="md:hidden w-8"></div> {/* Spacer to keep center badge center */}
      </nav>

      {/* Mobile Bottom Navigation (Beautiful Emoji Edition) */}
      <nav className="fixed bottom-0 w-full bg-[#050b0d]/90 backdrop-blur-2xl border-t border-white/5 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] px-4 z-[90] flex justify-between items-end md:hidden shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
        <MobileLink to="/home" emoji="🏡" label="Inicio" />
        <MobileLink to="/community" emoji="🤝" label="Tribu" />
        <MobileLink to="/routines" emoji="📅" label="Rutinas" />
        <MobileLink to="/journal" emoji="✍️" label="Diario" />
        <MobileLink to="/profile" emoji="👤" label="Perfil" />
      </nav>
    </>
  );
};

export default Navigation;