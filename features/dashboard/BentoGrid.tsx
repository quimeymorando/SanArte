import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { UserProfile } from '../../types';

// ─── Sacred Noir · Tierra Dorada palette ────────────────
const NAVY = '#0B1628';
const NAVY_DEEP = '#060D1B';
const GOLD = '#C9A84C';
const GOLD_LIGHT = '#F0D080';
const GOLD_DARK = '#9A7A2A';
const SLATE = '#7B9BB5';
const SAGE = '#8BA888';
const AMBER = '#FCD34D';

const GOLD_GRAD = `linear-gradient(135deg, ${GOLD_DARK} 0%, ${GOLD} 40%, ${GOLD_LIGHT} 55%, ${GOLD} 70%, ${GOLD_DARK} 100%)`;

const glassCard = (accent?: string): React.CSSProperties => ({
    background: 'rgba(9,17,32,0.55)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderLeft: accent ? `3px solid ${accent}` : '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
});

const goldTextStyle: React.CSSProperties = {
    background: GOLD_GRAD,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
};

const Icon = ({
    name, size = 20, color, filled = false, style = {},
}: { name: string; size?: number; color?: string; filled?: boolean; style?: React.CSSProperties }) => (
    <span
        className="material-symbols-outlined"
        style={{
            fontFamily: '"Material Symbols Outlined"',
            fontStyle: 'normal',
            fontSize: size,
            lineHeight: 1,
            color: color || 'inherit',
            display: 'inline-block',
            fontVariationSettings: `'wght' 300, 'FILL' ${filled ? 1 : 0}`,
            fontFeatureSettings: "'liga'",
            userSelect: 'none',
            ...style,
        }}
    >{name}</span>
);

const dailyQuotes = [
    { text: 'Lo que niegas te somete, lo que aceptas te transforma.', author: 'Carl Jung' },
    { text: 'Tu cuerpo es el jardín, tu voluntad es el jardinero.', author: 'William Shakespeare' },
    { text: 'La herida es el lugar por donde entra la luz.', author: 'Rumi' },
    { text: 'Sanar no es olvidar, es recordar sin dolor.', author: 'Bert Hellinger' },
    { text: 'El cuerpo grita lo que la boca calla.', author: 'Freud' },
    { text: 'Toda enfermedad tiene una parte espiritual que solo tú puedes sanar.', author: 'Alejandro Jodorowsky' },
    { text: 'No se puede curar el cuerpo sin curar el alma.', author: 'Platón' },
];
const getTodayQuote = () => dailyQuotes[new Date().getDate() % dailyQuotes.length];

