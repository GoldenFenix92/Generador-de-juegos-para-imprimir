import { describe, it, expect } from "vitest";
import { generateCrossword } from "./generate";

describe("generateCrossword", () => {
  it("generates a grid with correct dimensions", () => {
    const result = generateCrossword({
      size: 11,
      difficulty: "medium",
      wordCount: 7,
      generationMode: "random",
    });
    expect(result.width).toBe(11);
    expect(result.height).toBe(11);
    expect(result.grid.length).toBe(11);
    expect(result.grid[0].length).toBe(11);
  });

  it("places at least one word", () => {
    const result = generateCrossword({
      size: 11,
      difficulty: "medium",
      wordCount: 7,
      generationMode: "random",
    });
    expect(result.placedWords.length).toBeGreaterThan(0);
  });

  it("has matching grid and blocks dimensions", () => {
    const result = generateCrossword({
      size: 11,
      difficulty: "medium",
      wordCount: 7,
      generationMode: "random",
    });
    expect(result.blocks.length).toBe(11);
    expect(result.blocks[0].length).toBe(11);
  });

  it("generates clues for placed words", () => {
    const result = generateCrossword({
      size: 11,
      difficulty: "medium",
      wordCount: 7,
      generationMode: "random",
    });
    expect(result.clues.length).toBeGreaterThan(0);
    expect(result.clues.length).toBe(result.placedWords.length);
  });

  it("maps difficulty to grid size", () => {
    const easy = generateCrossword({ size: 9, difficulty: "easy", wordCount: 5, generationMode: "random" });
    const medium = generateCrossword({ size: 11, difficulty: "medium", wordCount: 7, generationMode: "random" });
    const hard = generateCrossword({ size: 13, difficulty: "hard", wordCount: 9, generationMode: "random" });
    const expert = generateCrossword({ size: 15, difficulty: "expert", wordCount: 11, generationMode: "random" });

    expect(easy.width).toBe(9);
    expect(medium.width).toBe(11);
    expect(hard.width).toBe(13);
    expect(expert.width).toBe(15);
  });

  it("generates themed crossword with words", () => {
    const result = generateCrossword({
      size: 11,
      difficulty: "medium",
      wordCount: 7,
      generationMode: "themed",
      theme: "animales",
    });
    expect(result.placedWords.length).toBeGreaterThan(0);
  });

  it("generates custom crossword from provided words", () => {
    const result = generateCrossword({
      size: 11,
      difficulty: "medium",
      wordCount: 7,
      generationMode: "custom",
      customWords: ["PERRO", "GATO", "CASA", "SOL", "LUNA"],
    });
    expect(result.placedWords.length).toBeGreaterThan(0);
  });

  it("has numbers on starting cells of words", () => {
    const result = generateCrossword({
      size: 11,
      difficulty: "medium",
      wordCount: 7,
      generationMode: "random",
    });

    for (const pw of result.placedWords) {
      expect(result.numbers[pw.row][pw.col]).toBeGreaterThan(0);
    }
  });
});
