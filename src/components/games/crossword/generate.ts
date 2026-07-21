import type { CrosswordConfig, CrosswordOutput, CrosswordPlacedWord, CrosswordClue } from "./types";
import { CROSSWORD_BANK } from "./crosswordBank";

const MAX_WORD_LENGTH = 15;

const DIFFICULTY_CONFIG = {
  easy: { gridSize: 9, minWordLen: 4, targetWords: 5 },
  medium: { gridSize: 11, minWordLen: 5, targetWords: 7 },
  hard: { gridSize: 13, minWordLen: 6, targetWords: 9 },
  expert: { gridSize: 15, minWordLen: 7, targetWords: 11 },
} as const;



function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWordsForCrossword(config: CrosswordConfig): { word: string; clue: string }[] {
  const diff = DIFFICULTY_CONFIG[config.difficulty] ?? DIFFICULTY_CONFIG.medium;
  const minLen = diff.minWordLen;
  const target = config.wordCount ?? diff.targetWords;
  const maxLen = Math.min(gridSizeForDifficulty(config.difficulty) - 2, MAX_WORD_LENGTH);

  if (config.generationMode === "custom" && config.customWords?.length) {
    const entries = config.customWords.map((w) => ({ word: w.toUpperCase(), clue: "" }));
    return shuffleArray(entries).slice(0, target).sort((a, b) => b.word.length - a.word.length);
  }

  let pool: { word: string; clue: string }[] = [];

  if (config.generationMode === "themed" && config.theme && CROSSWORD_BANK[config.theme]) {
    pool = CROSSWORD_BANK[config.theme];
  } else {
    pool = Object.values(CROSSWORD_BANK).flat();
  }

  const filtered = pool.filter(
    (e) => e.word.length >= minLen && e.word.length <= maxLen,
  );

  const bufferTarget = config.generationMode === "custom" ? target : target + 6;
  const seen = new Set<string>();
  const result: { word: string; clue: string }[] = [];
  for (const entry of shuffleArray(filtered)) {
    if (result.length >= bufferTarget) break;
    if (seen.has(entry.word)) continue;
    seen.add(entry.word);
    result.push(entry);
  }

  return result.sort((a, b) => b.word.length - a.word.length);
}

function gridSizeForDifficulty(difficulty: string): number {
  return DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.gridSize ?? 9;
}

function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(""));
}

function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: "across" | "down",
): boolean {
  const size = grid.length;
  const len = word.length;

  if (direction === "across") {
    if (col < 0 || col + len > size) return false;
    if (row < 0 || row >= size) return false;

    for (let i = 0; i < len; i++) {
      const cell = grid[row][col + i];
      if (cell !== "" && cell !== word[i]) return false;
    }

    const leftOk = col === 0 || grid[row][col - 1] === "";
    const rightOk = col + len >= size || grid[row][col + len] === "";
    if (!leftOk || !rightOk) return false;

    for (let i = 0; i < len; i++) {
      const isEmpty = grid[row][col + i] === "";
      if (isEmpty) {
        const aboveOk = row === 0 || grid[row - 1][col + i] === "";
        const belowOk = row === size - 1 || grid[row + 1][col + i] === "";
        if (!aboveOk || !belowOk) return false;
      }
    }

    return true;
  } else {
    if (row < 0 || row + len > size) return false;
    if (col < 0 || col >= size) return false;

    for (let i = 0; i < len; i++) {
      const cell = grid[row + i][col];
      if (cell !== "" && cell !== word[i]) return false;
    }

    const aboveOk = row === 0 || grid[row - 1][col] === "";
    const belowOk = row + len >= size || grid[row + len][col] === "";
    if (!aboveOk || !belowOk) return false;

    for (let i = 0; i < len; i++) {
      const isEmpty = grid[row + i][col] === "";
      if (isEmpty) {
        const leftOk = col === 0 || grid[row + i][col - 1] === "";
        const rightOk = col === size - 1 || grid[row + i][col + 1] === "";
        if (!leftOk || !rightOk) return false;
      }
    }

    return true;
  }
}

function placeWord(grid: string[][], word: string, row: number, col: number, direction: "across" | "down"): void {
  for (let i = 0; i < word.length; i++) {
    if (direction === "across") {
      grid[row][col + i] = word[i];
    } else {
      grid[row + i][col] = word[i];
    }
  }
}

