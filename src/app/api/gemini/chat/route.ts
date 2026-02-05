import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
        }

        const { message, history, systemInstruction } = await req.json();

        const genAI = new GoogleGenerativeAI(apiKey);
        let modelName = "gemini-3-flash-preview";
        let retryCount = 0;
        const MAX_RETRIES = 2;

        while (retryCount < MAX_RETRIES) {
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
                retryCount++;
                const errorMessage = error.message || String(error);
                const isOverloaded = errorMessage.includes("503") || errorMessage.includes("overloaded") || errorMessage.includes("429");

                if (retryCount < MAX_RETRIES && (isOverloaded || modelName === "gemini-3-flash-preview")) {
                    modelName = "gemini-2.5-flash-latest";
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
