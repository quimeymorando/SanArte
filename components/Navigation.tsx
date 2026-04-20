import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = React.memo(function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

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
        zIndex: 100,
        background: 'rgba(6,13,27,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(201,168,76,0.10)',
        display: 'flex',
        height: 'calc(58px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        alignItems: 'stretch',
      }}
    >
      {navItems.map(({ to, icon, label }) => {
        const active = isActive(to);
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
              textDecoration: 'none',
              position: 'relative',
              paddingTop: 8,
              paddingBottom: 4,
              gap: 3,
              minWidth: 0,
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
                  width: 20,
                  height: 2,
                  borderRadius: 999,
                  background: '#C9A84C',
                }}
              />
            )}
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{
                fontSize: 23,
                lineHeight: 1,
                display: 'block',
                textAlign: 'center',
                width: '100%',
                fontVariationSettings: "'wght' 300, 'FILL' 0",
                color: active ? '#C9A84C' : '#5A6170',
              }}
            >
              {icon}
            </span>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                color: active ? '#C9A84C' : '#5A6170',
                lineHeight: 1,
                textAlign: 'center',
                width: '100%',
                display: 'block',
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
