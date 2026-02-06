import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const ConfettiManager: React.FC = () => {
    useEffect(() => {
        const handleXP = (e: CustomEvent) => {
            // Only trigger confetti on Level Up or huge milestones
            if (e.detail.levelUp || e.detail.amount >= 100) {
                triggerCelebration();
            }
        };

        window.addEventListener('xp-gained', handleXP as EventListener);
        return () => window.removeEventListener('xp-gained', handleXP as EventListener);
    }, []);

    const triggerCelebration = () => {
        // School Pride / Cannon effect
        const end = Date.now() + 3 * 1000;
        const colors = ['#00f2ff', '#7000ff', '#ffffff'];

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    return null; // Logic only component
};
