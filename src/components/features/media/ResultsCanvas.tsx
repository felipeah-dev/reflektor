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

  const isWarningEvent = (event: AnalysisEvent) => {
    return (
      event.type === 'filler' ||
      event.type === 'spatial_warning' ||
      event.type === 'pace_issue' ||
      event.severity === 'high' ||
      event.severity === 'medium'
    );
  };

  // 1. Group events by horizontal zone to prevent overlaps between different boxes in the same area
  const zones: Record<string, { events: AnalysisEvent[], minTop: number, maxBottom: number, centerAvg: number }> = {
    left: { events: [], minTop: 1000, maxBottom: 0, centerAvg: 0 },
    center: { events: [], minTop: 1000, maxBottom: 0, centerAvg: 0 },
    right: { events: [], minTop: 1000, maxBottom: 0, centerAvg: 0 },
  };

  activeEvents.forEach(event => {
    if (!event.box_2d) return;
    const [ymin, xmin, ymax, xmax] = event.box_2d;
    const center = (xmin + xmax) / 20; // 0-100
    const isWarning = isWarningEvent(event);

    let zoneKey = 'center';
    if (center < 33) zoneKey = 'left';
    else if (center > 66) zoneKey = 'right';

    const zone = zones[zoneKey];
    zone.events.push(event);
    zone.minTop = Math.min(zone.minTop, ymin / 10);
    zone.maxBottom = Math.max(zone.maxBottom, ymax / 10);
    zone.centerAvg = (xmin + xmax) / 20; // Simplified for the anchor
  });

  return (
    <div className="relative w-full h-full rounded-xl select-none overflow-hidden">
      {/* --- DRAW ALL INDIVIDUAL BOUNDING BOXES --- */}
      {activeEvents.map((event, idx) => {
        const [ymin, xmin, ymax, xmax] = event.box_2d!;
        const isWarning = isWarningEvent(event);

        return (
          <div
            key={`box-${idx}`}
            className="absolute pointer-events-none transition-all duration-200 ease-out z-10"
            style={{
              top: `${ymin / 10}%`,
              left: `${xmin / 10}%`,
              width: `${(xmax - xmin) / 10}%`,
              height: `${(ymax - ymin) / 10}%`,
              border: `clamp(1.5px, 0.3vmin, 3px) solid`,
              borderRadius: "clamp(6px, 1.5vmin, 16px)",
              borderColor: isWarning ? 'rgb(234 179 8 / 0.8)' : 'rgb(19 236 91 / 0.8)',
              boxShadow: isWarning ? '0 0 20px rgba(234, 179, 8, 0.4)' : '0 0 20px rgba(19, 236, 91, 0.4)',
            }}
          />
        );
      })}

      {/* --- DRAW PILL STACKS BY ZONE --- */}
      {Object.entries(zones).map(([zoneKey, zone]) => {
        if (zone.events.length === 0) return null;

        // Determine if we should stack above, below, or inside
        // If any box is at the bottom, stack the whole zone ABOVE
        // If boxes are both at top and bottom, anchor INSIDE bottom
        const hasBottomCollision = zone.maxBottom > 85;
        const hasTopCollision = zone.minTop < 15;

        let stackPosition = 'below'; // default
        if (hasBottomCollision && !hasTopCollision) stackPosition = 'above';
        else if (hasBottomCollision && hasTopCollision) stackPosition = 'inside';
        else if (hasTopCollision) stackPosition = 'below';

        const horizontalClass = zoneKey === 'left' ? "left-0" :
          zoneKey === 'right' ? "right-0" :
            "left-1/2 -translate-x-1/2";

        return (
          <div
            key={`stack-${zoneKey}`}
            className={cn(
              "absolute z-30 flex flex-col pointer-events-none transition-all duration-300 px-4",
              horizontalClass,
              stackPosition === 'above' ? "flex-col-reverse" : "flex-col"
            )}
            style={{
              top: stackPosition === 'above' ? `${zone.minTop}%` :
                stackPosition === 'inside' ? undefined :
                  `${zone.maxBottom}%`,
              bottom: stackPosition === 'inside' ? '1rem' : undefined,
              // Offset from top/bottom to not touch box
              marginTop: stackPosition === 'below' ? '0.5rem' : undefined,
              marginBottom: stackPosition === 'above' ? '0.5rem' : undefined,
              alignItems: zoneKey === 'left' ? 'flex-start' :
                zoneKey === 'right' ? 'flex-end' : 'center',
              width: 'max-content'
            }}
          >
            {zone.events.map((event, eIdx) => {
              const isWarning = isWarningEvent(event);
              const count = getEventCount(event);

              return (
                <div key={`pill-${eIdx}`} className="relative py-1 border-none bg-transparent">
                  {/* DESKTOP */}
                  <div className={cn(
                    "md:flex hidden items-start gap-1.5 backdrop-blur-md bg-black/70 border border-white/20 shadow-2xl rounded-2xl px-4 py-2.5 max-w-[min(500px,85vw)]",
                  )}>
                    <div className={cn("size-2 rounded-full animate-pulse shrink-0 mt-1", isWarning ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]" : "bg-primary shadow-[0_0_8px_rgba(19,236,91,1)]")} />
                    <span className="text-white font-bold uppercase tracking-wide feedback-shadow text-xs leading-tight">
                      {event.description} {event.type === 'filler' && `(#${count})`}
                    </span>
                  </div>
                  {/* MOBILE */}
                  <div className={cn(
                    "md:hidden flex items-start gap-1 backdrop-blur-md bg-black/60 border border-white/20 shadow-xl rounded-full px-2.5 py-1.5 max-w-[75vw]",
                  )}>
                    <div className={cn("size-1.5 rounded-full animate-pulse shrink-0 mt-1", isWarning ? "bg-yellow-500" : "bg-primary")} />
                    <span className="text-white font-bold uppercase tracking-wide text-[10px] leading-tight">
                      {event.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ResultsCanvas;


