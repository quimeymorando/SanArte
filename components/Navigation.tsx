import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

const Navigation: React.FC = React.memo(function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    authService.getUser().then(setUser);
  }, []);

  if (location.pathname === '/') return null;

  const navItems = [
    { to: '/home', icon: 'home', label: 'Inicio' },
    { to: '/community', icon: 'diversity_1', label: 'Comunidad' },
    { to: '/routines', icon: 'routine', label: 'Rutinas' },
    { to: '/journal', icon: 'edit_note', label: 'Diario' },
    { to: '/profile', icon: 'person', label: 'Perfil' },
  ];

  return (
    <>
      {/* ── Top Bar ── */}
      <nav
        aria-label="Navegación principal"
        className="fixed top-0 w-full bg-[#F3EDE0]/90 backdrop-blur-xl border-b border-[#C4A252]/15 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] px-5 md:px-8 z-[90] flex justify-between items-center"
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/home')}
          role="link"
          aria-label="SanArte — Ir al inicio"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate('/home')}
        >
          <span className="material-symbols-outlined text-xl text-[#C4A252]" style={{fontVariationSettings:"'wght' 300"}}>spa</span>
          <span className="text-base font-medium text-[#1C1814] tracking-tight hidden sm:block">
            San<em className="text-[#C4A252] font-light">Arte</em>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, icon, label }) => {
            const active = isActive(to);
            const isProfile = to === '/profile' && user?.avatar;
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all duration-200 ${
                  active
                    ? 'text-[#1C1814] font-medium border-b-2 border-[#C4A252] rounded-none pb-1'
                    : 'text-[#A09080] font-normal hover:text-[#1C1814]'
                }`}
              >
                {isProfile ? (
                  <div
                    className={`size-6 rounded-full bg-cover bg-center ${active ? 'ring-1 ring-[#C4A252]/50' : ''}`}
                    style={{ backgroundImage: `url('${user.avatar}')` }}
                  />
                ) : (
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings:"'wght' 300"}} aria-hidden="true">{icon}</span>
                )}
                {label}
              </Link>
            );
          })}
        </div>

        <div className="md:hidden w-8" />
      </nav>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        aria-label="Navegación móvil"
        className="fixed bottom-0 w-full bg-[#F3EDE0]/95 backdrop-blur-xl border-t border-[#C4A252]/15 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] px-2 z-[90] md:hidden"
      >
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map(({ to, icon, label }) => {
            const active = isActive(to);
            const isProfile = to === '/profile' && user?.avatar;
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 ${
                  active ? 'text-[#C4A252]' : 'text-[#B0A090]'
                }`}
              >
                {isProfile ? (
                  <div
                    className={`size-7 rounded-full bg-cover bg-center transition-all ${active ? 'ring-2 ring-[#C4A252]/50' : 'opacity-60'}`}
                    style={{ backgroundImage: `url('${user.avatar}')` }}
                  />
                ) : (
                  <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings:"'wght' 300"}} aria-hidden="true">{icon}</span>
                )}
                <span className={`text-[9px] font-medium ${active ? 'text-[#C4A252]' : 'text-[#B0A090]'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
});

export default Navigation;
