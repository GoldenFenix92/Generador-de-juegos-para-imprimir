import type { Difficulty } from "../../../types/games";

export type WordSearchMode = "online" | "print";

export interface WordSearchConfig {
  size: number;
  difficulty: Difficulty;
  wordCount: 5 | 10 | 15 | 20;
  mode: WordSearchMode;
}

export interface WordSearchOutput {
  grid: string[][];
  words: string[];
  positions: { word: string; row: number; col: number; direction: [number, number] }[];
}
