import React, { useEffect, useRef, useState } from 'react';
import { tween } from '../lib/tween';

interface TweenedButtonProps {
  startScale: number;
  endScale: number;
  duration: number;
  easingStyle: string;
  easingDirection: string;
  onClick: () => void;
  children: React.ReactNode;
}

const TweenedButton: React.FC<TweenedButtonProps> = ({
  startScale,
  endScale,
  duration,
  easingStyle,
  easingDirection,
  onClick,
  children,
}) => {
  const [scale, setScale] = useState(startScale);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime.current) / 1000;
      const interpolant = Math.min(elapsedTime / duration, 1);

      const newScale = tween(startScale, endScale, interpolant, easingStyle, easingDirection);
      setScale(newScale);

      if (interpolant < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    return () => {
      // Clean up if needed
    };
  }, [startScale, endScale, duration, easingStyle, easingDirection]);

  return (
    <button
      onClick={onClick}
      style={{
        transform: `scale(${scale})`,
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
};

export default TweenedButton;