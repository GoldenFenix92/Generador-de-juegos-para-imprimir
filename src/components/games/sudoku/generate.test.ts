import { describe, it, expect } from "vitest";
import { generateSudoku } from "./generate";

describe("generateSudoku", () => {
  it("generates a 9x9 puzzle", () => {
    const result = generateSudoku({ size: 9, difficulty: "easy" });
    expect(result.puzzle).toHaveLength(9);
    expect(result.puzzle[0]).toHaveLength(9);
    expect(result.solution).toHaveLength(9);
  });

  it("solution has no zeros (valid complete grid)", () => {
    const result = generateSudoku({ size: 9, difficulty: "medium" });
    for (const row of result.solution) {
      for (const cell of row) {
        expect(cell).toBeGreaterThanOrEqual(1);
        expect(cell).toBeLessThanOrEqual(9);
      }
    }
  });

  it("puzzle has fewer filled cells than solution", () => {
    const result = generateSudoku({ size: 9, difficulty: "easy" });
    const puzzleFilled = result.puzzle.flat().filter((v) => v !== 0).length;
    const solutionFilled = result.solution.flat().filter((v) => v !== 0).length;
    expect(puzzleFilled).toBeLessThan(solutionFilled);
  });

  it("hard difficulty removes more cells than easy", () => {
    const easy = generateSudoku({ size: 9, difficulty: "easy" });
    const hard = generateSudoku({ size: 9, difficulty: "hard" });
    const easyEmpty = easy.puzzle.flat().filter((v) => v === 0).length;
    const hardEmpty = hard.puzzle.flat().filter((v) => v === 0).length;
    expect(hardEmpty).toBeGreaterThanOrEqual(easyEmpty);
  });
});
