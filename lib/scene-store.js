const state = {
  sequence: [],
  offsets: [],
  opacities: [],
  progress: 0,
  override: null,
  dimmed: false,
  assemble: 1,
  pulse: 0,
};

const listeners = new Set();

export const sceneStore = {
  get: () => state,
  set(patch) {
    Object.assign(state, patch);
    listeners.forEach((l) => l());
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
