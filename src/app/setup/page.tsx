"use client";

import Link from "next/link";
import { useState, useEffect, Suspense, useRef } from "react";
import { CameraPreview } from "@/components/features/media/CameraPreview";
import { AudioVisualizer } from "@/components/features/media/AudioVisualizer";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";


function SetupContent() {
    const searchParams = useSearchParams();
    const scenario = searchParams.get("scenario") || "custom";
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedVideoId, setSelectedVideoId] = useState<string>("");
    const [selectedAudioId, setSelectedAudioId] = useState<string>("");
    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);

    const [teleprompterEnabled, setTeleprompterEnabled] = useState(true);
    const [scriptText, setScriptText] = useState("");
    const [fontSize, setFontSize] = useState(30);
    const [scrollSpeed, setScrollSpeed] = useState(40);
    const [previewOffset, setPreviewOffset] = useState(0);
    const previewRequestRef = useRef<number | null>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    const isReady = hasCameraPermission === true && hasMicPermission === true;

    useEffect(() => {
        try {
            // Load persist script
            const savedScript = localStorage.getItem("reflektor_script");
            if (savedScript) setScriptText(savedScript);

            const savedPromptEnabled = localStorage.getItem("reflektor_teleprompter_enabled");
            if (savedPromptEnabled !== null) setTeleprompterEnabled(savedPromptEnabled === "true");

            const savedFontSize = localStorage.getItem("reflektor_teleprompter_font_size");
            if (savedFontSize) setFontSize(parseInt(savedFontSize));

            const savedScrollSpeed = localStorage.getItem("reflektor_teleprompter_scroll_speed");
            if (savedScrollSpeed) setScrollSpeed(parseInt(savedScrollSpeed));
        } catch (e) {
            console.warn("Storage access failed:", e);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("reflektor_script", scriptText);
            localStorage.setItem("reflektor_teleprompter_enabled", teleprompterEnabled.toString());
            localStorage.setItem("reflektor_teleprompter_font_size", fontSize.toString());
            localStorage.setItem("reflektor_teleprompter_scroll_speed", scrollSpeed.toString());
        } catch (e) {
            // Silently fail, user just won't have persistence
        }
    }, [scriptText, teleprompterEnabled, fontSize, scrollSpeed]);

    const restartPreview = () => setPreviewOffset(0);

    useEffect(() => {
        if (teleprompterEnabled && scrollSpeed > 0) {
            const animate = () => {
                setPreviewOffset(prev => prev + (scrollSpeed / 40));
                previewRequestRef.current = requestAnimationFrame(animate);
            };
            previewRequestRef.current = requestAnimationFrame(animate);
        } else {
            setPreviewOffset(0);
            if (previewRequestRef.current) cancelAnimationFrame(previewRequestRef.current);
        }
        return () => {
            if (previewRequestRef.current) cancelAnimationFrame(previewRequestRef.current);
        };
    }, [teleprompterEnabled, scrollSpeed]);

    useEffect(() => {
        if ((hasCameraPermission || hasMicPermission) && typeof navigator !== 'undefined' && navigator.mediaDevices) {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                const video = devices.filter(d => d.kind === "videoinput");
                const audio = devices.filter(d => d.kind === "audioinput");
                setVideoDevices(video);
                setAudioDevices(audio);

                if (!selectedVideoId && video.length > 0) setSelectedVideoId(video[0].deviceId);
                if (!selectedAudioId && audio.length > 0) setSelectedAudioId(audio[0].deviceId);
            }).catch(err => {
                console.error("enumerateDevices failed:", err);
            });
        }
    }, [hasCameraPermission, hasMicPermission, selectedVideoId, selectedAudioId]);

    const estimatedTime = () => {
        // Simple heuristic: 130 words per minute
        const words = scriptText.trim().split(/\s+/).filter(w => w.length > 0).length;
        const totalSeconds = Math.round((words / 130) * 60);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}m ${secs.toString().padStart(2, '0')}s`;
    };

    const paragraphs = scriptText.split('\n').filter(p => p.trim().length > 0);

    return (
        <div className="bg-background-dark min-h-screen flex flex-col font-display text-white selection:bg-primary selection:text-background-dark">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-[#28392e] px-4 lg:px-10 py-4 bg-background-dark sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="size-6 text-primary">
                        <span className="material-symbols-outlined !text-2xl">graphic_eq</span>
                    </div>
                    <h2 className="text-lg lg:text-xl font-bold tracking-tight uppercase">REFLEKTOR</h2>
                </div>

                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-[#28392e] hover:bg-[#3b5443] transition-colors text-sm font-bold text-white"
                >
                    <span className="material-symbols-outlined !text-lg">close</span>
                    <span className="truncate hidden sm:inline">Cancel session</span>
                </Link>
            </header>

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 lg:px-10 py-6 lg:py-8 flex flex-col lg:flex-row gap-8">
                <section className="flex-1 flex flex-col gap-6">
                    <div className="flex flex-col gap-2 mb-2">
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Session Setup</h1>
                        <p className="text-[#9db9a6] text-base font-normal">Check your audio, video and script to ensure the best AI analysis quality.</p>
                    </div>

                    {/* Teleprompter Live Preview (Mobile: Above Video) */}
                    {teleprompterEnabled && (
                        <div className="md:hidden w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
                            <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden h-[180px] flex flex-col items-center">
                                {/* Mobile Fades */}
                                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background-dark to-transparent z-10 pointer-events-none" />
                                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background-dark to-transparent z-10 pointer-events-none" />

                                <div className="absolute top-2 left-3 right-3 flex justify-between items-center z-20">
                                    <div className="text-[10px] font-bold text-primary/60 tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded-full border border-primary/10">Live Preview</div>
                                    <button
                                        onClick={restartPreview}
                                        className="group/reset flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-[10px] font-bold text-white/70 hover:text-white"
                                    >
                                        <span className="material-symbols-outlined !text-xs group-hover:rotate-[-120deg] transition-transform duration-500">replay</span>
                                        REINICIAR
                                    </button>
                                </div>

                                <div
                                    ref={previewContainerRef}
                                    className="w-full transition-transform duration-100 ease-linear pt-[70px] pb-[70px] flex flex-col items-center space-y-8"
                                    style={{ transform: `translateY(${-previewOffset}px)` }}
                                >
                                    {paragraphs.length > 0 ? (
                                        paragraphs.map((p, i) => (
                                            <p
                                                key={i}
                                                className="text-white font-bold text-center leading-tight tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-all duration-300"
                                                style={{ fontSize: `${fontSize}px` }}
                                            >
                                                {p}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-white/30 text-lg font-medium blur-[1.5px] text-center pt-4">Escribe tu guion abajo...</p>
                                    )}
                                </div>
                                <div className="absolute top-1/2 left-0 w-1.5 h-10 bg-primary -translate-y-1/2 rounded-r-full shadow-[0_0_15px_rgba(28,227,94,0.5)] z-20 animate-pulse"></div>
                            </div>
                        </div>
                    )}

                    <div className="relative w-full max-w-3xl mx-auto aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-[#28392e] group">
                        <CameraPreview
                            onPermissionChange={setHasCameraPermission}
                            onMicPermissionChange={setHasMicPermission}
                            onStream={setActiveStream}
                            videoDeviceId={selectedVideoId}
                            audioDeviceId={selectedAudioId}
                            videoEnabled={cameraEnabled}
                            audioEnabled={micEnabled}
                            onToggleVideo={() => setCameraEnabled(!cameraEnabled)}
                            onToggleAudio={() => setMicEnabled(!micEnabled)}
                            showOverlays={false}
                        />

                        {/* Teleprompter Live Preview (Desktop: Overlay) */}
                        {teleprompterEnabled && (
                            <div className="hidden md:block absolute inset-0 z-30 pointer-events-none">
                                <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl px-4 pointer-events-auto">
                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl relative overflow-hidden h-[300px] flex flex-col items-center">
                                        {/* Desktop Fades - Original darker style */}
                                        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />
                                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />

                                        <div className="absolute top-2 left-3 right-3 flex justify-between items-center z-20">
                                            <div className="text-[10px] font-bold text-primary/60 tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded-full border border-primary/10">Live Preview</div>
                                            <button
                                                onClick={restartPreview}
                                                className="group/reset flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-[10px] font-bold text-white/70 hover:text-white"
                                            >
                                                <span className="material-symbols-outlined !text-xs group-hover:rotate-[-120deg] transition-transform duration-500">replay</span>
                                                REINICIAR
                                            </button>
                                        </div>

                                        <div
                                            className="w-full transition-transform duration-100 ease-linear pt-[130px] pb-[130px] flex flex-col items-center space-y-12"
                                            style={{ transform: `translateY(${-previewOffset}px)` }}
                                        >
                                            {paragraphs.length > 0 ? (
                                                paragraphs.map((p, i) => (
                                                    <p
                                                        key={i}
                                                        className="text-white font-bold text-center leading-tight tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-all duration-300"
                                                        style={{ fontSize: `${fontSize}px` }}
                                                    >
                                                        {p}
                                                    </p>
                                                ))
                                            ) : (
                                                <p className="text-white/30 text-xl font-medium blur-[1.5px]">Escribe tu guion abajo...</p>
                                            )}
                                        </div>
                                        <div className="absolute top-1/2 left-0 w-1.5 h-12 bg-primary -translate-y-1/2 rounded-r-full shadow-[0_0_15px_rgba(28,227,94,0.5)] z-20 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Centering Guide Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[35%] h-[60%] border-2 border-dashed border-white/30 rounded-[50%] relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">CENTER YOUR FACE</div>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 flex gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/10">
                                <span className="material-symbols-outlined !text-sm text-primary">videocam</span>
                                <span>HD 1080p</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/10">
                                <span className="material-symbols-outlined !text-sm text-primary">mic</span>
                                <span>Stereo</span>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                onClick={() => setCameraEnabled(!cameraEnabled)}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">{cameraEnabled ? "videocam" : "videocam_off"}</span>
                            </button>
                            <button
                                onClick={() => setMicEnabled(!micEnabled)}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">{micEnabled ? "mic" : "mic_off"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Teleprompter Card */}
                    <div className="bg-[#1c271f] rounded-xl p-6 border border-[#28392e] shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined">description</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Teleprompter</h3>
                                    <p className="text-xs text-[#9db9a6]">Show your script during recording</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={teleprompterEnabled}
                                    onChange={() => setTeleprompterEnabled(!teleprompterEnabled)}
                                />
                                <div className="w-11 h-6 bg-[#28392e] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                            </label>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="relative group">
                                <textarea
                                    className="w-full p-4 rounded-lg bg-[#102216] border border-[#3b5443] text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none min-h-[120px]"
                                    placeholder="Write or paste your script or key points here..."
                                    value={scriptText}
                                    onChange={(e) => setScriptText(e.target.value)}
                                    rows={4}
                                />
                                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                    <button
                                        onClick={async () => {
                                            try {
                                                if (!navigator.clipboard) {
                                                    alert("Tu navegador no permite acceder al portapapeles automáticamente.");
                                                    return;
                                                }
                                                const text = await navigator.clipboard.readText();
                                                setScriptText(text);
                                            } catch (err) {
                                                console.error("Paste failed", err);
                                            }
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c271f] hover:bg-[#28392e] border border-[#3b5443] rounded-md text-xs font-medium transition-colors text-white"
                                    >
                                        <span className="material-symbols-outlined !text-sm">content_paste</span>
                                        Paste Script
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-[#9db9a6]">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined !text-sm">timer</span>
                                    <span>Estimated: {estimatedTime()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined !text-sm">notes</span>
                                    <span>{scriptText.length} characters</span>
                                </div>
                            </div>
                        </div>

                        {/* Teleprompter Settings (Expandable) */}
                        {teleprompterEnabled && (
                            <div className="mt-6 pt-6 border-t border-[#28392e] flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-[#9db9a6] flex items-center gap-2">
                                                <span className="material-symbols-outlined !text-sm">text_fields</span>
                                                Font Size
                                            </span>
                                            <span className="text-xs font-mono text-primary">{fontSize}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="16"
                                            max="72"
                                            value={fontSize}
                                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                                            className="w-full accent-primary bg-[#102216] h-1.5 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-[#9db9a6] flex items-center gap-2">
                                                <span className="material-symbols-outlined !text-sm">speed</span>
                                                Scroll Speed
                                            </span>
                                            <span className="text-xs font-mono text-primary">{scrollSpeed}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={scrollSpeed}
                                            onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
                                            className="w-full accent-primary bg-[#102216] h-1.5 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>


                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-[#9db9a6]">Camera</span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <span className="material-symbols-outlined !text-xl">videocam</span>
                                </div>
                                <select
                                    value={selectedVideoId}
                                    onChange={(e) => setSelectedVideoId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#1c271f] border border-[#3b5443] text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer text-sm font-medium"
                                >
                                    {videoDevices.map(device => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                                        </option>
                                    ))}
                                    {videoDevices.length === 0 && <option>No cameras found</option>}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <span className="material-symbols-outlined !text-xl">expand_more</span>
                                </div>
                            </div>
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-[#9db9a6]">Microphone</span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <span className="material-symbols-outlined !text-xl">mic</span>
                                </div>
                                <select
                                    value={selectedAudioId}
                                    onChange={(e) => setSelectedAudioId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#1c271f] border border-[#3b5443] text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer text-sm font-medium"
                                >
                                    {audioDevices.map(device => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                                        </option>
                                    ))}
                                    {audioDevices.length === 0 && <option>No microphones found</option>}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <span className="material-symbols-outlined !text-xl">expand_more</span>
                                </div>
                            </div>
                        </label>
                    </div>
                </section>

                <aside className="w-full lg:w-[360px] flex flex-col gap-6 pt-0 lg:pt-24">
                    <div className="bg-[#1c271f] rounded-xl p-6 border border-[#28392e] shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">checklist</span>
                            Checklist
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "shrink-0 size-5 rounded-full flex items-center justify-center text-background-dark mt-0.5 transition-colors",
                                    hasCameraPermission === true ? "bg-primary" : "bg-gray-700"
                                )}>
                                    <span className="material-symbols-outlined !text-sm font-bold">
                                        {hasCameraPermission === true ? "check" : "more_horiz"}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Camera detected</p>
                                    <p className="text-xs text-[#9db9a6]">Fluid video at 30fps</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "shrink-0 size-5 rounded-full flex items-center justify-center text-background-dark mt-0.5 transition-colors",
                                        hasMicPermission === true ? "bg-primary" : "bg-gray-700"
                                    )}>
                                        <span className="material-symbols-outlined !text-sm font-bold">
                                            {hasMicPermission === true ? "check" : "more_horiz"}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-sm font-bold text-white">Audio level</p>
                                            <span className="text-xs text-primary font-mono uppercase">OK</span>
                                        </div>
                                        <div className="flex items-end h-8 w-full bg-transparent">
                                            <AudioVisualizer
                                                stream={activeStream}
                                                width={160}
                                                height={32}
                                                isMuted={!micEnabled}
                                                template="checklist"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 opacity-60">
                                <div className="shrink-0 size-5 rounded-full border-2 border-gray-400 dark:border-[#3b5443] flex items-center justify-center mt-0.5"></div>
                                <div>
                                    <p className="text-sm font-bold text-white">Lighting</p>
                                    <p className="text-xs text-[#9db9a6]">Increase brightness in your environment</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 transition-opacity duration-300" style={{ opacity: hasCameraPermission === true ? 1 : 0.4 }}>
                                <div className={cn(
                                    "shrink-0 size-5 rounded-full flex items-center justify-center text-background-dark mt-0.5",
                                    hasCameraPermission === true ? "bg-primary" : "border-2 border-gray-400 dark:border-[#3b5443]"
                                )}>
                                    {hasCameraPermission === true && <span className="material-symbols-outlined !text-sm font-bold">check</span>}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Face centered</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link
                            href={isReady ? `/recording?scenario=${scenario}&videoDeviceId=${selectedVideoId}&audioDeviceId=${selectedAudioId}` : "#"}
                            className={cn(
                                "w-full bg-primary hover:bg-green-400 text-background-dark font-display font-bold text-lg h-14 rounded-lg shadow-[0_0_20px_rgba(19,236,91,0.3)] hover:shadow-[0_0_30px_rgba(19,236,91,0.5)] transition-all flex items-center justify-center gap-2 group/btn",
                                !isReady && "opacity-50 cursor-not-allowed pointer-events-none"
                            )}
                            onClick={(e) => !isReady && e.preventDefault()}
                        >
                            <div className="size-3 rounded-full bg-red-600 animate-pulse"></div>
                            START RECORDING
                            <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
                        </Link>
                        <p className="text-xs text-center text-[#9db9a6]">
                            By continuing, you accept that the session will be analyzed by our IA.
                        </p>
                    </div>
                </aside>
            </main>
        </div>
    );
}

export default function SetupPage() {
    return (
        <Suspense fallback={<div className="bg-background-dark min-h-screen flex items-center justify-center text-white">Loading setup...</div>}>
            <SetupContent />
        </Suspense>
    );
}
