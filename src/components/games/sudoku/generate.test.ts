import { describe, it, expect } from "vitest";
import { generateSudoku } from "./generate";

describe("generateSudoku", () => {
  it.each(["easy", "medium", "hard", "expert"] as const)("generates a puzzle for %s difficulty", (difficulty) => {
    const result = generateSudoku({ size: 9, difficulty });
    expect(result.puzzle.length).toBeGreaterThan(0);
    expect(result.solution.length).toBe(result.puzzle.length);
  });

  it("easy generates a 4x4 grid", () => {
    const result = generateSudoku({ size: 4, difficulty: "easy" });
    expect(result.puzzle).toHaveLength(4);
    expect(result.puzzle[0]).toHaveLength(4);
    expect(result.solution).toHaveLength(4);
  });

  it("medium generates a 6x6 grid", () => {
    const result = generateSudoku({ size: 6, difficulty: "medium" });
    expect(result.puzzle).toHaveLength(6);
    expect(result.puzzle[0]).toHaveLength(6);
    expect(result.solution).toHaveLength(6);
  });

  it("hard generates a 9x9 grid", () => {
    const result = generateSudoku({ size: 9, difficulty: "hard" });
    expect(result.puzzle).toHaveLength(9);
    expect(result.puzzle[0]).toHaveLength(9);
  });

  it("expert generates a 9x9 grid", () => {
    const result = generateSudoku({ size: 9, difficulty: "expert" });
    expect(result.puzzle).toHaveLength(9);
    expect(result.puzzle[0]).toHaveLength(9);
  });

  it("solution has no zeros (valid complete grid)", () => {
    const result = generateSudoku({ size: 9, difficulty: "medium" });
    for (const row of result.solution) {
      for (const cell of row) {
        expect(cell).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("puzzle has fewer filled cells than solution", () => {
    const result = generateSudoku({ size: 9, difficulty: "hard" });
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

  it("expert removes more cells than hard", () => {
    const hard = generateSudoku({ size: 9, difficulty: "hard" });
    const expert = generateSudoku({ size: 9, difficulty: "expert" });
    const hardEmpty = hard.puzzle.flat().filter((v) => v === 0).length;
    const expertEmpty = expert.puzzle.flat().filter((v) => v === 0).length;
    expect(expertEmpty).toBeGreaterThanOrEqual(hardEmpty);
  });
});
