import type { Difficulty } from "../../../types/games";

export interface SudokuConfig {
  size: number;
  difficulty: Difficulty;
  sheetCount?: number;
  showSolutionInPDF?: boolean;
}

export interface SudokuOutput {
  puzzle: number[][];
  solution: number[][];
}
