import type { GameDefinition, GameId, GameConfig } from "../types/games";
import wordSearchGame from "../components/games/wordsearch";
import sudokuGame from "../components/games/sudoku";
import mazeGame from "../components/games/maze";
import tictactoeGame from "../components/games/tictactoe";

interface GameEntry<TOutput, TConfig extends GameConfig> {
  definition: GameDefinition<TOutput, TConfig>;
  loadPDF: () => Promise<{ default: React.FC<{ data: TOutput; config: TConfig }> }>;
}

const gameEntries: Record<GameId, GameEntry<any, any>> = {
  wordsearch: {
    definition: wordSearchGame,
    loadPDF: () => import("../components/games/wordsearch/WordSearchPDF"),
  },
  sudoku: {
    definition: sudokuGame,
    loadPDF: () => import("../components/games/sudoku/SudokuPDF"),
  },
  maze: {
    definition: mazeGame,
    loadPDF: () => import("../components/games/maze/MazePDF"),
  },
  tictactoe: {
    definition: tictactoeGame,
    loadPDF: () => import("../components/games/tictactoe/TicTacToePDF"),
  },
};

export function getGameDefinition(id: GameId): GameDefinition<any> | null {
  return gameEntries[id]?.definition ?? null;
}

export function getPDFComponent(id: GameId) {
  return gameEntries[id]?.loadPDF();
}

export function registerGame(id: GameId, entry: GameEntry<any, any>) {
  gameEntries[id] = entry;
}

export type { GameDefinition, GameId } from "../types/games";
