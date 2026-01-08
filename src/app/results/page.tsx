"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ResultsCanvas from "@/components/features/media/ResultsCanvas";
import { Logo } from "@/components/ui/Logo";



export default function ResultsPage() {
    const router = useRouter();

    return (
        <div className="bg-background-dark font-display text-white overflow-x-hidden min-h-screen flex flex-col">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-surface-dark px-6 lg:px-10 py-4 bg-background-dark z-20 sticky top-0">
                <Link
                    className="hover:opacity-80 transition-opacity"
                    href="/"
                >
                    <Logo textSize="text-xl" />
                </Link>

                <div className="flex items-center gap-6">
                    <button className="hidden md:flex cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-[#0fdc50] active:scale-95 transition-all text-background-dark text-sm font-bold leading-normal tracking-[0.015em] shadow-[0_0_15px_rgba(19,236,91,0.2)]">
                        <span className="material-symbols-outlined mr-2 text-[20px]">
                            add_circle
                        </span>
                        <span>New Practice</span>
                    </button>
                    <button className="flex items-center justify-center size-10 rounded-full text-muted hover:text-white hover:bg-surface-dark transition-colors">
                        <span className="material-symbols-outlined !text-[24px]">
                            settings
                        </span>
                    </button>
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-surface-dark hover:border-primary transition-colors cursor-pointer"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDDEyJpcaTAe2Xn6r_b2SP9GtJSkpEHgMTayVQrYybfJLoyVaAlzEquje_z12MWDm7rER8zs1ZUMCRUpFLKimEVIEKm3i2xPY5tjYZmnUXpTxG1qpLIr57ss-8bVIMl1gNfd9td31YMUS7OSqsdr8nNxPjPVw5UryXKWAIa2V6D6BT1X4LLIfIMQAxkSqVLHXaxK14zjBhhrIX0icVM8tkC50y85VxQ3J9p5ZHpxXYqyYaErVaoWsPxvQWwrBTPSlxa31pzh7lAvzS9")',
                        }}
                    ></div>
                </div>
            </header>
            <main className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto px-4 lg:px-10 py-6">
                <div className="flex flex-col gap-2 mb-6">
                    <div className="flex flex-wrap gap-2 items-center text-sm">
                        <Link
                            className="text-muted hover:text-primary transition-colors font-medium"
                            href="/"
                        >
                            Home
                        </Link>
                        <span className="text-surface-dark">/</span>
                        <span className="text-muted hover:text-primary transition-colors font-medium">
                            Practice Session
                        </span>
                        <span className="text-surface-dark">/</span>
                        <span className="text-white font-medium">Results</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <h1 className="text-white tracking-tight text-3xl lg:text-4xl font-bold leading-tight">
                            Results: Video with Annotations
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-muted bg-surface-dark px-4 py-2 rounded-full border border-surface-hover">
                            <span className="material-symbols-outlined text-lg">
                                calendar_today
                            </span>
                            <span>24 Oct, 2026</span>
                            <span className="w-1 h-1 rounded-full bg-surface-hover"></span>
                            <span className="material-symbols-outlined text-lg">schedule</span>
                            <span>2m 23s</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-surface-dark group shadow-2xl">
                            {/* Dynamic Canvas Layer */}
                            <div className="absolute inset-0 z-0">
                                <ResultsCanvas imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuBq9gvOnrKa_ap4I-A_9QP9tDU-eo6CJJDNbz7UF5pV9Qq6by2DeSK1ipYY3KkG7D0Rb02Thpej4EXaVZ_Yrl2BRLZPH1PFmqE4bhvVGehzYB-RvvusWPuerKPZjWTRVSkQxWzFNBVRPW2zvh9XSpCtnHUizK83UJjdRSlL3DleAlMmbCu1DnzV5u4yi-_BkKcm7RGNcErH5d1nxAzNI2PAqWVx-jPK7ekczXo8lpAUb7kWvzyN4m61x4WC8GqNNl_FYtOFZBdYstz8" />
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                                <button className="flex items-center justify-center rounded-full size-20 bg-primary/90 text-background-dark shadow-lg backdrop-blur-sm pointer-events-auto hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[40px] fill-current">
                                        play_arrow
                                    </span>
                                </button>
                            </div>
                            {/* Controls */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-4 px-6 flex flex-col gap-2">
                                <div className="relative h-6 flex items-center group/scrubber cursor-pointer">
                                    <div className="absolute w-full h-1.5 bg-white/20 rounded-full"></div>
                                    <div className="absolute w-[26%] h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(19,236,91,0.5)]"></div>
                                    {/* Markers */}
                                    <div
                                        className="absolute left-[15%] top-1/2 -translate-y-1/2 size-3 bg-primary rounded-full border-2 border-black z-10 hover:scale-150 transition-transform cursor-pointer"
                                        title="Strong Intro"
                                    ></div>
                                    <div
                                        className="absolute left-[32%] top-1/2 -translate-y-1/2 size-3 bg-yellow-500 rounded-full border-2 border-black z-10 hover:scale-150 transition-transform cursor-pointer"
                                        title="Filler Word"
                                    ></div>
                                    <div
                                        className="absolute left-[58%] top-1/2 -translate-y-1/2 size-3 bg-yellow-500 rounded-full border-2 border-black z-10 hover:scale-150 transition-transform cursor-pointer"
                                        title="Repetitive Gesture"
                                    ></div>
                                    <div
                                        className="absolute left-[90%] top-1/2 -translate-y-1/2 size-3 bg-primary rounded-full border-2 border-black z-10 hover:scale-150 transition-transform cursor-pointer"
                                        title="Good Pace"
                                    ></div>
                                    <div className="absolute left-[26%] top-1/2 -translate-y-1/2 size-4 bg-white rounded-full shadow-md z-20 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"></div>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-4">
                                        <button className="text-white hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">pause</span>
                                        </button>
                                        <button className="text-white hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">
                                                replay_10
                                            </span>
                                        </button>
                                        <div className="text-xs font-mono font-medium tracking-wider">
                                            <span className="text-white">0:37</span>{" "}
                                            <span className="text-white/50">/</span>{" "}
                                            <span className="text-white/50">2:23</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button className="text-white hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">
                                                volume_up
                                            </span>
                                        </button>
                                        <button className="text-white hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">settings</span>
                                        </button>
                                        <button className="text-white hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">fullscreen</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-surface-dark border border-surface-hover rounded-lg p-4 flex flex-col items-start">
                                <div className="flex items-center gap-2 mb-1 text-muted text-xs uppercase tracking-wider font-bold">
                                    <span className="material-symbols-outlined text-sm">speed</span>{" "}
                                    Pace
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    130 <span className="text-sm font-normal text-muted">wpm</span>
                                </div>
                                <div className="text-xs text-primary mt-1">Optimal Range</div>
                            </div>
                            <div className="bg-surface-dark border border-surface-hover rounded-lg p-4 flex flex-col items-start">
                                <div className="flex items-center gap-2 mb-1 text-muted text-xs uppercase tracking-wider font-bold">
                                    <span className="material-symbols-outlined text-sm">
                                        sentiment_satisfied
                                    </span>{" "}
                                    Sentiment
                                </div>
                                <div className="text-2xl font-bold text-white">Positive</div>
                                <div className="text-xs text-primary mt-1">High Confidence</div>
                            </div>
                            <div className="bg-surface-dark border border-surface-hover rounded-lg p-4 flex flex-col items-start">
                                <div className="flex items-center gap-2 mb-1 text-muted text-xs uppercase tracking-wider font-bold">
                                    <span className="material-symbols-outlined text-sm">
                                        visibility
                                    </span>{" "}
                                    Eye Contact
                                </div>
                                <div className="text-2xl font-bold text-yellow-500">68%</div>
                                <div className="text-xs text-muted mt-1">Needs Improvement</div>
                            </div>
                            <div className="bg-surface-dark border border-surface-hover rounded-lg p-4 flex flex-col items-start">
                                <div className="flex items-center gap-2 mb-1 text-muted text-xs uppercase tracking-wider font-bold">
                                    <span className="material-symbols-outlined text-sm">
                                        graphic_eq
                                    </span>{" "}
                                    Clarity
                                </div>
                                <div className="text-2xl font-bold text-white">94%</div>
                                <div className="text-xs text-primary mt-1">Excellent</div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                        <div className="bg-surface-dark border border-surface-hover rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-[100px] text-primary">
                                    analytics
                                </span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-muted text-sm uppercase font-bold tracking-wider mb-2">
                                    Overall Performance
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-bold text-primary">8.5</span>
                                    <span className="text-xl text-muted">/ 10</span>
                                </div>
                                <p className="text-white mt-2 leading-relaxed text-sm">
                                    Great presentation! Your pace and clarity were excellent. Focus
                                    on maintaining eye contact during transitions.
                                </p>
                            </div>
                        </div>
                        <div className="bg-surface-dark border border-surface-hover rounded-xl p-5 shadow-lg">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex flex-col">
                                    <h3 className="text-white text-base font-bold">
                                        Analysis Layers
                                    </h3>
                                    <span className="text-xs text-muted mt-0.5">
                                        Toggle visual overlays
                                    </span>
                                </div>
                                <button className="text-xs text-primary hover:text-white transition-colors uppercase font-bold tracking-wider">
                                    View All
                                </button>
                            </div>
                            {/* Layers List */}
                            <div className="flex flex-col gap-3">
                                <label className="group relative flex items-center justify-between p-4 rounded-xl bg-surface-hover/30 border border-primary/40 cursor-pointer hover:bg-surface-hover/50 hover:border-primary/60 transition-all shadow-md">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                                            <span className="material-symbols-outlined">visibility</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                                Eye Contact
                                            </span>
                                            <span className="text-[10px] text-primary/80 font-medium tracking-wide flex items-center gap-1">
                                                <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>{" "}
                                                Overlay Active
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input defaultChecked type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                    </div>
                                </label>
                                {/* Other toggles simplified */}
                                <label className="group relative flex items-center justify-between p-4 rounded-xl bg-surface-hover/30 border border-blue-500/40 cursor-pointer hover:bg-surface-hover/50 hover:border-blue-500/60 transition-all shadow-md">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center size-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
                                            <span className="material-symbols-outlined">graphic_eq</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Speech Pace</span>
                                            <span className="text-[10px] text-blue-400/80 font-medium tracking-wide">Timeline</span>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input defaultChecked type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        {/* Feedback Log */}
                        <div className="flex-1 bg-surface-dark border border-surface-hover rounded-xl p-0 flex flex-col min-h-[300px] overflow-hidden">
                            <div className="p-4 border-b border-surface-hover bg-surface-dark z-10">
                                <h3 className="text-white text-sm font-bold">Feedback Log</h3>
                            </div>
                            <div className="overflow-y-auto p-4 flex-1 scrollbar-hide">
                                <div className="grid grid-cols-[32px_1fr] gap-x-3">
                                    {/* Item 1 */}
                                    <div className="flex flex-col items-center gap-1 pt-1">
                                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                        <div className="w-[1px] bg-surface-hover h-full min-h-[40px] grow"></div>
                                    </div>
                                    <div className="flex flex-col pb-6 cursor-pointer group">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-primary text-xs font-bold">0:05</span>
                                        </div>
                                        <p className="text-white text-sm font-medium group-hover:text-primary transition-colors">Good Eye Contact</p>
                                        <p className="text-muted text-xs mt-0.5">Started with confident gaze.</p>
                                    </div>
                                    {/* Item 2 */}
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="material-symbols-outlined text-yellow-500 text-[20px]">error</span>
                                        <div className="w-[1px] bg-surface-hover h-full min-h-[40px] grow"></div>
                                    </div>
                                    <div className="flex flex-col pb-6 cursor-pointer group bg-surface-hover/10 -mx-2 px-2 py-2 rounded">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-yellow-500 text-xs font-bold">0:45</span>
                                            <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 rounded uppercase font-bold">Review</span>
                                        </div>
                                        <p className="text-white text-sm font-medium group-hover:text-yellow-500 transition-colors">Filler Word</p>
                                        <p className="text-muted text-xs mt-0.5">Used &quot;Uhm&quot; during pause.</p>
                                    </div>
                                    {/* Item 3 */}
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="material-symbols-outlined text-yellow-500 text-[20px]">pan_tool</span>
                                        <div className="w-[1px] bg-surface-hover h-full min-h-[40px] grow"></div>
                                    </div>
                                    <div className="flex flex-col pb-6 cursor-pointer group">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-yellow-500 text-xs font-bold">1:20</span>
                                        </div>
                                        <p className="text-white text-sm font-medium group-hover:text-yellow-500 transition-colors">Repetitive Gesture</p>
                                        <p className="text-muted text-xs mt-0.5">Hand movement is distracting.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-surface-hover">
                    <div className="flex gap-4 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg h-12 px-6 border border-surface-hover bg-surface-dark hover:bg-surface-hover hover:border-muted transition-all text-white font-bold tracking-wide">
                            <span className="material-symbols-outlined text-[20px]">share</span>
                            <span>Share</span>
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-white hover:bg-gray-200 text-background-dark transition-all font-bold tracking-wide shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
                            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                            <span>Export PDF</span>
                        </button>
                    </div>
                    <button onClick={() => router.push('/action')} className="w-full md:w-auto flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary hover:bg-[#0fdc50] text-background-dark transition-all font-bold tracking-wide shadow-[0_0_20px_rgba(19,236,91,0.3)] hover:shadow-[0_0_25px_rgba(19,236,91,0.5)] hover:scale-105 active:scale-95 group">
                        <span>Finish Review</span>
                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
