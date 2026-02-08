/**
 * Centralized Gemini API Key Management
 * Collects multiple keys from environment variables to allow rotation
 * upon reaching quota limits (Error 429).
 */

export const getGeminiKeys = (): string[] => {
    const keys: string[] = [];

    // 1. Check primary key
    if (process.env.GOOGLE_API_KEY) {
        keys.push(process.env.GOOGLE_API_KEY);
    }

    // 2. Check numbered keys (e.g., GOOGLE_API_KEY_1, GOOGLE_API_KEY_2...)
    // We'll check up to 10 keys for safety
    for (let i = 1; i <= 10; i++) {
        const key = process.env[`GOOGLE_API_KEY_${i}`];
        if (key && !keys.includes(key)) {
            keys.push(key);
        }
    }

    return keys;
};
