import type { GameDefinition } from "../../../types/games";
import WordSearch, { generateWordSearch } from "./WordSearch";
import type { WordSearchConfig, WordSearchOutput } from "./types";

const wordSearchGame: GameDefinition<WordSearchOutput, WordSearchConfig> = {
  generate: generateWordSearch,
  Preview: WordSearch,
  defaultConfig: { size: 10, difficulty: "easy", wordCount: 10, mode: "print" },
};

export default wordSearchGame;
export type { WordSearchConfig, WordSearchOutput } from "./types";
