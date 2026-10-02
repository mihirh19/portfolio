const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Holds a section's shape for its first 60%, then morphs toward the next one.
export function computeSceneProgress(rects, viewportHeight) {
  const n = rects.length;
  if (!n) return 0;
  const center = viewportHeight / 2;

  let i = -1;
  for (let k = 0; k < n; k++) if (rects[k].top <= center) i = k;
  if (i === -1) return 0;
  if (i === n - 1) return n - 1;

  const { top, bottom } = rects[i];
  const frac = bottom > top ? (center - top) / (bottom - top) : 1;
  return i + clamp01((frac - 0.6) / 0.4);
}
