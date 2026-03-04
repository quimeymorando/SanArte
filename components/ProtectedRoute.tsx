import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';
import { useTheme } from '../context/ThemeContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { theme, setTheme } = useTheme();

  // Force dark mode inside the app — the interior is designed for dark aesthetic
  useEffect(() => {
    const originalTheme = theme;
    if (theme !== 'dark') {
      setTheme('dark');
    }
    return () => {
      // Restore previous theme only if it wasn't dark originally
      if (originalTheme !== 'dark') {
        setTheme(originalTheme);
      }
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const timeoutPromise = new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error("Auth check timed out")), 3000)
        );

        const authPromise = authService.isAuthenticated();
        const isAuth = await Promise.race([authPromise, timeoutPromise]);
        setIsAuthenticated(isAuth as boolean);
      } catch (error) {
        logger.error("Auth check failed or timed out:", error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;