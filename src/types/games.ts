import type { FC } from "react";

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface GameConfig {
  size: number;
  difficulty: Difficulty;
  showSolutionInPDF?: boolean;
}

export interface GameDefinition<TOutput, TConfig extends GameConfig = GameConfig> {
  generate(config: TConfig): TOutput;
  Preview: FC<{ data: TOutput; config: TConfig }>;
  defaultConfig: TConfig;
}

export type GameId = "wordsearch" | "sudoku" | "maze" | "tictactoe" | "crossword";
