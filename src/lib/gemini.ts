import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeVideo(videoBlob: Blob, onStatusUpdate: (msg: string) => void) {
    try {
        onStatusUpdate("Obtaining secure connection token...");
        const tokenResponse = await fetch('/api/gemini/token');
        const { token } = await tokenResponse.json();

        const genAI = new GoogleGenerativeAI(token);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: `You are an elite Spatial-Temporal Communication Coach. 
            Do not just identify objects; analyze the SYNERGY between the speaker's gestures, eye contact, and vocal emphasis.
            Identify CAUSE and EFFECT (e.g., 'Looking at the floor caused a drop in perceived confidence').
            
            Output ONLY a single JSON object with:
            1. 'summary': {
                'score': number (0-10),
                'pace': number (words per minute estimate),
                'sentiment': string (e.g., 'Positive', 'Nervous'),
                'eyeContact': number (percentage 0-100),
                'clarity': number (percentage 0-100),
                'overallFeedback': string (concise summary)
            }
            2. 'events': Array of {
                'start' / 'end': numeric seconds,
                'type': 'eye_contact', 'filler', 'gesture_impact', 'spatial_warning',
                'description': High-level coaching feedback,
                'box_2d': [y_min, x_min, y_max, x_max] (0-1000)
            }
            
            Use MM:SS for internal reasoning, but strictly numeric seconds in JSON output.
            Prioritize identifying moments where non-verbal cues fail to support the spoken message.`
        });

        onStatusUpdate("Preparing video for analysis...");

        // Convert Blob to Base64 (Proof of concept for Hackathon - for larger files, use Files API)
        const base64Video = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.readAsDataURL(videoBlob);
        });

        onStatusUpdate("Analyzing multimodal data with Gemini 3...");

        const result = await model.generateContentStream([
            {
                inlineData: {
                    mimeType: videoBlob.type,
                    data: base64Video,
                }
            },
            "Analyze this presentation for eye contact and gestures. Provide specific timestamps for when the speaker looks away or uses filler words. Return ONLY the JSON array."
        ]);

        let fullText = "";
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            // Optionally update UI with partial reasoning or progress
            onStatusUpdate(`Processing analysis stream... (${fullText.length} chars)`);
        }

        // Extract JSON from response (Gemini might wrap it in markdown block)
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        const analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: {}, events: [] };

        return analysisData;

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw error;
    }
}
