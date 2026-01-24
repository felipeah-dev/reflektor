import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getChatResponse(
    message: string,
    history: { role: 'user' | 'model', parts: { text: string }[] }[],
    sessionData: any
) {
    try {
        const tokenResponse = await fetch('/api/gemini/token');
        const { token } = await tokenResponse.json();
        const genAI = new GoogleGenerativeAI(token);

        const scenario = sessionData.scenario || "custom";
        const analysis = sessionData.analysis || {};
        const summary = analysis.summary || {};
        const events = analysis.events || [];

        const systemInstruction = `Eres "Expert Coach", un mentor experto en ${scenario}.
        Tu objetivo es ayudar al usuario de forma clara, directa y muy humana. 

        # TU PERSONALIDAD
        - **Cercano pero Profesional**: Habla como un mentor que quiere que el usuario brille. No seas un robot que lee datos.
        - **Directo al Grano**: Contesta **únicamente** lo que se te pregunta. No sueltes todo el análisis si no te lo piden.
        - **Lenguaje Sencillo**: Aunque seas un experto técnico, explica todo para que hasta un niño lo entienda. Evita tecnicismos innecesarios.
        - **Inspirador**: Da consejos que den ganas de poner en práctica.

        # CONTEXTO DE LA SESIÓN (Usa esto solo si es relevante a la pregunta)
        - Escenario: ${scenario}
        - Puntaje: ${summary.score}/10
        - Ritmo: ${summary.pace} WPM
        - Contacto Visual: ${summary.eyeContact}%
        - Feedback General: ${summary.overallFeedback}
        - Eventos detectados: ${JSON.stringify(events.slice(0, 15))}

        # REGLAS DE RESPUESTA
        1. **Si saludan (Ej: "Hola")**: Responde de forma amable y breve, ofreciéndote a contestar dudas sobre su sesión o el escenario ${scenario}. NO des el feedback completo aún.
        2. **Brevedad**: Máximo 2-3 frases por respuesta, a menos que te pidan una explicación detallada o un ejercicio.
        3. **Foco en el Escenario**: Si preguntan sobre ${scenario}, da consejos prácticos "de la vida real", no solo teoría.
        4. **Idioma**: Responde siempre en el idioma del usuario (detectado como ${summary.sentiment ? 'Español/Inglés' : 'Español'}).
        `;

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
                return response.text();
            } catch (error: any) {
                retryCount++;
                const isOverloaded = error.message?.includes("503") || error.message?.includes("overloaded") || error.message?.includes("429");

                if (retryCount < MAX_RETRIES && (isOverloaded || modelName === "gemini-3-flash-preview")) {
                    console.warn(`Chat model ${modelName} failed or busy. Switching to fallback...`);
                    modelName = "gemini-1.5-flash-latest"; // Reliable fallback
                    continue;
                } else {
                    throw error;
                }
            }
        }

        throw new Error("Chat failed after model fallbacks.");

    } catch (error) {
        console.error("ChatCoach Error:", error);
        throw error;
    }
}
