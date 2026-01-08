"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { CameraPreview } from "@/components/features/media/CameraPreview";
import { AudioVisualizer } from "@/components/features/media/AudioVisualizer";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function SetupContent() {
    const searchParams = useSearchParams();
    const scenario = searchParams.get("scenario") || "custom";
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

    const isReady = hasCameraPermission === true && hasMicPermission === true;

    return (
        <div className="bg-background-dark min-h-screen flex flex-col font-display text-white">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-[#28392e] px-4 lg:px-10 py-4 bg-background-dark sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="size-6 text-primary">
                        <span className="material-symbols-outlined !text-2xl">
                            graphic_eq
                        </span>
                    </div>
                    <h2 className="text-lg lg:text-xl font-bold tracking-tight">
                        REFLEKTOR
                    </h2>
                </div>
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-[#28392e] hover:bg-[#3b5443] transition-colors text-sm font-bold text-white"
                >
                    <span className="material-symbols-outlined !text-lg">close</span>
                    <span className="truncate hidden sm:inline">Cancel session</span>
                </Link>
            </header>
            {/* Main Content */}
            <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 lg:px-10 py-6 lg:py-8 flex flex-col lg:flex-row gap-8">
                {/* Left Column: Camera Preview (Hero) */}
                <section className="flex-1 flex flex-col gap-4">
                    <div className="flex flex-col gap-2 mb-2">
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
                            Session Setup
                        </h1>
                        <p className="text-[#9db9a6] text-base font-normal">
                            Check your audio and video to ensure the best AI analysis quality.
                        </p>
                    </div>
                    {/* Video Container */}
                    <CameraPreview
                        onPermissionChange={setHasCameraPermission}
                        onMicPermissionChange={setHasMicPermission}
                    />
                    {/* Device Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <label className="flex flex-col gap-2 transition-opacity" style={{ opacity: hasCameraPermission === true ? 1 : 0.6 }}>
                            <span className="text-sm font-medium text-[#9db9a6]">
                                Camera
                            </span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <span className="material-symbols-outlined !text-xl">
                                        videocam
                                    </span>
                                </div>
                                <select className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#1c271f] border border-[#3b5443] text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer text-sm font-medium">
                                    <option>FaceTime HD Camera</option>
                                    <option>Logitech C920</option>
                                    <option>OBS Virtual Camera</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <span className="material-symbols-outlined !text-xl">
                                        expand_more
                                    </span>
                                </div>
                            </div>
                        </label>
                        <label className="flex flex-col gap-2 transition-opacity" style={{ opacity: hasMicPermission === true ? 1 : 0.6 }}>
                            <span className="text-sm font-medium text-[#9db9a6]">
                                Microphone
                            </span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <span className="material-symbols-outlined !text-xl">
                                        mic
                                    </span>
                                </div>
                                <select className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#1c271f] border border-[#3b5443] text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer text-sm font-medium">
                                    <option>MacBook Pro Microphone</option>
                                    <option>Blue Yeti X</option>
                                    <option>AirPods Pro</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <span className="material-symbols-outlined !text-xl">
                                        expand_more
                                    </span>
                                </div>
                            </div>
                        </label>
                    </div>
                </section>
                {/* Right Column: Checklist & Actions */}
                <aside className="w-full lg:w-[360px] flex flex-col gap-6 pt-4 lg:pt-24">
                    {/* Checklist Card */}
                    <div className="bg-[#1c271f] rounded-xl p-6 border border-[#28392e] shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">
                                checklist
                            </span>
                            Checklist
                        </h3>
                        <div className="flex flex-col gap-4">
                            {/* Item 1: Camera */}
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "shrink-0 size-5 rounded-full flex items-center justify-center text-background-dark mt-0.5 transition-colors",
                                    hasCameraPermission === true ? "bg-primary" : "bg-gray-600"
                                )}>
                                    <span className="material-symbols-outlined !text-sm font-bold">
                                        {hasCameraPermission === true ? "check" : "close"}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">
                                        {hasCameraPermission === true ? "Camera detected" : hasCameraPermission === false ? "Camera access denied" : "Detecting camera..."}
                                    </p>
                                    <p className="text-xs text-[#9db9a6]">
                                        Fluid video at 30fps
                                    </p>
                                </div>
                            </div>
                            {/* Item 2: Audio Level */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "shrink-0 size-5 rounded-full flex items-center justify-center text-background-dark mt-0.5 transition-colors",
                                        hasMicPermission === true ? "bg-primary" : "bg-gray-600"
                                    )}>
                                        <span className="material-symbols-outlined !text-sm font-bold">
                                            {hasMicPermission === true ? "check" : "close"}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-sm font-bold">
                                                {hasMicPermission === true ? "Microphone active" : hasMicPermission === false ? "Mic access denied" : "Detecting audio..."}
                                            </p>
                                            {hasMicPermission === true && <span className="text-xs text-primary font-mono">OK</span>}
                                        </div>
                                        {/* Visualizer Bars (Mock) */}
                                        <div style={{ opacity: hasMicPermission === true ? 1 : 0.3 }}>
                                            <AudioVisualizer />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Item 3: Lighting */}
                            <div className="flex items-start gap-3 opacity-60">
                                <div className="shrink-0 size-5 rounded-full border-2 border-gray-400 dark:border-[#3b5443] flex items-center justify-center mt-0.5"></div>
                                <div>
                                    <p className="text-sm font-bold text-white">Lighting</p>
                                    <p className="text-xs text-[#9db9a6]">
                                        Increase brightness in your environment
                                    </p>
                                </div>
                            </div>
                            {/* Item 4: Framing */}
                            <div className="flex items-start gap-3 transition-opacity duration-300" style={{ opacity: hasCameraPermission === true ? 1 : 0.4 }}>
                                <div className={cn(
                                    "shrink-0 size-5 rounded-full flex items-center justify-center text-background-dark mt-0.5",
                                    hasCameraPermission === true ? "bg-primary" : "border-2 border-gray-400 dark:border-[#3b5443]"
                                )}>
                                    {hasCameraPermission === true && (
                                        <span className="material-symbols-outlined !text-sm font-bold">
                                            check
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Face Centered</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Action Area */}
                    <div className="flex flex-col gap-3">
                        <Link
                            href={isReady ? `/recording?scenario=${scenario}` : "#"}
                            className={cn(
                                "w-full font-display font-bold text-lg h-14 rounded-lg transition-all flex items-center justify-center gap-2 group/btn",
                                isReady
                                    ? "bg-primary hover:bg-green-400 text-background-dark shadow-[0_0_20px_rgba(19,236,91,0.3)] hover:shadow-[0_0_30px_rgba(19,236,91,0.5)]"
                                    : "bg-gray-700 text-gray-400 cursor-not-allowed opacity-70"
                            )}
                            onClick={(e) => !isReady && e.preventDefault()}
                        >
                            <div className={cn(
                                "size-3 rounded-full animate-pulse",
                                isReady ? "bg-red-600" : "bg-gray-500"
                            )}></div>
                            START RECORDING
                            <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">
                                arrow_forward
                            </span>
                        </Link>
                        {!isReady && (hasCameraPermission === false || hasMicPermission === false) && (
                            <p className="text-[10px] text-center text-red-400 font-medium">
                                Please enable both camera and mic access to continue
                            </p>
                        )}
                        <p className="text-xs text-center text-[#9db9a6]">
                            By continuing, you accept that the session will be analyzed by our
                            AI.
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
