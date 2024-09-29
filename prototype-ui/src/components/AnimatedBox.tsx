import React, { useEffect, useRef, useState } from 'react';
import { tween } from '../lib/tween';

interface AnimatedBoxProps {
  startX: number;
  endX: number;
  duration: number;
  easingStyle: string;
  easingDirection: string;
  isVisible: boolean;
}

const AnimatedBox: React.FC<AnimatedBoxProps> = ({
  startX,
  endX,
  duration,
  easingStyle,
  easingDirection,
  isVisible,
}) => {
  const [position, setPosition] = useState(startX);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime.current) / 1000;
      const interpolant = Math.min(elapsedTime / duration, 1);

      const newPosition = tween(startX, endX, interpolant, easingStyle, easingDirection);
      setPosition(newPosition);

      if (interpolant < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    return () => {
      // Clean up if needed
    };
  }, [startX, endX, duration, easingStyle, easingDirection]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        width: '50px',
        height: '50px',
        backgroundColor: 'blue',
        position: 'absolute',
        left: `${position}px`,
        top: '50%',
        transform: 'translateY(-50%)',
      }}
    />
  );
};

export default AnimatedBox;