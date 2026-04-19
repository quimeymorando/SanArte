import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

const GOLD = '#C9A84C';
const MUTED = '#6A6460';

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
    <nav
      aria-label="Navegación"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(64px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'rgba(6,13,27,0.92)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderTop: '1px solid rgba(201,168,76,0.12)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {navItems.map(({ to, icon, label }) => {
        const active = isActive(to);
        const color = active ? GOLD : MUTED;
        const isProfile = to === '/profile' && user?.avatar;
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? 'page' : undefined}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 14px',
              background: 'transparent',
              minWidth: '56px',
              textDecoration: 'none',
            }}
          >
            {active && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '4px',
                  borderRadius: '999px',
                  background: GOLD,
                }}
              />
            )}
            {isProfile ? (
              <div
                className="bg-cover bg-center"
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundImage: `url('${user.avatar}')`,
                  opacity: active ? 1 : 0.6,
                  border: active ? `1px solid ${GOLD}` : 'none',
                }}
              />
            ) : (
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '22px',
                  fontVariationSettings: "'wght' 300",
                  color,
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                {icon}
              </span>
            )}
            <span
              style={{
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.02em',
                color,
                marginTop: '2px',
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
});

export default Navigation;
