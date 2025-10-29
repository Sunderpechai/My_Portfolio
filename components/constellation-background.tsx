"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { getThemeByName } from "@/lib/config";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  targetOpacity: number;
  hue: number;
}

export function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, radius: 150 });
  const timeRef = useRef(0);

  const getColors = useCallback(() => {
    const currentTheme = getThemeByName(theme || "dark");
    const particleConfig = currentTheme?.particleConfig || {
      particleCount: 80,
      color: "#3b82f6",
      linkColor: "#3b82f6",
      speed: 0.5,
      size: 3,
      opacity: 0.8,
    };

    return {
      particleColor: particleConfig.color || "#3b82f6",
      linkColor: particleConfig.linkColor || "#3b82f6",
      particleCount: particleConfig.particleCount || 80,
      speed: particleConfig.speed || 0.5,
      size: particleConfig.size || 3,
      opacity: particleConfig.opacity || 0.8,
    };
  }, [theme]);

  const initializeParticles = useCallback((canvas: HTMLCanvasElement) => {
    const config = getColors();
    const particles: Particle[] = [];

    for (let i = 0; i < config.particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        radius: Math.random() * config.size + 1,
        opacity: Math.random() * config.opacity,
        targetOpacity: Math.random() * config.opacity,
        hue: Math.random() * 60 - 30, // Slight hue variation
      });
    }

    particlesRef.current = particles;
  }, [getColors]);

  const drawConstellation = useCallback(
    (ctx: CanvasRenderingContext2D, particles: Particle[], config: any) => {
      const connectionDistance = 180;
      const mouseDistance = mouseRef.current.radius;

      // Draw connections (constellation lines)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.7;

            // Check if mouse is near this connection
            const midX = (particles[i].x + particles[j].x) / 2;
            const midY = (particles[i].y + particles[j].y) / 2;
            const mouseDistToLine = Math.sqrt(
              Math.pow(midX - mouseRef.current.x, 2) +
              Math.pow(midY - mouseRef.current.y, 2)
            );

            const isNearMouse = mouseDistToLine < mouseDistance;

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);

            if (isNearMouse) {
              // Highlighted connection near mouse
              const gradient = ctx.createLinearGradient(
                particles[i].x,
                particles[i].y,
                particles[j].x,
                particles[j].y
              );
              gradient.addColorStop(0, `rgba(59, 130, 246, ${opacity * 2})`);
              gradient.addColorStop(0.5, `rgba(147, 51, 234, ${opacity * 2})`);
              gradient.addColorStop(1, `rgba(236, 72, 153, ${opacity * 2})`);
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 2;
            } else {
              // Normal connection
              ctx.strokeStyle = `${config.linkColor}${Math.floor(opacity * 255)
                .toString(16)
                .padStart(2, "0")}`;
              ctx.lineWidth = 1;
            }

            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((particle, index) => {
        // Check distance to mouse
        const dx = particle.x - mouseRef.current.x;
        const dy = particle.y - mouseRef.current.y;
        const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
        const isNearMouse = distanceToMouse < mouseDistance;

        // Update target opacity for twinkling effect
        if (Math.random() < 0.01) {
          particle.targetOpacity = Math.random() * config.opacity;
        }

        // Smooth opacity transition
        particle.opacity += (particle.targetOpacity - particle.opacity) * 0.05;

        // Draw particle glow
        if (isNearMouse) {
          const glowSize = particle.radius * 4;
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            glowSize
          );
          gradient.addColorStop(0, `rgba(59, 130, 246, ${particle.opacity})`);
          gradient.addColorStop(0.5, `rgba(147, 51, 234, ${particle.opacity * 0.5})`);
          gradient.addColorStop(1, "rgba(236, 72, 153, 0)");

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Draw main particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);

        if (isNearMouse) {
          // Highlighted particle
          const particleGradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.radius
          );
          particleGradient.addColorStop(0, "#ffffff");
          particleGradient.addColorStop(1, config.particleColor);
          ctx.fillStyle = particleGradient;
        } else {
          // Normal particle with twinkling
          ctx.fillStyle = `${config.particleColor}${Math.floor(particle.opacity * 255)
            .toString(16)
            .padStart(2, "0")}`;
        }

        ctx.fill();

        // Add sparkle effect to some particles
        if (particle.opacity > config.opacity * 0.8 && Math.random() < 0.02) {
          const sparkleSize = particle.radius * 2;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y - sparkleSize);
          ctx.lineTo(particle.x, particle.y + sparkleSize);
          ctx.moveTo(particle.x - sparkleSize, particle.y);
          ctx.lineTo(particle.x + sparkleSize, particle.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${particle.opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    },
    []
  );

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const config = getColors();
    const particles = particlesRef.current;

    timeRef.current += 0.01;

    // Clear canvas with fade effect
    ctx.fillStyle = theme === "light" ? "rgba(255, 255, 255, 0.08)" : "rgba(17, 24, 39, 0.08)";
    ctx.fillRect(0, 0, width, height);

    // Update particle positions
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -1;
        particle.x = Math.max(0, Math.min(width, particle.x));
      }
      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -1;
        particle.y = Math.max(0, Math.min(height, particle.y));
      }

      // Mouse repulsion effect
      const dx = particle.x - mouseRef.current.x;
      const dy = particle.y - mouseRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouseRef.current.radius) {
        const force = (mouseRef.current.radius - distance) / mouseRef.current.radius;
        particle.vx += (dx / distance) * force * 0.5;
        particle.vy += (dy / distance) * force * 0.5;
      }

      // Damping to prevent particles from moving too fast
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Ensure minimum speed
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed < config.speed * 0.3) {
        particle.vx += (Math.random() - 0.5) * 0.1;
        particle.vy += (Math.random() - 0.5) * 0.1;
      }
    });

    // Draw constellation
    drawConstellation(ctx, particles, config);

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [getColors, drawConstellation, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeParticles(canvas);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    // Start animation
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializeParticles, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="constellation-canvas"
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

