"use client";

import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    stream: MediaStream | null;
    className?: string;
    barColor?: string;
    isMuted?: boolean;
    width?: number;
    height?: number;
    template?: "default" | "checklist";
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
    stream,
    className = "",
    barColor = "#13ec5b",
    isMuted = false,
    width = 120,
    height = 32,
    template = "default"
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
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;

            if (template === "checklist") {
                const barCount = 10;
                const baseHeights = [0.4, 0.6, 0.8, 0.5, 0.9, 0.7, 0.45, 0.3, 0.2, 0.2];
                const opacities = [0.2, 0.4, 0.6, 1.0, 1.0, 0.8, 0.6, 0.4, 0.2, 0.2];
                const barWidth = 4;

                // Spread logic: calculate gap to fill the entire width
                const gap = (width - (barCount * barWidth)) / (barCount - 1);
                let startX = 0;

                for (let i = 0; i < barCount; i++) {
                    const dataIndex = Math.floor((i / barCount) * bufferLength);
                    // Add gain for better visibility of typical speech levels
                    const rawValue = dataArray[dataIndex] / 255;
                    const audioValue = Math.min(1, rawValue * 1.5);

                    // Design modulation: 
                    // 20% is the absolute minimum base height
                    // 80% of the height is modulated by (baseDesignPower * audioPresence)
                    const normalizedHeight = baseHeights[i] * (0.2 + audioValue * 1.2);
                    const barHeight = Math.max(3, Math.min(height, normalizedHeight * height));

                    const r = parseInt(barColor.slice(1, 3), 16);
                    const g = parseInt(barColor.slice(3, 5), 16);
                    const b = parseInt(barColor.slice(5, 7), 16);
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacities[i]})`;

                    const y = height - barHeight;
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(startX, y, barWidth, barHeight, barWidth / 2);
                    } else {
                        // Fallback for older browsers
                        ctx.rect(startX, y, barWidth, barHeight);
                    }
                    ctx.fill();

                    startX += barWidth + gap;
                }
            } else {
                const barWidth = (width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = (dataArray[i] / 255) * height;
                    ctx.fillStyle = barColor;
                    const radius = barWidth / 2;
                    const y = height - barHeight;
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(x, y, barWidth - 2, barHeight, radius);
                    } else {
                        // Fallback for older browsers
                        ctx.rect(x, y, barWidth - 2, barHeight);
                    }
                    ctx.fill();
                    x += barWidth + 1;
                }
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
            width={width}
            height={height}
        />
    );
};
