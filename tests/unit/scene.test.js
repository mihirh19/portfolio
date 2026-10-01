import { describe, expect, test, mock } from "bun:test";
import { sceneStore } from "@/lib/scene-store";
import { buildShapes, SHAPE_NAMES } from "@/components/scene/shapes";
import { computeSceneProgress } from "@/components/scene/progress";

describe("sceneStore", () => {
  test("set merges and notifies; unsubscribe stops notifications", () => {
    const fn = mock(() => {});
    const off = sceneStore.subscribe(fn);
    sceneStore.set({ progress: 2.5 });
    expect(sceneStore.get().progress).toBe(2.5);
    expect(sceneStore.get().override).toBeNull();
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    sceneStore.set({ progress: 0 });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("buildShapes", () => {
  const shapes = buildShapes(500, 7);

  test("builds every shape with count*3 finite, bounded values", () => {
    expect(Object.keys(shapes).sort()).toEqual([...SHAPE_NAMES].sort());
    for (const name of SHAPE_NAMES) {
      const arr = shapes[name];
      expect(arr).toBeInstanceOf(Float32Array);
      expect(arr.length).toBe(1500);
      for (const v of arr) {
        expect(Number.isFinite(v)).toBe(true);
        expect(Math.abs(v)).toBeLessThan(6);
      }
    }
  });

  test("is deterministic for the same seed", () => {
    expect(buildShapes(500, 7).brain).toEqual(shapes.brain);
    expect(buildShapes(500, 8).brain).not.toEqual(shapes.brain);
  });
});

describe("computeSceneProgress", () => {
  const vh = 1000; // center line at 500
  const rects = (tops) => tops.map((t) => ({ top: t, bottom: t + 1000 }));

  test("empty → 0", () => expect(computeSceneProgress([], vh)).toBe(0));
  test("before first section → 0", () => expect(computeSceneProgress(rects([600, 1600]), vh)).toBe(0));
  test("first 60% of a section holds its shape", () => expect(computeSceneProgress(rects([0, 1000]), vh)).toBe(0));
  test("last 40% morphs to next", () => expect(computeSceneProgress(rects([-300, 700]), vh)).toBeCloseTo(0.5));
  test("inside last section → last index", () => expect(computeSceneProgress(rects([-2000, -1000, 0]), vh)).toBe(2));
  test("in a gap after a section → fully next", () =>
    expect(computeSceneProgress([{ top: -900, bottom: 100 }, { top: 800, bottom: 1800 }], vh)).toBe(1));
});
