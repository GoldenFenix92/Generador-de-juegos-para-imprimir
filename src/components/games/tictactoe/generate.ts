import { createGrid } from "../../../lib/algorithms";
import type { TicTacToeConfig, TicTacToeOutput } from "./types";

const DIFFICULTY_CONFIG = {
  easy: { gridSize: 3, winLength: 3 },
  medium: { gridSize: 3, winLength: 3 },
  hard: { gridSize: 3, winLength: 3 },
  expert: { gridSize: 4, winLength: 4 },
} as const;

export function generateTicTacToe(config: TicTacToeConfig): TicTacToeOutput {
  const diff = DIFFICULTY_CONFIG[config.difficulty] ?? DIFFICULTY_CONFIG.medium;
  const gridSize = diff.gridSize;
  const grid = createGrid(gridSize, gridSize, null as null | "X" | "O");
  return { grid, gridSize, winLength: diff.winLength };
}

export { DIFFICULTY_CONFIG };
