"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { getThemeByName } from "@/lib/config";

interface GridCell {
  x: number;
  y: number;
  active: boolean;
  activationProgress: number;
  delay: number;
}

export function GeometricGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const animationFrameId = useRef<number>();
  const gridCellsRef = useRef<GridCell[]>([]);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get theme colors
    const currentTheme = getThemeByName(theme === "system" ? "light" : theme);
    const gridConfig = currentTheme?.gridConfig || {
      gridSize: 60,
      lineColor: "#3b82f6",
      activeColor: "#f59e0b",
      lineWidth: 1,
      dotSize: 3,
      hoverRadius: 150,
      animationSpeed: 0.02,
    };

    // Initialize grid cells
    const initializeGrid = () => {
      const cells: GridCell[] = [];
      const cols = Math.ceil(canvas.width / gridConfig.gridSize) + 1;
      const rows = Math.ceil(canvas.height / gridConfig.gridSize) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          cells.push({
            x: i * gridConfig.gridSize,
            y: j * gridConfig.gridSize,
            active: false,
            activationProgress: 0,
            delay: Math.random() * 100,
          });
        }
      }
      gridCellsRef.current = cells;
    };

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeGrid();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Animation function
    const draw = () => {
      // Clear canvas
      ctx.fillStyle = theme === "light" ? "#ffffff" : "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cells = gridCellsRef.current;
      timeRef.current += gridConfig.animationSpeed;

      // Draw grid lines
      ctx.strokeStyle = gridConfig.lineColor + "20"; // 20 = low opacity
      ctx.lineWidth = gridConfig.lineWidth;

      // Vertical lines
      for (let x = 0; x <= canvas.width; x += gridConfig.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= canvas.height; y += gridConfig.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update and draw cells
      cells.forEach((cell, index) => {
        // Check distance from mouse
        const dx = cell.x - mouseRef.current.x;
        const dy = cell.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const isNearMouse = distance < gridConfig.hoverRadius;

        // Random activation
        if (Math.random() > 0.998 && !cell.active) {
          cell.active = true;
          cell.activationProgress = 0;
        }

        // Update activation progress
        if (cell.active || isNearMouse) {
          cell.activationProgress = Math.min(1, cell.activationProgress + 0.05);
        } else {
          cell.activationProgress = Math.max(0, cell.activationProgress - 0.02);
        }

        // Deactivate after full cycle
        if (cell.active && cell.activationProgress >= 1) {
          cell.active = false;
        }

        // Draw intersection dots
        if (cell.activationProgress > 0 || isNearMouse) {
          const progress = cell.activationProgress;
          const pulseSize = isNearMouse
            ? gridConfig.dotSize + Math.sin(timeRef.current * 3 + index * 0.1) * 2
            : gridConfig.dotSize;

          // Outer glow
          if (progress > 0.3 || isNearMouse) {
            ctx.beginPath();
            ctx.arc(cell.x, cell.y, pulseSize + 6, 0, Math.PI * 2);
            const glowGradient = ctx.createRadialGradient(
              cell.x,
              cell.y,
              0,
              cell.x,
              cell.y,
              pulseSize + 6
            );
            const glowColor = isNearMouse ? gridConfig.activeColor : gridConfig.lineColor;
            glowGradient.addColorStop(0, glowColor + "40");
            glowGradient.addColorStop(1, glowColor + "00");
            ctx.fillStyle = glowGradient;
            ctx.fill();
          }

          // Main dot
          ctx.beginPath();
          ctx.arc(cell.x, cell.y, pulseSize, 0, Math.PI * 2);
          const dotColor = isNearMouse ? gridConfig.activeColor : gridConfig.lineColor;
          const opacity = Math.floor(progress * 255)
            .toString(16)
            .padStart(2, "0");
          ctx.fillStyle = dotColor + opacity;
          ctx.fill();

          // Dot border
          ctx.strokeStyle = dotColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Draw connecting lines to nearby active cells
        if (cell.activationProgress > 0.5 || isNearMouse) {
          cells.forEach((otherCell, otherIndex) => {
            if (otherIndex <= index) return;

            const cellDx = cell.x - otherCell.x;
            const cellDy = cell.y - otherCell.y;
            const cellDistance = Math.sqrt(cellDx * cellDx + cellDy * cellDy);

            // Only connect adjacent cells
            if (cellDistance <= gridConfig.gridSize * 1.5) {
              const otherIsNearMouse =
                Math.sqrt(
                  Math.pow(otherCell.x - mouseRef.current.x, 2) +
                    Math.pow(otherCell.y - mouseRef.current.y, 2)
                ) < gridConfig.hoverRadius;

              if (otherCell.activationProgress > 0.5 || otherIsNearMouse) {
                ctx.beginPath();
                ctx.moveTo(cell.x, cell.y);
                ctx.lineTo(otherCell.x, otherCell.y);

                const lineOpacity = Math.min(
                  cell.activationProgress,
                  otherCell.activationProgress
                );
                const opacity = Math.floor(lineOpacity * 100)
                  .toString(16)
                  .padStart(2, "0");

                const lineColor =
                  isNearMouse || otherIsNearMouse
                    ? gridConfig.activeColor
                    : gridConfig.lineColor;
                ctx.strokeStyle = lineColor + opacity;
                ctx.lineWidth = 2;
                ctx.stroke();
              }
            }
          });
        }

        // Draw geometric shapes at active intersections
        if (cell.activationProgress > 0.7) {
          const shapeSize = gridConfig.gridSize * 0.3 * cell.activationProgress;
          const rotation = timeRef.current + cell.delay;

          ctx.save();
          ctx.translate(cell.x, cell.y);
          ctx.rotate(rotation);

          // Draw diamond/square
          ctx.beginPath();
          ctx.moveTo(0, -shapeSize);
          ctx.lineTo(shapeSize, 0);
          ctx.lineTo(0, shapeSize);
          ctx.lineTo(-shapeSize, 0);
          ctx.closePath();

          const shapeOpacity = Math.floor(cell.activationProgress * 50)
            .toString(16)
            .padStart(2, "0");
          ctx.fillStyle = gridConfig.lineColor + shapeOpacity;
          ctx.fill();

          ctx.strokeStyle = gridConfig.lineColor + "80";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.restore();
        }
      });

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mounted, theme]);

  if (!mounted) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="geometric-grid-canvas"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "auto",
        cursor: "crosshair",
      }}
    />
  );
}

