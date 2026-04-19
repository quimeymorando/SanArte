import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

const GOLD = '#C9A84C';
const MUTED = '#5A6170';

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
    { to: '/routines', icon: 'wb_sunny', label: 'Rutinas' },
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
        height: `calc(62px + env(safe-area-inset-bottom))`,
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingTop: 8,
        background: 'rgba(6,13,27,0.94)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(201,168,76,0.10)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'stretch',
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
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textDecoration: 'none',
              position: 'relative',
              padding: '2px 0',
            }}
          >
            {active && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 2,
                  borderRadius: 999,
                  background: GOLD,
                }}
              />
            )}
            {isProfile ? (
              <div
                className="bg-cover bg-center"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundImage: `url('${user.avatar}')`,
                  opacity: active ? 1 : 0.55,
                  border: active ? `1px solid ${GOLD}` : 'none',
                }}
              />
            ) : (
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{
                  fontSize: 24,
                  fontFamily: '"Material Symbols Outlined"',
                  fontVariationSettings: active
                    ? "'wght' 400, 'FILL' 0"
                    : "'wght' 300, 'FILL' 0",
                  color,
                  lineHeight: 1,
                  transition: 'color 0.2s ease',
                }}
              >
                {icon}
              </span>
            )}
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 10,
                fontWeight: active ? 600 : 500,
                letterSpacing: '0.01em',
                color,
                lineHeight: 1.2,
                transition: 'color 0.2s ease',
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