// ─── GREETING ────────────────────────────────────────
const Greeting = ({ user, greeting }: { user: UserProfile | null; greeting: string }) => {
    const name = user?.name ? user.name.split(' ')[0] : 'Bienvenida';
    const levelTitle =
        user?.level === 1 ? 'Semilla Despierta' :
        user?.level === 2 ? 'Brote de Luz' : 'Loto en Expansión';

    return (
        <div className="mb-10">
            <p
                className="m-0 uppercase"
                style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.36em',
                    ...goldTextStyle,
                }}
            >
                {greeting}
            </p>
            <h1
                style={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 400,
                    fontStyle: 'italic',
                    fontSize: 68,
                    letterSpacing: '-0.02em',
                    margin: '8px 0 6px',
                    lineHeight: 0.98,
                    background: `linear-gradient(135deg, #F5E4B3 0%, #F0D080 35%, ${GOLD} 55%, #F0D080 75%, #E8C876 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 2px 24px rgba(240,208,128,0.18))',
                }}
            >
                {name}
            </h1>
            <p
                className="m-0"
                style={{
                    fontFamily: '"Playfair Display", serif',
                    fontStyle: 'italic',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.55)',
                    letterSpacing: '0.01em',
                }}
            >
                {levelTitle}
            </p>
        </div>
    );
};

// ─── SEARCH ──────────────────────────────────────────
const SearchCard = ({ onSearch }: { onSearch: (q: string) => void }) => {
    const [query, setQuery] = useState('');
    const submit = () => { if (query.trim()) onSearch(query); };

    return (
        <div
            className="mb-6"
            style={{
                ...glassCard(GOLD),
                background: 'rgba(6,13,27,0.75)',
                border: '1px solid rgba(201,168,76,0.18)',
                borderLeft: `3px solid ${GOLD}`,
                borderRadius: 18,
                padding: '22px 22px 20px',
            }}
        >
            <p
                className="uppercase"
                style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.28em',
                    margin: '0 0 16px',
                    ...goldTextStyle,
                }}
            >
                Descubrí el mensaje de tu cuerpo
            </p>
            <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submit();
                    }
                }}
                rows={2}
                placeholder="¿Qué siente tu cuerpo hoy?"
                className="w-full text-white placeholder-white/40 outline-none resize-none"
                style={{
                    boxSizing: 'border-box',
                    padding: '2px 0 18px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.12)',
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 17,
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                }}
            />
            <div className="flex justify-end mt-5">
                <button
                    onClick={submit}
                    disabled={!query.trim()}
                    className="inline-flex items-center justify-center gap-2.5 uppercase transition-all duration-200 active:scale-95 disabled:opacity-40"
                    style={{
                        padding: '14px 32px',
                        borderRadius: 999,
                        background: GOLD_GRAD,
                        color: NAVY_DEEP,
                        border: '1px solid rgba(240,208,128,0.35)',
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        boxShadow: '0 8px 24px rgba(201,168,76,0.4), 0 0 0 1px rgba(240,208,128,0.3) inset',
                        cursor: query.trim() ? 'pointer' : 'not-allowed',
                    }}
                >
                    Buscar
                    <span style={{ fontSize: 15, marginTop: -1 }}>→</span>
                </button>
            </div>
        </div>
    );
};

// ─── BREATHING (4-7-8) ───────────────────────────────
type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';
const phaseConfig: Record<Exclude<BreathPhase, 'idle'>, { label: string; sub: string; duration: number; color: string }> = {
    inhale: { label: 'Inhalá', sub: 'Llená tus pulmones de paz', duration: 4, color: GOLD_LIGHT },
    hold:   { label: 'Retené', sub: 'Sentí la calma interior',   duration: 7, color: SLATE },
    exhale: { label: 'Exhalá', sub: 'Soltá todo lo que pesa',    duration: 8, color: SAGE },
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
                else { currentPhase = 'inhale'; currentCount = 4; setCycles((c) => c + 1); }
                setPhase(currentPhase);
                setCount(currentCount);
            }
        }, 1000);
    }, []);

    useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

    const isActive = phase !== 'idle';
    const cfg = isActive ? phaseConfig[phase as Exclude<BreathPhase, 'idle'>] : null;

    if (isActive && cfg) {
        return (
            <div
                onClick={stopBreathing}
                className="mb-6 cursor-pointer flex flex-col items-center gap-4"
                style={{ ...glassCard(cfg.color), borderRadius: 24, padding: 32 }}
            >
                <div
                    className="flex items-center justify-center"
                    style={{
                        width: 104,
                        height: 104,
                        borderRadius: '50%',
                        border: `1px solid ${cfg.color}55`,
                        boxShadow: `0 0 30px ${cfg.color}22, inset 0 0 30px ${cfg.color}11`,
                        transform:
                            phase === 'inhale' ? 'scale(1.14)' :
                            phase === 'exhale' ? 'scale(0.86)' : 'scale(1.05)',
                        transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                >
                    <span
                        className="tabular-nums"
                        style={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 400,
                            fontSize: 38,
                            color: cfg.color,
                        }}
                    >{count}</span>
                </div>
                <div className="text-center">
                    <h3
                        style={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 400,
                            fontStyle: 'italic',
                            fontSize: 22,
                            color: cfg.color,
                            margin: 0,
                        }}
                    >{cfg.label}</h3>
                    <p
                        style={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.5)',
                            margin: '4px 0 0',
                        }}
                    >{cfg.sub}</p>
                </div>
                {cycles > 0 && (
                    <span
                        className="uppercase"
                        style={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: 10,
                            color: 'rgba(255,255,255,0.45)',
                            letterSpacing: '0.22em',
                            fontWeight: 500,
                        }}
                    >Ciclo {cycles}</span>
                )}
                <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" style={{ opacity: 0.5 }}>
                    <rect x="8" y="8" width="4" height="12" fill={AMBER} rx="1" />
                    <rect x="16" y="8" width="4" height="12" fill={AMBER} rx="1" />
                </svg>
                <p
                    className="uppercase m-0"
                    style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.35)',
                        letterSpacing: '0.28em',
                    }}
                >Tocá para detener</p>
            </div>
        );
    }

    return (
        <div
            onClick={startBreathing}
            className="mb-6 cursor-pointer flex items-center justify-between transition-all duration-200"
            style={{ ...glassCard(GOLD), borderRadius: 16, padding: '14px 18px' }}
        >
            <div className="flex items-center" style={{ gap: 16 }}>
                <div
                    className="flex items-center justify-center"
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'rgba(217,119,6,0.22)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 0 24px rgba(217,119,6,0.28)',
                    }}
                >
                    <Icon name="self_improvement" size={22} color={AMBER} />
                </div>
                <div>
                    <h3
                        className="m-0"
                        style={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: 17,
                            fontWeight: 500,
                            color: '#fff',
                            letterSpacing: '0.005em',
                        }}
                    >
                        Pausa <em style={{ fontStyle: 'italic', color: AMBER }}>Sagrada</em>
                    </h3>
                    <p
                        style={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.5)',
                            margin: '3px 0 0',
                            letterSpacing: '0.08em',
                        }}
                    >Técnica 4-7-8</p>
                </div>
            </div>
            <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
                <circle cx="18" cy="18" r="17" fill="none" stroke={AMBER} strokeWidth="1.5" />
                <polygon points="15,12 15,24 26,18" fill={AMBER} />
            </svg>
        </div>
    );
};

// ─── NAV CARD ────────────────────────────────────────
const NavCard = ({
    icon, accent, titlePrefix, titleSuffix, suffixColor, iconColor, accentBg, desc, onClick,
}: {
    icon: string;
    accent: string;
    titlePrefix: string;
    titleSuffix: string;
    suffixColor: string;
    iconColor: string;
    accentBg: string;
    desc: string;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className="w-full text-left flex items-center transition-all duration-200 active:scale-[0.99]"
        style={{
            ...glassCard(accent),
            borderRadius: 16,
            padding: '14px 18px',
            fontFamily: '"Inter", sans-serif',
            color: '#fff',
            cursor: 'pointer',
            gap: 16,
        }}
    >
        <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: accentBg,
                border: '1px solid rgba(255,255,255,0.12)',
                color: iconColor,
                boxShadow: `0 0 22px ${accent}55`,
            }}
        >
            <Icon name={icon} size={24} color={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
            <h3
                className="m-0"
                style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 17,
                    fontWeight: 500,
                    color: '#fff',
                    letterSpacing: '0.005em',
                }}
            >
                <span style={{ color: '#fff' }}>{titlePrefix}</span>
                <span style={{ color: suffixColor }}>{titleSuffix}</span>
            </h3>
            <p
                style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.5)',
                    margin: '3px 0 0',
                }}
            >{desc}</p>
        </div>
        <Icon name="chevron_right" size={22} color="rgba(255,255,255,0.4)" />
    </button>
);

// ─── STATS ───────────────────────────────────────────
const StatRow = ({ icon, label, value, last = false }: { icon: string; label: string; value: number | string; last?: boolean }) => (
    <div
        className="flex items-center justify-between"
        style={{
            padding: '15px 20px',
            borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)',
        }}
    >
        <div className="flex items-center" style={{ gap: 16 }}>
            <Icon name={icon} size={20} color={GOLD} />
            <span
                className="uppercase"
                style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.26em',
                    color: 'rgba(255,255,255,0.55)',
                }}
            >{label}</span>
        </div>
        <span
            className="tabular-nums"
            style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 24,
                fontWeight: 400,
                ...goldTextStyle,
            }}
        >{value}</span>
    </div>
);

const StatsCard = ({ level, streak }: { level: number; streak: number }) => (
    <div
        className="mb-8 overflow-hidden"
        style={{ ...glassCard(GOLD), borderRadius: 16 }}
    >
        <StatRow icon="diamond" label="Nivel de Luz" value={level} />
        <StatRow icon="local_fire_department" label="Días de Racha" value={streak} last />
    </div>
);

// ─── DAILY QUOTE ─────────────────────────────────────
const DailyQuote = () => {
    const quote = getTodayQuote();
    return (
        <div
            className="relative"
            style={{
                borderLeft: `3px solid ${GOLD}`,
                paddingLeft: 22,
                margin: '8px 2px 40px',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: -3,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: GOLD_GRAD,
                    boxShadow: `0 0 12px ${GOLD}66`,
                }}
            />
            <p
                className="m-0"
                style={{
                    fontFamily: '"Playfair Display", serif',
                    fontStyle: 'italic',
                    fontSize: 18,
                    color: 'rgba(255,255,255,0.82)',
                    lineHeight: 1.55,
                }}
            >
                “{quote.text}”
            </p>
            <p
                className="uppercase"
                style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 10,
                    margin: '14px 0 0',
                    letterSpacing: '0.28em',
                    fontWeight: 500,
                }}
            >— <span style={goldTextStyle}>{quote.author}</span></p>
        </div>
    );
};

// ─── LOGO HEADER (inline, reemplaza top nav) ─────────
const LogoHeader = ({ user, onProfile }: { user: UserProfile | null; onProfile: () => void }) => {
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';
    return (
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center" style={{ gap: 9 }}>
                <Icon name="spa" size={22} color={GOLD} />
                <span
                    style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: 20,
                        fontWeight: 500,
                        color: '#fff',
                        letterSpacing: '0.01em',
                    }}
                >
                    San<em style={{ fontStyle: 'italic', fontWeight: 400, ...goldTextStyle }}>Arte</em>
                </span>
            </div>
            <button
                onClick={onProfile}
                className="flex items-center justify-center cursor-pointer"
                style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    padding: 2,
                    border: `1.5px solid ${GOLD}`,
                    background: 'rgba(201,168,76,0.08)',
                }}
                aria-label="Perfil"
            >
                {user?.avatar ? (
                    <div
                        className="w-full h-full rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${user.avatar}')` }}
                    />
                ) : (
                    <div
                        className="w-full h-full rounded-full flex items-center justify-center"
                        style={{
                            background: GOLD_GRAD,
                            fontFamily: '"Playfair Display", serif',
                            fontSize: 14,
                            fontWeight: 600,
                            color: NAVY,
                            letterSpacing: '-0.01em',
                        }}
                    >{initial}</div>
                )}
            </button>
        </div>
    );
};

