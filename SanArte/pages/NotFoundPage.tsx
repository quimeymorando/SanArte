import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark px-6 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                <div className="relative size-24 bg-white dark:bg-surface-dark rounded-full flex items-center justify-center shadow-xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-5xl text-primary">explore_off</span>
                </div>
            </div>

            <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-2">404</h1>
            <h2 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-4">
                Esta página no existe
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
                El camino que buscas no se encuentra aquí. Pero tu viaje de sanación continúa.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => navigate('/home')}
                    className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">home</span>
                    Ir al Inicio
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-4 bg-gray-100 dark:bg-surface-dark text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                >
                    Volver Atrás
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;
