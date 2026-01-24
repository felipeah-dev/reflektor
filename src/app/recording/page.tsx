"use client";

import { useState, useEffect, useRef, Suspense } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { CameraPreview } from "@/components/features/media/CameraPreview";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { sessionStore } from "@/lib/sessionStore";
import { AudioVisualizer } from "@/components/features/media/AudioVisualizer";






function RecordingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const videoDeviceId = searchParams.get("videoDeviceId") || undefined;
    const audioDeviceId = searchParams.get("audioDeviceId") || undefined;
    const scenario = searchParams.get("scenario") || "custom";
    const [seconds, setSeconds] = useState(0);

    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
    const { startRecording, stopRecording, status, recordedBlob } = useMediaRecorder();
    const isRecordingStarted = useRef(false);

    // Teleprompter Logic
    const [teleprompterEnabled, setTeleprompterEnabled] = useState(false);
    const [scriptText, setScriptText] = useState("");
    const [fontSize, setFontSize] = useState(30); // 1-100 range
    const [scrollSpeed, setScrollSpeed] = useState(40); // 1-100 range
    const [scrollOffset, setScrollOffset] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        const savedScript = localStorage.getItem("reflektor_script") || "";
        setScriptText(savedScript);

        const savedEnabled = localStorage.getItem("reflektor_teleprompter_enabled");
        if (savedEnabled !== null) setTeleprompterEnabled(savedEnabled === "true");

        const savedFontSize = localStorage.getItem("reflektor_teleprompter_font_size");
        if (savedFontSize) setFontSize(parseInt(savedFontSize));

        const savedScrollSpeed = localStorage.getItem("reflektor_teleprompter_scroll_speed");
        if (savedScrollSpeed) setScrollSpeed(parseInt(savedScrollSpeed));
    }, []);

    useEffect(() => {
        if (status !== 'recording') return;

        const interval = setInterval(() => {
            setSeconds((s) => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [status]);

    useEffect(() => {
        if (activeStream && !isRecordingStarted.current) {
            startRecording(activeStream);
            isRecordingStarted.current = true;
        }
    }, [activeStream, startRecording]);

    useEffect(() => {
        const handleRecordingStop = async () => {
            if (status === 'stopped' && recordedBlob) {
                await sessionStore.setSession({
                    videoBlob: recordedBlob,
                    duration: seconds,
                    timestamp: Date.now(),
                    scenario: scenario
                });
                router.push("/processing");
            }
        };
        handleRecordingStop();
    }, [status, recordedBlob, router, seconds, scenario]);

    // Auto-scroll animation - Fluid & Precise
    useEffect(() => {
        if (teleprompterEnabled && isRecordingStarted.current && status === 'recording') {
            const animate = () => {
                setScrollOffset(prev => prev + (scrollSpeed / 40));
                requestRef.current = requestAnimationFrame(animate);
            };
            requestRef.current = requestAnimationFrame(animate);
        } else if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [teleprompterEnabled, scrollSpeed, status]);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
        const s = (totalSeconds % 60).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    const handleStop = () => {
        stopRecording();
    };

    const paragraphs = scriptText.split('\n').filter(p => p.trim().length > 0);

    return (
        <div className="bg-background-dark text-white h-screen flex flex-col overflow-hidden font-display selection:bg-primary selection:text-background-dark">
            <header className="w-full flex items-center justify-between px-6 py-4 md:px-10 border-b border-white/10 z-20 bg-background-dark/80 backdrop-blur-md sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="text-primary">
                        <span className="material-symbols-outlined text-3xl">emergency_recording</span>
                    </div>
                    <h2 className="text-lg md:text-xl font-bold tracking-tight uppercase">REFLEKTOR</h2>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">mic_external_on</span>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Practice Session</span>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-8 w-full max-w-[1400px] mx-auto">
                <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                    <div className="absolute inset-0">
                        <CameraPreview
                            showOverlays={false}
                            audioEnabled={micEnabled}
                            videoEnabled={cameraEnabled}
                            videoDeviceId={videoDeviceId}
                            audioDeviceId={audioDeviceId}
                            onToggleVideo={() => setCameraEnabled(!cameraEnabled)}
                            onToggleAudio={() => setMicEnabled(!micEnabled)}
                            onStream={setActiveStream}
                        />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>

                    {/* Teleprompter Overlay*/}
                    {(teleprompterEnabled && paragraphs.length > 0) && (
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl px-4 z-30">
                            {/* Teleprompter Box - Fluid Scroll Implementation */}
                            <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden h-[320px]">
                                {/* Top and Bottom Fades - Smoother Gradient */}
                                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />

                                <div
                                    className="pt-[140px] pb-[140px] space-y-12 transition-transform duration-100 ease-linear flex flex-col items-center"
                                    style={{ transform: `translateY(-${scrollOffset}px)` }}
                                >
                                    {paragraphs.map((p, i) => {
                                        // Dynamic styling based on distance to visual center (160px from top of container)
                                        // Each line is spaced by margin/padding.
                                        // This creates a smooth focus/blur transition
                                        return (
                                            <p
                                                key={i}
                                                className={cn(
                                                    "text-white font-bold text-center leading-tight tracking-tight transition-all duration-300",
                                                    "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
                                                )}
                                                style={{
                                                    fontSize: `${fontSize}px`,
                                                    // This is where the magic happens:
                                                    // We render all paragraphs and let them slide.
                                                }}
                                            >
                                                {p}
                                            </p>
                                        );
                                    })}
                                </div>

                                {/* Reading Indicator Line - Now with active pulse */}
                                <div className="absolute top-1/2 left-0 w-1.5 h-12 bg-primary -translate-y-1/2 rounded-r-full shadow-[0_0_15px_rgba(28,227,94,0.5)] z-20 animate-pulse"></div>
                            </div>
                            <div
                                className="absolute bottom-0 left-0 h-1 bg-primary/40 transition-all duration-300"
                                style={{ width: `${Math.min((scrollOffset / (paragraphs.length * 80)) * 100, 100)}%` }}
                            />
                        </div>
                    )}

                    <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-10">
                        <div className="relative flex items-center justify-center size-3">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                            <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
                        </div>
                        <span className="text-white text-xs font-bold tracking-widest uppercase">Recording...</span>
                    </div>

                    <div className="absolute top-6 right-6 flex items-end gap-1 h-6">
                        <AudioVisualizer stream={activeStream} />
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="font-display font-medium text-white/60 text-sm tracking-widest mb-2 uppercase">Elapsed Time</div>
                        <div className="flex items-baseline gap-1 font-variant-numeric tabular-nums text-white text-5xl md:text-7xl font-light tracking-tighter drop-shadow-lg">
                            <span>{formatTime(seconds)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full max-w-4xl justify-center z-10">
                    <div className="flex items-center gap-4 order-2 md:order-1">
                        <button
                            onClick={() => setMicEnabled(!micEnabled)}
                            className={cn(
                                "group flex items-center justify-center size-12 rounded-full transition-all border text-white",
                                micEnabled ? "bg-white/10 hover:bg-white/20 border-white/5" : "bg-red-500/20 border-red-500 text-red-500"
                            )}
                            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
                        >
                            <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">
                                {micEnabled ? "mic" : "mic_off"}
                            </span>
                        </button>
                        <button
                            onClick={() => setCameraEnabled(!cameraEnabled)}
                            className={cn(
                                "group flex items-center justify-center size-12 rounded-full transition-all border text-white",
                                cameraEnabled ? "bg-white/10 hover:bg-white/20 border-white/5" : "bg-red-500/20 border-red-500 text-red-500"
                            )}
                            title={cameraEnabled ? "Disable Camera" : "Enable Camera"}
                        >
                            <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">
                                {cameraEnabled ? "videocam" : "videocam_off"}
                            </span>
                        </button>
                    </div>

                    <div className="order-1 md:order-2 flex-grow md:flex-grow-0">
                        <button
                            onClick={handleStop}
                            className="flex items-center gap-3 bg-primary hover:bg-[#15bd4e] text-background-dark px-10 py-4 rounded-full font-bold text-base md:text-lg transition-all transform hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(28,227,94,0.4)] w-full md:w-auto justify-center"
                        >
                            <span className="material-symbols-outlined filled">stop_circle</span>
                            <span>End Session</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 order-3">
                        <button
                            onClick={() => setTeleprompterEnabled(!teleprompterEnabled)}
                            className={cn(
                                "group flex items-center justify-center size-12 rounded-full transition-all border shadow-lg",
                                teleprompterEnabled ? "bg-primary text-background-dark border-primary/20 shadow-primary/20" : "bg-white/10 border-white/5 text-white"
                            )}
                            title="Toggle Teleprompter"
                        >
                            <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">description</span>
                        </button>
                        <button
                            className="group flex items-center justify-center size-12 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/5 text-white"
                            title="Settings"
                        >
                            <span className="material-symbols-outlined text-[24px] group-hover:rotate-45 transition-transform">settings</span>
                        </button>
                    </div>
                </div>
                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 font-medium opacity-80 animate-pulse">
                    Maintain eye contact with the camera while reading.
                </p>
            </main >
        </div >
    );
}

export default function RecordingPage() {
    return (
        <Suspense fallback={<div className="bg-background-dark min-h-screen flex items-center justify-center text-white">Loading recording...</div>}>
            <RecordingContent />
        </Suspense>
    );
}

