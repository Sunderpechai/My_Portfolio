"use client";

import { useState, useEffect } from "react";
import { GradientMeshBackground } from "./gradient-mesh-background";
import { MatrixRainBackground } from "./matrix-rain-background";
import { Sparkles, Code2 } from "lucide-react";

export function BackgroundSwitcher() {
  const [backgroundType, setBackgroundType] = useState<"gradient" | "matrix">("gradient");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved preference from localStorage
    const saved = localStorage.getItem("backgroundType");
    if (saved === "gradient" || saved === "matrix") {
      setBackgroundType(saved);
    }
  }, []);

  const toggleBackground = () => {
    const newType = backgroundType === "gradient" ? "matrix" : "gradient";
    setBackgroundType(newType);
    localStorage.setItem("backgroundType", newType);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Render the selected background */}
      {backgroundType === "gradient" ? <GradientMeshBackground /> : <MatrixRainBackground />}

      {/* Background Toggle Button */}
      <button
        onClick={toggleBackground}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-card border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        aria-label="Toggle background effect"
        title={`Switch to ${backgroundType === "gradient" ? "Matrix Rain" : "Gradient Mesh"}`}
      >
        <div className="relative w-6 h-6">
          {backgroundType === "gradient" ? (
            <Code2 className="w-6 h-6 text-primary transition-transform group-hover:rotate-12" />
          ) : (
            <Sparkles className="w-6 h-6 text-primary transition-transform group-hover:rotate-12" />
          )}
        </div>
      </button>

      {/* Optional: Background Type Indicator */}
      <div className="fixed bottom-20 right-6 z-40 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {backgroundType === "gradient" ? "Gradient Mesh" : "Matrix Rain"}
      </div>
    </>
  );
}

