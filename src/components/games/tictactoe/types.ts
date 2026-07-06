export interface TicTacToeConfig {
  size: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface TicTacToeOutput {
  grid: (null | "X" | "O")[][];
}
