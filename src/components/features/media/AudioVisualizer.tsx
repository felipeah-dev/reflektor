"use client";

import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    stream: MediaStream | null;
    className?: string;
    barColor?: string;
    isMuted?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
    stream,
    className = "",
    barColor = "#13ec5b",
    isMuted = false
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(null);
    const analyserRef = useRef<AnalyserNode>(null);
    const audioContextRef = useRef<AudioContext>(null);

    useEffect(() => {
        if (!stream || !canvasRef.current) return;

        // Initialize Audio Context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        source.connect(analyser);
        analyser.fftSize = 64; // Small for a simple bar visualizer

        analyserRef.current = analyser;
        audioContextRef.current = audioContext;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);

            if (isMuted) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            analyser.getByteFrequencyData(dataArray);

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;
            const barWidth = (width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * height;

                ctx.fillStyle = barColor;
                // Rounded bars
                const radius = barWidth / 2;
                const y = height - barHeight;

                ctx.beginPath();
                ctx.roundRect(x, y, barWidth - 2, barHeight, radius);
                ctx.fill();

                x += barWidth + 1;
            }
        };

        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, [stream, barColor, isMuted]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            width={120}
            height={32}
        />
    );
};
