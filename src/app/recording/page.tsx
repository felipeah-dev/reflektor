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
    const [seconds, setSeconds] = useState(0);

    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
    const { startRecording, stopRecording, status, recordedBlob } = useMediaRecorder();
    const isRecordingStarted = useRef(false);




    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((s) => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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
                    timestamp: Date.now()
                });
                router.push("/processing");
            }
        };
        handleRecordingStop();
    }, [status, recordedBlob, router, seconds]);



    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60)
            .toString()
            .padStart(2, "0");
        const secs = (totalSeconds % 60).toString().padStart(2, "0");
        return `${mins}:${secs}`;
    };

    const handleStop = () => {
        stopRecording();
    };



    return (
        <div className="bg-background-dark text-white h-screen flex flex-col overflow-hidden font-display selection:bg-primary selection:text-background-dark">
            {/* Header: Minimalist Top Bar */}
            <header className="w-full flex items-center justify-between px-6 py-4 md:px-10 border-b border-white/10 z-10 bg-background-dark/80 backdrop-blur-md sticky top-0">
                <Logo />

                {/* Subtle Context Indicator */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">
                        mic_external_on
                    </span>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Practice Session
                    </span>
                </div>
            </header>
            {/* Main Content: Immersive Recording Stage */}
            <main className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-8 w-full max-w-[1400px] mx-auto">
                {/* Video Feed Container */}
                <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                    {/* Reuse CameraPreview without standard overlays */}
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


                    {/* Gradient Overlay for readability */}
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

                    {/* Top Left: Recording Status */}
                    <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-10">
                        <div className="relative flex items-center justify-center size-3">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                            <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
                        </div>
                        <span className="text-white text-xs font-bold tracking-widest uppercase">
                            Recording...
                        </span>
                    </div>
                    {/* Top Right: Audio Waveform Visualization */}
                    <div className="absolute top-6 right-6 flex items-end gap-1 h-8">
                        <AudioVisualizer stream={activeStream} />
                    </div>
                    {/* Bottom Center: Timer */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="font-display font-medium text-white/60 text-sm tracking-widest mb-2 uppercase">
                            Elapsed Time
                        </div>
                        <div className="flex items-baseline gap-1 font-variant-numeric tabular-nums text-white text-5xl md:text-7xl font-light tracking-tighter drop-shadow-lg">
                            <span>{formatTime(seconds)}</span>
                        </div>
                        {status === 'stopped' && (
                            <div className="mt-4 text-primary text-sm font-bold animate-pulse">
                                Processing media chunks...
                            </div>
                        )}
                    </div>

                </div>
                {/* Control Bar (Bottom Floating) */}
                <div className="mt-8 flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full max-w-3xl justify-center z-10">
                    {/* Secondary Toggles */}
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

                    {/* Primary Action */}
                    <div className="order-1 md:order-2 flex-grow md:flex-grow-0">
                        <button
                            onClick={handleStop}
                            className="flex items-center gap-3 bg-primary hover:bg-[#15bd4e] text-background-dark px-8 py-3.5 rounded-full font-bold text-base md:text-lg transition-all transform hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(28,227,94,0.4)] w-full md:w-auto justify-center"
                        >
                            <span className="material-symbols-outlined filled">
                                stop_circle
                            </span>
                            <span>End Session</span>
                        </button>
                    </div>
                    {/* Settings / Help */}
                    <div className="flex items-center gap-4 order-3">
                        <button
                            className="group flex items-center justify-center size-12 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/5 text-white"
                            title="Settings"
                        >
                            <span className="material-symbols-outlined text-[24px] group-hover:rotate-45 transition-transform">
                                settings
                            </span>
                        </button>
                    </div>
                </div>
                {/* Micro-copy Hint */}
                <p className="mt-6 text-sm text-gray-400 font-medium animate-pulse">
                    Focus on your pace and tone.
                </p>
            </main>
        </div>
    );
}

export default function RecordingPage() {
    return (
        <Suspense fallback={<div className="bg-background-dark min-h-screen flex items-center justify-center text-white">Loading recording...</div>}>
            <RecordingContent />
        </Suspense>
    );
}

