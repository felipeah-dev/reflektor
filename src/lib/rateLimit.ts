import { LRUCache } from 'lru-cache';

type RateLimitContext = {
    tokenCount: number;
    lastRefill: number;
};

type RateLimitOptions = {
    uniqueTokenPerInterval: number; // Max number of unique IPs to track
    interval: number; // Interval in milliseconds
    limit: number; // Max requests per interval
};

export const rateLimit = (options: RateLimitOptions) => {
    const tokenCache = new LRUCache<string, RateLimitContext>({
        max: options.uniqueTokenPerInterval || 500,
        ttl: options.interval,
    });

    return {
        check: (limit: number, token: string) => new Promise<void>((resolve, reject) => {
            const now = Date.now();
            const interval = options.interval;

            let context = tokenCache.get(token);

            if (!context) {
                // First request from this IP
                context = {
                    tokenCount: 1,
                    lastRefill: now
                };
                tokenCache.set(token, context);
                resolve();
                return;
            }

            // Simple Window / Token Bucket Logic
            // If the key expired (defined by TTL), LRU cache would have removed it, so we'd be in the 'if (!context)' block.
            // But since we manually manage counts within the TTL window:

            // Calculate time passed since last request/refill
            // Actually, for simplicity with LRU TTL, we can just count. 
            // If the item exists, it check if count > limit.

            if (context.tokenCount >= limit) {
                // If the item is still in cache (TTL hasn't expired) and count exceeded
                reject(new Error('Rate limit exceeded'));
                return;
            }

            context.tokenCount += 1;
            tokenCache.set(token, context); // Update usage
            resolve();
        }),
    };
};
