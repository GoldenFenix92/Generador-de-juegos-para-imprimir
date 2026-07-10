export interface TicTacToeConfig {
  size: number;
  difficulty: "easy" | "medium" | "hard" | "expert";
  sheetCount?: number;
  mode?: "print" | "online";
}

export interface TicTacToeOutput {
  grid: (null | "X" | "O")[][];
  gridSize: number;
  winLength: number;
}
