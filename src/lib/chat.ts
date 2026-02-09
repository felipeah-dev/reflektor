import { SessionData } from "./sessionStore";

export async function getChatResponse(
    message: string,
    history: { role: 'user' | 'model', parts: { text: string }[] }[],
    sessionData: SessionData
) {
    try {
        const scenario = sessionData.scenario || "custom";
        const analysis = sessionData.analysis || {
            summary: { score: 0, pace: 0, sentiment: 'neutral', eyeContact: 0, clarity: 0, overallFeedback: '' },
            events: []
        };
        const summary = analysis.summary || { score: 0, pace: 0, sentiment: 'neutral' as const, eyeContact: 0, clarity: 0, overallFeedback: '' };
        const events = analysis.events || [];

        const systemInstruction = `You are "Expert Coach", an expert mentor in ${scenario}.
        Your goal is to help the user clearly, directly, and very humanly. 

        # YOUR PERSONALITY
        - **Friendly but Professional**: Speak like a mentor who wants the user to shine. Don't be a robot reading data.
        - **Straight to the Point**: Answer **only** what is asked. Do not dump the entire analysis unless asked.
        - **Simple Language**: Even though you are a technical expert, explain everything so even a child can understand. Avoid unnecessary jargon.
        - **Inspiring**: Give advice that makes the user want to put it into practice.

        # SESSION CONTEXT (Use this only if relevant to the question)
        - Scenario: ${scenario}
        - Score: ${Number(summary.score || 0).toFixed(1)}/10
        - Pace: ${summary.pace} WPM
        - Eye Contact: ${summary.eyeContact}%
        - Overall Feedback: ${summary.overallFeedback}
        - Detected Events: ${JSON.stringify(events.slice(0, 15))}

        # RESPONSE RULES
        1. **If greeted (e.g., "Hi", "Hello")**: Respond politely and briefly, offering to answer questions about their session or the scenario ${scenario}. Do NOT give the full feedback yet.
        2. **Brevity**: Maximum 2-3 sentences per response, unless asked for a detailed explanation or an exercise.
        3. **Scenario Focus**: If asking about ${scenario}, give practical "real life" advice, not just theory.
        4. **Language**: **DEFAULT TO ENGLISH**. However, if the user writes in Spanish or another language, **YOU MUST ADAPT AND REPLY IN THAT LANGUAGE**.
        `;

        const response = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                history,
                systemInstruction
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get chat response');
        }

        const data = await response.json();
        return data.text;

    } catch (error) {
        console.error("ChatCoach Error:", error);
        throw error;
    }
}
