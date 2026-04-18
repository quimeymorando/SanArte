import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { UserProfile } from '../../types';

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

// ─── WELCOME ───────────────────────────────────────
const WelcomeWidget = ({ user, greeting }: { user: UserProfile | null; greeting: string }) => {
    const levelTitle = user?.level === 1 ? "Semilla Despierta" : user?.level === 2 ? "Brote de Luz" : "Loto en Expansión";
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <p className="text-[10px] font-medium tracking-widest uppercase text-[#C4A252] mb-1">{greeting}</p>
                <h1 className="text-2xl font-light text-[#1C1814] leading-tight">
                    {user?.name ? user.name.split(' ')[0] : 'Bienvenida'}
                </h1>
                <p className="text-[#A09080] text-[11px] mt-0.5 italic">{levelTitle}</p>
            </div>
            {user?.avatar ? (
                <div className="size-12 rounded-full bg-cover bg-center border border-sanarte-gold/20 ring-2 ring-sanarte-gold/10" style={{ backgroundImage: `url('${user.avatar}')` }} />
            ) : (
                <div className="size-12 rounded-full bg-[#C4A252]/10 flex items-center justify-center border border-[#C4A252]/25 text-[#C4A252] font-medium text-lg">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
            )}
        </div>
    );
};

// ─── SEARCH ────────────────────────────────────────
const SearchWidget = ({ onSearch }: { onSearch: (q: string) => void }) => {
    const [query, setQuery] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) onSearch(query);
    };
    return (
        <div className="mb-8">
            <p className="text-[10px] font-medium tracking-widest uppercase text-[#A09080] mb-3">
                Descubrí el mensaje de tu cuerpo
            </p>
            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (query.trim()) onSearch(query);
                        }
                    }}
                    placeholder="¿Qué siente tu cuerpo hoy?"
                    rows={2}
                    className="w-full px-5 py-4 rounded-2xl bg-white border border-sanarte-border-light outline-none text-sanarte-text-dark text-sm placeholder-sanarte-text-faint resize-none focus:border-sanarte-gold/40 transition-colors duration-200 leading-relaxed shadow-sm"
                />
                <button
                    type="submit"
                    disabled={!query.trim()}
                    className="absolute right-3 bottom-3 bg-[#C4A252] hover:opacity-90 disabled:opacity-30 text-[#1C1814] px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 active:scale-95"
                >
                    Buscar
                </button>
            </form>
        </div>
    );
};

// ─── BREATHING (4-7-8) ─────────────────────────────
type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

const phaseConfig: Record<Exclude<BreathPhase, 'idle'>, { label: string; sub: string; duration: number; color: string }> = {
    inhale:  { label: 'Inhalá',  sub: 'Llená tus pulmones de paz',   duration: 4, color: 'text-sanarte-gold' },
    hold:    { label: 'Retené',  sub: 'Sentí la calma interior',     duration: 7, color: 'text-sanarte-slate' },
    exhale:  { label: 'Exhalá', sub: 'Soltá todo lo que pesa',      duration: 8, color: 'text-sanarte-sage' },
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
                if (currentPhase === 'inhale') { currentPhase = 'hold'; currentCount = 7; }
                else if (currentPhase === 'hold') { currentPhase = 'exhale'; currentCount = 8; }
                else { currentPhase = 'inhale'; currentCount = 4; setCycles(prev => prev + 1); }
                setPhase(currentPhase);
                setCount(currentCount);
            }
        }, 1000);
    }, []);

    useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, []);

    const isActive = phase !== 'idle';
    const config = isActive ? phaseConfig[phase as Exclude<BreathPhase, 'idle'>] : null;

    return (
        <div
            onClick={!isActive ? startBreathing : stopBreathing}
            className={`w-full mb-6 rounded-2xl border cursor-pointer transition-all duration-500 overflow-hidden ${
                isActive
                    ? 'bg-white border-sanarte-gold/20 py-10'
                    : 'bg-white border-sanarte-border-light hover:border-sanarte-gold/20'
            }`}
        >
            {!isActive ? (
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-sanarte-gold/8 border border-sanarte-gold/15 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sanarte-gold text-xl" style={{fontVariationSettings:"'wght' 300"}}>self_improvement</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-sanarte-text-dark">Pausa Sagrada</h3>
                            <p className="text-[11px] text-sanarte-text-faint">Técnica 4-7-8 · Anti-ansiedad</p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-sanarte-gold/40 text-xl" style={{fontVariationSettings:"'wght' 300"}}>play_circle</span>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-5">
                    <div className={`size-24 rounded-full border border-sanarte-gold/20 flex items-center justify-center transition-all duration-[2000ms] ease-in-out ${
                        phase === 'inhale' ? 'scale-110' : phase === 'exhale' ? 'scale-90' : 'scale-105'
                    }`}>
                        <span className={`text-3xl font-light ${config?.color} transition-colors duration-500 tabular-nums`}>
                            {count}
                        </span>
                    </div>
                    <div className="text-center">
                        <h3 className={`text-lg font-light ${config?.color} transition-colors duration-500`}>
                            {config?.label}
                        </h3>
                        <p className="text-sanarte-text-faint text-xs mt-0.5">{config?.sub}</p>
                    </div>
                    {cycles > 0 && (
                        <span className="text-[10px] text-sanarte-text-faint font-medium">Ciclo {cycles}</span>
                    )}
                    <p className="text-[10px] text-sanarte-text-faint/60">Tocá para detener</p>
                </div>
            )}
        </div>
    );
};