function findBestPlacement(
  grid: string[][],
  word: string,
  placedWords: CrosswordPlacedWord[],
  size: number,
  allowIsolated: boolean,
): { row: number; col: number; direction: "across" | "down"; score: number } | null {
  let best: { row: number; col: number; direction: "across" | "down"; score: number } | null = null;

  for (const placed of placedWords) {
    for (let pi = 0; pi < placed.word.length; pi++) {
      for (let wi = 0; wi < word.length; wi++) {
        if (placed.word[pi] !== word[wi]) continue;

        let row: number, col: number;
        const direction: "across" | "down" = placed.direction === "across" ? "down" : "across";

        if (placed.direction === "across") {
          row = placed.row - wi;
          col = placed.col + pi;
        } else {
          row = placed.row + pi;
          col = placed.col - wi;
        }

        if (!canPlace(grid, word, row, col, direction)) continue;

        const center = (size - 1) / 2;
        const distFromCenter = Math.abs(row - center) + Math.abs(col - center);
        const score = wi * 10 - distFromCenter + Math.random();

        if (!best || score > best.score) {
          best = { row, col, direction, score };
        }
      }
    }
  }

  if (!best && allowIsolated) {
    const center = Math.floor(size / 2);
    const offsets = [0, -1, 1, -2, 2];
    for (const dr of offsets) {
      const row = center + dr;
      if (row < 0 || row + word.length > size) continue;
      for (const dir of (["across", "down"] as const)) {
        const col = dir === "across"
          ? Math.max(0, Math.floor((size - word.length) / 2))
          : Math.floor(size / 2);
        if (canPlace(grid, word, row, col, dir)) {
          return { row, col, direction: dir, score: 50 - Math.abs(dr) * 5 };
        }
      }
    }
  }

  return best;
}

function numberCells(
  grid: string[][],
  placedWords: CrosswordPlacedWord[],
): (number | null)[][] {
  const size = grid.length;
  const numbers: (number | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

  let num = 1;
  const starts = new Set<string>();

  for (const pw of placedWords) {
    const key = `${pw.row},${pw.col}`;
    if (!starts.has(key)) {
      starts.add(key);
      numbers[pw.row][pw.col] = num;
      num++;
    }
  }

  return numbers;
}

function generateClues(
  placedWords: CrosswordPlacedWord[],
  wordClueMap: Map<string, string>,
): CrosswordClue[] {
  const clues: CrosswordClue[] = [];
  let num = 1;
  const seen = new Set<string>();

  for (const pw of placedWords) {
    const key = `${pw.row},${pw.col},${pw.direction}`;
    if (seen.has(key)) continue;
    seen.add(key);

    let clueText = wordClueMap.get(pw.word);
    if (!clueText) {
      clueText = `${pw.direction === "across" ? "Horizontal" : "Vertical"} - ${pw.word.length} letras`;
    }

    clues.push({
      number: num,
      direction: pw.direction,
      word: pw.word,
      clue: clueText,
      row: pw.row,
      col: pw.col,
    });

    num++;
  }

  return clues;
}

function createBlocks(grid: string[][]): boolean[][] {
  const size = grid.length;
  const blocks: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      row.push(grid[r][c] === "");
    }
    blocks.push(row);
  }
  return blocks;
}

function tryPlaceWords(
  size: number,
  wordEntries: { word: string; clue: string }[],
  clueMap: Map<string, string>,
  allowIsolated: boolean,
  target: number,
): CrosswordOutput {
  const grid = createEmptyGrid(size);
  const placedWords: CrosswordPlacedWord[] = [];
  const pending = wordEntries.map((e, i) => ({ ...e, idx: i }));
  const used = new Set<number>();

  const first = pending[0];
  if (first) {
    const center = Math.floor(size / 2);
    const startCol = Math.max(0, Math.floor((size - first.word.length) / 2));
    if (canPlace(grid, first.word, center, startCol, "across")) {
      placeWord(grid, first.word, center, startCol, "across");
      placedWords.push({ word: first.word, row: center, col: startCol, direction: "across" });
      used.add(first.idx);
    }
  }

  let changed = true;
  let pass = 0;
  while (changed && pass < 5) {
    if (placedWords.length >= target) break;
    changed = false;
    pass++;
    for (const entry of pending) {
      if (placedWords.length >= target) break;
      if (used.has(entry.idx)) continue;
      const best = findBestPlacement(grid, entry.word, placedWords, size, allowIsolated && pass >= 3);
      if (best) {
        placeWord(grid, entry.word, best.row, best.col, best.direction);
        placedWords.push({ word: entry.word, row: best.row, col: best.col, direction: best.direction });
        used.add(entry.idx);
        changed = true;
      }
    }
  }

  return {
    grid,
    blocks: createBlocks(grid),
    width: size,
    height: size,
    placedWords,
    numbers: numberCells(grid, placedWords),
    clues: generateClues(placedWords, clueMap),
  };
}

export function generateCrossword(config: CrosswordConfig): CrosswordOutput {
  const diff = DIFFICULTY_CONFIG[config.difficulty] ?? DIFFICULTY_CONFIG.medium;
  const size = diff.gridSize;
  const wordEntries = getWordsForCrossword(config);
  const clueMap = new Map(wordEntries.map((e) => [e.word, e.clue]));

  const target = config.wordCount ?? diff.targetWords;

  const tries = [
    wordEntries,
    ...Array.from({ length: 5 }, () => shuffleArray(wordEntries)),
  ];

  let best = tryPlaceWords(size, tries[0], clueMap, false, target);

  for (let i = 1; i < tries.length; i++) {
    const result = tryPlaceWords(size, tries[i], clueMap, i >= 3, target);
    if (result.placedWords.length > best.placedWords.length) {
      best = result;
    }
    if (best.placedWords.length >= target) break;
  }

  return best;
}
