import React, { useState } from 'react';
import { MarkdownRenderer } from './ui/MarkdownRenderer';
import { logger } from '../utils/logger';

// Inyectamos keyframes globales una sola vez
const pulseKeyframes = `
@keyframes sa-pulse-gold {
    0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4), 0 8px 32px rgba(201,168,76,0.3); }
    50% { box-shadow: 0 0 0 18px rgba(201,168,76,0), 0 8px 32px rgba(201,168,76,0.3); }
}
`;
if (typeof document !== 'undefined' && !document.getElementById('sa-audio-pulse-style')) {
    const style = document.createElement('style');
    style.id = 'sa-audio-pulse-style';
    style.textContent = pulseKeyframes;
    document.head.appendChild(style);
}

interface AudioVisualizerProps {
    scriptText: string;
    isPremium: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ scriptText, isPremium }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showScript, setShowScript] = useState(false);

    const handleToggleAudio = () => {
        if (!scriptText || !isPremium) return;
        const synthesis = window.speechSynthesis;

        if (isPlaying) {
            synthesis.cancel();
            setIsPlaying(false);
            return;
        }

        try {
            const utterance = new SpeechSynthesisUtterance(scriptText.replace(/\*/g, ''));
            const voices = synthesis.getVoices();
            const spanishVoice = voices.find(v =>
                v.lang.includes('es') &&
                (v.name.includes('Mexico') || v.name.includes('Latin') || v.lang === 'es-MX')
            );

            if (spanishVoice) utterance.voice = spanishVoice;
            utterance.rate = 0.85;
            utterance.pitch = 0.95;

            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);

            synthesis.speak(utterance);
        } catch (e) {
            logger.error('Audio playback error', e);
        }
    };

    return (
        <div
            style={{
                position: 'relative',
                background:
                    'radial-gradient(circle at 50% 50%, rgba(244,114,182,0.06) 0%, transparent 70%)',
                padding: '40px 20px 32px',
                textAlign: 'center',
                borderRadius: '16px',
            }}
        >
            <button
                onClick={handleToggleAudio}
                disabled={!isPremium}
                aria-label={isPlaying ? 'Pausar meditación' : 'Iniciar meditación'}
                style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F5E4B3 0%, #C9A84C 50%, #E8C96A 100%)',
                    border: 'none',
                    cursor: isPremium ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'sa-pulse-gold 3s ease-in-out infinite',
                    opacity: isPremium ? 1 : 0.5,
                    padding: 0,
                    transition: 'transform 0.2s',
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
                {isPlaying ? (
                    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
                        <rect x="7" y="6" width="4" height="14" fill="#4A3810" rx="1" />
                        <rect x="15" y="6" width="4" height="14" fill="#4A3810" rx="1" />
                    </svg>
                ) : (
                    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
                        <polygon points="9,6 9,20 21,13" fill="#4A3810" />
                    </svg>
                )}
            </button>

            <h3
                style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '22px',
                    fontWeight: 400,
                    color: '#F0EBE0',
                    marginTop: '24px',
                    marginBottom: '6px',
                }}
            >Meditación Guiada</h3>

            <p
                style={{
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'rgba(244,114,182,0.7)',
                    margin: '0 0 20px',
                }}
            >Frecuencia 432Hz</p>

            <div
                style={{
                    width: '220px',
                    height: '3px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.08)',
                    margin: '0 auto 22px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: isPlaying ? '100%' : '0%',
                        background: 'linear-gradient(90deg, #F472B6, #DD6BA8)',
                        borderRadius: '999px',
                        transition: isPlaying ? 'width 180s linear' : 'width 0.3s',
                    }}
                />
            </div>

            <button
                onClick={() => setShowScript(v => !v)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(244,114,182,0.75)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                }}
            >
                {showScript ? 'Ocultar guion' : 'Ver guion escrito'}
                <span
                    className="material-symbols-outlined"
                    style={{
                        fontSize: '14px',
                        transform: showScript ? 'rotate(90deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                        fontVariationSettings: "'wght' 300",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >chevron_right</span>
            </button>

            {showScript && (
                <div
                    style={{
                        marginTop: '24px',
                        paddingTop: '24px',
                        borderTop: '1px solid rgba(244,114,182,0.15)',
                        textAlign: 'left',
                    }}
                >
                    <MarkdownRenderer text={scriptText} />
                </div>
            )}
        </div>
    );
};
