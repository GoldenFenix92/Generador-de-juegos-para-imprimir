import { cloneGrid } from "../../../lib/algorithms";
import type { SudokuConfig, SudokuOutput } from "./types";

const GRID_SIZE = 9;

function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < GRID_SIZE; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function solve(grid: number[][]): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
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

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIFFICULTY_REMOVE: Record<string, number> = {
  easy: 30,
  medium: 45,
  hard: 55,
};

export function generateSudoku(config: SudokuConfig): SudokuOutput {
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

  // Fill diagonal 3x3 boxes first (they're independent)
  for (let box = 0; box < 3; box++) {
    const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let idx = 0;
    for (let r = box * 3; r < box * 3 + 3; r++) {
      for (let c = box * 3; c < box * 3 + 3; c++) {
        grid[r][c] = nums[idx++];
      }
    }
  }

  // Solve the rest
  solve(grid);

  const solution = cloneGrid(grid);
  const toRemove = DIFFICULTY_REMOVE[config.difficulty] ?? 30;

  const positions = shuffleArray(
    Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => [Math.floor(i / GRID_SIZE), i % GRID_SIZE] as [number, number]),
  );

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= toRemove) break;
    const backup = grid[r][c];
    grid[r][c] = 0;

    // Quick sanity: ensure unique solution still exists
    const testGrid = cloneGrid(grid);
    if (countSolutions(testGrid) > 1) {
      grid[r][c] = backup;
    } else {
      removed++;
    }
  }

  return { puzzle: grid, solution };
}

function countSolutions(grid: number[][], limit = 2): number {
  let count = 0;

  function countHelper(g: number[][]): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
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
