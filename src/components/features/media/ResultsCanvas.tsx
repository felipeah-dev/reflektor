"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { AnalysisEvent } from "@/lib/sessionStore";

interface ResultsCanvasProps {
  analysisData?: AnalysisEvent[];
  currentTime: number;
}

const ResultsCanvas: React.FC<ResultsCanvasProps> = ({ analysisData = [], currentTime }) => {
  // Precision Tuning: slightly reduced offset to feel more "snappy"
  const syncOffset = 0.05;
  const adjustedTime = currentTime + syncOffset;

  // Filter events that should be active at the current adjusted time
  const activeEvents = analysisData.filter(event => {
    return adjustedTime >= event.start && adjustedTime <= event.end;
  });

  const getEventCount = (event: AnalysisEvent) => {
    return analysisData
      .filter(e => e.type === event.type && e.start <= event.start)
      .length;
  };

  return (
    <div className="relative w-full h-full rounded-xl select-none">
      {activeEvents.map((event, index) => {
        if (!event.box_2d || event.box_2d.length !== 4) return null;

        const [ymin, xmin, ymax, xmax] = event.box_2d;

        const top = ymin / 10;
        const left = xmin / 10;
        const width = (xmax - xmin) / 10;
        const height = (ymax - ymin) / 10;

        const isError = event.type === 'filler' ||
          event.type === 'spatial_warning' ||
          event.type === 'pace_issue' ||
          event.severity === 'high' ||
          event.severity === 'medium';

        const count = getEventCount(event);

        // --- Smart Responsiveness Logic ---

        // 1. Vertical Positioning:
        // If box is too high (< 15% from top), push pill DOWN.
        const pillAbove = top > 15;
        const verticalClass = pillAbove ? "bottom-full mb-2" : "top-full mt-2";

        // 2. Horizontal Anchoring:
        // If box is too far left (< 20%), anchor Left.
        // If box is too far right (> 80%), anchor Right.
        // Else, Center.
        const centerPoint = left + (width / 2);
        let horizontalClass = "left-1/2 -translate-x-1/2"; // Default Center
        if (centerPoint < 20) horizontalClass = "left-0 translate-x-0";
        else if (centerPoint > 80) horizontalClass = "right-0 translate-x-0";

        // 3. Dynamic Scaling for Box:
        // Use container query-like relative units for borders
        const borderWidth = "clamp(2px, 0.4vw, 4px)";
        const borderRadius = "clamp(8px, 2vw, 24px)";

        return (
          <div
            key={`${index}-${event.start}`}
            className={cn(
              "absolute pointer-events-none transition-all duration-200 ease-out", // Faster transition for "precision" feel
              isError
                ? "border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-soft-pulse-yellow"
                : "border-primary/70 shadow-[0_0_15px_rgba(19,236,91,0.3)] animate-soft-pulse"
            )}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${height}%`,
              borderWidth: borderWidth,
              borderRadius: borderRadius,
              borderStyle: 'solid'
            }}
          >
            {/* Box Corner Accents for "Tech/Precision" feel */}
            <div className={cn("absolute size-2 rounded-full opacity-0 sm:opacity-100 transition-opacity", isError ? "bg-yellow-500" : "bg-primary")} style={{ top: '-1px', left: '-1px' }}></div>
            <div className={cn("absolute size-2 rounded-full opacity-0 sm:opacity-100 transition-opacity", isError ? "bg-yellow-500" : "bg-primary")} style={{ bottom: '-1px', right: '-1px' }}></div>

            {/* Smart Floating Pill */}
            <div className={cn(
              "absolute flex items-center gap-2 z-30 whitespace-nowrap",
              "glass-pill w-max max-w-[200px] sm:max-w-none", // Allow more width on desktop
              "px-3 py-1.5 sm:px-4 sm:py-2",
              verticalClass,
              horizontalClass
            )}>
              <span className={cn(
                "size-1.5 sm:size-2 rounded-full animate-pulse shrink-0",
                isError ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]" : "bg-primary shadow-[0_0_8px_rgba(19,236,91,1)]"
              )}></span>
              <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider feedback-shadow">
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

