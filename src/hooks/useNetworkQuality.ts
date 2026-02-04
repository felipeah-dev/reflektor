import { useState, useEffect } from 'react';

export type NetworkQuality = 'good' | 'poor' | 'offline';

interface NetworkInformation extends EventTarget {
    readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
    readonly saveData: boolean;
    onchange: EventListener;
}

export function useNetworkQuality() {
    const [quality, setQuality] = useState<NetworkQuality>('good');

    useEffect(() => {
        const checkPing = async () => {
            try {
                // Try to fetch a small resource to verify real connectivity
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const start = performance.now();
                await fetch('/favicon.ico', {
                    method: 'HEAD',
                    signal: controller.signal,
                    cache: 'no-store'
                });
                clearTimeout(timeoutId);
                const end = performance.now();

                // If it takes more than 1.5s for a HEAD request to local favicon, it's "poor"
                if (end - start > 1500) {
                    return 'poor';
                }
                return 'good';
            } catch (e) {
                return 'offline';
            }
        };

        const updateStatus = async () => {
            if (!navigator.onLine) {
                setQuality('offline');
                return;
            }

            const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
            if (conn) {
                if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.effectiveType === '3g') {
                    setQuality('poor');
                } else if (conn.saveData) {
                    setQuality('poor');
                } else {
                    setQuality('good');
                }
            } else {
                // Fallback to ping check if Network Info API is missing
                const pingResult = await checkPing();
                setQuality(pingResult);
            }
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
        if (conn) {
            conn.addEventListener('change', updateStatus);
        }

        updateStatus();

        // Periodically check if we are in "good" but maybe it's actually slow (optional, but good for UX)
        const interval = setInterval(updateStatus, 30000);

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
            if (conn) {
                conn.removeEventListener('change', updateStatus);
            }
            clearInterval(interval);
        };
    }, []);

    return quality;
}

