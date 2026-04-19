import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

const Navigation: React.FC = React.memo(function Navigation() {
  const location = useLocation();
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
      {/* ── Bottom Nav (all screen sizes) ── */}
      <nav
        aria-label="Navegación"
        className="fixed bottom-0 w-full backdrop-blur-xl py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] px-2 z-[90]"
        style={{ background: 'rgba(6,13,27,0.95)', borderTop: '1px solid rgba(201,168,76,0.15)' }}
      >
        <div className="flex justify-around items-center max-w-[448px] mx-auto">
          {navItems.map(({ to, icon, label }) => {
            const active = isActive(to);
            const isProfile = to === '/profile' && user?.avatar;
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 ${
                  active ? 'text-[#C9A84C]' : 'text-[#8B8A9B]'
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
                <span className={`text-[9px] font-medium ${active ? 'text-[#C9A84C]' : 'text-[#8B8A9B]'}`}>
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
