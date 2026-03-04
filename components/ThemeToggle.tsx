import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed z-[90] bg-white/90 dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 bottom-24 left-4 md:bottom-8 md:left-8" // Mantener abajo izquierda pero asegurar z-index y estilo
      title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
    >
      <span className="material-symbols-outlined text-xl">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
    </button>
  );
};

export default ThemeToggle;