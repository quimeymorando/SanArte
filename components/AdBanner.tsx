import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface AdBannerProps {
    className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ className = '' }) => {
    const [user, setUser] = React.useState<any>(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        const loadUser = async () => {
            const u = await authService.getUser();
            setUser(u);
        }
        loadUser();
    }, []);

    if (!user || user.isPremium) return null;

    return (
        <div className={`w-full bg-surface-light dark:bg-black/40 border border-gray-200 dark:border-white/5 p-4 rounded-xl my-6 relative overflow-hidden group cursor-pointer ${className}`} onClick={() => navigate('/profile?upgrade=true')}>
            <div className="absolute top-0 right-0 bg-gray-200 dark:bg-white/10 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg text-gray-500">
                PUBLICIDAD
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <div className="size-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 animate-pulse">
                    <span className="material-symbols-outlined">diamond</span>
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                        Desbloquea tu Sanación Completa
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                        Elimina estos anuncios y accede a todas las terapias con Premium.
                    </p>
                </div>
                <button className="text-xs font-black text-primary bg-primary/10 px-3 py-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                    VER
                </button>
            </div>
        </div>
    );
};

export default AdBanner;
