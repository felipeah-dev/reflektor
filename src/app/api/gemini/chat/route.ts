import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiKeys } from '@/lib/geminiKeys';
import { rateLimit } from '@/lib/rateLimit';

// Rate Limiter: 20 messages per minute per IP
const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
    limit: 20,
});

export async function POST(req: NextRequest) {
    try {
        // 1. Rate Limiting Check
        const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
        try {
            await limiter.check(20, ip);
        } catch {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Too many messages.' },
                { status: 429 }
            );
        }

        const apiKeys = getGeminiKeys();
        if (apiKeys.length === 0) {
            return NextResponse.json({ error: 'No GOOGLE_API_KEY configured' }, { status: 500 });
        }

        const { message, history, systemInstruction } = await req.json();

        let modelName = "gemini-3-flash-preview";
        let retryCount = 0;
        let keyIndex = 0;
        const MAX_RETRIES_PER_KEY = 2;

        while (keyIndex < apiKeys.length) {
            const currentApiKey = apiKeys[keyIndex];
            const genAI = new GoogleGenerativeAI(currentApiKey);

            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemInstruction,
                });

                const chat = model.startChat({
                    history: history,
                });

                const result = await chat.sendMessage(message);
                const response = await result.response;

                return NextResponse.json({ text: response.text() });
            } catch (error: any) {
                const errorMessage = error.message || String(error);
                const isOverloaded = errorMessage.includes("503") || errorMessage.includes("overloaded") || errorMessage.includes("429") || errorMessage.includes("quota");

                if (isOverloaded) {
                    retryCount++;

                    // If we've retried on this key or it's a hard quota limit, move to next key
                    if (retryCount >= MAX_RETRIES_PER_KEY || errorMessage.includes("quota")) {
                        console.warn(`API Key ${keyIndex} failed (Chat Overloaded/Quota). Rotating to next key...`);
                        keyIndex++;
                        retryCount = 0;

                        // Switch model only if we are on the first key and it fails, 
                        // or keep trying current model on next keys first.
                        // For chat, we usually want the best model until it fails everywhere.
                        if (keyIndex === apiKeys.length - 1 && modelName === "gemini-3-flash-preview") {
                            modelName = "gemini-2.5-flash-latest";
                        }
                        continue;
                    }

                    // Backoff
                    const waitTime = Math.pow(2, retryCount) * 500;
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                } else {
                    throw error;
                }
            }
        }

        throw new Error("Chat failed after model fallbacks.");

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
