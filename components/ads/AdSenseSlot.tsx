import React, { useEffect, useRef } from 'react';
import { useConsent } from '../../hooks/useConsent';

interface AdSenseSlotProps {
    slotId: string;
    format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
    className?: string;
}

const ADSENSE_SCRIPT_ID = 'sanarte-adsense-script';
const ADSENSE_SCRIPT_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6058754158804941';

const ensureAdSenseScript = async (): Promise<void> => {
    const existing = document.getElementById(ADSENSE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
        if ((window as any).adsbygoogle) return;

        await new Promise<void>((resolve) => {
            existing.addEventListener('load', () => resolve(), { once: true });
            setTimeout(() => resolve(), 2000);
        });
        return;
    }

    await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.id = ADSENSE_SCRIPT_ID;
        script.async = true;
        script.src = ADSENSE_SCRIPT_SRC;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('AdSense failed to load'));
        document.head.appendChild(script);
    });
};

/**
 * Google AdSense slot component for web.
 * Replace the `data-ad-client` with your real AdSense publisher ID.
 * Replace `slotId` with your real ad unit ID when ready.
 */
const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
    slotId,
    format = 'auto',
    className = '',
}) => {
    const adRef = useRef<HTMLDivElement>(null);
    const pushed = useRef(false);
    const { canShowAds } = useConsent();

    useEffect(() => {
        if (!canShowAds || pushed.current || !slotId) return;

        let cancelled = false;

        const mountAd = async () => {
            try {
                await ensureAdSenseScript();
                if (cancelled || pushed.current) return;

                // @ts-ignore — Google AdSense global
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                pushed.current = true;
            } catch {
                // Ignore network/script failures. House ad fallback is handled upstream.
            }
        };

        mountAd();

        return () => {
            cancelled = true;
        };
    }, [canShowAds, slotId]);

    if (!canShowAds || !slotId) return null;

    return (
        <div ref={adRef} className={`ad-slot-container ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-6058754158804941"
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
};

export default AdSenseSlot;
