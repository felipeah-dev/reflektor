"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Group } from 'react-konva';
import useImage from 'use-image';

interface ResultsCanvasProps {
  imageSrc: string;
}

const ResultsCanvas: React.FC<ResultsCanvasProps> = ({ imageSrc }) => {
  const [image] = useImage(imageSrc);
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

  // Mock overlays scaling
  // Assuming overlay coordinates are based on a noramlized 1000x1000 space or similar, 
  // but for this mock we'll just place them relatively.
    
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden" ref={containerRef}>
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
            {/* Background Image - scaled to cover/contain as needed. For now, simple fill */}
            {image && (
                <KonvaImage
                    image={image}
                    width={dimensions.width}
                    height={dimensions.height}
                    // Emulate "object-cover" mostly by just stretching for this MVP proof-of-concept
                    // A real implementation would calculate aspect ratios.
                />
            )}

            {/* Mock Overlay 1: Face Bounding Box (Green) */}
             <Group>
                <Rect
                    x={dimensions.width * 0.42}
                    y={dimensions.height * 0.20}
                    width={dimensions.width * 0.16}
                    height={dimensions.height * 0.28}
                    stroke="#13ec5b" // Primary green
                    strokeWidth={2}
                    shadowColor="#13ec5b"
                    shadowBlur={10}
                    shadowOpacity={0.3}
                    cornerRadius={8}
                />
                 {/* Label */}
                <Group x={dimensions.width * 0.42} y={dimensions.height * 0.20 - 24}>
                     <Rect
                        width={110}
                        height={20}
                        fill="#13ec5b"
                        cornerRadius={2}
                     />
                     <Text
                        text="EYE CONTACT: GOOD"
                        fontSize={10}
                        fontStyle="bold"
                        fill="black"
                        padding={4}
                        y={3}
                     />
                </Group>
                 {/* Corners decorations (simplified) */}
                 <Rect x={dimensions.width * 0.42 - 2} y={dimensions.height * 0.20 - 2} width={8} height={2} fill="#13ec5b" />
                 <Rect x={dimensions.width * 0.42 - 2} y={dimensions.height * 0.20 - 2} width={2} height={8} fill="#13ec5b" />
            </Group>

            {/* Mock Overlay 2: Gesture Warning (Yellow) */}
             <Group>
                <Rect
                    x={dimensions.width * 0.75}
                    y={dimensions.height * 0.65}
                    width={dimensions.width * 0.15}
                    height={dimensions.height * 0.25}
                    stroke="#eab308" // Yellow-500
                    strokeWidth={2}
                    dash={[10, 5]}
                    cornerRadius={4}
                    opacity={0.6}
                />
                 {/* Label */}
                <Group x={dimensions.width * 0.75 + (dimensions.width * 0.15) - 70} y={dimensions.height * 0.65 - 24}>
                     <Rect
                        width={70}
                        height={20}
                        fill="#eab308"
                        cornerRadius={2}
                     />
                     <Text
                        text="REPETITIVE"
                        fontSize={10}
                        fontStyle="bold"
                        fill="black"
                        padding={4}
                        x={5}
                        y={3}
                     />
                </Group>
            </Group>

        </Layer>
      </Stage>
    </div>
  );
};

export default ResultsCanvas;
