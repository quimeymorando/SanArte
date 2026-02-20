import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { updateStreak } from '../../services/routineService';
import { UserProfile } from '../../types';
import SmartAd from '../../components/ads/SmartAd';

// ─── DAILY QUOTES POOL ──────────────────────────────
const dailyQuotes = [
    { text: "Lo que niegas te somete, lo que aceptas te transforma.", author: "Carl Jung" },
    { text: "Tu cuerpo es el jardín, tu voluntad es el jardinero.", author: "William Shakespeare" },
    { text: "La herida es el lugar por donde entra la luz.", author: "Rumi" },
    { text: "Sanar no es olvidar, es recordar sin dolor.", author: "Bert Hellinger" },
    { text: "El cuerpo grita lo que la boca calla.", author: "Freud" },
    { text: "Toda enfermedad tiene una parte espiritual que solo tú puedes sanar.", author: "Alejandro Jodorowsky" },
    { text: "No se puede curar el cuerpo sin curar el alma.", author: "Platón" },
];

const getTodayQuote = () => dailyQuotes[new Date().getDate() % dailyQuotes.length];

// ─── WELCOME WIDGET ─────────────────────────────────
const WelcomeWidget = ({ user, greeting }: { user: UserProfile | null, greeting: string }) => {
    const levelTitle = user?.level === 1 ? "Semilla Despierta" : user?.level === 2 ? "Brote de Luz" : "Loto en Expansión";

    return (
        <div className="w-full bg-[#0a1114]/60 backdrop-blur-xl rounded-[2rem] p-6 relative overflow-hidden group mb-5 border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/8 via-transparent to-purple-500/8"></div>
            <div className="relative z-10 flex justify-between items-center">
                <div>
                    <p className="text-[10px] font-black text-cyan-400/80 uppercase tracking-[0.25em] mb-1">{greeting}</p>
                    <h1 className="text-3xl font-black text-white leading-none">
                        {user?.name ? user.name.split(' ')[0] : 'Sanador/a'}
                    </h1>
                    <p className="text-cyan-300/50 text-xs mt-1.5 font-semibold tracking-wide">{levelTitle}</p>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-15 rounded-full"></div>
                    {user?.avatar ? (
                        <div className="size-16 rounded-2xl bg-cover bg-center border-2 border-white/10 shadow-xl" style={{ backgroundImage: `url('${user.avatar}')` }}></div>
                    ) : (
                        <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center border-2 border-white/10 text-cyan-400 font-black text-2xl">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── SEARCH WIDGET (HERO CARD) ──────────────────────
const SearchWidget = ({ onSearch }: { onSearch: (q: string) => void }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) onSearch(query);
    };

    return (
        <div className="w-full mb-5">
            <div className="relative rounded-[2rem] p-[1.5px] bg-gradient-to-r from-cyan-400/60 via-purple-500/40 to-cyan-400/60 shadow-[0_0_30px_rgba(0,242,255,0.15)] group hover:shadow-[0_0_40px_rgba(0,242,255,0.25)] transition-shadow duration-700">
                <div className="bg-[#080f12]/95 backdrop-blur-xl rounded-[2rem] p-6 relative overflow-hidden">
                    {/* Ambient glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/10 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🔮</span>
                            <div>
                                <h2 className="text-lg font-black text-white leading-none">Descubrí el mensaje</h2>
                                <p className="text-cyan-400/70 text-[11px] font-semibold tracking-wide">de tu cuerpo</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="¿Qué siente tu cuerpo hoy?"
                                className="w-full h-14 pl-5 pr-16 rounded-2xl bg-white/5 border border-cyan-400/20 outline-none text-white text-base placeholder-white/30 focus:border-cyan-400/50 focus:shadow-[0_0_20px_rgba(0,242,255,0.1)] transition-all duration-300"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-lg">search</span>
                                Buscar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── BREATHING WIDGET (4-7-8 TECHNIQUE) ─────────────
type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

const phaseConfig: Record<Exclude<BreathPhase, 'idle'>, { label: string; sub: string; duration: number; color: string; ringColor: string; scale: string }> = {
    inhale: { label: 'Inhalá', sub: 'Llená tus pulmones de paz', duration: 4, color: 'text-cyan-300', ringColor: 'border-cyan-400/40', scale: 'scale-110' },
    hold: { label: 'Retené', sub: 'Sentí la calma interior', duration: 7, color: 'text-purple-300', ringColor: 'border-purple-400/40', scale: 'scale-110' },
    exhale: { label: 'Exhalá', sub: 'Soltá todo lo que pesa', duration: 8, color: 'text-emerald-300', ringColor: 'border-emerald-400/40', scale: 'scale-90' },
};

const BreathingWidget = () => {
    const [phase, setPhase] = useState<BreathPhase>('idle');
    const [count, setCount] = useState(0);
    const [cycles, setCycles] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopBreathing = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setPhase('idle');
        setCount(0);
        setCycles(0);
    }, []);

    const startBreathing = useCallback(() => {
        setPhase('inhale');
        setCount(4);
        setCycles(0);

        if (intervalRef.current) clearInterval(intervalRef.current);

        let currentPhase: Exclude<BreathPhase, 'idle'> = 'inhale';
        let currentCount = 4;

        intervalRef.current = setInterval(() => {
            currentCount--;
            if (currentCount > 0) {
                setCount(currentCount);
            } else {
                // Move to next phase
                if (currentPhase === 'inhale') {
                    currentPhase = 'hold';
                    currentCount = 7;
                } else if (currentPhase === 'hold') {
                    currentPhase = 'exhale';
                    currentCount = 8;
                } else {
                    currentPhase = 'inhale';
                    currentCount = 4;
                    setCycles(prev => prev + 1);
                }
                setPhase(currentPhase);
                setCount(currentCount);
            }
        }, 1000);
    }, []);

    useEffect(() => {
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    const isActive = phase !== 'idle';
    const config = isActive ? phaseConfig[phase as Exclude<BreathPhase, 'idle'>] : null;

    return (
        <div
            className={`w-full mb-5 rounded-[2rem] relative overflow-hidden transition-all duration-700 border border-white/5 ${isActive
                ? 'h-72 bg-gradient-to-br from-[#0a0a20] via-[#0d1520] to-[#080f16]'
                : 'h-24 bg-[#0a1114]/60 backdrop-blur-xl cursor-pointer hover:border-emerald-500/20'
                }`}
            onClick={!isActive ? startBreathing : undefined}
        >
            {/* Ambient glow when active */}
            {isActive && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-emerald-500/5"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] opacity-20 transition-colors duration-[2000ms]"
                        style={{ backgroundColor: phase === 'inhale' ? '#22d3ee' : phase === 'hold' ? '#a855f7' : '#34d399' }}></div>
                </>
            )}

            <div className="relative z-10 p-6 flex items-center justify-between h-full">
                {!isActive ? (
                    /* ── IDLE STATE ── */
                    <>
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-2xl border border-emerald-500/20">
                                🫁
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white leading-none mb-0.5">Pausa Sagrada</h3>
                                <p className="text-emerald-300/60 text-[10px] font-semibold uppercase tracking-wider">Técnica 4-7-8 anti-ansiedad</p>
                            </div>
                        </div>
                        <div className="size-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-300 border border-emerald-500/20">
                            <span className="material-symbols-outlined text-xl">play_arrow</span>
                        </div>
                    </>
                ) : (
                    /* ── ACTIVE STATE ── */
                    <div className="w-full flex flex-col items-center justify-center gap-4">
                        {/* Breathing Circle */}
                        <div className="relative flex items-center justify-center">
                            {/* Outer ring pulse */}
                            <div className={`absolute size-28 rounded-full border-2 ${config?.ringColor} transition-all duration-[2000ms] ease-in-out ${config?.scale} opacity-40`}></div>
                            {/* Inner circle */}
                            <div className={`size-20 rounded-full bg-white/5 border-2 ${config?.ringColor} flex items-center justify-center transition-all duration-[2000ms] ease-in-out ${config?.scale}`}>
                                <span className={`text-4xl font-black ${config?.color} transition-colors duration-500 tabular-nums`}>
                                    {count}
                                </span>
                            </div>
                        </div>

                        {/* Phase Label */}
                        <div className="text-center">
                            <h3 className={`text-xl font-black ${config?.color} transition-colors duration-500 mb-0.5`}>
                                {config?.label}
                            </h3>
                            <p className="text-white/40 text-xs font-medium">{config?.sub}</p>
                        </div>

                        {/* Cycle counter + Close */}
                        <div className="flex items-center gap-4">
                            {cycles > 0 && (
                                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                    Ciclo {cycles}
                                </span>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); stopBreathing(); }}
                                className="text-white/30 hover:text-white/60 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── NAV CARDS ──────────────────────────────────────
interface NavCardProps {
    title: string;
    emoji: string;
    desc: string;
    gradient: string;
    borderHover: string;
    onClick: () => void;
}

const NavCard = ({ title, emoji, desc, gradient, borderHover, onClick }: NavCardProps) => (
    <div
        onClick={onClick}
        className={`w-full h-20 mb-3 bg-[#0a1114]/60 backdrop-blur-md border border-white/5 ${borderHover} rounded-2xl px-5 flex items-center justify-between relative overflow-hidden group cursor-pointer transition-all duration-300 active:scale-[0.98]`}
    >
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        <div className="flex items-center gap-4 relative z-10">
            <span className="text-2xl">{emoji}</span>
            <div>
                <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">{title}</h3>
                <p className="text-[10px] text-white/40 font-medium">{desc}</p>
            </div>
        </div>
        <span className="material-symbols-outlined text-white/20 group-hover:text-white/60 text-lg transition-colors relative z-10">arrow_forward</span>
    </div>
);

// ─── STAT BAR ───────────────────────────────────────
const StatBar = ({ icon, label, value, barColor }: { icon: string; label: string; value: number | string; barColor: string }) => (
    <div className="w-full h-14 mb-3 bg-[#0a1114]/40 backdrop-blur-md border border-white/5 rounded-xl px-5 flex items-center justify-between relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${barColor}`}></div>
        <div className="flex items-center gap-3">
            <span className="text-lg">{icon}</span>
            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-lg font-black text-white">{value}</span>
    </div>
);

// ─── DAILY TIP ──────────────────────────────────────
const DailyTip = () => {
    const quote = getTodayQuote();
    return (
        <div className="w-full mt-3 relative overflow-hidden rounded-2xl border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5"></div>
            <div className="relative z-10 p-5 flex items-start gap-4">
                <span className="text-2xl mt-0.5">🌿</span>
                <div className="flex-1">
                    <p className="text-[10px] text-amber-400/60 uppercase font-black tracking-[0.2em] mb-2">Consejo del día</p>
                    <p className="text-sm font-serif italic text-white/70 leading-relaxed">
                        "{quote.text}"
                    </p>
                    <p className="text-[10px] text-white/30 mt-2 font-semibold">— {quote.author}</p>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// ─── BENTO GRID (MAIN DASHBOARD) ────────────────────
// ═══════════════════════════════════════════════════════
export const BentoGrid = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [streak, setStreak] = useState(0);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const load = async () => {
            const u = await authService.getUser();
            const s = updateStreak();
            setUser(u);
            setStreak(s);
        };
        load();

        const h = new Date().getHours();
        setGreeting(h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches');
    }, []);

    const handleSearch = (q: string) => {
        authService.addXP(20);
        navigate(`/search?initial=${encodeURIComponent(q)}`);
    };

    return (
        <div className="relative min-h-[100dvh] w-full bg-[#050b0d] text-gray-200 pb-32 overflow-hidden flex flex-col items-center">
            {/* ── BACKGROUND ── */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/60 via-[#050b0d] to-[#050b0d] pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] opacity-20 blur-[100px] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(112, 0, 255, 0.3) 0%, transparent 60%)' }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] opacity-15 blur-[80px] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 80%, rgba(0, 242, 255, 0.3) 0%, transparent 60%)' }}></div>

            {/* ── MAIN CONTENT ── */}
            <div className="relative z-10 w-full max-w-lg mx-auto px-5 pt-24 md:pt-32 flex flex-col">

                {/* 1. Welcome */}
                <WelcomeWidget user={user} greeting={greeting} />

                {/* 2. Search — HERO CARD */}
                <SearchWidget onSearch={handleSearch} />

                {/* 3. Breathing — 4-7-8 */}
                <BreathingWidget />

                {/* 4. Navigation Cards */}
                <NavCard
                    title="Comunidad"
                    emoji="🤝"
                    desc="Compartí, conectá y saná en tribu"
                    gradient="from-pink-500/10"
                    borderHover="hover:border-pink-500/30"
                    onClick={() => navigate('/community')}
                />
                <NavCard
                    title="Rutinas"
                    emoji="📅"
                    desc="Hábitos que transforman tu vida"
                    gradient="from-purple-500/10"
                    borderHover="hover:border-purple-500/30"
                    onClick={() => navigate('/routines')}
                />

                {/* Ad Slot */}
                <SmartAd format="banner" />

                <NavCard
                    title="Diario"
                    emoji="✍️"
                    desc="Tu espacio seguro de reflexión"
                    gradient="from-cyan-500/10"
                    borderHover="hover:border-cyan-500/30"
                    onClick={() => navigate('/journal')}
                />

                {/* 5. Stats */}
                <StatBar icon="⭐" label="Nivel de Luz" value={Math.floor((user?.xp || 0) / 100)} barColor="bg-amber-500" />
                <StatBar icon="🔥" label="Días de Racha" value={streak} barColor="bg-orange-500" />

                {/* 6. Daily Tip */}
                <DailyTip />

                {/* Footer */}
                <div className="mt-8 text-center pb-8 border-t border-white/5 pt-8">
                    <p className="text-white/10 text-[10px] uppercase tracking-[0.4em] font-black">SanArte v2.0</p>
                </div>
            </div>
        </div>
    );
};

export default BentoGrid;
