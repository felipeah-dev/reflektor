import { useState, useEffect } from 'react';

export type NetworkQuality = 'good' | 'poor' | 'offline';

export function useNetworkQuality() {
    const [quality, setQuality] = useState<NetworkQuality>('good');

    useEffect(() => {
        const updateStatus = () => {
            if (!navigator.onLine) {
                setQuality('offline');
                return;
            }

            const conn = (navigator as any).connection;
            if (conn) {
                // effectiveType can be 'slow-2g', '2g', '3g', or '4g'
                if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.effectiveType === '3g') {
                    setQuality('poor');
                } else if (conn.saveData) {
                    setQuality('poor');
                } else {
                    setQuality('good');
                }
            } else {
                // If the Network Information API is not supported, we assume good if online 
                // but we can't be sure without a speed test.
                setQuality('good');
            }
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        const conn = (navigator as any).connection;
        if (conn) {
            conn.addEventListener('change', updateStatus);
        }

        updateStatus();

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
            if (conn) {
                conn.removeEventListener('change', updateStatus);
            }
        };
    }, []);

    return quality;
}
