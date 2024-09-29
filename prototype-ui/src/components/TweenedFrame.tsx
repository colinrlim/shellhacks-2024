import React, { useEffect, useRef, useState } from 'react';
import { tween } from '../lib/tween';

interface TweenedFrameProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  easingStyle: string;
  easingDirection: string;
  isVisible: boolean;
  children: React.ReactNode;
}

const TweenedFrame: React.FC<TweenedFrameProps> = ({
  startX,
  startY,
  endX,
  endY,
  duration,
  easingStyle,
  easingDirection,
  isVisible,
  children,
}) => {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const startTime = useRef(Date.now());

  useEffect(() => {
    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime.current) / 1000;
      const interpolant = Math.min(elapsedTime / duration, 1);

      const newX = tween(startX, endX, interpolant, easingStyle, easingDirection);
      const newY = tween(startY, endY, interpolant, easingStyle, easingDirection);
      setPosition({ x: newX, y: newY });

      if (interpolant < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    return () => {
      // Clean up if needed
    };
  }, [startX, startY, endX, endY, duration, easingStyle, easingDirection]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        border: '2px solid black',
        padding: '10px',
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
      }}
    >
      {children}
    </div>
  );
};

export default TweenedFrame;