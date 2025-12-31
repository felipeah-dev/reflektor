"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CameraPreviewProps {
    showOverlays?: boolean;
    onPermissionChange?: (allowed: boolean) => void;
    onStream?: (stream: MediaStream) => void;
}

export function CameraPreview({
    showOverlays = true,
    onPermissionChange,
    onStream
}: CameraPreviewProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [permissionError, setPermissionError] = useState(false);

    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false, // Audio handled separately if needed for visualizer, or just requesting permission
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setPermissionError(false);
                onPermissionChange?.(true);
                onStream?.(stream);
            } catch (err) {
                console.error("Camera access denied:", err);
                setPermissionError(true);
                onPermissionChange?.(false);
            }
        }

        startCamera();

        return () => {
            // Cleanup stream
            if (videoRef.current && videoRef.current.srcObject) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach((track) => track.stop());
            }
        };
    }, []);

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-200 dark:ring-[#28392e] group">
            {/* Live Preview Placeholder or Video */}
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={cn(
                    "absolute inset-0 size-full object-cover transform -scale-x-100 transition-opacity duration-300",
                    permissionError ? "opacity-0" : "opacity-100"
                )}
            />

            {permissionError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white flex-col gap-2">
                    <span className="material-symbols-outlined text-4xl text-red-500">videocam_off</span>
                    <p className="text-sm">Camera access denied</p>
                </div>
            )}

            {!permissionError && showOverlays && (
                <>
                    {/* Face Framing Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[35%] h-[60%] border-2 border-dashed border-white/30 rounded-[50%] relative">
                            {/* Corner Markers */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
                                Center your face
                            </div>
                        </div>
                    </div>

                    {/* Status Indicators Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/10">
                            <span className="material-symbols-outlined !text-sm text-primary">
                                videocam
                            </span>
                            <span>HD 1080p</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/10">
                            <span className="material-symbols-outlined !text-sm text-primary">
                                mic
                            </span>
                            <span>Stereo</span>
                        </div>
                    </div>

                    {/* Bottom Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
                            title="Toggle Camera"
                        >
                            <span className="material-symbols-outlined">videocam_off</span>
                        </button>
                        <button
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
                            title="Toggle Mic"
                        >
                            <span className="material-symbols-outlined">mic_off</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
