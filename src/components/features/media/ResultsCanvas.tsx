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

        // 1. Vertical Positioning (Unified Robust Logic):
        // Calculate the best position (Above, Below, or Inside) to avoid edge cutoff
        // This applies to both Mobile and Desktop for consistent behavior

        const boxBottom = top + height;
        let verticalClass = "top-full mt-2"; // Default: Below the box

        // Check Top Edge Collision (Safe Zone 30%)
        if (top < 30) {
          // Box starts in upper 30% of screen.
          // Putting pill ABOVE is risky (text touches top edge).

          if (boxBottom > 75) {
            // Box also extends deep down (Tall box).
            // Solution: Place INSIDE at the bottom of the box.
            verticalClass = "bottom-2";
          } else {
            // Box starts high but ends early (Short box at top).
            // Plenty of room below.
            verticalClass = "top-full mt-2";
          }
        }
        // 2. Starts lower down (Top >= 30%)
        else if (boxBottom > 85) {
          // Ends near bottom. Put ABOVE.
          verticalClass = "bottom-full mb-2";
        }
        // 3. Middle Area
        else {
          // Default preference: Below
          verticalClass = "top-full mt-2";
        }

        // 2. Horizontal Anchoring:
        const centerPoint = left + (width / 2);
        let horizontalClass = "left-1/2 -translate-x-1/2"; // Default Center

        // Thresholds for anchoring: 
        // If center is in first 35%, anchor to left edge.
        // If center is in last 35%, anchor to right edge.
        if (centerPoint < 35) horizontalClass = "left-0 translate-x-0";
        else if (centerPoint > 65) horizontalClass = "right-0 translate-x-0";

        // 3. Dynamic Scaling for Box:
        const borderWidth = "clamp(1.5px, 0.3vmin, 3px)";
        const borderRadius = "clamp(6px, 1.5vmin, 16px)";

        // 4. Dynamic Font Sizing for Pills (Mobile):
        const isNearTopEdge = top < 30;
        const isNearBottomEdge = boxBottom > 85;
        const textSizeClass = isNearBottomEdge || isNearTopEdge
          ? "text-[8px] sm:text-[9px] md:text-[10px]"
          : "text-[9px] sm:text-[10px] md:text-xs";

        return (
          <React.Fragment key={`${index}-${event.start}`}>
            {/* --- THE BOUNDING BOX --- */}
            <div
              className="absolute pointer-events-none transition-all duration-200 ease-out z-10"
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
            />

            {/* --- PILL ANCHOR (Zero-width, positioned at the center of the box) --- */}
            <div
              className="absolute pointer-events-none z-30 transition-all duration-200"
              style={{
                top: verticalClass.includes("bottom-full") ? `${top}%` : `${top + height}%`,
                left: horizontalClass.includes("left-0") ? `${left}%` :
                  horizontalClass.includes("right-0") ? `${left + width}%` :
                    `${left + (width / 2)}%`,
                width: 0,
                height: 0,
              }}
            >
              {/* --- PILL CONTAINER --- */}
              <div
                className={cn(
                  "absolute flex items-start gap-1.5 backdrop-blur-md bg-black/60 border border-white/20 shadow-xl w-max",
                  // Horizontal alignment relative to anchor
                  horizontalClass.includes("left-0") ? "left-0" :
                    horizontalClass.includes("right-0") ? "right-0" :
                      "-translate-x-1/2",
                  // Vertical alignment relative to anchor
                  verticalClass.includes("bottom-full") ? "bottom-2" :
                    verticalClass.includes("bottom-2") ? "bottom-2" : // Case for "inside"
                      "top-2",
                  // Aesthetics
                  "rounded-2xl px-4 py-2.5",
                  // Width constraints (relative to video canvas now!)
                  "max-w-[min(500px,85vw)]", // Corrected: relative to video width
                  "md:flex hidden" // DESKTOP
                )}
              >
                <span className={cn(
                  "size-2 rounded-full animate-pulse shrink-0 mt-1",
                  isError ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]" : "bg-primary shadow-[0_0_8px_rgba(19,236,91,1)]"
                )}></span>
                <span className="text-white font-bold uppercase tracking-wide feedback-shadow text-xs leading-tight">
                  {event.description} {event.type === 'filler' && `(#${count})`}
                </span>
              </div>

              {/* --- MOBILE VERSION --- */}
              <div
                className={cn(
                  "absolute flex items-start gap-1 backdrop-blur-md bg-black/50 border border-white/20 shadow-lg w-max",
                  horizontalClass.includes("left-0") ? "left-0" :
                    horizontalClass.includes("right-0") ? "right-0" :
                      "-translate-x-1/2",
                  verticalClass.includes("bottom-full") ? "bottom-1.5" :
                    verticalClass.includes("bottom-2") ? "bottom-1.5" :
                      "top-1.5",
                  "rounded-full px-2.5 py-1.5",
                  "max-w-[70vw]",
                  "md:hidden flex" // MOBILE
                )}
              >
                <span className={cn(
                  "size-1.5 rounded-full animate-pulse shrink-0 mt-0.5",
                  isError ? "bg-yellow-500" : "bg-primary"
                )}></span>
                <span className={cn(
                  "text-white font-bold uppercase tracking-wide text-[10px] leading-snug",
                  textSizeClass
                )}>
                  {event.description}
                </span>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ResultsCanvas;


