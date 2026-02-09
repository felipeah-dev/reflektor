"use client";

import React, { useState, useEffect, useRef } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ResultsCanvas from "@/components/features/media/ResultsCanvas";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { ChatCoach } from "@/components/features/media/ChatCoach";
import { sessionStore, SessionData, AnalysisEvent } from "@/lib/sessionStore";
import { useNetworkQuality } from "@/hooks/useNetworkQuality";






export default function ResultsPage() {
    const router = useRouter();
    const [session, setSession] = useState<SessionData | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
    const [isVertical, setIsVertical] = useState(false);
    const requestRef = useRef<number | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const networkQuality = useNetworkQuality();


    useEffect(() => {
        const loadSession = async () => {
            const data = await sessionStore.getSession();
            if (data) {
                setSession(data);
                if (data.duration) setVideoDuration(data.duration);
            }
        };
        loadSession();
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const exportWithAnnotations = async () => {
        if (!session?.videoUrl) return;

        setIsExporting(true);
        setExportProgress(0);

        // 1. Create a separate, hidden video element for rendering
        // This decouples the export process from the user's main player.
        const hiddenVideo = document.createElement('video');
        hiddenVideo.src = session.videoUrl;
        hiddenVideo.crossOrigin = "anonymous";
        hiddenVideo.muted = false; // Must be unmuted to capture audio
        hiddenVideo.volume = 1.0;

        // Wait for metadata to know resolution
        await new Promise((resolve) => {
            hiddenVideo.onloadedmetadata = resolve;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = hiddenVideo.videoWidth || 1280;
        const height = hiddenVideo.videoHeight || 720;
        canvas.width = width;
        canvas.height = height;
        const scale = height / 720;

        const stream = canvas.captureStream(30);

        // 2. Setup Audio Capture properly
        const AudioContextClass = (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
        if (!AudioContextClass) throw new Error("AudioContext not supported");
        const audioContext = new AudioContextClass();
        const dest = audioContext.createMediaStreamDestination();
        const source = audioContext.createMediaElementSource(hiddenVideo);

        // Route audio to our recorder destination but NOT to the speakers
        source.connect(dest);

        const combinedStream = new MediaStream([
            ...stream.getVideoTracks(),
            ...dest.stream.getAudioTracks()
        ]);

        // Detect supported mime type
        const supportedTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
            'video/mp4;codecs=h264',
            'video/mp4',
            'video/quicktime'
        ];
        const mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
        const extension = mimeType.includes('mp4') || mimeType.includes('quicktime') ? 'mp4' : 'webm';

        const recorder = new MediaRecorder(combinedStream, {
            mimeType: mimeType,
            videoBitsPerSecond: 12000000 // Ultra high quality
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reflektor-feedback-${Date.now()}.${extension}`;
            a.click();

            // Clean up
            setIsExporting(false);
            setExportProgress(0);
            hiddenVideo.remove();
            audioContext.close();
        };

        // 3. Drawing Loop (tied to hidden video)
        const renderLoop = () => {
            if (hiddenVideo.ended) {
                recorder.stop();
                return;
            }

            // Draw current frame
            ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);

            // Draw Overlays - EXACTLY MATCH PREVIEW DESIGN
            const currentTime = hiddenVideo.currentTime;
            const events = session.analysis?.events || [];
            const activeEvents = events.filter((e: AnalysisEvent) => currentTime >= e.start && currentTime <= e.end);

            // 1. First, Draw ALL Bounding Boxes for ALL active events
            activeEvents.forEach((event: AnalysisEvent) => {
                if (!event.box_2d) return;
                const [ymin, xmin, ymax, xmax] = event.box_2d;
                const x = (xmin / 1000) * canvas.width;
                const y = (ymin / 1000) * canvas.height;
                const w = ((xmax - xmin) / 1000) * canvas.width;
                const h = ((ymax - ymin) / 1000) * canvas.height;

                const isWarning = event.type === 'filler' ||
                    event.type === 'spatial_warning' ||
                    event.type === 'pace_issue' ||
                    event.severity === 'high' ||
                    event.severity === 'medium';

                ctx.beginPath();
                const boxRadius = 32 * scale;
                if (ctx.roundRect) ctx.roundRect(x, y, w, h, boxRadius);
                else ctx.rect(x, y, w, h);
                ctx.strokeStyle = isWarning ? "rgba(234, 179, 8, 0.4)" : "rgba(19, 236, 91, 0.6)";
                ctx.lineWidth = 3 * scale;
                ctx.stroke();
            });

            // 2. Group events into Clusters for Pill Stacking
            let exportClusters: { events: AnalysisEvent[], minTop: number, maxBottom: number, minLeft: number, maxRight: number }[] = [];

            activeEvents.forEach((e: AnalysisEvent) => {
                if (!e.box_2d) return;
                const [ymin, xmin, ymax, xmax] = e.box_2d;
                exportClusters.push({
                    events: [e],
                    minTop: ymin,
                    maxBottom: ymax,
                    minLeft: xmin,
                    maxRight: xmax
                });
            });

            // Merge intersecting clusters horizontally
            let eMerged = true;
            while (eMerged) {
                eMerged = false;
                for (let i = 0; i < exportClusters.length; i++) {
                    for (let j = i + 1; j < exportClusters.length; j++) {
                        const overlap = !(exportClusters[i].maxRight + 50 < exportClusters[j].minLeft || exportClusters[i].minLeft - 50 > exportClusters[j].maxRight);
                        if (overlap) {
                            exportClusters[i].events.push(...exportClusters[j].events);
                            exportClusters[i].minTop = Math.min(exportClusters[i].minTop, exportClusters[j].minTop);
                            exportClusters[i].maxBottom = Math.max(exportClusters[i].maxBottom, exportClusters[j].maxBottom);
                            exportClusters[i].minLeft = Math.min(exportClusters[i].minLeft, exportClusters[j].minLeft);
                            exportClusters[i].maxRight = Math.max(exportClusters[i].maxRight, exportClusters[j].maxRight);
                            exportClusters.splice(j, 1);
                            eMerged = true;
                            break;
                        }
                    }
                    if (eMerged) break;
                }
            }

            // 3. Draw Pill Stacks Cluster by Cluster
            exportClusters.forEach((cluster) => {
                // Sort within cluster by vertical position
                cluster.events.sort((a, b) => {
                    if (!a.box_2d || !b.box_2d) return 0;
                    return a.box_2d[0] - b.box_2d[0];
                });

                const hasBottomCollision = cluster.maxBottom > 800;
                const hasTopCollision = cluster.minTop < 200;
                let stackAbove = hasBottomCollision && !hasTopCollision;
                let stackInside = hasBottomCollision && hasTopCollision;

                // Ceiling safety
                if (stackAbove && cluster.minTop < 250) {
                    stackAbove = false;
                    stackInside = hasTopCollision;
                }

                let currentYOffset = 0;
                const margin = 10 * scale;
                const topSafetyMargin = 20 * scale;

                // Position anchor
                const centerX = (cluster.minLeft + cluster.maxRight) / 2;
                const isLeft = centerX < 300;
                const isRight = centerX > 700;

                // For stacking ABOVE or INSIDE, we want the first item (topmost) to be at the TOP of the stack.
                // Since we calculate from Bottom -> Up, we must reverse the array to draw 
                // the bottom-most pill first (at the anchor) and the top-most last (at the top).
                const displayEvents = (stackAbove || stackInside) ? [...cluster.events].reverse() : cluster.events;

                displayEvents.forEach((event: AnalysisEvent) => {
                    const isError = event.type === 'filler' ||
                        event.type === 'spatial_warning' ||
                        event.type === 'pace_issue' ||
                        event.severity === 'high' ||
                        event.severity === 'medium';
                    const color = isError ? "#eab308" : "#13ec5b";
                    const count = events.filter((e: AnalysisEvent) => e.type === event.type && e.start <= event.start).length;
                    const labelText = `${event.description}${event.type === 'filler' ? ` (#${count})` : ''}`.toUpperCase();

                    const fontSize = Math.max(11, 13 * scale);
                    ctx.font = `bold ${fontSize}px 'Space Grotesk', sans-serif`;

                    const maxPillWidth = 350 * scale;
                    const pillPaddingX = 22 * scale;
                    const pillPaddingY = 14 * scale;
                    const lineSpacing = 4 * scale;

                    const words = labelText.split(' ');
                    const lines: string[] = [];
                    let currentLine = words[0];
                    for (let i = 1; i < words.length; i++) {
                        const testLine = currentLine + " " + words[i];
                        const metrics = ctx.measureText(testLine);
                        if (metrics.width > (maxPillWidth - (pillPaddingX * 3))) {
                            lines.push(currentLine);
                            currentLine = words[i];
                        } else {
                            currentLine = testLine;
                        }
                    }
                    lines.push(currentLine);

                    const textHeight = (lines.length * fontSize) + ((lines.length - 1) * lineSpacing);
                    const pillHeight = textHeight + (pillPaddingY * 2);
                    const pillWidth = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0) + (pillPaddingX * 3);

                    // Horizontal positioning
                    let pillX;
                    if (isLeft) pillX = (cluster.minLeft / 1000) * canvas.width;
                    else if (isRight) pillX = (cluster.maxRight / 1000) * canvas.width - pillWidth;
                    else pillX = (centerX / 1000) * canvas.width - (pillWidth / 2);

                    // Clamp horizontal
                    pillX = Math.max(10 * scale, Math.min(canvas.width - pillWidth - (10 * scale), pillX));

                    // Vertical calculation
                    let pillY;
                    if (stackAbove) {
                        pillY = (cluster.minTop / 1000) * canvas.height - pillHeight - (15 * scale) - currentYOffset;
                    } else if (stackInside) {
                        // Anchored to bottom of the cluster with a safety offset
                        pillY = (cluster.maxBottom / 1000) * canvas.height - pillHeight - (15 * scale) - currentYOffset;
                    } else {
                        pillY = (cluster.maxBottom / 1000) * canvas.height + (15 * scale) + currentYOffset;
                    }

                    // FINAL EDGE SAFETY CLAMPING
                    pillY = Math.max(topSafetyMargin, Math.min(canvas.height - pillHeight - topSafetyMargin, pillY));

                    currentYOffset += pillHeight + margin;

                    // Draw Pill Background
                    ctx.beginPath();
                    const radius = lines.length > 1 ? 16 * scale : pillHeight / 2;
                    if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillWidth, pillHeight, radius);
                    else ctx.rect(pillX, pillY, pillWidth, pillHeight);
                    ctx.fillStyle = "rgba(10, 20, 15, 0.95)";
                    ctx.fill();
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                    ctx.lineWidth = 1 * scale;
                    ctx.stroke();

                    // Draw Dot
                    const dotSize = 4 * scale;
                    const dotX = pillX + pillPaddingX;
                    const dotY = pillY + pillPaddingY + (fontSize / 2);
                    ctx.beginPath(); ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.shadowBlur = 10 * scale; ctx.shadowColor = color; ctx.fill();
                    ctx.shadowBlur = 0;

                    // Draw Lines
                    ctx.fillStyle = "white";
                    ctx.textAlign = "left";
                    lines.forEach((line, index) => {
                        const lineY = pillY + pillPaddingY + (index * (fontSize + lineSpacing)) + (fontSize * 0.82);
                        ctx.fillText(line, dotX + (dotSize * 3), lineY);
                    });
                });
            });

            if (!hiddenVideo.paused && !hiddenVideo.ended) {
                requestAnimationFrame(renderLoop);
            }
        };

        // Track progress via ontimeupdate for smoother values
        hiddenVideo.ontimeupdate = () => {
            if (hiddenVideo.duration > 0) {
                setExportProgress((hiddenVideo.currentTime / hiddenVideo.duration) * 100);
            }
        };

        // Start hidden process
        hiddenVideo.play();
        recorder.start();
        renderLoop();
    };



    const updateProgress = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            requestRef.current = requestAnimationFrame(updateProgress);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
            } else {
                videoRef.current.play();
                requestRef.current = requestAnimationFrame(updateProgress);
            }
        }
    };

    const handleTimeUpdate = () => {
        // Fallback or for non-playing states
        if (videoRef.current && !isPlaying) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            let duration = videoRef.current.duration;
            const width = videoRef.current.videoWidth;
            const height = videoRef.current.videoHeight;

            // Detect vertical video
            if (height > width) {
                setIsVertical(true);
            } else {
                setIsVertical(false);
            }

            // Handle Infinity duration often found in WebM blobs
            if (duration === Infinity && session?.duration) {
                duration = session.duration;
            }
            setVideoDuration(duration);

            // Fallback for Mobile/PC metadata failures
            if ((duration === 0 || isNaN(duration) || duration === Infinity) && session?.duration) {
                setVideoDuration(session.duration);
            }

            // Fix for WebM duration being Infinity: seek to end and back
            if (videoRef.current.duration === Infinity) {
                const v = videoRef.current;
                v.currentTime = 1e10;
                v.ontimeupdate = () => {
                    v.ontimeupdate = handleTimeUpdate;
                    v.currentTime = 0;
                };
            }

        }
    };



    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current && videoDuration > 0 && isFinite(videoDuration)) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            const newTime = percentage * videoDuration;
            if (isFinite(newTime)) {
                videoRef.current.currentTime = newTime;
            }
        }
    };


    const toggleFullscreen = () => {
        if (!videoContainerRef.current) return;

        // Detect if we are on a mobile device (iPhone/Android)
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            setIsPseudoFullscreen(!isPseudoFullscreen);
            // If exiting pseudo-fullscreen, also ensure we exit real fullscreen if it was active
            if (isPseudoFullscreen && document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
            return;
        }

        if (!document.fullscreenElement) {
            videoContainerRef.current.requestFullscreen().catch(() => {
                // Fallback to pseudo-fullscreen if request fails
                setIsPseudoFullscreen(true);
            });
        } else {
            document.exitFullscreen().catch(() => {
                setIsPseudoFullscreen(false);
            });
        }
    };

    // Listen for escape key to exit pseudo-fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPseudoFullscreen) {
                setIsPseudoFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPseudoFullscreen]);

    // Synchronize real fullscreen exit with pseudo state
    useEffect(() => {
        const handleFsChange = () => {
            if (!document.fullscreenElement) {
                setIsPseudoFullscreen(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const formatTimeFull = (timeInSeconds: number) => {
        const t = isNaN(timeInSeconds) ? 0 : timeInSeconds;
        const mins = Math.floor(t / 60);
        const secs = Math.floor(t % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    const formatDuration = (secs: number) => {
        const d = isNaN(secs) ? 0 : secs;
        const m = Math.floor(d / 60);
        const s = Math.floor(d % 60);
        return `${m}m ${s}s`;
    };




    return (
        <div className="bg-background-dark font-display text-white overflow-x-hidden min-h-screen flex flex-col">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-surface-dark px-4 lg:px-10 py-4 bg-background-dark z-20 sticky top-0">
                <Link
                    className="hover:opacity-80 transition-opacity"
                    href="/"
                >
                    <Logo textSize="text-lg sm:text-xl" />
                </Link>

                <div className="flex items-center gap-3 sm:gap-6">
                    <button className="hidden sm:flex cursor-pointer items-center justify-center rounded-lg h-9 sm:h-10 px-3 sm:px-5 bg-primary hover:bg-[#0fdc50] active:scale-95 transition-all text-background-dark text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] shadow-[0_0_15px_rgba(19,236,91,0.2)]">
                        <span className="material-symbols-outlined mr-1 sm:mr-2 text-[18px] sm:text-[20px]">
                            add_circle
                        </span>
                        <span className="hidden xs:inline">New Practice</span>
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
                <div className="flex flex-col gap-3 mb-6">
                    <div className="flex flex-wrap gap-2 items-center text-[10px] sm:text-xs">
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
                        <h1 className="text-white tracking-tight text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                            Results: Video with Annotations
                        </h1>
                        <div className="flex items-center gap-3 text-xs sm:text-sm text-muted bg-surface-dark px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-surface-hover w-fit">
                            <span className="material-symbols-outlined text-base sm:text-lg">
                                calendar_today
                            </span>
                            <span>{session ? new Date(session.timestamp).toLocaleDateString() : '24 Oct, 2026'}</span>
                            <span className="w-1 h-1 rounded-full bg-surface-hover"></span>
                            <span className="material-symbols-outlined text-base sm:text-lg">schedule</span>
                            <span>{session ? formatDuration(session.duration) : '2m 23s'}</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        <div
                            ref={videoContainerRef}
                            className={cn(
                                "relative transition-all mx-auto bg-black overflow-hidden",
                                // Normal Mode: standard constraints and rounded corners
                                !isPseudoFullscreen && cn(
                                    "w-full border border-surface-dark group shadow-2xl rounded-xl",
                                    isVertical ? "aspect-[9/16] max-h-[85vh] max-w-[500px]" : "aspect-video"
                                ),
                                // Fullscreen Mode: fixed fullscreen, no rounded corners, no max constraints
                                isPseudoFullscreen && "is-pseudo-fullscreen fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center bg-black"
                            )}
                        >
                            <div className="w-full h-full flex items-center justify-center">
                                {/* Inner Wrapper - Matches Video Aspect Ratio */}
                                <div className={cn(
                                    "relative",
                                    isVertical ? "aspect-[9/16]" : "aspect-video",
                                    // In fullscreen, let it scale to fit screen dimensions while maintaining aspect ratio
                                    isPseudoFullscreen ? "max-h-full max-w-full h-auto w-auto" : "w-full h-full"
                                )}>
                                    {/* Dynamic Canvas Layer or Real Video */}
                                    {session?.videoUrl ? (
                                        <>
                                            <video
                                                ref={videoRef}
                                                src={session.videoUrl}
                                                className="w-full h-full object-contain"
                                                onPlay={() => setIsPlaying(true)}
                                                onPause={() => setIsPlaying(false)}
                                                onTimeUpdate={handleTimeUpdate}
                                                onLoadedMetadata={handleLoadedMetadata}
                                                muted={isMuted}
                                                onClick={togglePlay}
                                                playsInline
                                                webkit-playsinline="true"
                                            />
                                            {/* Overlay Layer */}
                                            <div className="absolute inset-0 pointer-events-none z-20">
                                                <ResultsCanvas
                                                    analysisData={session.analysis?.events || []}
                                                    currentTime={currentTime}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 z-0">
                                            <ResultsCanvas currentTime={0} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={cn(
                                "absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 z-10",
                                isPlaying ? "opacity-0 scale-150" : "opacity-100 scale-100"
                            )}>
                                <button
                                    onClick={togglePlay}
                                    className="flex items-center justify-center rounded-full size-20 bg-primary/90 text-background-dark shadow-lg backdrop-blur-sm pointer-events-auto hover:scale-110 active:scale-95 transition-transform"
                                >
                                    <span className="material-symbols-outlined text-[40px] fill-current">
                                        play_arrow
                                    </span>
                                </button>
                            </div>


                            {/* Controls */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-4 px-6 flex flex-col gap-2">
                                <div
                                    className="relative h-6 flex items-center group/scrubber cursor-pointer"
                                    onClick={handleSeek}
                                >
                                    <div className="absolute w-full h-1.5 bg-white/20 rounded-full"></div>
                                    <div
                                        className="absolute h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(19,236,91,0.5)]"
                                        style={{ width: `${(currentTime / (videoDuration || 1)) * 100}%` }}
                                    ></div>
                                    {/* Markers - DYNAMIC from Analysis */}
                                    {(session?.analysis?.events || []).map((event: AnalysisEvent, idx: number) => {
                                        const isWarning = event.type === 'filler' ||
                                            event.type === 'spatial_warning' ||
                                            event.type === 'pace_issue' ||
                                            event.severity === 'high' ||
                                            event.severity === 'medium';
                                        return (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "absolute top-1/2 -translate-y-1/2 size-2 sm:size-3 rounded-full border-2 border-black z-10 hover:scale-150 transition-transform cursor-pointer",
                                                    isWarning ? "bg-yellow-500" : "bg-primary"
                                                )}
                                                style={{ left: `${(event.start / (videoDuration || session?.duration || 1)) * 100}%` }}
                                                title={event.type.toUpperCase()}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (videoRef.current) videoRef.current.currentTime = event.start;
                                                }}
                                            ></div>
                                        );
                                    })}
                                    <div
                                        className="absolute size-4 bg-white rounded-full shadow-md z-20 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                                        style={{ left: `${(currentTime / (videoDuration || 1)) * 100}%`, transform: 'translate(-50%, -50%)' }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={togglePlay}
                                            className="text-white hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10"
                                        >
                                            <span className="material-symbols-outlined">{isPlaying ? 'pause' : 'play_arrow'}</span>
                                        </button>
                                        <button
                                            onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)}
                                            className="text-white hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10"
                                        >
                                            <span className="material-symbols-outlined">
                                                replay_10
                                            </span>
                                        </button>
                                        <div className="text-xs font-mono font-medium tracking-wider">
                                            <span className="text-white">{formatTimeFull(currentTime)}</span>{" "}
                                            <span className="text-white/50">/</span>{" "}
                                            <span className="text-white/50">{formatTimeFull(videoDuration)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setIsMuted(!isMuted)}
                                            className="text-white hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10"
                                        >
                                            <span className="material-symbols-outlined">
                                                {isMuted ? 'volume_off' : 'volume_up'}
                                            </span>
                                        </button>
                                        <button className="text-white hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10">
                                            <span className="material-symbols-outlined">settings</span>
                                        </button>
                                        <button
                                            onClick={toggleFullscreen}
                                            className="text-white hover:text-primary transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10"
                                        >
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
                                    {session?.analysis?.summary?.pace || 0} <span className="text-sm font-normal text-muted">wpm</span>
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
                                <div className="text-2xl font-bold text-white">{session?.analysis?.summary?.sentiment || 'Analyzing...'}</div>
                                <div className="text-xs text-primary mt-1">AI Context</div>
                            </div>
                            <div className="bg-surface-dark border border-surface-hover rounded-lg p-4 flex flex-col items-start">
                                <div className="flex items-center gap-2 mb-1 text-muted text-xs uppercase tracking-wider font-bold">
                                    <span className="material-symbols-outlined text-sm">
                                        visibility
                                    </span>{" "}
                                    Eye Contact
                                </div>
                                <div className="text-2xl font-bold text-yellow-500">{session?.analysis?.summary?.eyeContact || 0}%</div>
                                <div className="text-xs text-muted mt-1">AI Gaze Tracking</div>
                            </div>
                            <div className="bg-surface-dark border border-surface-hover rounded-lg p-4 flex flex-col items-start">
                                <div className="flex items-center gap-2 mb-1 text-muted text-xs uppercase tracking-wider font-bold">
                                    <span className="material-symbols-outlined text-sm">
                                        graphic_eq
                                    </span>{" "}
                                    Clarity
                                </div>
                                <div className="text-2xl font-bold text-white">{session?.analysis?.summary?.clarity || 0}%</div>
                                <div className="text-xs text-primary mt-1">Vocal Quality</div>
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
                                    <span className="text-6xl font-bold text-primary">{Number(session?.analysis?.summary?.score || 0).toFixed(1)}</span>
                                    <span className="text-xl text-muted">/ 10</span>
                                </div>
                                <p className="text-white mt-2 leading-relaxed text-sm">
                                    {session?.analysis?.summary?.overallFeedback || "Analyzing your session with Gemini 3..."}
                                </p>
                            </div>
                        </div>
                        <div className="bg-surface-dark border border-surface-hover rounded-xl p-4 sm:p-5 shadow-lg">
                            <div className="flex items-center justify-between mb-4 sm:mb-5">
                                <div className="flex flex-col">
                                    <h3 className="text-white text-sm sm:text-base font-bold">
                                        Analysis Layers
                                    </h3>
                                    <span className="text-[10px] sm:text-xs text-muted mt-0.5">
                                        Toggle visual overlays
                                    </span>
                                </div>
                                <button className="text-[10px] sm:text-xs text-primary hover:text-white transition-colors uppercase font-bold tracking-wider">
                                    View All
                                </button>
                            </div>
                            {/* Layers List */}
                            <div className="flex flex-col gap-2 sm:gap-3">
                                <label className="group relative flex items-center justify-between p-3 sm:p-4 rounded-xl bg-surface-hover/30 border border-primary/40 cursor-pointer hover:bg-surface-hover/50 hover:border-primary/60 transition-all shadow-md">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="flex items-center justify-center size-8 sm:size-10 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                                            <span className="material-symbols-outlined !text-[18px] sm:!text-[24px]">visibility</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-primary transition-colors">
                                                Eye Contact
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] text-primary/80 font-medium tracking-wide flex items-center gap-1">
                                                <span className="size-1 rounded-full bg-primary animate-pulse"></span>{" "}
                                                Overlay Active
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input defaultChecked type="checkbox" className="sr-only peer" />
                                        <div className="w-9 sm:w-11 h-5 sm:h-6 bg-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                    </div>
                                </label>
                                {/* Other toggles simplified */}
                                <label className="group relative flex items-center justify-between p-3 sm:p-4 rounded-xl bg-surface-hover/30 border border-blue-500/40 cursor-pointer hover:bg-surface-hover/50 hover:border-blue-500/60 transition-all shadow-md">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="flex items-center justify-center size-8 sm:size-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
                                            <span className="material-symbols-outlined !text-[18px] sm:!text-[24px]">graphic_eq</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Speech Pace</span>
                                            <span className="text-[9px] sm:text-[10px] text-blue-400/80 font-medium tracking-wide">Timeline</span>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input defaultChecked type="checkbox" className="sr-only peer" />
                                        <div className="w-9 sm:w-11 h-5 sm:h-6 bg-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
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
                                <div className="grid grid-cols-[32px_1fr] gap-y-3">
                                    {(session?.analysis?.events || []).map((event: AnalysisEvent, idx: number) => {
                                        const isWarning = event.type === 'filler' ||
                                            event.type === 'spatial_warning' ||
                                            event.type === 'pace_issue' ||
                                            event.severity === 'high' ||
                                            event.severity === 'medium';
                                        return (
                                            <React.Fragment key={idx}>
                                                <div className="flex flex-col items-center gap-1 pt-1">
                                                    <span className={cn(
                                                        "material-symbols-outlined text-[20px]",
                                                        isWarning ? "text-yellow-500" : "text-primary"
                                                    )}>
                                                        {isWarning ? 'error' : 'check_circle'}
                                                    </span>
                                                    {session && session.analysis && idx < (session.analysis.events.length - 1) && (
                                                        <div className="w-[1px] bg-surface-hover h-full min-h-[40px] grow"></div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col pb-6 cursor-pointer group" onClick={() => {
                                                    if (videoRef.current) videoRef.current.currentTime = event.start;
                                                }}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={cn("text-xs font-bold", isWarning ? "text-yellow-500" : "text-primary")}>
                                                            {formatTimeFull(event.start)}
                                                        </span>
                                                        {isWarning && (
                                                            <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 rounded uppercase font-bold">Review</span>
                                                        )}
                                                    </div>
                                                    <p className="text-white text-sm font-medium group-hover:text-primary transition-colors">
                                                        {event.type.replace('_', ' ').toUpperCase()}
                                                    </p>
                                                    <p className="text-muted text-xs mt-0.5">{event.description}</p>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                    {(!session?.analysis?.events || session.analysis.events.length === 0) && (
                                        <div className="col-span-2 text-center py-10 text-muted italic">
                                            No detailed events found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mt-8 pt-6 border-t border-surface-hover">
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <button
                            onClick={() => alert("Share feature coming soon! (Blob URL: " + session?.videoUrl + ")")}
                            className="flex items-center justify-center gap-2 rounded-lg h-12 px-6 border border-surface-hover bg-surface-dark hover:bg-surface-hover hover:border-muted transition-all text-white font-bold tracking-wide sm:flex-1 lg:flex-none"
                        >
                            <span className="material-symbols-outlined text-[20px]">share</span>
                            <span>Share</span>
                        </button>
                        <button
                            onClick={exportWithAnnotations}
                            disabled={isExporting}
                            className={cn(
                                "flex items-center justify-center gap-2 rounded-lg h-12 px-6 transition-all font-bold tracking-wide shadow-lg active:scale-95 sm:flex-1 lg:flex-none min-w-0 sm:min-w-[200px]",
                                isExporting
                                    ? "bg-surface-dark text-muted cursor-not-allowed border border-surface-hover"
                                    : "bg-white hover:bg-gray-200 text-background-dark hover:shadow-xl hover:scale-105"
                            )}
                        >
                            {isExporting ? (
                                <>
                                    <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <span className="truncate">{Math.round(exportProgress)}% Exportando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">movie_edit</span>
                                    <span className="truncate">Download with Feedback</span>
                                </>
                            )}
                        </button>

                        {(networkQuality === 'poor' || networkQuality === 'offline') && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] sm:text-xs font-bold animate-pulse">
                                <span className="material-symbols-outlined text-sm">
                                    {networkQuality === 'offline' ? 'cloud_off' : 'signal_cellular_alt_1_bar'}
                                </span>
                                <span>{networkQuality === 'offline' ? 'Sin conexión a internet' : 'Conexión lenta detectada'}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => router.push('/action')}
                        className="w-full lg:w-auto flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary hover:bg-[#0fdc50] text-background-dark transition-all font-bold tracking-wide shadow-[0_0_20px_rgba(19,236,91,0.3)] hover:shadow-[0_0_25px_rgba(19,236,91,0.5)] hover:scale-105 active:scale-95 group"
                    >
                        <span>Finish Review</span>
                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </div>

                {/* AI Coaching Chatbot */}
                {session && <ChatCoach sessionData={session} />}
            </main>
        </div>
    );
}
