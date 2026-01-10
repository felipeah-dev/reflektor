"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { sessionStore } from "@/lib/sessionStore";


export default function ActionPage() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        const loadSession = async () => {
            const data = await sessionStore.getSession();
            if (data) setSession(data);
        };
        loadSession();
    }, []);

    return (
        <div className="bg-background-dark font-display text-white min-h-screen flex flex-col overflow-x-hidden selection:bg-primary selection:text-background-dark">
            <header className="w-full border-b border-solid border-surface-hover px-6 py-4 bg-background-dark z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        className="hover:opacity-80 transition-opacity"
                        href="/"
                    >
                        <Logo textSize="text-xl" />
                    </Link>

                    <div className="flex items-center gap-4 md:gap-6">
                        <button className="bg-primary hover:bg-green-400 text-background-dark text-sm font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">
                                add_circle
                            </span>
                            <span className="hidden sm:inline">New Practice</span>
                        </button>
                        <div className="h-6 w-px bg-surface-hover hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <button
                                className="text-muted hover:text-white hover:bg-surface-hover/50 transition-colors p-2 rounded-lg"
                                title="Settings"
                            >
                                <span className="material-symbols-outlined">settings</span>
                            </button>
                            <button
                                className="text-muted hover:text-white hover:bg-surface-hover/50 transition-colors p-2 rounded-lg"
                                title="Profile"
                            >
                                <span className="material-symbols-outlined">person</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="w-full max-w-[520px] z-0 flex flex-col gap-6">
                    <div className="text-center animate-fade-in-up">
                        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary mb-4 ring-1 ring-primary/30">
                            <span className="material-symbols-outlined icon-filled text-[32px]">
                                check_circle
                            </span>
                        </div>
                        <h1 className="text-white text-[32px] md:text-[40px] font-bold leading-tight tracking-tight mb-2">
                            Analysis Completed
                        </h1>
                        <p className="text-muted text-base md:text-lg font-normal">
                            Your session has been processed successfully.
                        </p>
                    </div>
                    <div className="bg-surface-dark border border-surface-hover rounded-xl p-6 shadow-2xl backdrop-blur-sm">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-surface-hover pb-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">
                                        psychology
                                    </span>
                                    <span className="text-white font-medium">Global Score</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-white">
                                        {session?.analysis?.summary?.score || 0}<span className="text-muted text-xl font-normal">/10</span>
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-muted text-xs uppercase tracking-wider font-bold mb-1">
                                        Key Metrics
                                    </span>
                                    <span className="text-white text-sm">
                                        {session?.analysis?.summary?.eyeContact}% Eye Contact
                                    </span>
                                </div>
                                <div className="bg-[#0bda43]/10 px-3 py-1.5 rounded-lg border border-[#0bda43]/20 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[#0bda43] text-sm">
                                        trending_up
                                    </span>
                                    <span className="text-[#0bda43] text-sm font-bold">{session?.analysis?.summary?.clarity}% Clarity</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 items-start">
                        <span className="material-symbols-outlined text-primary text-xl mt-0.5">
                            lightbulb
                        </span>
                        <p className="text-[#cce8d5] text-sm font-normal leading-relaxed">
                            <span className="text-primary font-bold block mb-0.5">
                                AI Coaching Tip:
                            </span>
                            {session?.analysis?.summary?.overallFeedback || "Focus on consistency during your next practice."}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                        <p className="text-white text-center text-sm mb-2 font-medium">
                            What would you like to do now?
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="group relative w-full bg-primary hover:bg-green-400 text-background-dark font-bold text-lg py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(19,236,91,0.2)] hover:shadow-[0_0_30px_rgba(19,236,91,0.4)]"
                        >
                            <span className="material-symbols-outlined">restart_alt</span>
                            TRY AGAIN
                            <div className="absolute inset-0 rounded-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="w-full bg-surface-dark border border-surface-hover hover:border-primary/50 hover:bg-surface-hover text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-muted text-xl">
                                    bookmark
                                </span>
                                Save Practice
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-transparent border border-transparent hover:bg-white/5 text-muted hover:text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-xl">
                                    check
                                </span>
                                Finish
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <div className="w-full h-1 bg-gradient-to-r from-background-dark via-primary/20 to-background-dark"></div>
        </div>
    );
}
