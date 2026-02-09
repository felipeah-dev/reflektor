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

  // 1. Group events into horizontal clusters based on box overlap
  let clusters: { events: AnalysisEvent[], minTop: number, maxBottom: number, minLeft: number, maxRight: number }[] = [];

  activeEvents.forEach(event => {
    if (!event.box_2d) return;
    const [ymin, xmin, ymax, xmax] = event.box_2d;
    const l = xmin / 10;
    const r = xmax / 10;
    const t = ymin / 10;
    const b = ymax / 10;

    clusters.push({
      events: [event],
      minTop: t,
      maxBottom: b,
      minLeft: l,
      maxRight: r
    });
  });

  // Merge clusters that overlap horizontally (with 5% safety buffer)
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const overlap = !(clusters[i].maxRight + 5 < clusters[j].minLeft || clusters[i].minLeft - 5 > clusters[j].maxRight);
        if (overlap) {
          clusters[i].events.push(...clusters[j].events);
          clusters[i].minTop = Math.min(clusters[i].minTop, clusters[j].minTop);
          clusters[i].maxBottom = Math.max(clusters[i].maxBottom, clusters[j].maxBottom);
          clusters[i].minLeft = Math.min(clusters[i].minLeft, clusters[j].minLeft);
          clusters[i].maxRight = Math.max(clusters[i].maxRight, clusters[j].maxRight);
          clusters.splice(j, 1);
          merged = true;
          break;
        }
      }
      if (merged) break;
    }
  }

  // 2. Sort events within each cluster by their vertical position (ymin)
  // This ensures face messages (top) stay at the top of the stack, etc.
  clusters.forEach(cluster => {
    cluster.events.sort((a, b) => (a.box_2d![0] - b.box_2d![0]));
  });

  return (
    <div className="relative w-full h-full rounded-xl select-none overflow-hidden">
      {/* --- DRAW ALL INDIVIDUAL BOUNDING BOXES --- */}
      {activeEvents.map((event, idx) => {
        if (!event.box_2d) return null;
        const [ymin, xmin, ymax, xmax] = event.box_2d;
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

      {/* --- DRAW CLUSTERED PILL STACKS --- */}
      {clusters.map((cluster, cIdx) => {
        const hasBottomCollision = cluster.maxBottom > 80;
        const hasTopCollision = cluster.minTop < 20;

        let stackPosition = 'below';
        if (hasBottomCollision && !hasTopCollision) stackPosition = 'above';
        else if (hasBottomCollision && hasTopCollision) stackPosition = 'inside';
        else if (hasTopCollision) stackPosition = 'below';

        // Final ceiling safety
        if (stackPosition === 'above' && cluster.minTop < 25) {
          stackPosition = hasTopCollision ? 'inside' : 'below';
        }

        const centerX = (cluster.minLeft + cluster.maxRight) / 2;
        const isLeft = centerX < 30;
        const isRight = centerX > 70;

        return (
          <div
            key={`cluster-${cIdx}`}
            className={cn(
              "absolute z-30 flex flex-col pointer-events-none transition-all duration-300 px-4",
              isLeft ? "left-0" : isRight ? "right-0" : "left-1/2 -translate-x-1/2"
            )}
            style={{
              top: stackPosition === 'above' ? `${cluster.minTop}%` :
                stackPosition === 'inside' ? undefined :
                  `${cluster.maxBottom}%`,
              bottom: stackPosition === 'inside' ? `${Math.max(10, (100 - cluster.maxBottom) + 2)}%` : undefined,
              marginTop: stackPosition === 'below' ? '0.5rem' : undefined,
              marginBottom: (stackPosition === 'above' || stackPosition === 'inside') ? '0.5rem' : undefined,
              alignItems: isLeft ? 'flex-start' : isRight ? 'flex-end' : 'center',
              width: 'max-content',
              maxWidth: '90vw'
            }}
          >
            {cluster.events.map((event, eIdx) => {
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


