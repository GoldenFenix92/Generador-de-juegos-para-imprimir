import { cloneGrid } from "../../../lib/algorithms";
import type { SudokuConfig, SudokuOutput } from "./types";

const GRID_CONFIGS: Record<string, { size: number; boxRows: number; boxCols: number; remove: number }> = {
  easy:   { size: 4, boxRows: 2, boxCols: 2, remove: 5 },
  medium: { size: 6, boxRows: 2, boxCols: 3, remove: 13 },
  hard:   { size: 9, boxRows: 3, boxCols: 3, remove: 42 },
  expert: { size: 9, boxRows: 3, boxCols: 3, remove: 62 },
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createSolver(size: number, boxRows: number, boxCols: number) {
  const maxNum = size;

  function isValid(grid: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < size; i++) {
      if (grid[row][i] === num) return false;
      if (grid[i][col] === num) return false;
    }
    const boxR = Math.floor(row / boxRows) * boxRows;
    const boxC = Math.floor(col / boxCols) * boxCols;
    for (let r = boxR; r < boxR + boxRows; r++) {
      for (let c = boxC; c < boxC + boxCols; c++) {
        if (grid[r][c] === num) return false;
      }
    }
    return true;
  }

  function solve(grid: number[][]): boolean {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) {
          const nums = shuffleArray(Array.from({ length: maxNum }, (_, i) => i + 1));
          for (const num of nums) {
            if (isValid(grid, r, c, num)) {
              grid[r][c] = num;
              if (solve(grid)) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function countSolutions(grid: number[][], limit = 2): number {
    let count = 0;

    function countHelper(g: number[][]): boolean {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (g[r][c] === 0) {
            for (let num = 1; num <= maxNum; num++) {
              if (isValid(g, r, c, num)) {
                g[r][c] = num;
                if (countHelper(g)) return true;
                g[r][c] = 0;
              }
            }
            return false;
          }
        }
      }
      count++;
      return count >= limit;
    }

    countHelper(cloneGrid(grid));
    return count;
  }

  return { isValid, solve, countSolutions };
}

export function generateSudoku(config: SudokuConfig): SudokuOutput {
  const cfg = GRID_CONFIGS[config.difficulty] ?? GRID_CONFIGS.hard;
  const { size, boxRows, boxCols, remove } = cfg;
  const solver = createSolver(size, boxRows, boxCols);

  const grid = Array.from({ length: size }, () => Array(size).fill(0));

  const numBoxRows = size / boxRows;
  const numBoxCols = size / boxCols;
  const diagBoxes = Math.min(numBoxRows, numBoxCols);

  for (let b = 0; b < diagBoxes; b++) {
    const startR = b * boxRows;
    const startC = b * boxCols;
    const nums = shuffleArray(Array.from({ length: size }, (_, i) => i + 1));
    let idx = 0;
    for (let r = startR; r < startR + boxRows; r++) {
      for (let c = startC; c < startC + boxCols; c++) {
        grid[r][c] = nums[idx++];
      }
    }
  }

  solver.solve(grid);
  const solution = cloneGrid(grid);

  const positions = shuffleArray(
    Array.from({ length: size * size }, (_, i) => [Math.floor(i / size), i % size] as [number, number]),
  );

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= remove) break;
    const backup = grid[r][c];
    grid[r][c] = 0;

    const testGrid = cloneGrid(grid);
    if (solver.countSolutions(testGrid) > 1) {
      grid[r][c] = backup;
    } else {
      removed++;
    }
  }

  return { puzzle: grid, solution };
}
