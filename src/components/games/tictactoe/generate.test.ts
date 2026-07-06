import { describe, it, expect } from "vitest";
import { generateTicTacToe } from "./generate";

describe("generateTicTacToe", () => {
  it("generates a 3x3 grid", () => {
    const result = generateTicTacToe({ size: 3, difficulty: "easy" });
    expect(result.grid).toHaveLength(3);
    expect(result.grid[0]).toHaveLength(3);
  });

  it("all cells are null", () => {
    const result = generateTicTacToe({ size: 3, difficulty: "easy" });
    for (const row of result.grid) {
      for (const cell of row) {
        expect(cell).toBeNull();
      }
    }
  });
});
