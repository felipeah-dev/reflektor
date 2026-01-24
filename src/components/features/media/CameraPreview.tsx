"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CameraPreviewProps {
    showOverlays?: boolean;
    onPermissionChange?: (allowed: boolean) => void;
    onMicPermissionChange?: (allowed: boolean) => void;
    onStream?: (stream: MediaStream | null) => void;
    audioEnabled?: boolean;
    videoEnabled?: boolean;
    audioDeviceId?: string;
    videoDeviceId?: string;
    onToggleVideo?: () => void;
    onToggleAudio?: () => void;
}



export function CameraPreview({
    showOverlays = true,
    onPermissionChange,
    onMicPermissionChange,
    onStream,
    audioEnabled = true,
    videoEnabled = true,
    audioDeviceId,
    videoDeviceId,
    onToggleVideo,
    onToggleAudio
}: CameraPreviewProps) {


    const videoRef = useRef<HTMLVideoElement>(null);
    const activeStreamRef = useRef<MediaStream | null>(null);
    const isInitializingRef = useRef(false);
    const [permissionError, setPermissionError] = useState(false);
    const [errorName, setErrorName] = useState<string | null>(null);
    const prevVideoDeviceIdRef = useRef<string | undefined>(videoDeviceId);
    const prevAudioDeviceIdRef = useRef<string | undefined>(audioDeviceId);



    async function startCamera() {
        if (isInitializingRef.current) return;
        isInitializingRef.current = true;

        setErrorName(null);
        let stream: MediaStream | null = null;
        let videoOk = false;
        let audioOk = false;

        // Step 1: Try to get both together
        try {
            const constraints: MediaStreamConstraints = {
                video: videoDeviceId
                    ? { deviceId: { exact: videoDeviceId } }
                    : { facingMode: "user" }, // Use front camera by default on mobile
                audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true
            };
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoOk = true;
            audioOk = true;
        } catch (err: any) {

            console.warn("Combined hardware access failed, probing individually...", err.name);
            // Don't set errorName yet, let's see what happens with individual probes

            // Step 2: Probe Video
            try {
                // Try with ideal deviceId instead of exact if first try failed, or facingMode
                const videoConstraints = videoDeviceId
                    ? { deviceId: videoDeviceId }
                    : { facingMode: "user" };
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
                stream = videoStream;
                videoOk = true;
            } catch (vErr: any) {
                console.error("Video probe failed:", vErr);
                videoOk = false;
                setErrorName(vErr.name);
            }

            // Small delay to let the browser settle after a potential denial
            await new Promise(resolve => setTimeout(resolve, 150));

            // Step 3: Probe Audio
            try {
                const audioConstraints = audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true;
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });

                if (stream) {
                    audioStream.getTracks().forEach(t => stream?.addTrack(t));
                } else {
                    stream = audioStream;
                }
                audioOk = true;
            } catch (aErr: any) {

                console.error("Audio probe failed:", aErr);
                audioOk = false;
                // If video worked but audio failed, we might want to know, but video usually takes precedence for the overlay
            }
        }


        if (stream) {
            activeStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Important for mobile browsers (iOS/Chrome Android)
                videoRef.current.play().catch(e => console.error("Video play failed:", e));
            }

            stream.getTracks().forEach(track => {
                // Initial state
                if (track.kind === 'video') track.enabled = videoEnabled;
                if (track.kind === 'audio') track.enabled = audioEnabled;

                setupTrackListeners(track);
            });


            onStream?.(stream);
        }

        setPermissionError(!videoOk);
        onPermissionChange?.(videoOk);
        onMicPermissionChange?.(audioOk);
        isInitializingRef.current = false;
    }

    useEffect(() => {
        const videoChanged = prevVideoDeviceIdRef.current !== videoDeviceId;
        const audioChanged = prevAudioDeviceIdRef.current !== audioDeviceId;

        prevVideoDeviceIdRef.current = videoDeviceId;
        prevAudioDeviceIdRef.current = audioDeviceId;

        if (activeStreamRef.current && (videoChanged || audioChanged)) {
            // Surgical update
            const updateTracks = async () => {
                const stream = activeStreamRef.current;
                if (!stream) return;

                if (videoChanged) {
                    // Stop old video tracks
                    stream.getVideoTracks().forEach(t => {
                        t.stop();
                        stream.removeTrack(t);
                    });
                    try {
                        const vConstraints = videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true;
                        const newVideoStream = await navigator.mediaDevices.getUserMedia({ video: vConstraints });
                        const newTrack = newVideoStream.getVideoTracks()[0];
                        if (newTrack) {
                            newTrack.enabled = videoEnabled;
                            stream.addTrack(newTrack);
                            setupTrackListeners(newTrack);
                        }
                    } catch (e) {
                        console.error("Failed to switch video track:", e);
                        setErrorName("SwitchFailed");
                    }
                }

                if (audioChanged) {
                    // Stop old audio tracks
                    stream.getAudioTracks().forEach(t => {
                        t.stop();
                        stream.removeTrack(t);
                    });
                    try {
                        const aConstraints = audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true;
                        const newAudioStream = await navigator.mediaDevices.getUserMedia({ audio: aConstraints });
                        const newTrack = newAudioStream.getAudioTracks()[0];
                        if (newTrack) {
                            newTrack.enabled = audioEnabled;
                            stream.addTrack(newTrack);
                            setupTrackListeners(newTrack);
                        }
                    } catch (e) {
                        console.error("Failed to switch audio track:", e);
                    }
                }

                // Re-trigger onStream to notify parents of track changes
                const updatedStream = new MediaStream(stream.getTracks());
                activeStreamRef.current = updatedStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = updatedStream;
                    videoRef.current.play().catch(e => console.error("Surgical play failed:", e));
                }
                onStream?.(updatedStream);
            };

            updateTracks();

        } else if (!activeStreamRef.current) {
            startCamera();
        }

        return () => {
            // Cleanup only on unmount (or when effect deps require full reset if we wanted to, but we handle surgically now)
            // However, the standard React way is cleanup on every change. 
            // To prevent cleanup on every change we need to manage the lifecycle carefully.
        };
    }, [videoDeviceId, audioDeviceId]);

    // Separate effect for full cleanup on unmount only
    useEffect(() => {
        return () => {
            if (activeStreamRef.current) {
                activeStreamRef.current.getTracks().forEach((track) => {
                    track.stop();
                    track.onended = null;
                    track.onmute = null;
                    track.onunmute = null;
                });
                activeStreamRef.current = null;
                onStream?.(null);
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, []);

    function setupTrackListeners(track: MediaStreamTrack) {
        const handleStateChange = () => {
            const isAnyProblem = !track.enabled || track.muted || track.readyState === 'ended';
            if (track.kind === 'video') {
                const isProblem = isAnyProblem && videoEnabled;
                setPermissionError(isProblem);
                if (isProblem) setErrorName(track.readyState === 'ended' ? "TrackEnded" : "TrackDisabled");
                onPermissionChange?.(!isProblem);
            } else if (track.kind === 'audio') {
                onMicPermissionChange?.(!isAnyProblem || !audioEnabled);
            }
        };
        track.onended = handleStateChange;
        track.onmute = handleStateChange;
        track.onunmute = handleStateChange;
    }



    // Handle Toggles
    useEffect(() => {
        if (activeStreamRef.current) {
            activeStreamRef.current.getTracks().forEach(track => {
                if (track.kind === 'video') track.enabled = videoEnabled;
                if (track.kind === 'audio') track.enabled = audioEnabled;
            });
        }
    }, [videoEnabled, audioEnabled]);


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
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white flex-col gap-3 p-6 text-center">
                    <span className="material-symbols-outlined text-4xl text-red-500">
                        {errorName === "NotReadableError" || errorName === "TrackEnded" || errorName === "TrackDisabled" ? "videocam_off" : "block"}
                    </span>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold">
                            {errorName === "NotReadableError"
                                ? "Camera is being used by another app"
                                : (errorName === "TrackEnded" || errorName === "TrackDisabled")
                                    ? "Camera was disconnected or disabled"
                                    : "Camera access denied"}
                        </p>
                        <p className="text-xs text-gray-400">
                            {errorName === "NotReadableError"
                                ? "Please close other apps using your camera and try again."
                                : errorName === "TrackEnded"
                                    ? "Please check your connection and try again."
                                    : "Please check your browser permissions."}
                        </p>
                    </div>
                    <button
                        onClick={() => startCamera()}
                        className="mt-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-lg text-xs font-bold transition-all"
                    >
                        RETRY CONNECTION
                    </button>
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
                            onClick={(e) => { e.stopPropagation(); onToggleVideo?.(); }}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
                            title={videoEnabled ? "Disable Camera" : "Enable Camera"}
                        >
                            <span className="material-symbols-outlined">
                                {videoEnabled ? "videocam" : "videocam_off"}
                            </span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleAudio?.(); }}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
                            title={audioEnabled ? "Mute Mic" : "Unmute Mic"}
                        >
                            <span className="material-symbols-outlined">
                                {audioEnabled ? "mic" : "mic_off"}
                            </span>
                        </button>


                    </div>
                </>
            )}
        </div>
    );
}
