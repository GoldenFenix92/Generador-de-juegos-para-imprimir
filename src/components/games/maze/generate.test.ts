import { describe, it, expect } from "vitest";
import { generateMaze } from "./generate";

describe("generateMaze", () => {
  it("generates a grid with odd dimensions", () => {
    const result = generateMaze({ size: 5, difficulty: "easy" });
    expect(result.width).toBe(5 * 2 + 1);
    expect(result.height).toBe(5 * 2 + 1);
  });

  it("has an open start and end cell", () => {
    const result = generateMaze({ size: 6, difficulty: "medium" });
    expect(result.walls[result.start[0] * 2 + 1]?.[result.start[1] * 2 + 1]).toBe(false);
    expect(result.walls[result.end[0] * 2 + 1]?.[result.end[1] * 2 + 1]).toBe(false);
  });

  it("produces a solvable maze", () => {
    const size = 10;
    const result = generateMaze({ size, difficulty: "easy" });
    expect(result.solution.length).toBeGreaterThan(0);
    expect(result.solution[0]).toEqual([0, 0]);
    expect(result.solution[result.solution.length - 1]).toEqual([size - 1, size - 1]);
  });
});
