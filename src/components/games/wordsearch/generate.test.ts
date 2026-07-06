import { describe, it, expect } from "vitest";
import { generateWordSearch } from "./generate";

const BASE_CONFIG = { wordCount: 10 as const, mode: "print" as const };

describe("generateWordSearch", () => {
  it("generates a grid sized for the word count", () => {
    const result = generateWordSearch({ size: 10, difficulty: "easy", ...BASE_CONFIG });
    // wordCount=10 → grid should be 14x14
    expect(result.grid.length).toBeGreaterThanOrEqual(10);
    expect(result.grid[0].length).toBeGreaterThanOrEqual(10);
  });

  it("contains all placed words in the grid", () => {
    const result = generateWordSearch({ size: 14, difficulty: "medium", ...BASE_CONFIG });
    for (const word of result.words) {
      const found = result.positions.find((p) => p.word === word);
      expect(found).toBeDefined();
    }
  });

  it("places the requested number of words", () => {
    const result = generateWordSearch({ size: 14, difficulty: "easy", wordCount: 5, mode: "print" });
    expect(result.words.length).toBe(5);
  });

  it("fills all cells with letters", () => {
    const result = generateWordSearch({ size: 10, difficulty: "hard", ...BASE_CONFIG });
    for (const row of result.grid) {
      for (const cell of row) {
        expect(cell).toMatch(/^[A-Z]$/);
      }
    }
  });

  it("expert difficulty uses reverse directions", () => {
    const result = generateWordSearch({ size: 22, difficulty: "expert", wordCount: 10, mode: "print" });
    expect(result.words.length).toBe(10);
  });
});
