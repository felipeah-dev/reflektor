"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { AnalysisEvent } from "@/lib/sessionStore";

interface ResultsCanvasProps {
  analysisData?: AnalysisEvent[];
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

  const getEventCount = (event: AnalysisEvent) => {
    // Count how many events of the same type occurred before or at the same time as this one
    return analysisData
      .filter(e => e.type === event.type && e.start <= event.start)
      .length;
  };

  return (
    <div className="relative w-full h-full rounded-xl">
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

        // Responsive positioning logic
        const pillAbove = top > 15; // If top is less than 15%, show below the box
        const verticalPos = pillAbove ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]";

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
            {/* Floating Feedback Pill - Optimized for responsivity */}
            <div className={cn(
              "absolute left-1/2 -translate-x-1/2 glass-pill flex items-center gap-2 z-30",
              "w-max max-w-[180px] sm:max-w-[280px] !rounded-xl py-1.5 px-3 sm:py-2.5 sm:px-4",
              verticalPos
            )}>
              <span className={cn(
                "size-1.5 sm:size-2 mr-1 rounded-full animate-pulse shrink-0",
                isError ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]" : "bg-primary shadow-[0_0_8px_rgba(19,236,91,1)]"
              )}></span>
              <span className="text-white text-[9px] sm:text-[11px] font-bold uppercase tracking-wider feedback-shadow text-center leading-tight sm:leading-normal">
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

