import type { GameDefinition } from "../../../types/games";
import Crossword, { generateCrossword } from "./Crossword";
import type { CrosswordConfig, CrosswordOutput } from "./types";

const crosswordGame: GameDefinition<CrosswordOutput, CrosswordConfig> = {
  generate: generateCrossword,
  Preview: Crossword,
  defaultConfig: { size: 9, difficulty: "medium", wordCount: 7, generationMode: "random" },
};

export default crosswordGame;
export type { CrosswordConfig, CrosswordOutput } from "./types";
