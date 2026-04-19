import React, { useEffect, useState } from 'react';

const GOLD_GRAD = 'linear-gradient(135deg, #9A7A2A 0%, #C9A84C 40%, #F0D080 55%, #C9A84C 70%, #9A7A2A 100%)';

const pulseKeyframes = `
@keyframes pulse-gold {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.85; }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('splash-pulse-style')) {
  const style = document.createElement('style');
  style.id = 'splash-pulse-style';
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
}

const goldTextStyle: React.CSSProperties = {
    background: GOLD_GRAD,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
};

interface SplashScreenProps {
    onDone: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDone }) => {
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        let fadeOutTimer: ReturnType<typeof setTimeout>;
        let doneTimer: ReturnType<typeof setTimeout>;

        const start = () => {
            setOpacity(1);
            fadeOutTimer = setTimeout(() => setOpacity(0), 3100);
            doneTimer = setTimeout(() => onDone(), 3500);
        };

        const fontTimeout = setTimeout(start, 3000);

        document.fonts.ready.then(() => {
            clearTimeout(fontTimeout);
            start();
        });

        return () => {
            clearTimeout(fontTimeout);
            clearTimeout(fadeOutTimer);
            clearTimeout(doneTimer);
        };
    }, [onDone]);

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: '#060D1B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                opacity,
                transition: 'opacity 0.4s ease',
                pointerEvents: 'none',
            }}
        >
            {/* Icon */}
            <span
                className="material-symbols-outlined"
                style={{
                    fontFamily: '"Material Symbols Outlined"',
                    fontSize: 48,
                    lineHeight: 1,
                    fontVariationSettings: "'wght' 300, 'FILL' 0",
                    color: '#C9A84C',
                    display: 'block',
                    marginBottom: 4,
                    filter: 'drop-shadow(0 0 18px rgba(201,168,76,0.4))',
                    animation: 'pulse-gold 1.2s ease-in-out infinite',
                }}
            >
                spa
            </span>

            {/* Logo */}
            <div
                style={{
                    fontFamily: '"Playfair Display", serif',
                    fontStyle: 'italic',
                    fontSize: 38,
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    ...goldTextStyle,
                    filter: 'drop-shadow(0 0 24px rgba(201,168,76,0.25))',
                }}
            >
                SanArte
            </div>

            {/* Tagline */}
            <p
                style={{
                    fontFamily: '"Playfair Display", serif',
                    fontStyle: 'italic',
                    fontSize: 13,
                    color: '#8B7355',
                    margin: 0,
                    letterSpacing: '0.02em',
                    textAlign: 'center',
                }}
            >
                Respira. Tu santuario está despertando.
            </p>
        </div>
    );
};

export default SplashScreen;
