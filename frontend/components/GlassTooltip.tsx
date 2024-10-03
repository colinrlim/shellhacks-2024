// @/components/GlassTooltip.tsx

// Imports
import React, { useState, useEffect } from "react";

// Types
type Quadrant = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

interface GlassTooltipProps {
  children: React.ReactNode;
  show: boolean;
}

// * GlassTooltip
/**
 * Displays a compact, glass-like tooltip that follows the cursor
 * and positions itself based on the cursor's location on the screen.
 */
function GlassTooltip({ children, show }: GlassTooltipProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [quadrant, setQuadrant] = useState<Quadrant>("topLeft");

  useEffect(
    function handleMouseMove() {
      function updatePosition(e: MouseEvent) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const newQuadrant: Quadrant =
          mouseY < windowHeight / 2
            ? mouseX < windowWidth / 2
              ? "topLeft"
              : "topRight"
            : mouseX < windowWidth / 2
            ? "bottomLeft"
            : "bottomRight";

        setQuadrant(newQuadrant);
        setPosition({ x: mouseX, y: mouseY });
      }

      if (show) {
        window.addEventListener("mousemove", updatePosition);
      }

      return function cleanup() {
        window.removeEventListener("mousemove", updatePosition);
      };
    },
    [show]
  );

  if (!show) return null;

  function getTooltipPosition() {
    const offset = 15;
    switch (quadrant) {
      case "topLeft":
        return {
          left: `${position.x + offset}px`,
          top: `${position.y + offset}px`,
        };
      case "topRight":
        return {
          right: `${window.innerWidth - position.x + offset}px`,
          top: `${position.y + offset}px`,
        };
      case "bottomLeft":
        return {
          left: `${position.x + offset}px`,
          bottom: `${window.innerHeight - position.y + offset}px`,
        };
      case "bottomRight":
        return {
          right: `${window.innerWidth - position.x + offset}px`,
          bottom: `${window.innerHeight - position.y + offset}px`,
        };
    }
  }

  return (
    <div
      className="fixed z-50 px-4 py-2 rounded-md shadow-lg pointer-events-none"
      style={{
        ...getTooltipPosition(),
        maxWidth: "400px",
        minWidth: "200px",
        backgroundColor: "rgba(250, 250, 250, 0.8)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        color: "rgba(0, 0, 0, 0.8)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: "13px",
        lineHeight: "1.3",
        textAlign: "center",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {children}
    </div>
  );
}

export default GlassTooltip;
