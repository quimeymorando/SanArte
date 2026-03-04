import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';

/**
 * Hook that checks if the current user is premium.
 * Used by ad components to auto-hide when user is subscribed.
 */
export function useIsPremium(): boolean {
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        const check = async () => {
            try {
                const user = await authService.getUser();
                setIsPremium(!!user?.isPremium);
            } catch {
                setIsPremium(false);
            }
        };
        check();
    }, []);

    return isPremium;
}
