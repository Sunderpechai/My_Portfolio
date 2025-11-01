// /lib/theme.ts

export interface ThemeGradientConfig {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
}

const themeGradients: Record<string, ThemeGradientConfig> = {
  light: {
    color1: "hsl(204, 100%, 40%)", // Blue
    color2: "hsl(262, 55%, 65%)",  // Purple
    color3: "hsl(340, 95%, 60%)",  // Pink
    color4: "hsl(175, 70%, 50%)",  // Aqua
  },
  dark: {
    color1: "hsl(220, 80%, 30%)",  // Deep blue
    color2: "hsl(280, 50%, 50%)",  // Purple
    color3: "hsl(0, 80%, 45%)",    // Red
    color4: "hsl(160, 60%, 40%)",  // Green-blue
  },
};

export function getThemeGradientByName(name: string): ThemeGradientConfig {
  return themeGradients[name] || themeGradients.light;
}
