import React, { useEffect, useRef, useState } from 'react';
import { tween } from '../lib/tween';

interface TweenedTextboxProps {
  startY: number;
  endY: number;
  duration: number;
  easingStyle: string;
  easingDirection: string;
  onEnter: (value: string) => void;
}

const TweenedTextbox: React.FC<TweenedTextboxProps> = ({
  startY,
  endY,
  duration,
  easingStyle,
  easingDirection,
  onEnter,
}) => {
  const [position, setPosition] = useState(startY);
  const [inputValue, setInputValue] = useState('');
  const startTime = useRef(Date.now());

  useEffect(() => {
    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime.current) / 1000; // Convert to seconds
      const interpolant = Math.min(elapsedTime / duration, 1);

      const newPosition = tween(startY, endY, interpolant, easingStyle, easingDirection);
      setPosition(newPosition);

      if (interpolant < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    return () => {
      // Clean up if needed
    };
  }, [startY, endY, duration, easingStyle, easingDirection]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onEnter(inputValue);
      setInputValue('');
    }
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyPress={handleKeyPress}
      style={{
        position: 'absolute',
        left: '50%',
        top: `${position}px`,
        transform: 'translateX(-50%)',
        padding: '10px',
        fontSize: '16px',
        width: '200px',
      }}
      placeholder="Type and press Enter"
    />
  );
};

export default TweenedTextbox;