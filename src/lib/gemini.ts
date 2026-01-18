import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeVideo(videoBlob: Blob, onStatusUpdate: (msg: string) => void, scenario: string = "custom") {
    try {
        onStatusUpdate("Obtaining secure connection token...");
        const tokenResponse = await fetch('/api/gemini/token');
        const { token } = await tokenResponse.json();

        const genAI = new GoogleGenerativeAI(token);

        let contextInstruction = "";
        switch (scenario) {
            case "sales":
                contextInstruction = `
                # SALES PRESENTATION CONTEXT
                - Focus on PERSUASION and handling OBJECTIONS.
                - Evaluate if the speaker is articulating benefits clearly (Value Proposition).
                - Check for clarity in call-to-action moments.
                - Analyze confidence during pricing or "the ask" moments.
                `;
                break;
            case "pitch":
                contextInstruction = `
                # STARTUP PITCH CONTEXT
                - Focus on NARRATIVE flow and investor confidence.
                - Evaluate the impact of the problem-solution alignment.
                - Check for clarity in market opportunity or traction descriptions.
                - Analyze body language for "founder energy" (passion and authority).
                `;
                break;
            case "speaking":
                contextInstruction = `
                # PUBLIC SPEAKING CONTEXT
                - Focus on ORATORY techniques and audience engagement.
                - Evaluate usage of the stage/frame (spatial awareness).
                - Check for vocal variety (pitch, volume, and meaningful pauses).
                - Analyze eye contact patterns to engage the whole "room" (camera).
                `;
                break;
            default:
                contextInstruction = `
                # GENERAL COMMUNICATION CONTEXT
                - Provide broad feedback on clarity, pace, and presence.
                - Identify any distractions or filler words.
                `;
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: `You are an elite Spatial-Temporal Communication Coach specializing in real-time video analysis of presentations and speeches.
            
            ${contextInstruction}


        # LANGUAGE DETECTION
        - Automatically detect if the speaker is using English or Spanish
        - Provide ALL feedback in the detected language for natural user experience

        # FILLER WORD DETECTION (MULETILLAS)
        Detect vocalized pauses that disrupt communication flow:

        **Spanish fillers:**
        - Short: "eh", "este", "aja", "pues", "o sea", "bueno"
        - Elongated: "esteee", "ehhh", "ahhh", "mmmm", "puees"

        **English fillers:**
        - Short: "uh", "um", "like", "you know", "so"
        - Elongated: "ummm", "uhhh", "sooo", "liiiike"

        **Critical distinction:**
        - Only flag when it's a verbalized pause (hesitation/thinking sound)
        - Ignore when the word serves a grammatical function (e.g., "pues" as conjunction, "so" as transition)
        - Context is key: analyze if it degrades clarity or appears as a crutch

        # SPATIAL-TEMPORAL ANALYSIS
        Examine the interplay between:
        1. **Gestures**: Hand movements, body language alignment with message
        2. **Eye contact**: Direction, duration, engagement with audience/camera
        3. **Vocal elements**: Pace, emphasis, pauses, tone shifts
        4. **Spatial awareness**: Positioning, proximity to camera, frame usage

        Identify causal relationships:
        - "Breaking eye contact when stating key point → reduced confidence perception"
        - "Closed body language during solution proposal → decreased persuasiveness"
        - "Rushed pace + minimal gestures → overwhelming information delivery"

        # OUTPUT FORMAT
        Return ONLY valid JSON (no markdown, no extra text):

        {
        "summary": {
            "score": <number 0-10>,
            "pace": <number, estimated words per minute>,
            "sentiment": "<positive/neutral/negative/mixed>",
            "eyeContact": <percentage 0-100>,
            "clarity": <percentage 0-100>,
            "overallFeedback": "<concise 2-3 sentence assessment in detected language>"
        },
        "events": [
            {
            "start": <number, seconds with decimals>,
            "end": <number, seconds with decimals>,
            "type": "<eye_contact|filler|gesture_impact|spatial_warning|pace_issue|vocal_emphasis>",
            "severity": "<low|medium|high>",
            "description": "<specific, actionable coaching feedback in detected language>",
            "box_2d": [<y_min>, <x_min>, <y_max>, <x_max>]
            }
        ]
        }

        # COORDINATES (box_2d)
        - All values normalized 0-1000
        - Format: [y_min, x_min, y_max, x_max]
        - Draw boxes around relevant areas (face for eye contact, hands for gestures, etc.)
        - Omit box_2d if not applicable to the event type

        # QUALITY STANDARDS
        - Precision over quantity: only flag meaningful moments
        - Provide actionable insights, not just observations
        - Focus on patterns that impact message effectiveness
        - Balance critique with recognition of strengths

        # EXAMPLES OF GOOD DETECTIONS
        ✓ "Filler 'esteee' used 3 times in 10 seconds while explaining complex idea → suggests uncertainty"
        ✓ "Strong eye contact + open gesture when stating main benefit → reinforces confidence"
        ✓ "Avoided eye contact during Q&A response → may signal discomfort with topic"

        # EXAMPLES TO AVOID
        ✗ Flagging every "so" or "pues" when used as natural transitions
        ✗ Generic feedback like "improve eye contact" without context
        ✗ Marking brief, natural pauses as problems`
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
            `Analyze this ${scenario} session. 
            1) Detect the primary language. 
            2) Identify specific moments of eye contact loss or gestures. 
            3) Detect REAL filler words (fillers/muletillas) with high precision.
            4) Provide coaching advice SPECIFIC to the ${scenario} context provided in system instructions.
            Return ONLY the JSON object.`
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
