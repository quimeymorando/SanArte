
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Timeout de seguridad de 3 segundos para evitar "Pantalla Blanca"
        const timeoutPromise = new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error("Auth check timed out")), 3000)
        );

        const authPromise = authService.isAuthenticated();

        const isAuth = await Promise.race([authPromise, timeoutPromise]);

        // Si el componente ya se desmontó, no actualizamos estado (aunque en useEffect [] es raro, pero buena práctica)
        setIsAuthenticated(isAuth as boolean);
      } catch (error) {
        console.error("Auth check failed or timed out:", error);
        // En caso de error/timeout, asumimos desconectado para redirigir en lugar de colgar
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Loading state con Spinner visible para evitar "Pantalla Blanca"
    return (
      <div className="min-h-screen bg-[#fcfdfe] dark:bg-background-dark flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
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