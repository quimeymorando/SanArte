import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { updateStreak } from '../../services/routineService';
import { UserProfile } from '../../types';
import SmartAd from '../../components/ads/SmartAd';

// Widget Components
const WelcomeWidget = ({ user, greeting }: { user: UserProfile | null, greeting: string }) => {
    const levelProgress = ((user?.xp || 0) % 500) / 500 * 100;
    const levelTitle = user?.level === 1 ? "Semilla Despierta" : user?.level === 2 ? "Brote de Luz" : "Loto en Expansión";

    return (
        <div className="w-full h-40 bg-[#0a1114]/80 backdrop-blur-xl rounded-[2.5rem] p-6 relative overflow-hidden group mb-4 border border-white/5 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 opacity-60"></div>
            <div className="relative z-10 flex justify-between items-center h-full">
                <div>
                    <h2 className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] mb-1">{greeting}</h2>
                    <h1 className="text-3xl font-black text-white leading-tight drop-shadow-md">
                        {user?.name ? user.name.split(' ')[0] : 'Sanador/a'}
                    </h1>
                    <p className="text-gray-500 dark:text-cyan-200/60 text-xs mt-1 font-medium tracking-wide">{levelTitle}</p>
                </div>

                {/* Avatar */}
                <div className="relative group/avatar cursor-pointer">
                    <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 group-hover/avatar:opacity-50 transition-opacity rounded-full"></div>
                    {user?.avatar ? (
                        <div className="size-20 rounded-full bg-cover bg-center border-2 border-white/20 shadow-2xl group-hover/avatar:scale-105 transition-transform" style={{ backgroundImage: `url('${user.avatar}')` }}></div>
                    ) : (
                        <div className="size-20 rounded-full bg-white/5 flex items-center justify-center border-2 border-white/10 text-cyan-400 font-black text-3xl group-hover/avatar:scale-105 transition-transform">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SearchWidget = ({ onSearch }: { onSearch: (q: string) => void }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) onSearch(query);
    };

    return (
        <div className="w-full mb-4">
            <div className="relative overflow-hidden rounded-[2.5rem] p-[1px] bg-gradient-to-r from-indigo-500/30 via-cyan-400/30 to-indigo-500/30 shadow-[0_0_20px_rgba(0,242,255,0.1)] group">
                <div className="bg-[#0a1114]/90 backdrop-blur-md rounded-[2.5rem] p-1 relative h-20 flex items-center">
                    <form onSubmit={handleSubmit} className="w-full relative h-full flex items-center px-6">
                        <div className="text-primary mr-4 animate-pulse">
                            <span className="material-symbols-outlined text-3xl">search</span>
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="¿Qué siente tu cuerpo hoy?"
                            className="w-full h-full bg-transparent outline-none text-gray-900 dark:text-white text-lg font-medium placeholder-gray-400/50"
                        />
                        <button type="submit" className="bg-white/10 hover:bg-white/20 text-white size-10 rounded-full flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const BreathingWidget = () => {
    const [active, setActive] = useState(false);

    return (
        <div
            className={`w-full mb-4 rounded-[2.5rem] relative overflow-hidden transition-all duration-700 cursor-pointer shadow-2xl ${active ? 'h-64 bg-indigo-950/80 backdrop-blur-xl' : 'h-28 bg-[#0a1114]/80 backdrop-blur-xl'} border border-white/5 group animate-float`}
            onClick={() => setActive(!active)}
        >
            {/* Glowing Border effect */}
            <div className={`absolute inset-0 border-2 ${active ? 'border-indigo-400/30' : 'border-emerald-400/10 group-hover:border-emerald-400/30'} rounded-[2.5rem] transition-colors duration-500`}></div>

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-50"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-400/20 blur-[50px] rounded-full group-hover:scale-125 transition-transform duration-1000"></div>

            <div className="relative z-10 p-6 flex items-center justify-between h-full">
                {!active ? (
                    <>
                        <div className="flex items-center gap-5">
                            <div className="size-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                <span className="material-symbols-outlined text-3xl animate-breathing">air</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white leading-none mb-1 text-neon-green">Pausa Sagrada</h3>
                                <p className="text-emerald-200/70 text-xs font-bold uppercase tracking-wider">Reiniciar Sistema Nervioso</p>
                            </div>
                        </div>
                        <div className="bg-white/10 size-10 rounded-full flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">play_arrow</span>
                        </div>
                    </>
                ) : (
                    <div className="w-full flex flex-col items-center justify-center">
                        <h3 className="text-2xl font-black text-white animate-pulse mb-4">Inhala... 4s</h3>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-white animate-[shimmer_2s_infinite] w-1/2 rounded-full"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Tailwind needs static class names — dynamic interpolation gets purged in production
const colorMap: Record<string, { border: string; gradient: string; bg: string; text: string; hoverText: string; hoverBg: string; bar: string }> = {
    pink: { border: 'hover:border-pink-500/50', gradient: 'from-pink-500/5', bg: 'bg-pink-500/10', text: 'text-pink-400', hoverText: 'group-hover:text-pink-300', hoverBg: 'group-hover:bg-pink-500', bar: 'bg-pink-500' },
    purple: { border: 'hover:border-purple-500/50', gradient: 'from-purple-500/5', bg: 'bg-purple-500/10', text: 'text-purple-400', hoverText: 'group-hover:text-purple-300', hoverBg: 'group-hover:bg-purple-500', bar: 'bg-purple-500' },
    cyan: { border: 'hover:border-cyan-500/50', gradient: 'from-cyan-500/5', bg: 'bg-cyan-500/10', text: 'text-cyan-400', hoverText: 'group-hover:text-cyan-300', hoverBg: 'group-hover:bg-cyan-500', bar: 'bg-cyan-500' },
    yellow: { border: 'hover:border-yellow-500/50', gradient: 'from-yellow-500/5', bg: 'bg-yellow-500/10', text: 'text-yellow-400', hoverText: 'group-hover:text-yellow-300', hoverBg: 'group-hover:bg-yellow-500', bar: 'bg-yellow-500' },
    orange: { border: 'hover:border-orange-500/50', gradient: 'from-orange-500/5', bg: 'bg-orange-500/10', text: 'text-orange-400', hoverText: 'group-hover:text-orange-300', hoverBg: 'group-hover:bg-orange-500', bar: 'bg-orange-500' },
};

interface NavCardProps { title: string; icon: string; color: string; onClick: () => void; desc: string; }

const NavCard = ({ title, icon, color, onClick, desc }: NavCardProps) => {
    const c = colorMap[color] || colorMap.cyan;
    return (
        <div
            onClick={onClick}
            className={`w-full h-24 mb-3 bg-[#0a1114]/60 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-[2rem] p-4 flex items-center justify-between relative overflow-hidden group cursor-pointer transition-all active:scale-[0.98]`}
        >
            <div className={`absolute inset-0 bg-gradient-to-r ${c.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>

            <div className="flex items-center gap-4 relative z-10">
                <div className={`size-14 rounded-2xl ${c.bg} flex items-center justify-center ${c.text} group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                </div>
                <div>
                    <h3 className={`text-lg font-bold text-gray-900 dark:text-white ${c.hoverText} transition-colors`}>{title}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{desc}</p>
                </div>
            </div>

            <div className={`size-8 rounded-full ${c.bg} flex items-center justify-center ${c.text} ${c.hoverBg} group-hover:text-white transition-all`}>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </div>
        </div>
    );
};

interface StatBarProps { icon: string; label: string; value: number | string; color: string; }

const StatBar = ({ icon, label, value, color }: StatBarProps) => {
    const c = colorMap[color] || colorMap.cyan;
    return (
        <div className="w-full h-16 mb-3 bg-[#0a1114]/60 backdrop-blur-md border border-white/5 rounded-2xl px-6 flex items-center justify-between relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.bar} shadow-[0_0_10px_${c.bar}]`}></div>
            <div className="flex items-center gap-3">
                <span className={`${c.text} text-xl`}>{icon}</span>
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white">{value}</span>
        </div>
    );
};

export const BentoGrid = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [streak, setStreak] = useState(0);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        // Load Data
        const load = async () => {
            const u = await authService.getUser();
            const s = updateStreak();
            setUser(u);
            setStreak(s);
        };
        load();

        // Greeting
        const h = new Date().getHours();
        setGreeting(h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches');
    }, []);

    const handleSearch = (q: string) => {
        authService.addXP(20);
        navigate(`/search?initial=${encodeURIComponent(q)}`);
    };

    return (
        <div className="relative min-h-[100dvh] w-full bg-[#050b0d] text-gray-200 pb-32 overflow-hidden flex flex-col items-center">
            {/* --- PREMIUM BACKGROUND EFFECTS (Match Landing Page) --- */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-[#050b0d] to-[#050b0d] pointer-events-none"></div>

            {/* Aurora / Nebula Effects behind dashboard */}
            <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] opacity-30 blur-[100px] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(112, 0, 255, 0.4) 0%, transparent 60%)' }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] opacity-20 blur-[80px] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 80%, rgba(0, 242, 255, 0.4) 0%, transparent 60%)' }}></div>

            {/* Main Container - Single Column Stack for Mobile */}
            <div className="relative z-10 w-full max-w-lg mx-auto px-5 pt-24 md:pt-32 flex flex-col">

                {/* 1. Welcome */}
                <WelcomeWidget user={user} greeting={greeting} />

                {/* 2. Search (Glowing Pulse) */}
                <SearchWidget onSearch={handleSearch} />

                {/* 3. Breathing (Glowing Pulse) */}
                <BreathingWidget />

                {/* 4. Community */}
                <NavCard
                    title="Comunidad"
                    desc="Conecta y Sana"
                    icon="diversity_1"
                    color="pink"
                    onClick={() => navigate('/community')}
                />

                {/* 5. Routines */}
                <NavCard
                    title="Rutinas"
                    desc="Hábitos de Poder"
                    icon="event_note"
                    color="purple"
                    onClick={() => navigate('/routines')}
                />

                {/* Ad Slot — between nav cards */}
                <SmartAd format="banner" />

                {/* 6. Journal */}
                <NavCard
                    title="Diario"
                    desc="Tu Espacio Seguro"
                    icon="edit_note"
                    color="cyan"
                    onClick={() => navigate('/journal')}
                />

                {/* 7. Level of Light */}
                <StatBar
                    icon="⭐"
                    label="Nivel de Luz"
                    value={Math.floor((user?.xp || 0) / 100)}
                    color="yellow"
                />

                {/* 8. Streak Days */}
                <StatBar
                    icon="🔥"
                    label="Días Racha"
                    value={streak}
                    color="orange"
                />

                {/* 9. Daily Tip */}
                <div className="w-full mt-2 bg-surface-light dark:bg-gradient-to-r dark:from-[#131d22] dark:to-[#0f181c] border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="size-10 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-xl">🧘‍♂️</div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Consejo del día</p>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300 italic leading-snug">"Lo que niegas te somete, lo que aceptas te transforma."</p>
                    </div>
                </div>

                <div className="mt-8 text-center pb-8 border-t border-white/5 pt-8">
                    <p className="text-white/10 text-[10px] uppercase tracking-[0.4em] font-black">Sanarte v2.0</p>
                </div>
            </div>
        </div>
    );
};

export default BentoGrid;
