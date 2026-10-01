export const palettes = {
  dark: { colorA: "#7c5cff", colorB: "#22d3ee", opacity: 0.75, size: 22, glowBoost: 0.8, additive: true, bloom: true },
  light: { colorA: "#1e1b4b", colorB: "#f97316", opacity: 0.75, size: 22, glowBoost: 0, additive: false, bloom: false },
};

export function getPalette(theme) {
  return theme === "light" ? palettes.light : palettes.dark;
}
