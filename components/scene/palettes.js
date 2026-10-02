export const palettes = {
  dark: {
    colorA: "#7c5cff",
    colorB: "#22d3ee",
    opacity: 0.75,
    size: 22,
    glowBoost: 0.8,
    additive: true,
    bloom: true,
    coreBackground: "#05060a",
    coreEdge: "#ffffff",
  },
  light: {
    colorA: "#1e1b4b",
    colorB: "#f97316",
    opacity: 0.75,
    size: 22,
    glowBoost: 0,
    additive: false,
    bloom: false,
    coreBackground: "#f6f4ef",
    coreEdge: "#1e1b4b",
  },
};

export function getPalette(theme) {
  return theme === "light" ? palettes.light : palettes.dark;
}
