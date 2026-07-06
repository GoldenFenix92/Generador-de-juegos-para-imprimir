import { describe, it, expect } from "vitest";
import { shuffle } from "./shuffle";
import { createGrid, cloneGrid } from "./grid";

describe("shuffle", () => {
  it("returns an array of the same length", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
  });

  it("contains the same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result.sort()).toEqual(input.sort());
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });
});

describe("createGrid", () => {
  it("creates a grid with the correct dimensions", () => {
    const grid = createGrid(3, 4, 0);
    expect(grid).toHaveLength(3);
    expect(grid[0]).toHaveLength(4);
  });

  it("fills all cells with the default value", () => {
    const grid = createGrid(2, 2, "X");
    expect(grid[0][0]).toBe("X");
    expect(grid[0][1]).toBe("X");
    expect(grid[1][0]).toBe("X");
    expect(grid[1][1]).toBe("X");
  });
});

describe("cloneGrid", () => {
  it("creates an independent copy", () => {
    const original = [
      [1, 2],
      [3, 4],
    ];
    const cloned = cloneGrid(original);
    cloned[0][0] = 99;
    expect(original[0][0]).toBe(1);
  });
});
