"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { getThemeByName } from "@/lib/config";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  layer: number;
  active: boolean;
  activationLevel: number;
}

export function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const animationFrameId = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const pulseTimeRef = useRef<number>(0);

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
    const neuralConfig = currentTheme?.neuralConfig || {
      nodeColor: "#3b82f6",
      connectionColor: "#3b82f6",
      activeColor: "#f59e0b",
      nodeCount: 50,
      connectionDistance: 200,
      pulseSpeed: 0.02,
    };

    // Initialize nodes
    const initializeNodes = () => {
      const nodes: Node[] = [];
      const nodeCount = neuralConfig.nodeCount;

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          layer: Math.floor(Math.random() * 3), // 0: input, 1: hidden, 2: output
          active: Math.random() > 0.7,
          activationLevel: Math.random(),
        });
      }
      nodesRef.current = nodes;
    };

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeNodes();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation function
    const draw = () => {
      // Clear canvas with slight transparency for trail effect
      ctx.fillStyle = theme === "light" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      pulseTimeRef.current += neuralConfig.pulseSpeed;

      // Update and draw connections first (so they appear behind nodes)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < neuralConfig.connectionDistance) {
            const opacity = 1 - distance / neuralConfig.connectionDistance;
            
            // Determine if connection is active (both nodes active)
            const isActive = nodes[i].active && nodes[j].active;
            
            // Animated pulse effect for active connections
            const pulseValue = isActive 
              ? Math.sin(pulseTimeRef.current + distance * 0.01) * 0.5 + 0.5
              : 0;

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            
            if (isActive) {
              // Active connection with gradient
              const gradient = ctx.createLinearGradient(
                nodes[i].x, nodes[i].y,
                nodes[j].x, nodes[j].y
              );
              gradient.addColorStop(0, neuralConfig.activeColor + Math.floor(opacity * pulseValue * 255).toString(16).padStart(2, '0'));
              gradient.addColorStop(1, neuralConfig.connectionColor + Math.floor(opacity * 100).toString(16).padStart(2, '0'));
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 2 * pulseValue + 0.5;
            } else {
              // Inactive connection
              ctx.strokeStyle = neuralConfig.connectionColor + Math.floor(opacity * 50).toString(16).padStart(2, '0');
              ctx.lineWidth = 1;
            }
            
            ctx.stroke();
          }
        }
      }

      // Update and draw nodes
      nodes.forEach((node, index) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Keep within bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Randomly activate/deactivate nodes
        if (Math.random() > 0.99) {
          node.active = !node.active;
        }

        // Update activation level
        if (node.active) {
          node.activationLevel = Math.min(1, node.activationLevel + 0.05);
        } else {
          node.activationLevel = Math.max(0, node.activationLevel - 0.02);
        }

        // Draw node
        const pulseSize = node.active 
          ? Math.sin(pulseTimeRef.current * 2 + index) * 2 + 3
          : 3;

        // Outer glow for active nodes
        if (node.active && node.activationLevel > 0.5) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseSize + 8, 0, Math.PI * 2);
          const glowGradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, pulseSize + 8
          );
          glowGradient.addColorStop(0, neuralConfig.activeColor + '40');
          glowGradient.addColorStop(1, neuralConfig.activeColor + '00');
          ctx.fillStyle = glowGradient;
          ctx.fill();
        }

        // Main node
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        
        if (node.active) {
          // Active node with gradient
          const nodeGradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, pulseSize
          );
          nodeGradient.addColorStop(0, neuralConfig.activeColor);
          nodeGradient.addColorStop(1, neuralConfig.nodeColor);
          ctx.fillStyle = nodeGradient;
        } else {
          ctx.fillStyle = neuralConfig.nodeColor + Math.floor(node.activationLevel * 255).toString(16).padStart(2, '0');
        }
        
        ctx.fill();

        // Node border
        ctx.strokeStyle = node.active ? neuralConfig.activeColor : neuralConfig.nodeColor;
        ctx.lineWidth = node.active ? 2 : 1;
        ctx.stroke();
      });

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
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
      className="neural-network-canvas"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