// ─── NAV CARD ──────────────────────────────────────
const NavCard = ({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-sanarte-border-light hover:border-sanarte-gold/25 transition-all duration-200 active:scale-[0.98] text-left group shadow-sm"
    >
        <div className="size-10 rounded-xl bg-[#C4A252]/10 border border-[#C4A252]/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[#C4A252] text-xl transition-colors duration-200" style={{fontVariationSettings:"'wght' 300"}}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-[#1C1814]">{title}</h3>
            <p className="text-[11px] text-[#A09080] truncate">{desc}</p>
        </div>
        <span className="material-symbols-outlined text-sanarte-text-faint/40 group-hover:text-sanarte-gold/50 text-lg transition-colors duration-200" style={{fontVariationSettings:"'wght' 300"}}>chevron_right</span>
    </button>
);

// ─── STAT ROW ──────────────────────────────────────
const StatRow = ({ icon, label, value }: { icon: string; label: string; value: number | string }) => (
    <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sanarte-gold/40 text-lg" style={{fontVariationSettings:"'wght' 300"}}>{icon}</span>
            <span className="text-sm text-[#7A6A5A]">{label}</span>
        </div>
        <span className="text-sm font-medium text-[#1C1814] tabular-nums">{value}</span>
    </div>
);

// ─── DAILY QUOTE ───────────────────────────────────
const DailyQuote = () => {
    const quote = getTodayQuote();
    return (
        <div className="px-2 py-6 border-l-2 border-sanarte-gold/25 pl-5 my-6">
            <p className="text-sm italic text-[#7A6A5A] leading-relaxed">
                "{quote.text}"
            </p>
            <p className="text-[11px] text-[#A09080] mt-2">— {quote.author}</p>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// ─── BENTO GRID MAIN ────────────────────────────
// ═══════════════════════════════════════════════════
export const BentoGrid = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [streak, setStreak] = useState(0);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const load = async () => {
            const u = await authService.getUser();
            setUser(u);
            setStreak(u?.currentStreak || 0);
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
        <div className="min-h-[100dvh] w-full bg-[#F3EDE0] pb-28">
            <div className="relative z-10 w-full max-w-md mx-auto px-5 pt-24 md:pt-28">
                <WelcomeWidget user={user} greeting={greeting} />
                <SearchWidget onSearch={handleSearch} />
                <BreathingWidget />
                <div className="space-y-2.5 mb-6">
                    <NavCard icon="diversity_1" title="Comunidad" desc="Compartí, conectá y saná en tribu" onClick={() => navigate('/community')} />
                    <NavCard icon="routine" title="Rutinas" desc="Hábitos que transforman tu vida" onClick={() => navigate('/routines')} />
                    <NavCard icon="edit_note" title="Diario" desc="Tu espacio seguro de reflexión" onClick={() => navigate('/journal')} />
                </div>
                <div className="rounded-2xl border border-sanarte-border-light bg-white divide-y divide-sanarte-border-light mb-2 shadow-sm">
                    <StatRow icon="diamond" label="Nivel de Luz" value={Math.floor((user?.xp || 0) / 100)} />
                    <StatRow icon="local_fire_department" label="Días de Racha" value={streak} />
                </div>
                <DailyQuote />
                <div className="text-center pb-8 mt-2">
                    <p className="text-sanarte-text-faint/40 text-[10px] uppercase tracking-[0.3em] font-medium">SanArte</p>
                </div>
            </div>
        </div>
    );
};

export default BentoGrid;
