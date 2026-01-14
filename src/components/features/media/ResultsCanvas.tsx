"use client";

import React, { useEffect, useState, useRef } from 'react';
import { cn } from "@/lib/utils";

interface ResultsCanvasProps {
  analysisData?: any[];
  currentTime: number;
}

const ResultsCanvas: React.FC<ResultsCanvasProps> = ({ analysisData = [], currentTime }) => {
  // Use a small offset for synchronization if needed. 
  // Gemini detection usually has a slight latency compared to the video frame.
  // We'll use 0.1s for now, but this can be tuned.
  const syncOffset = 0.1;
  const adjustedTime = currentTime + syncOffset;

  // Filter events that should be active at the current adjusted time
  const activeEvents = analysisData.filter(event => {
    return adjustedTime >= event.start && adjustedTime <= event.end;
  });

  const getEventCount = (event: any) => {
    // Count how many events of the same type occurred before or at the same time as this one
    return analysisData
      .filter(e => e.type === event.type && e.start <= event.start)
      .length;
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {activeEvents.map((event, index) => {
        if (!event.box_2d || event.box_2d.length !== 4) return null;

        // Gemini: [y_min, x_min, y_max, x_max] (0-1000)
        const [ymin, xmin, ymax, xmax] = event.box_2d;

        const top = ymin / 10; // Convert 0-1000 to 0-100%
        const left = xmin / 10;
        const width = (xmax - xmin) / 10;
        const height = (ymax - ymin) / 10;

        const isError = event.type === 'filler' ||
          event.type === 'spatial_warning' ||
          event.type === 'pace_issue' ||
          event.severity === 'high' ||
          event.severity === 'medium';

        const count = getEventCount(event);

        return (
          <div
            key={`${index}-${event.start}`}
            className={cn(
              "absolute border-2 rounded-3xl pointer-events-none transition-all duration-300",
              isError
                ? "border-yellow-500/40 animate-soft-pulse-yellow"
                : "border-primary/60 animate-soft-pulse"
            )}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
          >
            {/* Floating Feedback Pill */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 glass-pill flex items-center gap-2 whitespace-nowrap z-30">
              <span className={cn(
                "size-2 rounded-full animate-pulse",
                isError ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]" : "bg-primary shadow-[0_0_8px_rgba(19,236,91,1)]"
              )}></span>
              <span className="text-white text-[10px] font-bold uppercase tracking-widest feedback-shadow">
                {event.description} {event.type === 'filler' && `(#${count})`}
              </span>
            </div>
          </div>
        );
      })}
    </div>

  );
};

export default ResultsCanvas;

