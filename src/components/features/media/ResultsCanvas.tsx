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
        // If box is in upper portion (< 25% from top), push pill DOWN to avoid cutoff at top.
        // If box is in lower portion (> 75% from top), push pill UP to avoid cutoff at bottom.
        // Otherwise (middle 50%), place pill above the box.
        const isNearTop = top < 25;
        const isNearBottom = top > 75;
        const pillAbove = !isNearTop && !isNearBottom; // Pill above only in middle region
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
        // Use container-relative units that work better on mobile
        // On small screens (landscape mobile), use smaller minimum values
        const borderWidth = "clamp(1.5px, 0.3vmin, 3px)";
        const borderRadius = "clamp(6px, 1.5vmin, 16px)";

        // 4. Dynamic Font Sizing for Pills:
        // Instead of limiting height, reduce text size near edges to fit complete text
        // Bottom/top annotations use smaller text, middle can be larger
        const textSizeClass = isNearBottom || isNearTop
          ? "text-[8px] sm:text-[9px] md:text-[10px]"
          : "text-[9px] sm:text-[10px] md:text-xs";

        return (
          <div
            key={`${index}-${event.start}`}
            className={cn(
              "absolute pointer-events-none transition-all duration-200 ease-out", // Faster transition for "precision" feel
              "z-20"
            )}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${height}%`,
              border: `${borderWidth} solid`,
              borderRadius: borderRadius,
              borderColor: isError ? 'rgb(234 179 8 / 0.8)' : 'rgb(19 236 91 / 0.8)',
              boxShadow: isError
                ? '0 0 20px rgba(234, 179, 8, 0.4)'
                : '0 0 20px rgba(19, 236, 91, 0.4)',
            }}
          >
            {/* Smart Floating Pill */}
            <div
              className={cn(
                "absolute flex items-start gap-1.5 sm:gap-2 z-30",
                "glass-pill min-w-[100px] max-w-[90%] sm:max-w-[90%] md:max-w-[500px]",
                "landscape:max-w-[300px]",
                "px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2",
                verticalClass,
                horizontalClass
              )}
            >
              <span className={cn(
                "size-1.5 sm:size-2 rounded-full animate-pulse shrink-0 mt-0.5",
                isError ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]" : "bg-primary shadow-[0_0_8px_rgba(19,236,91,1)]"
              )}></span>
              <span className={cn(
                "text-white font-bold uppercase tracking-wide feedback-shadow whitespace-normal break-words leading-snug",
                textSizeClass
              )}>
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

