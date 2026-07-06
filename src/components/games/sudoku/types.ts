export interface SudokuConfig {
  size: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface SudokuOutput {
  puzzle: number[][];
  solution: number[][];
}
