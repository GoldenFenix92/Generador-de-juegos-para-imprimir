import type { GameDefinition } from "../../../types/games";
import Sudoku, { generateSudoku } from "./Sudoku";
import type { SudokuConfig, SudokuOutput } from "./types";

const sudokuGame: GameDefinition<SudokuOutput, SudokuConfig> = {
  generate: generateSudoku,
  Preview: Sudoku,
  defaultConfig: { size: 9, difficulty: "hard", sheetCount: 1, showSolutionInPDF: false },
};

export default sudokuGame;
export type { SudokuConfig, SudokuOutput } from "./types";
