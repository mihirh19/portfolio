// Mutable, listener-free scroll info read inside render loops (no React re-renders).
// `velocity` is Lenis's px-per-frame scroll speed; stays 0 when smooth scroll is off.
export const scrollState = { velocity: 0 };
