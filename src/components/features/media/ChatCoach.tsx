"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getChatResponse } from "@/lib/chat";
import { useNetworkQuality } from "@/hooks/useNetworkQuality";
import { SessionData } from "@/lib/sessionStore";

interface Message {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
    retryData?: string;
}

interface ChatCoachProps {
    sessionData: SessionData;
}

export function ChatCoach({ sessionData }: ChatCoachProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            text: `Hi! I've analyzed your ${sessionData.scenario || 'practice'} session. I see you scored ${sessionData.analysis?.summary?.score || 0}/10. How can I help you improve today?`
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const networkQuality = useNetworkQuality();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const [viewportHeight, setViewportHeight] = useState<number | null>(null);

    // Dynamic viewport height handling for mobile keyboards and orientation changes
    useEffect(() => {
        const handleResize = () => {
            if (window.visualViewport) {
                setViewportHeight(window.visualViewport.height);
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            window.visualViewport.addEventListener('scroll', handleResize);
            // Initial set
            setViewportHeight(window.visualViewport.height);
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
                window.visualViewport.removeEventListener('scroll', handleResize);
            }
        };
    }, []);

    const handleSend = async (forcedValue?: string) => {
        const textToSubmit = forcedValue || inputValue;
        if (!textToSubmit.trim() || isLoading) return;

        if (networkQuality === 'offline') {
            setMessages(prev => [
                ...prev,
                { role: 'user', text: textToSubmit },
                { role: 'model', text: "Sorry, it looks like you're offline. I can't respond right now." }
            ]);
            setInputValue("");
            return;
        }

        const userMsg = textToSubmit.trim();
        if (!forcedValue) setInputValue("");

        // Remove previous error message if this is a retry
        if (forcedValue) {
            setMessages(prev => prev.filter(m => !m.isError));
        } else {
            setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        }

        setIsLoading(true);

        try {
            const history = messages
                .slice(1)
                .filter(m => !m.isError)
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            const response = await getChatResponse(userMsg, history, sessionData);
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (error: unknown) {
            const err = error as Error;
            console.error("Chat Error:", err);

            let errorText = "Lo siento, tuve un problema conectando con mi cerebro de IA. ¿Podrías intentar de nuevo?";

            if (err.message?.includes("QUOTA_EXHAUSTED")) {
                errorText = "Se ha agotado la cuota de todas las API keys disponibles. Por favor, intenta de nuevo en unos minutos.";
            } else if (networkQuality === 'poor') {
                errorText = "Parece que hay problemas con tu conexión. No he podido procesar tu respuesta, ¿podrías reintentar?";
            }

            setMessages(prev => [...prev, {
                role: 'model',
                text: errorText,
                isError: true,
                retryData: userMsg
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            {/* Chat Window */}
            <div
                className={cn(
                    "w-full sm:w-96 rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 border border-white/20 origin-bottom sm:origin-bottom-right pointer-events-auto",
                    // Backdrop-blur-xl (original) and 90% opacity for better mobile contrast
                    "backdrop-blur-xl bg-surface-dark/90",
                    // Use max-h with viewport units for better stability
                    "max-h-[min(85vh,600px)] landscape:max-h-[min(70vh,400px)]",
                    isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 scale-95 pointer-events-none h-0"
                )}>
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center p-[2px]">
                            <div className="bg-surface-dark rounded-full w-full h-full flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined !text-[20px]">psychology</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white leading-tight">Expert Coach</h4>
                            <p className="text-[10px] text-primary/80 uppercase tracking-widest font-bold">
                                {sessionData.scenario === 'sales' ? 'Sales Strategy Expert' :
                                    sessionData.scenario === 'pitch' ? 'Startup Pitch Expert' :
                                        'Communication Expert'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/50 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Messages Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide bg-black/40 min-h-[150px]"
                >
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex flex-col gap-1.5 max-w-[85%]",
                                msg.role === 'user' ? "self-end" : "self-start"
                            )}
                        >
                            <div className={cn(
                                "p-3 rounded-2xl border backdrop-blur-md text-sm leading-relaxed",
                                msg.role === 'user'
                                    ? "bg-primary/20 border-primary/20 rounded-tr-none text-white/90"
                                    : "bg-white/10 border-white/5 rounded-tl-none text-white/90"
                            )}>
                                {msg.text}
                                {msg.isError && msg.retryData && (
                                    <button
                                        onClick={() => handleSend(msg.retryData)}
                                        className="mt-2 flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                                        REINTENTAR
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-1 px-1 py-2">
                            <span className="size-1.5 bg-primary/60 rounded-full animate-bounce"></span>
                            <span className="size-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="size-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="relative group"
                    >
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                            placeholder="Ask your coach..."
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-background-dark transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                    </form>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="size-14 sm:size-16 rounded-full bg-primary shadow-[0_0_30px_rgba(19,236,91,0.4)] flex items-center justify-center text-background-dark hover:scale-110 active:scale-95 transition-all group overflow-hidden border-4 border-background-dark pointer-events-auto"
            >
                <span className={cn(
                    "material-symbols-outlined text-[28px] sm:text-[32px] transition-transform duration-500",
                    isOpen ? "rotate-180" : "group-hover:rotate-12"
                )}>
                    {isOpen ? 'close' : 'chat_bubble'}
                </span>
            </button>
        </div>
    );
}
