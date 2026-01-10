"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';

interface ResultsCanvasProps {
  analysisData?: any[];
  currentTime: number;
}

const ResultsCanvas: React.FC<ResultsCanvasProps> = ({ analysisData = [], currentTime }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Filter events that should be active at the current time
  const activeEvents = analysisData.filter(event => {
    return currentTime >= event.start && currentTime <= event.end;
  });

  const transformBox = (box: number[]) => {
    if (!box || box.length !== 4) return null;
    // Gemini: [y_min, x_min, y_max, x_max] (0-1000)
    const [ymin, xmin, ymax, xmax] = box;
    return {
      x: (xmin / 1000) * dimensions.width,
      y: (ymin / 1000) * dimensions.height,
      width: ((xmax - xmin) / 1000) * dimensions.width,
      height: ((ymax - ymin) / 1000) * dimensions.height,
    };
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden" ref={containerRef}>
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          {activeEvents.map((event, index) => {
            const box = transformBox(event.box_2d);
            if (!box) return null;

            const isError = event.type === 'filler' || event.type === 'distraction' || event.type === 'no_eye_contact';
            const color = isError ? "#eab308" : "#13ec5b";

            return (
              <Group key={index}>
                <Rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  stroke={color}
                  strokeWidth={2}
                  shadowColor={color}
                  shadowBlur={10}
                  shadowOpacity={0.3}
                  cornerRadius={4}
                  dash={isError ? [5, 5] : []}
                />
                {/* Label */}
                <Group x={box.x} y={box.y > 30 ? box.y - 25 : box.y + box.height + 5}>
                  <Rect
                    width={event.description.length * 7 + 15}
                    height={22}
                    fill={color}
                    cornerRadius={2}
                  />
                  <Text
                    text={event.description.toUpperCase()}
                    fontSize={10}
                    fontStyle="bold"
                    fill="black"
                    padding={6}
                  />
                </Group>
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default ResultsCanvas;
