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

        // --- Mobile Specific Vertical Logic ---
        const boxBottom = top + height;
        let mobileVerticalClass = "top-full mt-2"; // Default below

        // 1. Check Top Edge Collision (Expanded Safe Zone to 30%)
        if (top < 30) {
          // Box starts in upper 30% of screen. 
          // Putting pill ABOVE is risky (text touches top edge).

          if (boxBottom > 75) {
            // Box also extends deep down.
            // Above is risky (top cut), Below is risky (bottom cut).
            // Solution: INSIDE at bottom.
            mobileVerticalClass = "bottom-2";
          } else {
            // Box starts high but ends early. Plenty of room below.
            mobileVerticalClass = "top-full mt-2";
          }
        }
        // 2. Starts lower down (Top >= 30%) -> Safe to put ABOVE if needed
        else if (boxBottom > 85) {
          // Ends near bottom. Put ABOVE.
          mobileVerticalClass = "bottom-full mb-2";
        }
        // 3. Middle Area
        else {
          // Default preference: Below
          mobileVerticalClass = "top-full mt-2";
        }

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
            {/* --- MOBILE PILL (md:hidden) --- */}
            <div
              className={cn(
                "md:hidden absolute flex items-start gap-1.5 z-30",
                "glass-pill min-w-[100px] max-w-[90%]",
                "landscape:max-w-[300px]",
                "px-2 py-1",
                mobileVerticalClass,
                horizontalClass // Keep horizontal logic shared for now (centering)
              )}
            >
              <span className={cn(
                "size-1.5 rounded-full animate-pulse shrink-0 mt-0.5",
                isError ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]" : "bg-primary shadow-[0_0_8px_rgba(19,236,91,1)]"
              )}></span>
              <span className={cn(
                "text-white font-bold uppercase tracking-wide feedback-shadow whitespace-normal break-words leading-snug",
                textSizeClass
              )}>
                {event.description} {event.type === 'filler' && `(#${count})`}
              </span>
            </div>

            {/* --- DESKTOP PILL (hidden md:flex) --- */}
            <div
              className={cn(
                "hidden md:flex absolute items-start gap-2 z-30",
                "glass-pill min-w-[100px] max-w-[500px]",
                "px-4 py-2",
                verticalClass, // Original logic for desktop
                horizontalClass
              )}
            >
              <span className={cn(
                "size-2 rounded-full animate-pulse shrink-0 mt-0.5",
                isError ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]" : "bg-primary shadow-[0_0_8px_rgba(19,236,91,1)]"
              )}></span>
              <span className={cn(
                "text-white font-bold uppercase tracking-wide feedback-shadow whitespace-normal break-words leading-snug",
                "text-xs"
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

