import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const NotificationManager: React.FC = () => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [actionLink, setActionLink] = useState('');
    const [icon, setIcon] = useState('');

    useEffect(() => {
        const checkNotifications = () => {
            const now = new Date();
            const hour = now.getHours();
            const today = now.toISOString().split('T')[0];

            // 13:00 msg (1 PM - 2 PM window)
            if (hour >= 13 && hour < 14) {
                const lastSeen = localStorage.getItem('sanarte_notif_13');
                if (lastSeen !== today) {
                    showNotification(
                        "¿Cómo te sientes hoy?",
                        "Contame qué te duele o incomoda...",
                        "/",
                        "medical_services"
                    );
                    localStorage.setItem('sanarte_notif_13', today);
                }
            }

            // 19:00 msg (7 PM - 10 PM window - extended for evening)
            if (hour >= 19 && hour < 22) {
                const lastSeen = localStorage.getItem('sanarte_notif_19');
                if (lastSeen !== today) {
                    showNotification(
                        "Momento de Sanar",
                        "No olvides hacer tu rutina de sanación diaria.",
                        "/routines",
                        "spa"
                    );
                    localStorage.setItem('sanarte_notif_19', today);
                }
            }
        };

        const showNotification = (title: string, msg: string, link: string, ico: string) => {
            setMessage(msg);
            setActionLink(link);
            setIcon(ico);
            setVisible(true);

            // Auto hide after 8 seconds
            setTimeout(() => setVisible(false), 8000);
        };

        // Check immediately
        checkNotifications();
        // Check every minute
        const interval = setInterval(checkNotifications, 60000);

        return () => clearInterval(interval);
    }, []);

    if (!visible) return null;

    return (
        <div
            onClick={() => { setVisible(false); if (actionLink) navigate(actionLink); }}
            className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-96 z-[100] cursor-pointer"
        >
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-primary/20 flex items-center gap-4 animate-bounce-in">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">SanArte</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">{message}</p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setVisible(false); }}
                    className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
        </div>
    );
};
