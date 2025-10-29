"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { getThemeByName } from "@/lib/config";

export function GradientMeshBackground() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [gradientColors, setGradientColors] = useState({
    color1: "hsl(204, 100%, 40%)",
    color2: "hsl(262, 55%, 65%)",
    color3: "hsl(340, 95%, 60%)",
    color4: "hsl(175, 70%, 50%)",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && theme) {
      try {
        const currentTheme = getThemeByName(theme === "system" ? "light" : theme);
        
        if (currentTheme && currentTheme.gradientConfig) {
          setGradientColors(currentTheme.gradientConfig);
        }
      } catch (error) {
        console.error("Error setting up gradient:", error);
      }
    }
  }, [mounted, theme]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="gradient-mesh-container">
      <div className="gradient-mesh">
        <div 
          className="gradient-blob gradient-blob-1"
          style={{ 
            background: `radial-gradient(circle at center, ${gradientColors.color1}, transparent 70%)` 
          }}
        />
        <div 
          className="gradient-blob gradient-blob-2"
          style={{ 
            background: `radial-gradient(circle at center, ${gradientColors.color2}, transparent 70%)` 
          }}
        />
        <div 
          className="gradient-blob gradient-blob-3"
          style={{ 
            background: `radial-gradient(circle at center, ${gradientColors.color3}, transparent 70%)` 
          }}
        />
        <div 
          className="gradient-blob gradient-blob-4"
          style={{ 
            background: `radial-gradient(circle at center, ${gradientColors.color4}, transparent 70%)` 
          }}
        />
        <div 
          className="gradient-blob gradient-blob-5"
          style={{ 
            background: `radial-gradient(circle at center, ${gradientColors.color1}, transparent 70%)` 
          }}
        />
      </div>
      <div className="gradient-overlay" />
    </div>
  );
}

