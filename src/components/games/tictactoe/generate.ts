import { createGrid } from "../../../lib/algorithms";
import type { TicTacToeConfig, TicTacToeOutput } from "./types";

export function generateTicTacToe(_config: TicTacToeConfig): TicTacToeOutput {
  const grid = createGrid(3, 3, null as null | "X" | "O");
  return { grid };
}
