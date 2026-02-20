import React, { useEffect, useRef } from 'react';

interface AdSenseSlotProps {
    slotId: string;
    format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
    className?: string;
}

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

    useEffect(() => {
        if (pushed.current) return;
        try {
            // @ts-ignore — Google AdSense global
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            pushed.current = true;
        } catch (e) {
            // AdSense not loaded yet — will render placeholder
        }
    }, []);

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
