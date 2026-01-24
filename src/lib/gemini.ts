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
                # SALES PERFORMANCE EVALUATION FRAMEWORK (Expert Level)
                Evaluate the interaction based on established methodologies (SPIN, Sandler, Challenger):
                
                1. **Vocal Architecture (The 38% Rule)**:
                    - **Target Pace**: 140-160 WPM for persuasion; 100-120 WPM for complex data.
                    - **Critical Error**: Velocity >170 WPM ("Comprehension Abyss").
                    - **Tonality**: High-Impact professionals use **Downward Inflection** (finality/authority) during "the ask" and pricing. Penalize "Up-talk" when stating value.
                    - **The 5-Second Rule**: Detect pauses of ≥5s after: (1) Diagnostic questions, (2) Stating price, (3) After an objection is raised.

                2. **Kinesics and Status (Playing High vs. Low)**:
                    - **Playing High (Authority)**: Stable head, expansive gestures, slow/controlled movements, sustained eye contact (50-70% rule).
                    - **Playing Low (Deficiency)**: Facial touching, jerky movements, excessive nodding, avoiding eye contact.
                    - **Hand Gestures**: Detect usage of "Illustrator" gestures to draw the future state.

                3. **Methodology KPIs**:
                    - **SPIN**: Ratio of Implication Questions vs. Situation Questions.
                    - **Sandler**: Presence of a clear "Up-front Contract" early on.
                    - **Challenger**: Is there "Constructive Tension"? Does the speaker reframe the customer's problem or just demo features?
                
                4. **Objection Handling**:
                    - Measure latency before response (Master level: Pause-Validate-Clarify-Respond-Confirm).
                `;
                break;
            case "pitch":
                contextInstruction = `
                # VENTURE CAPITAL PITCH STANDARDS (High-Impact Founder)
                Analyze based on YC, Sequoia, a16z, and Techstars benchmarks:

                1. **Dual-Processing Architecture**:
                    - **System 1 (Intuitive)**: Hook effectiveness in first 30-60s. Does the energy arc justify the logic?
                    - **System 2 (Logical)**: "Bottom-up" market math and unit economics precision.
                
                2. **Visual Presence (The 90/10 Rule)**:
                    - **Eye Contact**: 90% of time looking at the LENS (not the screen). Detect deviations.
                    - **Framing**: Mid-chest up (half-body). Front-facing diffused lighting. Clean background.
                
                3. **Technical Benchmarks**:
                    - **Guy Kawasaki 10/20/30**: Evaluation of cognitive load.
                    - **Rhythmic Pacing**: 130-150 WPM average. Slower pace for "Underlying Magic" or metrics.
                
                4. **Founder DNA Identification**:
                    - **YC Style**: Radical clarity. Can it be explained to a 5-year-old?
                    - **Sequoia Style**: "Why Now?" urgency. Market shift identification.
                    - **a16z Style**: "Logic-first" narrative and technical moats.
                `;
                break;
            case "speaking":
                contextInstruction = `
                # MODERN RHETORIC COMPENDIUM (TED & Toastmasters Standards)
                Evaluate following the Duarte and Chris Anderson frameworks:

                1. **The Throughline**:
                    - Is there a single, central idea being reconstructed in the audience's mind?
                    - **STAR Moment**: Identify the "Something They'll Always Remember".
                
                2. **Vocal Variety & Projection**:
                    - Diaphragmatic projection (lack of vocal fry/strain).
                    - Meaningful use of the "Silent Pause" for cognitive marination (2x time for audience vs speaker).
                    - **Elimination of Filler Words**: High-Impact level requires near-zero "muletillas" (Filler score).
                
                3. **Kinésica Propositiva**:
                    - Gestures defined and vigorous (above the elbow, away from body).
                    - **Virtual Presence**: Gestures within the "Virtual Frame" (sternum to chin).
                
                4. **Narrative Arc**:
                    - POW Opening (Curiosity/Conflict) vs. Transformative Conclusion (Call to action).
                    - **Duarte Sparklines**: Contrast between "What is" and "What could be".
                `;
                break;
            default:
                contextInstruction = `
                # PERFORMANCE COMMUNICATION CONTEXT
                - Target 140-150 WPM.
                - Focus on clarity, eye contact, and erasure of filler words.
                - Identify causal relationships between non-verbal signals and perceived confidence.
                `;
        }

        const systemInstruction = `You are an elite Spatial-Temporal Communication Coach specializing in real-time video analysis of presentations and speeches.
        
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
    ✗ Marking brief, natural pauses as problems`;

        // Convert Blob to Base64 (Proof of concept for Hackathon - for larger files, use Files API)
        const base64Video = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Find the index of the base64 data start
                // Data URLs format: "data:[<mediatype>][;base64],<data>"
                // Some mediatypes (like video/webm;codecs=vp9,opus) contain commas.
                // The base64 data is always after the LAST comma before the data itself.
                const base64Marker = ";base64,";
                const index = result.indexOf(base64Marker);
                if (index !== -1) {
                    resolve(result.substring(index + base64Marker.length));
                } else {
                    // Fallback to simpler split if marker not found
                    const lastComma = result.lastIndexOf(',');
                    if (lastComma !== -1) {
                        resolve(result.substring(lastComma + 1));
                    } else {
                        reject(new Error("Failed to parse base64 data from video blob"));
                    }
                }
            };
            reader.onerror = () => reject(new Error("FileReader error"));
            reader.readAsDataURL(videoBlob);
        });

        onStatusUpdate("Analyzing multimodal data with Gemini 3 Flash...");

        let modelName = "gemini-3-flash-preview";
        let result;
        let retryCount = 0;
        const MAX_RETRIES = 3;

        while (retryCount < MAX_RETRIES) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemInstruction
                });

                result = await model.generateContentStream([
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
                break; // If successful, exit the loop
            } catch (error: any) {
                retryCount++;
                const isOverloaded = error.message?.includes("503") || error.message?.includes("overloaded") || error.message?.includes("429");

                if (isOverloaded && retryCount < MAX_RETRIES) {
                    const waitTime = Math.pow(2, retryCount) * 2000;
                    onStatusUpdate(`Model busy or quota reached. Retrying in ${waitTime / 1000}s... (Attempt ${retryCount}/${MAX_RETRIES})`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));

                    // On last retry, try gemini-2.5-flash-latest as fallback for stability
                    if (retryCount === MAX_RETRIES - 1) {
                        modelName = "gemini-2.5-flash-latest";
                        onStatusUpdate("Switching to Gemini 2.5 fallback (stability mode)...");
                    }
                } else {
                    console.error("Gemini Critical Error:", error);
                    throw error;
                }
            }
        }

        if (!result) throw new Error("Failed to initialize analysis stream after retries.");

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
