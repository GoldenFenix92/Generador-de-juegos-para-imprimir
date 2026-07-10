import { describe, it, expect } from "vitest";
import { generateMaze } from "./generate";

describe("generateMaze", () => {
  it("generates a grid with odd dimensions", () => {
    const result = generateMaze({ size: 5, difficulty: "easy" });
    expect(result.width).toBe(result.height);
    expect(result.width % 2).toBe(1);
    expect(result.height % 2).toBe(1);
  });

  it("has an open start and end cell", () => {
    const result = generateMaze({ size: 8, difficulty: "medium" });
    expect(result.walls[1][1]).toBe(false);
    const endR = result.end[0] * 2 + 1;
    const endC = result.end[1] * 2 + 1;
    expect(result.walls[endR][endC]).toBe(false);
  });

  it("produces a solvable maze", () => {
    const result = generateMaze({ size: 8, difficulty: "easy" });
    expect(result.solution.length).toBeGreaterThan(0);
    expect(result.solution[0]).toEqual([0, 0]);
    expect(result.solution[result.solution.length - 1]).toEqual([4, 4]);
  });

  it("maps difficulty to grid size", () => {
    const easy = generateMaze({ size: 8, difficulty: "easy" });
    const medium = generateMaze({ size: 8, difficulty: "medium" });
    const hard = generateMaze({ size: 8, difficulty: "hard" });
    const expert = generateMaze({ size: 8, difficulty: "expert" });

    expect(easy.width).toBe(5 * 2 + 1);
    expect(medium.width).toBe(8 * 2 + 1);
    expect(hard.width).toBe(12 * 2 + 1);
    expect(expert.width).toBe(16 * 2 + 1);
  });

  it("applies braiding for easy difficulty", () => {
    const easy = generateMaze({ size: 8, difficulty: "easy" });
    const medium = generateMaze({ size: 8, difficulty: "medium" });

    const easyDeadEnds = countDeadEnds(easy);
    const mediumDeadEnds = countDeadEnds(medium);

    expect(easyDeadEnds).toBeLessThan(mediumDeadEnds);
  });
});

function countDeadEnds(maze: { walls: boolean[][] }): number {
  const rows = maze.walls.length;
  const cols = maze.walls[0].length;
  let count = 0;
  for (let r = 1; r < rows - 1; r += 2) {
    for (let c = 1; c < cols - 1; c += 2) {
      let openDirs = 0;
      if (!maze.walls[r - 1][c]) openDirs++;
      if (!maze.walls[r + 1][c]) openDirs++;
      if (!maze.walls[r][c - 1]) openDirs++;
      if (!maze.walls[r][c + 1]) openDirs++;
      if (openDirs === 1) count++;
    }
  }
  return count;
}
