"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

    const setupTrackListeners = useCallback((track: MediaStreamTrack) => {
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
    }, [videoEnabled, audioEnabled, onPermissionChange, onMicPermissionChange]);

    const startCamera = useCallback(async () => {
        if (isInitializingRef.current) return;

        if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
            setErrorName("NotSupported");
            setPermissionError(true);
            onPermissionChange?.(false);
            return;
        }

        isInitializingRef.current = true;
        setErrorName(null);
        let stream: MediaStream | null = null;
        let videoOk = false;
        let audioOk = false;

        try {
            const constraints: MediaStreamConstraints = {
                video: videoDeviceId
                    ? { deviceId: { ideal: videoDeviceId } }
                    : { facingMode: "user" },
                audio: audioDeviceId ? { deviceId: { ideal: audioDeviceId } } : true
            };
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoOk = true;
            audioOk = true;
        } catch (err: unknown) {
            const error = err as Error;
            console.warn("Combined hardware access failed, probing individually...", error.name);

            try {
                const videoConstraints = videoDeviceId
                    ? { deviceId: videoDeviceId }
                    : { facingMode: "user" };
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
                stream = videoStream;
                videoOk = true;
            } catch (vErr: unknown) {
                const videoError = vErr as Error;
                console.error("Video probe failed:", videoError);
                videoOk = false;
                setErrorName(videoError.name);
            }

            await new Promise(resolve => setTimeout(resolve, 150));

            try {
                const audioConstraints = audioDeviceId ? { deviceId: { ideal: audioDeviceId } } : true;
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
                if (stream) {
                    audioStream.getTracks().forEach(t => stream?.addTrack(t));
                } else {
                    stream = audioStream;
                }
                audioOk = true;
            } catch (aErr: unknown) {
                const audioError = aErr as Error;
                console.error("Audio probe failed:", audioError);
                audioOk = false;
            }
        }

        if (stream) {
            activeStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.error("Video play failed:", e));
            }

            stream.getTracks().forEach(track => {
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
    }, [videoDeviceId, audioDeviceId, videoEnabled, audioEnabled, onPermissionChange, onMicPermissionChange, onStream, setupTrackListeners]);

    useEffect(() => {
        const videoChanged = prevVideoDeviceIdRef.current !== videoDeviceId;
        const audioChanged = prevAudioDeviceIdRef.current !== audioDeviceId;

        prevVideoDeviceIdRef.current = videoDeviceId;
        prevAudioDeviceIdRef.current = audioDeviceId;

        if (activeStreamRef.current && (videoChanged || audioChanged)) {
            const updateTracks = async () => {
                const stream = activeStreamRef.current;
                if (!stream) return;

                if (videoChanged) {
                    stream.getVideoTracks().forEach(t => {
                        t.stop();
                        stream.removeTrack(t);
                    });
                    try {
                        const vConstraints = videoDeviceId ? { deviceId: { ideal: videoDeviceId } } : true;
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
                    stream.getAudioTracks().forEach(t => {
                        t.stop();
                        stream.removeTrack(t);
                    });
                    try {
                        const aConstraints = audioDeviceId ? { deviceId: { ideal: audioDeviceId } } : true;
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
            const timer = setTimeout(() => {
                startCamera();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [videoDeviceId, audioDeviceId, audioEnabled, videoEnabled, onPermissionChange, onMicPermissionChange, onStream, startCamera, setupTrackListeners]);

    useEffect(() => {
        const videoEl = videoRef.current;
        return () => {
            const currentStream = activeStreamRef.current;
            if (currentStream) {
                currentStream.getTracks().forEach((track) => {
                    track.stop();
                    track.onended = null;
                    track.onmute = null;
                    track.onunmute = null;
                });
                activeStreamRef.current = null;
                onStream?.(null);
            }
            if (videoEl) {
                videoEl.srcObject = null;
            }
        };
    }, [onStream]);

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
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                disablePictureInPicture
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
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[35%] h-[60%] border-2 border-dashed border-white/30 rounded-[50%] relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
                                Center your face
                            </div>
                        </div>
                    </div>

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
