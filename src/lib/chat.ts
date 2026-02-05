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
