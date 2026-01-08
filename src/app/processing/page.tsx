"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProcessingPage() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (progress >= 100) {
            router.push("/results");
        }
    }, [progress, router]);

    useEffect(() => {
        // Simulate progress
        const interval = setInterval(() => {
            setProgress((p) => {
                if (p >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return p + 1; // 1% every 50ms = 5 seconds total
            });
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-background-dark text-white font-display overflow-x-hidden min-h-screen flex flex-col">
            <div className="w-full border-b border-[#28392e] bg-background-dark/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <header className="flex items-center justify-between h-16">
                        <Link className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity" href="/">
                            <div className="size-8 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">hexagon</span>
                            </div>
                            <h2 className="text-white text-xl font-bold tracking-tight">REFLEKTOR</h2>
                        </Link>
                    </header>
                </div>
            </div>
            <main className="flex-1 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="w-full max-w-[1024px] flex flex-col gap-8 z-10">
                    <div className="flex flex-col gap-2 text-center md:text-left">
                        <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                            Processing your Session
                        </h1>
                        <p className="text-[#9db9a6] text-lg font-light">
                            We are analyzing your multimodal data with AI. Please do not close this window.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-4">
                        <div className="flex flex-col gap-6 order-2 lg:order-1">
                            <div className="relative w-full aspect-video lg:aspect-square bg-surface-dark rounded-2xl overflow-hidden border border-[#28392e] shadow-2xl shadow-black/50 group">
                                <div
                                    className="absolute inset-0 bg-center bg-cover opacity-80 mix-blend-screen"
                                    data-alt="Processing visualization"
                                    style={{
                                        backgroundImage:
                                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDTTGCm8BSNv-XMWkgPCOi3bEbw5YwRrhhfV9qOpzzxG0Ha3J7iYa0ZkMymhuARsrVZn68FFKoEujXpRP7qduDYtj6Qd50ku8XypHwn4TzkUK9Y8k1A4V6yOQwuLk5tBCdra7ZIcwFu1srLGR3ewrlpGSF3rY9xmzT4HcGykuaA3XUjWu30N22F8gxtjkOzGlV9nZdMOXwW5PSRAonMTs9aIUomz4jMwAafzfvSrJ-W2CeYh3XHKqw0exHLLp9tBj4y4WGoK7nbJIt7")',
                                    }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-90"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative size-24 md:size-32">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                                        <div className="absolute inset-2 bg-primary/10 rounded-full border border-primary/30 backdrop-blur-sm flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl md:text-5xl text-primary animate-pulse">
                                                psychology
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Scanning Effect */}
                                <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent w-full -translate-y-full animate-[scan_3s_ease-in-out_infinite]"></div>
                            </div>
                            <div className="flex flex-col gap-3 bg-surface-dark p-5 rounded-xl border border-[#28392e]">
                                <div className="flex gap-6 justify-between items-center">
                                    <p className="text-white text-sm font-medium uppercase tracking-wider">
                                        Total Progress
                                    </p>
                                    <p className="text-primary text-sm font-bold font-mono">
                                        {progress}%
                                    </p>
                                </div>
                                <div className="h-2 w-full bg-[#28392e] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full relative overflow-hidden transition-all duration-100 ease-out"
                                        style={{ width: `${progress}%` }}
                                    >
                                        {/* Stripes using CSS standard background since tailwind arbitrary variants can be tricky with complex gradients */}
                                        <div className="absolute top-0 left-0 bottom-0 right-0 animate-[progress-stripes_1s_linear_infinite]"
                                            style={{
                                                backgroundImage: `linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)`,
                                                backgroundSize: '1rem 1rem'
                                            }}
                                        />
                                    </div>
                                </div>
                                <p className="text-[#9db9a6] text-xs">
                                    Estimated time remaining: ~{Math.max(0, 5 - Math.floor(progress / 20))} seconds
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col h-full justify-between order-1 lg:order-2 gap-6">
                            <div className="bg-surface-dark/50 p-6 md:p-8 rounded-2xl border border-[#28392e] flex-1">
                                <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">terminal</span>
                                    Analysis Log
                                </h3>
                                {/* Visual Fake Log */}
                                <div className="grid grid-cols-[32px_1fr] gap-x-4">
                                    {/* Step 1 */}
                                    <div className="flex flex-col items-center">
                                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                                            <span className="material-symbols-outlined text-lg">check</span>
                                        </div>
                                        <div className="w-px bg-primary/30 h-full min-h-[40px]"></div>
                                    </div>
                                    <div className="pb-8 pt-1">
                                        <p className="text-white text-base font-medium">Uploading secure video</p>
                                        <p className="text-primary/70 text-sm mt-1">Completed</p>
                                    </div>
                                    {/* Step 2 */}
                                    <div className="flex flex-col items-center">
                                        <div className="size-8 rounded-full bg-primary flex items-center justify-center text-background-dark shadow-[0_0_15px_rgba(19,236,91,0.4)] z-10">
                                            <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                                        </div>
                                        <div className="w-px bg-[#28392e] h-full min-h-[40px]"></div>
                                    </div>
                                    <div className="pb-8 pt-1">
                                        <p className="text-white text-lg font-bold animate-pulse">Analyzing your eye contact...</p>
                                        <p className="text-[#9db9a6] text-sm mt-1">Detecting focal points and deviations.</p>
                                    </div>
                                    {/* Step 3 */}
                                    <div className="flex flex-col items-center">
                                        <div className="size-8 rounded-full bg-transparent border-2 border-[#28392e] flex items-center justify-center text-[#28392e]">
                                            <span className="material-symbols-outlined text-lg">radio_button_unchecked</span>
                                        </div>
                                    </div>
                                    <div className="pt-1 opacity-50">
                                        <p className="text-white text-base font-medium">Generating personalized feedback</p>
                                    </div>
                                </div>
                            </div>
                            {/* Tip */}
                            <div className="bg-gradient-to-r from-primary/10 to-transparent p-5 rounded-xl border-l-4 border-primary flex items-start gap-4">
                                <div className="p-2 bg-primary/20 rounded-lg text-primary shrink-0">
                                    <span className="material-symbols-outlined">lightbulb</span>
                                </div>
                                <div>
                                    <p className="text-primary font-bold text-sm mb-1 uppercase tracking-wider">Did you know...</p>
                                    <p className="text-white text-sm leading-relaxed">
                                        Pausing for 2 seconds before answering complex questions demonstrates reflection and increases perceived authority.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <style jsx>{`
        @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(200%); }
        }
        @keyframes progress-stripes {
            from { background-position: 1rem 0; }
            to { background-position: 0 0; }
        }
      `}</style>
        </div>
    );
}
