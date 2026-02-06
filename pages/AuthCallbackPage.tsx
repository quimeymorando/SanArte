import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Handle the hash fragment from Supabase auth redirect
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                // Successful login/verification
                // Use replace to prevent back button returning to this cleaning page
                navigate('/home', { replace: true });
            } else {
                // If no session found, maybe wait a bit or redirect to login
                // But typically getSession handles the hash parsing automatically
                // If it fails, users might just need to login manually
                const timer = setTimeout(() => {
                    navigate('/', { replace: true });
                }, 2000);
                return () => clearTimeout(timer);
            }
        });
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark text-text-main">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h2 className="text-xl font-semibold">Verificando tu sesión...</h2>
            <p className="text-gray-500">Sanando conexiones...</p>
        </div>
    );
};

export default AuthCallbackPage;