// ─── ATMOSPHERIC ORBS ────────────────────────────────
// Blurs reducidos a 40px y sin background-attachment fixed para scroll fluido en mobile.
const Atmosphere = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div
            style={{
                position: 'absolute',
                top: '-10%',
                left: '-25%',
                width: 460,
                height: 460,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0) 70%)',
                filter: 'blur(40px)',
                transform: 'translateZ(0)',
            }}
        />
        <div
            style={{
                position: 'absolute',
                bottom: '5%',
                right: '-30%',
                width: 480,
                height: 480,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, rgba(124,58,237,0) 70%)',
                filter: 'blur(40px)',
                transform: 'translateZ(0)',
            }}
        />
    </div>
);

// ═══════════════════════════════════════════════════════
// ─── BENTO GRID MAIN ───────────────────────────────
// ═══════════════════════════════════════════════════════
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

    const xpLevel = Math.floor((user?.xp || 0) / 100);

    return (
        <div
            className="relative min-h-[100dvh] w-full"
            style={{
                background: NAVY_DEEP,
                color: '#fff',
                fontFamily: '"Inter", sans-serif',
                paddingBottom: 110,
                willChange: 'transform',
                transform: 'translateZ(0)',
            }}
        >
            <Atmosphere />

            <div
                className="relative w-full max-w-md mx-auto"
                style={{
                    zIndex: 1,
                    padding: '38px 22px 24px',
                }}
            >
                <LogoHeader user={user} onProfile={() => navigate('/profile')} />
                <Greeting user={user} greeting={greeting} />
                <SearchCard onSearch={handleSearch} />
                <BreathingWidget />

                <div className="flex flex-col mb-8" style={{ gap: 14 }}>
                    <NavCard
                        icon="diversity_1"
                        accent={GOLD}
                        titlePrefix="Comuni"
                        titleSuffix="dad"
                        suffixColor={GOLD}
                        iconColor="#FFD700"
                        accentBg="rgba(201,168,76,0.25)"
                        desc="Compartí y saná en tribu"
                        onClick={() => navigate('/community')}
                    />
                    <NavCard
                        icon="routine"
                        accent="#0EA5E9"
                        titlePrefix="Ruti"
                        titleSuffix="nas"
                        suffixColor="#7DD4FC"
                        iconColor="#7DD4FC"
                        accentBg="rgba(14,165,233,0.25)"
                        desc="Hábitos que transforman"
                        onClick={() => navigate('/routines')}
                    />
                    <NavCard
                        icon="edit_note"
                        accent="#7C3AED"
                        titlePrefix="Dia"
                        titleSuffix="rio"
                        suffixColor="#A78BFA"
                        iconColor="#A78BFA"
                        accentBg="rgba(124,58,237,0.25)"
                        desc="Tu espacio seguro"
                        onClick={() => navigate('/journal')}
                    />
                </div>

                <StatsCard level={xpLevel} streak={streak} />
                <DailyQuote />

                <div className="text-center pb-6">
                    <p
                        className="uppercase"
                        style={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: 10,
                            color: 'rgba(240,208,128,0.35)',
                            letterSpacing: '0.32em',
                            fontWeight: 500,
                        }}
                    >SanArte</p>
                </div>
            </div>
        </div>
    );
};

export default BentoGrid;
