import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiKeys } from '@/lib/geminiKeys';
import { rateLimit } from '@/lib/rateLimit';

// Rate Limiter: 10 requests per hour per IP
const limiter = rateLimit({
    interval: 60 * 60 * 1000, // 1 hour
    uniqueTokenPerInterval: 500, // Max 500 unique IPs tracked per hour
    limit: 10,
});

export async function POST(req: NextRequest) {
    try {
        // 1. Rate Limiting Check
        const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
        try {
            await limiter.check(10, ip);
        } catch {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again in an hour.' },
                { status: 429 }
            );
        }

        const apiKeys = getGeminiKeys();
        if (apiKeys.length === 0) {
            return NextResponse.json({ error: 'No GOOGLE_API_KEY configured' }, { status: 500 });
        }

        const formData = await req.formData();
        const videoFile = formData.get('video') as Blob;
        const scenario = (formData.get('scenario') as string) || "custom";
        const totalDuration = formData.get('totalDuration') as string;
        const systemInstruction = formData.get('systemInstruction') as string;

        if (!videoFile) {
            return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
        }

        // 2. Security Validation: File Size & Type
        const MAX_SIZE_MB = 500;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

        if (videoFile.size > MAX_SIZE_BYTES) {
            return NextResponse.json(
                { error: `File too large. Maximum size is ${MAX_SIZE_MB}MB.` },
                { status: 400 }
            );
        }

        if (!videoFile.type.startsWith('video/') && !videoFile.type.startsWith('audio/')) {
            return NextResponse.json(
                { error: 'Invalid file type. Only video and audio files are allowed.' },
                { status: 400 }
            );
        }

        let modelName = "gemini-3-flash-preview";
        let result;
        let retryCount = 0;
        let keyIndex = 0;
        const MAX_RETRIES_PER_KEY = 2;

        const arrayBuffer = await videoFile.arrayBuffer();
        const base64Video = Buffer.from(arrayBuffer).toString('base64');

        const durationPrompt = totalDuration
            ? `The video is exactly ${totalDuration} seconds long. Ensure all timestamps in "start" and "end" are within 0 and ${totalDuration}.`
            : "";

        let lastError = null;

        // Strategy: Try each API key. For each key, allow a small number of retries for 503/429.
        while (keyIndex < apiKeys.length) {
            const currentApiKey = apiKeys[keyIndex];
            const genAI = new GoogleGenerativeAI(currentApiKey);

            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemInstruction
                });

                result = await model.generateContent([
                    {
                        inlineData: {
                            mimeType: videoFile.type,
                            data: base64Video,
                        }
                    },
                    `Analyze this ${scenario} session. 
                    ${durationPrompt}
                    1) Detect the primary language. 
                    2) Identify specific moments of eye contact loss or gestures. 
                    3) Detect REAL filler words (fillers/muletillas) with high precision.
                    4) Provide coaching advice SPECIFIC to the ${scenario} context provided in system instructions.
                    Return ONLY the JSON object.`
                ]);
                break; // If successful, exit the outer loop
            } catch (error: any) {
                lastError = error;
                const errorMessage = error.message || String(error);
                const isOverloaded = errorMessage.includes("503") || errorMessage.includes("overloaded") || errorMessage.includes("429") || errorMessage.includes("quota");

                if (isOverloaded) {
                    retryCount++;
                    // If we've retried on this key or it's a hard quota limit, move to next key
                    if (retryCount >= MAX_RETRIES_PER_KEY || errorMessage.includes("quota")) {
                        console.warn(`API Key ${keyIndex} failed (Overloaded/Quota). Rotating to next key...`);
                        keyIndex++;
                        retryCount = 0; // Reset for next key

                        // If we are at the last key, try a fallback model as a final attempt
                        if (keyIndex === apiKeys.length - 1) {
                            modelName = "gemini-2.5-flash-latest";
                        }

                        continue;
                    }

                    // Small backoff before retry on SAME key
                    const waitTime = Math.pow(2, retryCount) * 1000;
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                } else {
                    // Critical unexpected error, don't rotate just fail
                    throw error;
                }
            }
        }

        if (!result) {
            const isQuota = lastError?.message?.includes("429") || lastError?.message?.includes("quota") || lastError?.message?.includes("503");
            return NextResponse.json({
                error: isQuota ? 'QUOTA_EXHAUSTED' : (lastError?.message || 'Failed to initialize analysis'),
                details: lastError?.toString()
            }, { status: isQuota ? 429 : 500 });
        }

        const response = await result.response;
        const fullText = response.text();

        // Extract JSON from response
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        const analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: {}, events: [] };

        return NextResponse.json(analysisData);

    } catch (error: any) {
        console.error("Analysis API Error:", error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }, { status: 500 });
    }
}
