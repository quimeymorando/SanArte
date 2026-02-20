import React, { useState } from 'react';
import { MarkdownRenderer } from './ui/MarkdownRenderer';

interface AudioVisualizerProps {
    scriptText: string;
    isPremium: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ scriptText, isPremium }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    // const [audioError, setAudioError] = useState(false); // Can be used for error UI handling

    const handleToggleAudio = () => {
        if (!scriptText || !isPremium) return;
        const synthesis = window.speechSynthesis;

        if (isPlaying) {
            synthesis.cancel();
            setIsPlaying(false);
            return;
        }

        try {
            const utterance = new SpeechSynthesisUtterance(scriptText.replace(/\*/g, '')); // Clean markdown for speech
            const voices = synthesis.getVoices();
            const spanishVoice = voices.find(v => v.lang.includes('es') && (v.name.includes('Mexico') || v.name.includes('Latin') || v.lang === 'es-MX'));

            if (spanishVoice) utterance.voice = spanishVoice;
            utterance.rate = 0.85;
            utterance.pitch = 0.95;

            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => { setIsPlaying(false); /* setAudioError(true); */ };

            synthesis.speak(utterance);
        } catch (e) {
            console.error("Audio playback error", e);
            // setAudioError(true);
        }
    };

    // Cleanup on unmount handled by parent or context usually, but good to have safety
    // For now we rely on the component lifecycle or global cancellation if needed

    return (
        <div className="rounded-[2.5rem] bg-gray-900 border border-white/10 p-8 mb-8 relative overflow-hidden group">
            {/* Dynamic Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-r from-orange-500/20 to-indigo-500/20 blur-xl transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`} />

            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                {/* Play Button */}
                <button
                    onClick={handleToggleAudio}
                    className={`relative size-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${isPlaying ? 'bg-white text-orange-500 scale-110 shadow-orange-500/50' : 'bg-white/10 text-white hover:bg-white hover:text-orange-500'}`}
                >
                    {isPlaying && (
                        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />
                    )}
                    <span className="material-symbols-outlined text-4xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                </button>

                {/* Waveform Visualizer (CSS Fake) */}
                <div className="flex-1 w-full flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h5 className="font-bold text-white text-lg">Meditación Guiada</h5>
                            <p className="text-xs text-orange-300 font-medium tracking-wider uppercase">Frecuencia 432Hz</p>
                        </div>
                        {isPlaying && (
                            <div className="flex gap-1 items-end h-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="w-1 bg-orange-400 rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: `${i * 0.1}s`, height: '100%' }} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000 ${isPlaying ? 'w-full animate-[shimmer_3s_infinite]' : 'w-0'}`}></div>
                    </div>
                </div>
            </div>

            {/* Highlight Script Toggle */}
            <div className="mt-8 text-center">
                <details className="group/details">
                    <summary className="list-none cursor-pointer text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
                        Ver Guion Escrito
                    </summary>
                    <div className="mt-6 pt-6 border-t border-white/10 text-sm text-gray-300 text-left animate-in slide-in-from-top-2">
                        <MarkdownRenderer text={scriptText} />
                    </div>
                </details>
            </div>
        </div>
    );
};
