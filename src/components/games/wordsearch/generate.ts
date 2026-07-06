import { shuffle, createGrid } from "../../../lib/algorithms";
import type { WordSearchConfig, WordSearchOutput } from "./types";
import { WORD_BANK } from "../../../data/wordbank";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function getDirections(difficulty: string): [number, number][] {
  switch (difficulty) {
    case "easy":
      return [[0, 1], [1, 0]];
    case "medium":
      return [[0, 1], [1, 0], [1, 1]];
    case "hard":
      return [
        [0, 1], [1, 0], [1, 1],
        [0, -1], [-1, 0], [-1, -1],
      ];
    case "expert":
      return [
        [0, 1], [1, 0], [1, 1],
        [0, -1], [-1, 0], [-1, -1],
        [1, -1], [-1, 1],
      ];
    default:
      return [[0, 1], [1, 0], [1, 1]];
  }
}

function getWordLengthRange(difficulty: string): [number, number] {
  switch (difficulty) {
    case "easy": return [3, 5];
    case "medium": return [3, 8];
    default: return [3, 99];
  }
}

function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number,
  allowOverwrite = false,
  allowIntersect = true,
): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  const endR = row + dr * (word.length - 1);
  const endC = col + dc * (word.length - 1);
  if (endR < 0 || endR >= rows || endC < 0 || endC >= cols) return false;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (allowOverwrite) continue;
    if (grid[r][c] !== "") {
      if (!allowIntersect) return false;
      if (grid[r][c] !== word[i]) return false;
    }
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number,
) {
  for (let i = 0; i < word.length; i++) {
    grid[row + dr * i][col + dc * i] = word[i];
  }
}

function fillEmpty(grid: string[][]) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === "") grid[r][c] = randomLetter();
    }
  }
}

function getGridSize(wordCount: number): number {
  if (wordCount <= 5) return 10;
  if (wordCount <= 10) return 14;
  if (wordCount <= 15) return 18;
  return 22;
}

function selectWords(config: WordSearchConfig): string[] {
  const count = config.wordCount ?? 10;
  const [minLen, maxLen] = getWordLengthRange(config.difficulty);
  let pool: string[];

  if (config.generationMode === "themed" && config.theme && WORD_BANK[config.theme]) {
    pool = [...WORD_BANK[config.theme]];
  } else if (config.generationMode === "custom" && config.customWords && config.customWords.length > 0) {
    const valid = config.customWords
      .filter((w) => w.trim().length >= 2)
      .map((w) => w.trim().toUpperCase().replace(/[^A-Z]/g, ""))
      .filter((w) => w.length >= 2);
    if (valid.length === 0) {
      pool = [...WORD_BANK.general];
    } else {
      return shuffle([...new Set(valid)]).slice(0, count);
    }
  } else {
    pool = [...WORD_BANK.general];
  }

  const filtered = pool.filter((w) => {
    const upper = w.toUpperCase().replace(/[^A-Z]/g, "");
    return upper.length >= minLen && upper.length <= maxLen;
  });

  if (filtered.length === 0) {
    return shuffle(pool).slice(0, count);
  }

  return shuffle(filtered).slice(0, count);
}

export function generateWordSearch(config: WordSearchConfig): WordSearchOutput {
  const size = getGridSize(config.wordCount);
  const grid = createGrid(size, size, "");
  const selectedWords = selectWords(config);
  const directions = getDirections(config.difficulty);
  const isExpert = config.difficulty === "expert";
  const isHard = config.difficulty === "hard";
  const allowIntersect = isHard || isExpert;
  const allowOverwrite = isExpert;

  const positions: WordSearchOutput["positions"] = [];

  for (const word of selectedWords) {
    const upperWord = word.toUpperCase().replace(/[^A-Z]/g, "");
    if (upperWord.length < 2) continue;
    const dirs = shuffle([...directions]);
    let placed = false;

    for (const [dr, dc] of dirs) {
      const maxRow = dr === 0 ? size - 1 : dr > 0 ? size - upperWord.length : size - 1;
      const maxCol = dc === 0 ? size - 1 : dc > 0 ? size - upperWord.length : size - 1;
      const minRow = dr >= 0 ? 0 : upperWord.length - 1;
      const minCol = dc >= 0 ? 0 : upperWord.length - 1;

      const candidates: [number, number][] = [];
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          if (canPlace(grid, upperWord, r, c, dr, dc, allowOverwrite, allowIntersect)) {
            candidates.push([r, c]);
          }
        }
      }

      if (candidates.length > 0) {
        const [r, c] = candidates[Math.floor(Math.random() * candidates.length)];
        placeWord(grid, upperWord, r, c, dr, dc);
        positions.push({ word: upperWord, row: r, col: c, direction: [dr, dc] });
        placed = true;
        break;
      }
    }

    if (!placed) {
      for (let attempt = 0; attempt < 200; attempt++) {
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
        if (canPlace(grid, upperWord, r, c, dr, dc, allowOverwrite, allowIntersect)) {
          placeWord(grid, upperWord, r, c, dr, dc);
          positions.push({ word: upperWord, row: r, col: c, direction: [dr, dc] });
          placed = true;
          break;
        }
      }
    }
  }

  fillEmpty(grid);

  return {
    grid,
    words: selectedWords.map((w) => w.toUpperCase().replace(/[^A-Z]/g, "")),
    positions,
  };
}
