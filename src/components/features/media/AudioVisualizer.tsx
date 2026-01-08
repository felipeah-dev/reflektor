"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
    stream: MediaStream | null;
    isMuted?: boolean;
}

export function AudioVisualizer({ stream, isMuted = false }: AudioVisualizerProps) {
    const barsRef = useRef<(HTMLDivElement | null)[]>([]);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!stream || isMuted) return;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // Small FFT for simple bars
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateBars = () => {
            analyser.getByteFrequencyData(dataArray);

            // We have 10 bars in the UI
            const barCount = 10;
            for (let i = 0; i < barCount; i++) {
                const bar = barsRef.current[i];
                if (bar) {
                    // Sample the frequency data
                    const val = dataArray[i % bufferLength];
                    // Map value to percentage height (30% to 100%)
                    const height = Math.max(20, (val / 255) * 100);
                    bar.style.height = `${height}%`;
                    // Opacity based on volume
                    bar.style.opacity = `${Math.max(0.3, val / 255)}`;
                }
            }
            animationFrameRef.current = requestAnimationFrame(updateBars);
        };

        updateBars();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            audioContext.close();
        };
    }, [stream, isMuted]);

    return (
        <div className="flex items-end justify-between h-8 gap-0.5">
            {[...Array(10)].map((_, i) => (
                <div
                    key={i}
                    ref={(el) => { barsRef.current[i] = el; }}
                    className="w-1 bg-primary rounded-full transition-[height,opacity] duration-75"
                    style={{ height: '20%' }}
                ></div>
            ))}
        </div>
    );
}

