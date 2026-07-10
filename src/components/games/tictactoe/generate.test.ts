import { describe, it, expect } from "vitest";
import { generateTicTacToe } from "./generate";

describe("generateTicTacToe", () => {
  it("generates a 3x3 grid for easy", () => {
    const result = generateTicTacToe({ size: 3, difficulty: "easy" });
    expect(result.grid).toHaveLength(3);
    expect(result.grid[0]).toHaveLength(3);
    expect(result.gridSize).toBe(3);
    expect(result.winLength).toBe(3);
  });

  it("all cells are null", () => {
    const result = generateTicTacToe({ size: 3, difficulty: "easy" });
    for (const row of result.grid) {
      for (const cell of row) {
        expect(cell).toBeNull();
      }
    }
  });

  it("generates a 4x4 grid for expert", () => {
    const result = generateTicTacToe({ size: 3, difficulty: "expert" });
    expect(result.grid).toHaveLength(4);
    expect(result.grid[0]).toHaveLength(4);
    expect(result.gridSize).toBe(4);
    expect(result.winLength).toBe(4);
  });
});
