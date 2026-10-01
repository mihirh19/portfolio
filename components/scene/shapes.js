export const SHAPE_NAMES = ["brain", "network", "rings", "grid", "helix", "galaxy", "orb", "scatter"];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;

function fill(count, fn) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const [x, y, z] = fn(i);
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

function fibonacciPoint(i, count) {
  const y = 1 - (2 * (i + 0.5)) / count;
  const r = Math.sqrt(1 - y * y);
  const theta = i * Math.PI * (3 - Math.sqrt(5));
  return [Math.cos(theta) * r, y, Math.sin(theta) * r, theta];
}

const builders = {
  brain(count, rnd) {
    return fill(count, (i) => {
      const [x, y, z, theta] = fibonacciPoint(i, count);
      const fold = 1 + 0.07 * Math.sin(theta * 9) * Math.sin(y * 12);
      const r = 1.55 * fold * (0.92 + rnd() * 0.08);
      const gap = Math.sign(x || 1) * 0.12;
      return [x * r * 1.25 + gap, y * r * 0.95, z * r * 1.1];
    });
  },
  network(count, rnd) {
    const nodes = Array.from({ length: 16 }, () => [(rnd() - 0.5) * 6, (rnd() - 0.5) * 3.6, (rnd() - 0.5) * 2.5]);
    const edges = [];
    for (let a = 0; a < nodes.length; a++) {
      edges.push([a, (a + 1) % nodes.length]);
      edges.push([a, Math.floor(rnd() * nodes.length)]);
    }
    return fill(count, () => {
      const [a, b] = edges[Math.floor(rnd() * edges.length)];
      const t = rnd();
      const j = 0.05;
      return [0, 1, 2].map((k) => nodes[a][k] + (nodes[b][k] - nodes[a][k]) * t + (rnd() - 0.5) * j);
    });
  },
  rings(count, rnd) {
    const rings = [
      { r: 1.0, tilt: 0.3 },
      { r: 1.6, tilt: -0.5 },
      { r: 2.2, tilt: 0.9 },
      { r: 2.8, tilt: -1.2 },
    ];
    return fill(count, (i) => {
      const { r, tilt } = rings[i % rings.length];
      const a = rnd() * TAU;
      const rr = r + (rnd() - 0.5) * 0.08;
      const x = Math.cos(a) * rr;
      const y0 = Math.sin(a) * rr * 0.35;
      return [x, y0 * Math.cos(tilt), y0 * Math.sin(tilt) + (rnd() - 0.5) * 0.05];
    });
  },
  grid(count) {
    const cols = Math.ceil(Math.sqrt(count * 1.8));
    const rows = Math.ceil(count / cols);
    return fill(count, (i) => {
      const cx = i % cols;
      const cy = Math.floor(i / cols);
      const x = (cx / (cols - 1) - 0.5) * 9;
      const y = (cy / Math.max(rows - 1, 1) - 0.5) * 5;
      return [x, y, Math.sin(x * 0.8) * Math.cos(y * 0.8) * 0.3 - 0.5];
    });
  },
  helix(count, rnd) {
    return fill(count, (i) => {
      const t = i / count;
      const a = t * TAU * 5 + (i % 2) * Math.PI;
      const r = 1.1 + (rnd() - 0.5) * 0.1;
      return [Math.cos(a) * r, (t - 0.5) * 6, Math.sin(a) * r];
    });
  },
  galaxy(count, rnd) {
    const arms = 3;
    return fill(count, (i) => {
      const r = Math.pow(rnd(), 0.6) * 3.2;
      const a = ((i % arms) / arms) * TAU + r * 1.4;
      const spread = (0.35 * (3.2 - r)) / 3.2 + 0.05;
      return [
        Math.cos(a) * r + (rnd() - 0.5) * spread,
        (rnd() - 0.5) * spread * 0.6,
        Math.sin(a) * r + (rnd() - 0.5) * spread,
      ];
    });
  },
  orb(count, rnd) {
    return fill(count, (i) => {
      const [x, y, z] = fibonacciPoint(i, count);
      const r = 1.2 + (rnd() - 0.5) * 0.06;
      return [x * r, y * r, z * r];
    });
  },
  scatter(count, rnd) {
    return fill(count, () => [(rnd() - 0.5) * 10, (rnd() - 0.5) * 6, (rnd() - 0.5) * 6]);
  },
};

export function buildShapes(count, seed = 7) {
  const rnd = mulberry32(seed);
  const out = {};
  for (const name of SHAPE_NAMES) out[name] = builders[name](count, rnd);
  return out;
}
