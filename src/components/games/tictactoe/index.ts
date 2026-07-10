import type { GameDefinition } from "../../../types/games";
import TicTacToe, { generateTicTacToe } from "./TicTacToe";
import type { TicTacToeConfig, TicTacToeOutput } from "./types";

const tictactoeGame: GameDefinition<TicTacToeOutput, TicTacToeConfig> = {
  generate: generateTicTacToe,
  Preview: TicTacToe,
  defaultConfig: { size: 3, difficulty: "medium" },
};

export default tictactoeGame;
export type { TicTacToeConfig, TicTacToeOutput } from "./types";
